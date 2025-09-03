// src/components/topbar/filter-toggle.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Filter as FilterIcon } from "lucide-react";

export default function FilterToggle({
  tagOptions = ["K-POP", "Chill", "EDM", "Lo-Fi", "Study"],
}) {
  const [openFilter, setOpenFilter] = useState(false);
  const filterRef = useRef(null);

  // 바깥 클릭 + ESC 닫기
  useEffect(() => {
    const onDown = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setOpenFilter(false);
      }
    };
    const onEsc = (e) => e.key === "Escape" && setOpenFilter(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div className="relative" ref={filterRef}>
      <button
        type="button"
        onClick={() => setOpenFilter((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={openFilter}
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-[#17171B] hover:bg-gray-50"
      >
        <FilterIcon className="h-4 w-4" />
        <span className="font-medium">필터</span>
      </button>

      {openFilter && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-black/5 bg-white p-4 shadow-lg ring-1 ring-black/5">
          <p className="text-sm font-medium text-[#17171B]">태그</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tagOptions.map((t) => (
              <button
                key={t}
                type="button"
                className="rounded-full border border-black/10 bg-gray-100 px-3 py-1 text-xs text-[#17171B] hover:bg-gray-200"
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-sm text-[#17171B] hover:bg-gray-100"
              onClick={() => setOpenFilter(false)}
            >
              취소
            </button>
            <button
              type="button"
              className="rounded-full bg-[#17171B] px-4 py-1.5 text-sm font-medium text-[#FFFAFA] hover:opacity-90"
              onClick={() => setOpenFilter(false)}
            >
              적용
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
