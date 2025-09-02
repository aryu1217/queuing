"use client";

import { useEffect, useRef, useState } from "react";
import { useMyProfile } from "@/hooks/useMyProfile";
import Cookies from "js-cookie";
import { Music2, Power } from "lucide-react";

export default function Header() {
  const { data: profile, isLoading, isError, error } = useMyProfile();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

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
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2"
            ref={wrapRef}
          >
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                className="px-3 py-1 rounded-full text-3xl font-medium text-[#17171B] cursor-pointer transition-colors hover:bg-gray-200 font-hand"
              >
                {nickname}
              </button>

              {open && (
                <div
                  role="menu"
                  // 버튼의 padding-right(px-3=0.75rem)만큼 우측 보정해 텍스트 끝과 정렬
                  className="absolute top-full mt-2 right-[0.75rem] z-50 w-44 rounded-xl border border-black/5 bg-gray-900/2 backdrop-blur-sm shadow-lg ring-1 ring-black/5 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      // TODO: 로그아웃 로직 연결
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-700/10 hover:text-red-700 transition-colors font-hand cursor-pointer"
                  >
                    <Power className="w-5 h-5" />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
