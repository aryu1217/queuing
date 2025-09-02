"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/utils/supabase/client";

import { useMyProfile } from "@/hooks/useMyProfile";

import Cookies from "js-cookie";

export default function LoginPage() {
  const supabase = createClient();

  const router = useRouter();
  const search = useSearchParams();
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const { data: profile, isLoading } = useMyProfile();

  useEffect(() => {
    if (!isLoading && profile?.nickname) {
      router.replace("/main");
    }

    if (Cookies.get("nickname")) {
      router.replace("/main");
    }
  }, [isLoading, profile, router]);

  if (isLoading) {
    return <div>확인 중...</div>;
  }

  // 1~8자, 한글/영문/숫자/_/- 허용
  const nicknameRegex = /^[가-힣a-zA-Z0-9_-]{1,8}$/;

  function validateNickname(nickname) {
    if (!nicknameRegex.test(nickname)) {
      return "닉네임은 한글/영문/숫자/_/-만 사용 가능하며 1~8자여야 합니다.";
    }
    return null;
  }

  function handleGoogleLogin() {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/post-login?next=/main`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    const value = nickname.trim();
    if (!value) {
      setErr("닉네임을 입력해 주세요.");
      return;
    }

    const error = validateNickname(value);
    if (error) {
      setErr(error);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/login/nicknameStart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: value }),
      // same-origin 요청이므로 credentials 옵션은 생략해도 쿠키가 저장됩니다.
    });

    if (res.ok) {
      const next = search.get("next") || "/main";
      // 쿠키 반영 보장
      router.refresh();
      router.replace(next);
      // 혹시 SPA 네비가 막히면 하드 네비로 백업
      setTimeout(() => {
        if (window.location.pathname !== next) {
          window.location.assign(next);
        }
      }, 50);
      return;
    }

    const data = await res.json().catch(() => ({}));
    setErr(data?.error || "에러가 발생했어요.");
    setLoading(false);
  }

  return (
    <div className="bg-[#FDFDFD] h-screen flex flex-col justify-center items-center text-[#242424]">
      <header className="mb-6 text-xl font-bold">
        큐잉에 오신걸 환영해요 👋
      </header>

      <div className="w-full max-w-xs">
        {/* 닉네임 로그인 */}
        <form className="flex flex-col" onSubmit={onSubmit}>
          <input
            type="text"
            name="nickname"
            placeholder="ex) 큐돌이17"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            disabled={loading}
            className="rounded-t-4xl border border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-gray-200 text-center"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-b-4xl border border-t-0 border-gray-300 bg-[#242424] px-3 py-2 text-[#FDFDFD] hover:bg-black transition cursor-pointer disabled:opacity-60"
          >
            {loading ? "시작 중..." : "닉네임으로 시작하기"}
          </button>
        </form>

        {err && <p className="mt-3 text-center text-sm text-red-500">{err}</p>}

        {/* 구분선 */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-3 text-xs text-gray-400 uppercase">or</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-2 rounded-3xl border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          onClick={() => {
            // const supabase = createClient()
            handleGoogleLogin();
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9A6.4 6.4 0 0 1 5.6 12 6.4 6.4 0 0 1 12 5.9c1.9 0 3.2.8 3.9 1.4l2.7-2.6C17.1 3 14.8 2 12 2 6.8 2 2.5 6.2 2.5 12S6.8 22 12 22c3.5 0 6-1.2 7.3-3.4 1.3-2 1.5-4.5 1.2-6.3H12z"
            />
          </svg>
          Google로 시작하기
        </button>
      </div>
    </div>
  );
}
