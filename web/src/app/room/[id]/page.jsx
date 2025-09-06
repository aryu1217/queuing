// src/app/r/[code]/page.jsx  (또는 해당 Room 파일)
"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { currentVideoIdAtom } from "@/atoms/player";

import QueueList from "@/components/room/queue/queue-list";
import ParticipantList from "@/components/room/right-section/participant-list";
import TopBar from "@/components/room/top-bar";
import YoutubePlayer from "@/components/room/youtube-player";
import AddSongModal from "@/components/room/queue/add-song-modal";

export default function Room({ params }) {
  const [openAdd, setOpenAdd] = useState(false);
  const [videoId] = useAtom(currentVideoIdAtom);

  return (
    <div className="bg-white text-[#17171B] min-h-screen flex flex-col">
      <TopBar />

      {/* 본문 영역 */}
      <main
        className="
          flex-1 p-4 grid gap-4
          grid-cols-1
          lg:grid-cols-[minmax(240px,320px)_1fr_minmax(220px,280px)]
        "
      >
        {/* Left: Queue */}
        <aside className="order-2 lg:order-1 w-full min-w-0">
          <QueueList
            onOpenAddSong={() => setOpenAdd(true)}
            // onOpenMyQueue / onOpenRoomQueueManage 도 같은 패턴으로 연결 가능
          />
        </aside>

        {/* Center: Player */}
        <section className="order-1 lg:order-2 w-full min-w-0 flex justify-center">
          <div className="w-full max-w-[960px]">
            {/* 전역 atom에서 읽은 videoId 전달, 자동 재생 */}
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
