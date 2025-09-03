// src/components/topbar/top-bar.jsx
"use client";

import SearchBar from "./search-bar";
import SortButton from "./sort-button";
import FilterToggle from "./tag-bar";
import CreateRoom from "./create-room";

export default function TopBar() {
  return (
    <div className="sticky top-0 z-10 bg-[#FFFFFF]/90 backdrop-blur supports-[backdrop-filter]:bg-[#FFFFFF]/75">
      <div className="mx-auto w-full px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          {/* ✅ SearchBar가 넓게 자리 차지 */}
          <div className="flex-1">
            <SearchBar />
          </div>

          {/* 버튼 묶음은 내용 크기만큼만 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <SortButton />
            <CreateRoom />
          </div>
        </div>
      </div>
    </div>
  );
}
