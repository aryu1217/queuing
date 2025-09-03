"use client";

import { useEffect, useRef, useState } from "react";
import { useMyProfile } from "@/hooks/useMyProfile";
import Cookies from "js-cookie";
import { Music2, Power } from "lucide-react";
import { useRouter } from "next/navigation";
import Spinner from "./ui/spinner";
import TopBar from "./topbar/top-bar";

export default function Header() {
  const { data: profile, isLoading, isError, error } = useMyProfile();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const router = useRouter();

  function handleLogout() {
    Cookies.remove("nickname", { path: "/" });

    fetch("/api/auth/signOut", { method: "POST" }).finally(() =>
      router.replace("/login")
    );
  }

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

  if (isLoading) return <Spinner />;
  if (isError)
    return <div className="p-6 text-red-500">에러: {error.message}</div>;

  const nickname = profile?.nickname ?? Cookies.get("nickname");

  return (
    <header className="relative z-50 isolate  bg-white py-3 px-6">
      <div className="flex items-center justify-between">
        {/* 왼쪽 로고/타이틀 */}
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Music2 className="w-7 h-7" />
          큐잉
        </h1>

        {/* 가운데 TopBar */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <TopBar />
        </div>

        {/* 오른쪽 닉네임 */}
        {nickname && (
          <div className="relative" ref={wrapRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              className="px-3 py-1 rounded-full text-lg font-semibold text-gray-800 cursor-pointer transition-colors hover:bg-gray-100"
            >
              {nickname}
            </button>

            {open && (
              <div
                role="menu"
                className="absolute top-full mt-2 right-0 z-50 w-44 rounded-xl border border-black/5 bg-white shadow-lg ring-1 ring-black/5 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Power className="w-5 h-5" />
                  로그아웃
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
