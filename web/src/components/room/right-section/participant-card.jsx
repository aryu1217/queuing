"use client";

import { Crown } from "lucide-react";

export default function ParticipantCard({
  user,
  isMeHost = false,
  onTransferHost,
  busy = false,
}) {
  const showTransfer = isMeHost && !user.isHost; // 내가 방장이고, 대상이 방장이 아닐 때만

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2">
      <img
        src={user.avatarUrl || "/default-avatar.jpg"}
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 rounded-full object-cover bg-gray-200"
      />

      <div className="min-w-0 flex-1">
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

      {showTransfer && (
        <button
          type="button"
          onClick={() => onTransferHost?.(user.id)}
          disabled={busy}
          className="ml-auto inline-flex items-center rounded-full border border-gray-200 bg-[#17171B] px-2.5 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "처리중…" : "방장 넘기기"}
        </button>
      )}
    </div>
  );
}
