// src/app/r/[code]/page.jsx
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
  const [participants, setParticipants] = useState([]); // ✅ 참가자 목록
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let off = false;
    let channel; // (옵션) realtime

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

      // 2) 멤버 수 (count-only)
      const { count, error: cErr } = await supabase
        .from("room_members")
        .select("id", { count: "exact", head: true })
        .eq("room_id", r.id);

      if (!off) {
        if (cErr) setErr(cErr.message);
        setMemberCount(count ?? 0);
      }

      // 3) 참가자 목록
      const { data: members, error: mErr } = await supabase
        .from("room_members")
        .select("id, user_id, guest_id, guest_nickname, role")
        .eq("room_id", r.id);

      if (off) return;
      if (mErr) {
        setErr(mErr.message);
        setParticipants([]);
        setLoading(false);
        return;
      }

      // 로그인 유저들의 프로필 닉네임/아바타 보강 (FK 없을 수 있으니 별도 조회)
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
          // 널-safe로 ParticipantCard 호환성 보장
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

      if (!off) {
        // 호스트 우선 정렬
        mapped.sort((a, b) => (a.isHost === b.isHost ? 0 : a.isHost ? -1 : 1));
        setParticipants(mapped);
        setLoading(false);
      }

      // 4) (옵션) 실시간 갱신
      // 필요하면 주석 해제
      /*
      const refresh = async () => {
        const { count: newCount } = await supabase
          .from("room_members")
          .select("id", { count: "exact", head: true })
          .eq("room_id", r.id);
        setMemberCount(newCount ?? 0);

        const { data: ms } = await supabase
          .from("room_members")
          .select("id, user_id, guest_id, guest_nickname, role")
          .eq("room_id", r.id);
        // (위와 동일 매핑)
        // ...생략 (필요 시 함수로 빼도 됨)
      };

      channel = supabase
        .channel(`room-members:${r.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "room_members", filter: `room_id=eq.${r.id}` },
          () => { refresh(); }
        )
        .subscribe();
      */
    }

    fetchAll();
    return () => {
      off = true;
      // if (channel) supabase.removeChannel(channel);
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
          {/* ✅ 실제 참가자 전달 */}
          <ParticipantList users={participants} />
        </aside>
      </main>

      <AddSongModal open={openAdd} onClose={() => setOpenAdd(false)} />
    </div>
  );
}
