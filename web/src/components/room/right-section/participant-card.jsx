// src/components/room/right-section/participant-card.jsx
"use client";

export default function ParticipantCard({ user }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2">
      <img
        src={user.avatarUrl}
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 rounded-full object-cover bg-gray-200"
      />
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-[#17171B]">
          {user.nickname}
        </div>
      </div>
    </div>
  );
}
