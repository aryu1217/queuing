// src/components/room/queue/queue-list.jsx
"use client";

import { useState } from "react";
import QueueCard from "./queue-card";
import { DUMMY_QUEUE_SONGS } from "@/dummy-queue-songs";
import { ListMusic, PlusCircle, Settings2 } from "lucide-react";
import AddSongModal from "@/components/room/queue/add-song-modal";

export default function QueueList({
  showThumbnail = true,
  onOpenMyQueue,
  onOpenAddSong,
  onOpenRoomQueueManage,
}) {
  const [items] = useState(DUMMY_QUEUE_SONGS);
  const [openAdd, setOpenAdd] = useState(false);

  const handleOpenAdd = () => {
    if (typeof onOpenAddSong === "function") onOpenAddSong();
    else setOpenAdd(true);
  };

  return (
    <div className="flex flex-col h-full min-w-0">
      {/* 헤더 */}
      <div className="mb-2 flex items-center justify-between shrink-0">
        <h3 className="text-sm font-semibold text-[#17171B]">
          큐 목록{" "}
          <span className="ml-1 text-xs text-gray-500">{items.length}곡</span>
        </h3>

        <button
          type="button"
          onClick={onOpenRoomQueueManage}
          className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-[#17171B] hover:bg-gray-50"
        >
          <Settings2 className="h-3.5 w-3.5" />방 큐 관리
        </button>
      </div>

      {/* 리스트: 최대 높이 넘으면 스크롤 */}
      <div className="flex-1 overflow-y-auto max-h-[350px] pr-1">
        {items.map((t, i) => (
          <QueueCard
            key={t.id}
            track={t}
            index={i}
            showThumbnail={showThumbnail}
          />
        ))}

        {items.length === 0 && (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-500">
            대기열이 비어 있어요.{" "}
            <span className="font-medium">노래 추가하기</span>를 눌러 곡을
            추가해 보세요.
          </div>
        )}
      </div>

      {/* 푸터 */}
      <div className="pt-2 shrink-0">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onOpenMyQueue}
            className="inline-flex items-center cursor-pointer justify-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#17171B] hover:bg-gray-50"
          >
            <ListMusic className="h-4 w-4" />
            나의 큐 관리
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center cursor-pointer justify-center gap-2 rounded-full bg-[#17171B]/98 px-3 py-2 text-sm font-medium text-[#FFFAFA] hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" />
            노래 추가하기
          </button>
        </div>
      </div>

      {/* 링크 입력 모달 (부모 핸들러가 없을 때만 로컬로 사용) */}
      <AddSongModal open={openAdd} onClose={() => setOpenAdd(false)} />
    </div>
  );
}
