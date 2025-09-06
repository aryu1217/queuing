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
  // Next 15 / React 19: params는 Promise → use()로 언랩
  const { code } = use(params);

  const supabase = createClient();
  const [openAdd, setOpenAdd] = useState(false);
  const [videoId] = useAtom(currentVideoIdAtom);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let off = false;

    (async () => {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("rooms")
        .select(
          `
            id, code, title
            
          `
        )
        .eq("code", code)
        .single();

      if (off) return;
      if (error) setErr(error.message);
      else setRoom(data);
      setLoading(false);
    })();

    return () => {
      off = true;
    };
  }, [code, supabase]);

  if (loading) {
    return <div className="p-6">불러오는 중…</div>;
  }

  if (err || !room) {
    return (
      <div className="p-6 text-red-600">방 정보를 가져오지 못했어요. {err}</div>
    );
  }

  return (
    <div className="bg-white text-[#17171B] min-h-screen flex flex-col">
      <TopBar title={room.title ?? "방제목"} exitHref="/main" />

      {/* 본문 */}
      <main
        className="
          flex-1 p-4 grid gap-4
          grid-cols-1
          lg:grid-cols-[minmax(240px,320px)_1fr_minmax(220px,280px)]
        "
      >
        {/* Left: Queue */}
        <aside className="order-2 lg:order-1 w-full min-w-0">
          <QueueList onOpenAddSong={() => setOpenAdd(true)} />
        </aside>

        {/* Center: Player */}
        <section className="order-1 lg:order-2 w-full min-w-0 flex justify-center">
          <div className="w-full max-w-[960px]">
            <YoutubePlayer videoId={videoId} autoplay />
          </div>
        </section>

        {/* Right: Participants */}
        <aside className="order-3 lg:order-3 w-full min-w-0">
          <ParticipantList />
        </aside>
      </main>

      {/* 링크 입력 모달 */}
      <AddSongModal open={openAdd} onClose={() => setOpenAdd(false)} />
    </div>
  );
}
