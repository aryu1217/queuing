"use client";

import { useMyProfile } from "@/hooks/useMyProfile";
import Cookies from "js-cookie";
import { Music2 } from "lucide-react";

export default function Header() {
  const { data: profile, isLoading, isError, error } = useMyProfile();

  if (isLoading) return <div className="p-6">로딩…</div>;
  if (isError)
    return <div className="p-6 text-red-500">에러: {error.message}</div>;

  const nickname = profile?.nickname ?? Cookies.get("nickname");

  return (
    <header className="border-b border-gray-400 bg-[#FFFAFA] pb-4 pt-0">
      <div className="relative flex items-center justify-center">
        {/* 가운데 타이틀 */}
        <h1 className="flex items-center gap-2 text-5xl font-normal text-[#17171B] font-hand">
          <Music2 className="w-8 h-8 mt-2" />
          큐잉
        </h1>

        {/* 오른쪽 상단 닉네임 */}
        {nickname && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <span className="px-3 py-1 font-hand rounded-full text-3xl font-medium text-[#17171B] cursor-pointer transition-colors hover:bg-gray-200">
              {nickname}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
