// src/components/room/topbar.jsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Copy, Check, QrCode, Users, LogOut } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function TopBar({
  title = "방제목",
  currentListeners = 0,
  maxListeners = 0,
  exitHref = "/main",
}) {
  const router = useRouter();
  const { code: codeFromUrl } = useParams();
  const code = Array.isArray(codeFromUrl) ? codeFromUrl[0] : codeFromUrl;

  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const qrRef = useRef(null);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/room/${code}`
      : `https://your.app/room/${code}`;

  useEffect(() => {
    const onDown = (e) => {
      if (qrRef.current && !qrRef.current.contains(e.target)) setQrOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setQrOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(String(code || ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  // 1) 명시적 나가기 버튼
  const leaveNow = useCallback(async () => {
    try {
      await fetch("/api/rooms/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        keepalive: true,
      });
    } catch {}
    router.push(exitHref);
  }, [code, exitHref, router]);

  // 2) 뒤로가기 인터셉트: confirm 후 삭제 → 실제 뒤로가기
  useEffect(() => {
    if (!code) return;

    // 이미 가드가 올라가 있으면 다시 pushState 하지 않음
    if (!history.state || !history.state._guard) {
      history.pushState({ _guard: true }, "", location.href);
    }

    const onPopState = async () => {
      const ok = window.confirm("방에서 나가시겠습니까?");
      if (!ok) {
        // 취소 시 가드를 다시 복구
        if (!history.state || !history.state._guard) {
          history.pushState({ _guard: true }, "", location.href);
        }
        return;
      }
      try {
        await fetch("/api/rooms/leave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
          keepalive: true,
        });
      } catch {}
      // 가드가 1개만 존재하므로 한 번만 back
      router.back();
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [code, router]);

  return (
    <header className="sticky top-0 z-20 w-full bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="mx-auto flex h-14 items-center justify-between px-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => history.back()} // 브라우저 뒤로가기 트리거 → 위 popstate 로직이 인터셉트
            aria-label="뒤로가기"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5 text-[#17171B]" />
          </button>

          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Room</span>
            <h1 className="text-base font-semibold text-[#17171B] leading-5">
              {title}
            </h1>
          </div>

          {/* 코드 + 복사 */}
          <div className="ml-2 flex items-center gap-1">
            <span className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-[#17171B]">
              코드: {code}
            </span>
            <button
              type="button"
              onClick={copyCode}
              aria-label="코드 복사"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
              title="코드 복사"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-[#17171B]" />
              )}
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2" ref={qrRef}>
          {/* 인원 */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-[#17171B]">
            <Users className="h-4 w-4" />
            <span className="tabular-nums">
              {currentListeners}/{maxListeners}
            </span>
          </div>

          {/* QR 버튼 */}
          <div className="relative">
            <button
              type="button"
              aria-label="QR 보기"
              onClick={() => setQrOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
              title="QR 코드"
            >
              <QrCode className="h-5 w-5 text-[#17171B]" />
            </button>

            {qrOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
                <div className="text-xs text-gray-500 mb-2">입장 QR</div>
                <div className="flex justify-center">
                  <QRCodeCanvas value={shareUrl} size={160} includeMargin />
                </div>
                <div className="mt-2 truncate text-center text-xs text-gray-500">
                  {shareUrl}
                </div>
              </div>
            )}
          </div>

          {/* 나가기 버튼 (즉시 삭제 후 지정 경로 이동) */}
          <button
            type="button"
            onClick={leaveNow}
            title="나가기"
            aria-label="나가기"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
          >
            <LogOut className="h-5 w-5 text-[#17171B]" />
          </button>
        </div>
      </div>
    </header>
  );
}
