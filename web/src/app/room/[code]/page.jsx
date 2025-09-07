// src/app/room/[code]/page.jsx
"use client";

import React, { use, useEffect, useState } from "react";
import { useAtom } from "jotai";
import { currentVideoIdAtom } from "@/atoms/player";
import { createClient } from "@/utils/supabase/client";

import QueueList from "@/components/room/queue/queue-list";
import ParticipantList from "@/components/room/right-section/participant-list";
import TopBar from "@/components/room/top-bar";
import YoutubePlayer from "@/components/room/youtube-player";
import AddSongModal from "@/components/room/queue/add-song-modal";

export default function Room({ params }) {
  const { code } = use(params);
  const supabase = createClient();

  const [openAdd, setOpenAdd] = useState(false);
  const [videoId] = useAtom(currentVideoIdAtom);

  const [room, setRoom] = useState(null);
  const [memberCount, setMemberCount] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 멤버 → UI 매핑 함수
  const mapMembers = async (roomId, members) => {
    const userIds = members.filter((m) => m.user_id).map((m) => m.user_id);
    let profilesMap = new Map();
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, nickname, avatar_url")
        .in("id", userIds);
      (profs || []).forEach((p) => profilesMap.set(p.id, p));
    }

    const mapped = members.map((m) => {
      const p = m.user_id ? profilesMap.get(m.user_id) : null;
      const nickname = p?.nickname || m.guest_nickname || "사용자";
      return {
        id: m.id,
        nickname,
        name: nickname,
        displayName: nickname,
        avatarUrl: p?.avatar_url || null,
        role: m.role,
        isHost: m.role === "host",
        isGuest: !!m.guest_id,
        userId: m.user_id,
        guestId: m.guest_id,
      };
    });

    mapped.sort((a, b) => (a.isHost === b.isHost ? 0 : a.isHost ? -1 : 1));
    return mapped;
  };

  useEffect(() => {
    let off = false;
    let channel = null;

    const refreshAll = async (roomId) => {
      // 카운트 + 멤버 동시 갱신
      const [{ count }, { data: ms, error: mErr }] = await Promise.all([
        supabase
          .from("room_members")
          .select("id", { count: "exact", head: true })
          .eq("room_id", roomId),
        supabase
          .from("room_members")
          .select("id, user_id, guest_id, guest_nickname, role, created_at")
          .eq("room_id", roomId),
      ]);

      if (mErr) {
        if (!off) setErr(mErr.message);
        return;
      }

      if (!off) {
        setMemberCount(count ?? 0);
        const mapped = await mapMembers(roomId, ms || []);
        setParticipants(mapped);
      }
    };

    async function fetchAll() {
      setLoading(true);
      setErr("");

      // 1) 방 정보
      const { data: r, error: rErr } = await supabase
        .from("rooms")
        .select("id, code, title, max_listeners")
        .eq("code", code)
        .maybeSingle();

      if (off) return;
      if (rErr || !r) {
        setErr(rErr?.message || "방 정보를 찾을 수 없습니다.");
        setLoading(false);
        return;
      }
      setRoom(r);

      // 2) 초기 데이터 로드
      await refreshAll(r.id);

      // 3) 실시간 구독 (room_members + rooms)
      channel = supabase
        .channel(`room:${r.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "room_members",
            filter: `room_id=eq.${r.id}`,
          },
          () => refreshAll(r.id)
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "rooms",
            filter: `id=eq.${r.id}`,
          },
          () => refreshAll(r.id)
        )
        .subscribe();

      if (!off) setLoading(false);
    }

    if (code) fetchAll();

    return () => {
      off = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [code, supabase]);

  if (loading) return <div className="p-6">불러오는 중…</div>;
  if (err || !room)
    return (
      <div className="p-6 text-red-600">방 정보를 가져오지 못했어요. {err}</div>
    );

  return (
    <div className="bg-white text-[#17171B] min-h-screen flex flex-col">
      <TopBar
        title={room.title ?? "방제목"}
        currentListeners={memberCount}
        maxListeners={room.max_listeners ?? 0}
        exitHref="/main"
      />

      <main className="flex-1 p-4 grid gap-4 grid-cols-1 lg:grid-cols-[minmax(240px,320px)_1fr_minmax(220px,280px)]">
        <aside className="order-2 lg:order-1 w-full min-w-0">
          <QueueList onOpenAddSong={() => setOpenAdd(true)} />
        </aside>

        <section className="order-1 lg:order-2 w-full min-w-0 flex justify-center">
          <div className="w-full max-w-[960px]">
            <YoutubePlayer videoId={videoId} autoplay />
          </div>
        </section>

        <aside className="order-3 lg:order-3 w-full min-w-0">
          <ParticipantList users={participants} />
        </aside>
      </main>

      <AddSongModal open={openAdd} onClose={() => setOpenAdd(false)} />
    </div>
  );
}
