// components/room-card.jsx
"use client";

import { Music2, Users2, Lock } from "lucide-react";
import { tagClasses, tagLabel } from "@/constants/tags";

export default function RoomCard({ room, onJoin }) {
  const {
    title,
    hostNickname,
    isPrivate = false,
    tags = [],
    listenersCount = 0,
    capacity,
    isUnlimited = false,
    nowPlaying,
  } = room;

  const cap = isUnlimited ? Infinity : capacity ?? 8;
  const isFull = !isUnlimited && listenersCount >= cap;
  const capDisplay = isUnlimited ? "∞" : cap;

  const progress = nowPlaying?.durationSec
    ? Math.min(
        100,
        ((nowPlaying.positionMs ?? 0) / (nowPlaying.durationSec * 1000)) * 100
      )
    : 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-300/10 p-4 shadow-sm hover:shadow-md hover:bg-gray-300/20 transition">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-2xl font-semibold text-[#17171B] font-hand truncate">
          {title}
        </h3>
        {isPrivate && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            <Lock className="h-3.5 w-3.5" />
            비공개
          </span>
        )}
      </div>

      <p className="mt-1 text-sm text-gray-500">
        방장: <span className="font-medium">{hostNickname}</span>
      </p>

      {nowPlaying && (
        <div className="mt-3">
          <div className="flex items-center gap-2 text-sm text-gray-800">
            <Music2 className="h-4 w-4 text-gray-500" />
            <span className="truncate">{nowPlaying.title}</span>
            <span className="text-gray-400">·</span>
            <span className="truncate text-gray-600">{nowPlaying.artist}</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-gray-500 transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {!!tags.length && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className={`rounded-full px-2 py-0.5 text-xs ${tagClasses(t)}`}
            >
              {tagLabel(t)}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-centered justify-between">
        <div className="flex items-center gap-1.5 text-sm">
          <Users2
            className={`h-4 w-4 ${isFull ? "text-red-600" : "text-gray-600"}`}
          />
          <span
            className={`${
              isFull ? "text-red-600 font-semibold" : "text-gray-800"
            }`}
          >
            {listenersCount} / {capDisplay} 명
          </span>
          {isFull && !isUnlimited && (
            <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">
              가득참
            </span>
          )}
        </div>

        <button
          onClick={() => !isFull && onJoin?.(room)}
          disabled={isFull && !isUnlimited}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition font-hand
            ${
              isFull && !isUnlimited
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#17171B] text-[#FFFAFA] hover:opacity-90"
            }`}
        >
          입장하기
        </button>
      </div>
    </div>
  );
}
