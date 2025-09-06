// src/components/room/topbar.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Copy, Check, QrCode, Users, LogOut } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function TopBar({
  title = "방제목",
  currentListeners = 0,
  maxListeners = 0,
  exitHref = "/main",
  code: codeProp, // (선택) 부모가 넘겨주면 우선 사용
}) {
  const router = useRouter();
  const { code: codeFromUrl } = useParams();
  const code =
    codeProp ??
    (Array.isArray(codeFromUrl) ? codeFromUrl[0] : codeFromUrl) ??
    "";

  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const qrRef = useRef(null);
  const leftRef = useRef(false);

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
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  async function leaveRoom() {
    if (!code || leftRef.current) return;
    leftRef.current = true;
    try {
      await fetch("/api/rooms/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        keepalive: true,
      });
    } catch {}
    router.push(exitHref);
  }

  // 탭 닫기/뒤로가기 시 best-effort 제거
  useEffect(() => {
    if (!code) return;
    const send = () => {
      if (leftRef.current) return;
      leftRef.current = true;
      try {
        navigator.sendBeacon("/api/rooms/leave", JSON.stringify({ code }));
      } catch {}
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") send();
    };
    window.addEventListener("pagehide", send);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", send);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [code]);

  return (
    <header className="sticky top-0 z-20 w-full bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="mx-auto flex h-14 items-center justify-between px-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
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
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-[#17171B]">
            <Users className="h-4 w-4" />
            <span className="tabular-nums">
              {currentListeners}/{maxListeners}
            </span>
          </div>

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

          {/* 나가기 */}
          <button
            type="button"
            onClick={leaveRoom}
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
