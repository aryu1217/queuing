// src/components/topbar/search-bar.jsx
"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

export default function SearchBar() {
  const [q, setQ] = useState("");

  return (
    <div className="md:flex-1">
      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="방 이름이나 태그로 검색"
          className="w-full rounded-full border border-gray-200 bg-white pl-9 pr-9 py-2 text-sm text-[#17171B] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#17171B]/20"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            aria-label="검색 지우기"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
}
