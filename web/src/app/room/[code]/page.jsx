"use client";

import React, { use, useEffect, useState } from "react";
import { useAtom } from "jotai";
import { currentVideoIdAtom } from "@/atoms/player";
import { createClient } from "@/utils/supabase/client";
import Cookies from "js-cookie";

import QueueList from "@/components/room/queue/queue-list";
import ParticipantList from "@/components/room/right-section/participant-list";
import TopBar from "@/components/room/top-bar";
import YoutubePlayer from "@/components/room/youtube-player";
import AddSongModal from "@/components/room/queue/add-song-modal";
import Spinner from "@/components/ui/spinner";
import { useParams } from "next/navigation";

export default function Room({ params }) {
  const { code } = useParams();
  const supabase = createClient();

  const [openAdd, setOpenAdd] = useState(false);
  const [videoId] = useAtom(currentVideoIdAtom);

  const [room, setRoom] = useState(null);
  const [memberCount, setMemberCount] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 내가 방장인지 및 진행 중 타겟
  const [isMeHost, setIsMeHost] = useState(false);
  const [busyMemberId, setBusyMemberId] = useState(null);

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
        id: m.id, // <- room_members.id (API에 보낼 타겟)
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

        // 내가 누구인지 판별 (로그인 or 게스트)
        const {
          data: { user: authUser },
        } = await supabase.auth
          .getUser()
          .catch(() => ({ data: { user: null } }));

        const guestIdCookie =
          (typeof document !== "undefined" &&
            (Cookies.get("guest_id") || Cookies.get("guestId"))) ||
          "";
        const nicknameCookie =
          (typeof document !== "undefined" && Cookies.get("nickname")) || "";

        const meRow = (ms || []).find(
          (m) =>
            (authUser?.id && m.user_id === authUser.id) ||
            (guestIdCookie && m.guest_id === guestIdCookie) ||
            (!guestIdCookie &&
              nicknameCookie &&
              m.guest_nickname === nicknameCookie)
        );

        setIsMeHost(meRow?.role === "host");

        const mapped = await mapMembers(roomId, ms || []);
        setParticipants(mapped);
      }
    };

    async function fetchAll() {
      setLoading(true);
      setErr("");

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

      await refreshAll(r.id);

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

  // 방장 넘기기 호출
  const handleTransferHost = async (targetMemberId) => {
    if (!room?.id || !targetMemberId || busyMemberId) return;
    const ok = window.confirm("해당 참가자에게 방장을 넘길까요?");
    if (!ok) return;

    setBusyMemberId(targetMemberId);
    try {
      const res = await fetch("/api/rooms/transfer-host", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          targetMemberId,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      // 성공 시 rooms/room_members 구독이 알아서 갱신함
    } catch (e) {
      alert(`방장 넘기기 실패: ${e.message}`);
    } finally {
      setBusyMemberId(null);
    }
  };

  if (loading)
    return (
      <div className="grid h-screen place-items-center px-4 pt-5 bg-[#FFFFFF]">
        <Spinner />
      </div>
    );
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
          <ParticipantList
            users={participants}
            isMeHost={isMeHost}
            onTransferHost={handleTransferHost}
            busyMemberId={busyMemberId}
          />
        </aside>
      </main>

      <AddSongModal open={openAdd} onClose={() => setOpenAdd(false)} />
    </div>
  );
}
