// src/components/topbar/tag-bar.jsx
"use client";

import { useState } from "react";
import { tagClasses, tagLabel } from "@/constants/tags";

export default function TagBar({
  tagOptions = [
    "K-POP",
    "Chill",
    "EDM",
    "Lo-Fi",
    "Study",
    "힙합",
    "발라드",
    "재즈",
    "댄스",
  ],
}) {
  // ✅ 여러 개 선택 가능 → 배열
  const [selected, setSelected] = useState([]);

  function toggleTag(tag) {
    setSelected(
      (prev) =>
        prev.includes(tag)
          ? prev.filter((t) => t !== tag) // 이미 있으면 제거
          : [...prev, tag] // 없으면 추가
    );
  }

  return (
    <div className="w-full bg-[#FFFFFF] px-4 pt-5 overflow-x-auto">
      <div className="flex items-center gap-2">
        {tagOptions.map((t) => {
          const isActive = selected.includes(t);
          return (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              className={[
                "whitespace-nowrap rounded-full px-4 py-1 text-sm transition cursor-pointer",
                isActive
                  ? "bg-[#17171B] text-white"
                  : `${tagClasses(t)} hover:bg-gray-200`,
              ].join(" ")}
            >
              {tagLabel(t)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
