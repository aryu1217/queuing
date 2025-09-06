// src/components/topbar/create-room.jsx
"use client";

import { useState, useMemo } from "react";
import Modal from "@/components/ui/modal";
import { PlusCircle, X } from "lucide-react";
import { TAG_META, tagLabel, tagClasses } from "@/constants/tags";
import { useRouter } from "next/navigation";

const MAX_TAGS = 5;

export default function CreateRoom() {
  const [open, setOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  const tags = useMemo(() => Object.keys(TAG_META), []);

  function toggleTag(key) {
    setSelectedTags((prev) => {
      const set = new Set(prev);
      if (set.has(key)) {
        set.delete(key);
      } else {
        if (set.size >= MAX_TAGS) return prev; // 최대 개수 제한
        set.add(key);
      }
      return Array.from(set);
    });
  }

  async function onCreate() {
    if (submitting) return; // 이미 진행 중이면 탈출
    setSubmitting(true);

    setErr("");
    if (!title.trim()) {
      setErr("방 이름을 입력해 주세요.");
      return;
    }
    if (isPrivate && password.length < 4) {
      setErr("비밀번호는 4자 이상이어야 합니다.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          isPrivate,
          password: isPrivate ? password : undefined,
          tags: selectedTags,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "방 생성에 실패했습니다.");

      // 성공 → 입력 초기화 + 이동
      setOpen(false);
      setTitle("");
      setPassword("");
      setSelectedTags([]);
      router.push(`/room/${data.room.code}`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* 방 생성 버튼 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center cursor-pointer whitespace-nowrap select-none gap-1.5 rounded-full border border-gray-200 bg-[#17171B] px-3 text-[13px] leading-none font-medium text-white hover:opacity-90"
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
              className="rounded-full p-1 hover:bg-gray-100 cursor-pointer"
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* 비공개 여부 */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">비공개 방</label>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-4 w-4 accent-[#17171B] cursor-pointer"
              />
            </div>

            {/* 비밀번호 입력 */}
            {isPrivate && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  비밀번호
                </label>
                <input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  className="w-full rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm text-[#17171B] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#17171B]/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">4자 이상</p>
              </div>
            )}

            {/* 태그(옵션) */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm text-gray-600 mb-1">
                  태그(선택)
                </label>
                <span className="text-[11px] text-gray-500">
                  {selectedTags.length}/{MAX_TAGS}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((t) => {
                  const active = selectedTags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      aria-pressed={active}
                      className={[
                        "rounded-full px-3 py-1 text-xs select-none transition",
                        "cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#17171B]/20",
                        tagClasses(t), // 기본 색
                        active
                          ? "ring-2 ring-[#17171B] bg-[#17171B] text-black border-transparent"
                          : "",
                      ].join(" ")}
                      title={tagLabel(t)}
                    >
                      {tagLabel(t)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 에러 */}
            {err && <p className="text-xs text-red-500">{err}</p>}
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
              disabled={submitting}
              onClick={onCreate}
              className="rounded-full bg-[#17171B] px-4 py-1.5 text-sm font-medium text-[#FFFAFA] hover:opacity-90 cursor-pointer disabled:opacity-60"
            >
              {submitting ? "만드는 중…" : "만들기"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
