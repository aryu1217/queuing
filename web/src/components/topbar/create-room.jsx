// src/components/topbar/create-room.jsx
"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";
import { PlusCircle, X } from "lucide-react";
import { TAG_META, tagLabel, tagClasses } from "@/constants/tags";

export default function CreateRoom() {
  const [open, setOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  // 프리셋 태그 목록
  const tags = Object.keys(TAG_META);

  return (
    <>
      {/* 방 생성 버튼 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-[#17171B] px-4 py-2 text-sm font-medium text-[#FFFAFA] hover:opacity-90"
      >
        <PlusCircle className="h-4 w-4" />
        방생성
      </button>

      {/* 모달 */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="p-5">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#17171B]">
              새 방 만들기
            </h2>
            <button
              className="rounded-full p-1 hover:bg-gray-100"
              onClick={() => setOpen(false)}
              aria-label="닫기"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* 본문 */}
          <div className="mt-4 space-y-4">
            {/* 방 이름 */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                방 이름
              </label>
              <input
                type="text"
                placeholder="예) 카페 BGM"
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm text-[#17171B] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#17171B]/20"
              />
            </div>

            {/* 비공개 여부 */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">비공개 방</label>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-4 w-4 accent-[#17171B]"
              />
            </div>

            {/* 비밀번호 입력 (비공개일 때만) */}
            {isPrivate && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  비밀번호
                </label>
                <input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  className="w-full rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm text-[#17171B] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#17171B]/20"
                />
              </div>
            )}

            {/* 태그 선택 */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                태그(선택)
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs ${tagClasses(
                      t
                    )}`}
                  >
                    {tagLabel(t)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-sm text-[#17171B] hover:bg-gray-100 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              취소
            </button>
            <button
              type="button"
              className="rounded-full bg-[#17171B] px-4 py-1.5 text-sm font-medium text-[#FFFAFA] hover:opacity-90 cursor-pointer"
              onClick={() => setOpen(false)} // TODO: 서버 연결
            >
              만들기
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
