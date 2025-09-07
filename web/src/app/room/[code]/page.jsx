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
  const [memberCount, setMemberCount] = useState(0); // ✅ 현재 인원 수
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let off = false;
    let channel; // (옵션) realtime 구독 핸들

    async function fetchAll() {
      setLoading(true);
      setErr("");

      // 1) 방 정보
      const { data: r, error: rErr } = await supabase
        .from("rooms")
        .select("id, code, title, max_listeners")
        .eq("code", code)
        .single();

      if (off) return;
      if (rErr || !r) {
        setErr(rErr?.message || "방 정보를 찾을 수 없습니다.");
        setLoading(false);
        return;
      }
      setRoom(r);

      // 2) 멤버 수 카운트 (데이터 없이 count만)
      const { count, error: cErr } = await supabase
        .from("room_members")
        .select("id", { count: "exact", head: true })
        .eq("room_id", r.id);
      if (!off) {
        if (cErr) setErr(cErr.message);
        setMemberCount(count ?? 0);
        setLoading(false);
      }

      // 3) (옵션) 실시간으로 인원 수 갱신
      // 주석 해제하면 insert/delete/update 시 자동으로 재계산됩니다.
      /*
      const refreshCount = async () => {
        const { count: newCount } = await supabase
          .from("room_members")
          .select("id", { count: "exact", head: true })
          .eq("room_id", r.id);
        if (!off) setMemberCount(newCount ?? 0);
      };

      channel = supabase
        .channel(`room-members:${r.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "room_members", filter: `room_id=eq.${r.id}` },
          () => { refreshCount(); }
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
        currentListeners={memberCount} // ✅ 현재 인원
        maxListeners={room.max_listeners ?? 0} // ✅ 최대 인원
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
          <ParticipantList />
        </aside>
      </main>

      <AddSongModal open={openAdd} onClose={() => setOpenAdd(false)} />
    </div>
  );
}
