"use client";

import ParticipantCard from "./participant-card";

export default function ParticipantList({ users = [] }) {
  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="mb-1 flex items-center justify-left shrink-0">
        <h3 className="text-sm font-semibold text-[#17171B]">참가자</h3>
        <span className="text-xs text-gray-500 ml-4">{users.length}명</span>
      </div>

      {/* 본문: 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto max-h-[400px] pr-1">
        {users.map((u) => (
          <ParticipantCard key={u.id} user={u} />
        ))}

        {users.length === 0 && (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-500">
            참여자가 없어요.
          </div>
        )}
      </div>
    </div>
  );
}
