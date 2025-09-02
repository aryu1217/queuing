"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateNicknamePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const res = await fetch("/api/profile/nickname", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname }),
    });

    // CreateNicknamePage.jsx (응답 처리만 바꿈)
    if (res.ok) {
      router.replace("/main");
      return;
    }
    if (res.status === 409) {
      setErr("이미 사용 중인 닉네임입니다.");
      setLoading(false);
      return;
    }

    const data = await res.json().catch(() => ({}));
    setErr(data?.error || "닉네임 저장 중 에러가 발생했습니다.");
    setLoading(false);
  }

  return (
    <div className="bg-[#FDFDFD] h-screen flex flex-col justify-center items-center text-[#242424]">
      <header className="mb-6 text-xl font-bold">
        닉네임을 설정해주세요 ✍️
      </header>

      <div className="w-full max-w-xs">
        <form className="flex flex-col" onSubmit={onSubmit}>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="ex) 큐돌이17"
            className="rounded-t-4xl border border-gray-300 py-2 text-center"
            disabled={loading}
          />
          <button
            type="submit"
            className="rounded-b-4xl border border-t-0 border-gray-300 bg-[#242424] px-3 py-2 text-[#FDFDFD] hover:bg-black transition cursor-pointer disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "저장 중..." : "닉네임 저장하기"}
          </button>
        </form>

        {err && <p className="mt-3 text-center text-sm text-red-500">{err}</p>}
      </div>
    </div>
  );
}
