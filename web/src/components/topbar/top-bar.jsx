// src/components/topbar/top-bar.jsx
"use client";

import SearchBar from "./search-bar";
import SortButton from "./sort-button";
import FilterToggle from "./filter-toggle";
import CreateRoom from "./create-room";

export default function TopBar() {
  return (
    <div className="sticky top-0 z-10 bg-[#FFFAFA]/90 backdrop-blur supports-[backdrop-filter]:bg-[#FFFAFA]/75">
      <div className="mx-auto w-full px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <SearchBar />
          <div className="flex items-center gap-2 md:ml-auto">
            <SortButton />
            <FilterToggle />
            <CreateRoom />
          </div>
        </div>
      </div>
    </div>
  );
}
