// src/components/room/queue/QueueCard.jsx
"use client";

import { fmtDuration } from "@/dummy-queue-songs";

export default function QueueCard({ track, index, showThumbnail = true }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50">
      <div className="flex min-w-0 items-center gap-2">
        {/* 인덱스 */}
        <span className="w-6 shrink-0 text-xs tabular-nums text-gray-500">
          {index + 1}
        </span>

        {/* 썸네일(옵션) */}
        {showThumbnail && (
          <img
            src={track.thumbnailUrl}
            alt=""
            width={64}
            height={36}
            className="h-9 w-16 rounded object-cover"
          />
        )}

        {/* 제목/길이 */}
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-[#17171B]">
            {track.title}
          </div>
          <div className="text-xs text-gray-500">
            {fmtDuration(track.durationSec)}
          </div>
        </div>
      </div>
    </div>
  );
}
