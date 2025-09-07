// src/components/room/right-section/participant-card.jsx
"use client";

import { Crown } from "lucide-react";

export default function ParticipantCard({ user }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2">
      <img
        src={user.avatarUrl || ""}
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 rounded-full object-cover bg-gray-200"
      />
      <div className="min-w-0">
        <div className="flex items-center gap-1 truncate text-sm font-medium text-[#17171B]">
          <span className="truncate">{user.nickname}</span>
          {user.isHost && (
            <Crown
              className="h-4 w-4 shrink-0 text-amber-500"
              aria-label="방장"
              title="방장"
            />
          )}
        </div>
      </div>
    </div>
  );
}
