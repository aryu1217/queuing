// src/components/room/youtube-player.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSetAtom } from "jotai";
import { advanceQueueAtom } from "@/atoms/queue";
import Spinner from "../ui/spinner";

export default function YoutubePlayer({ videoId, autoplay = false }) {
  const wrapRef = useRef(null);
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [apiReady, setApiReady] = useState(false);
  const advanceQueue = useSetAtom(advanceQueueAtom);

  // IFrame API 로드
  useEffect(() => {
    let cancelled = false;
    function loadAPI() {
      return new Promise((resolve) => {
        if (window.YT?.Player) return resolve(window.YT);
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = function () {
          prev && prev();
          resolve(window.YT);
        };
        if (!document.getElementById("youtube-iframe-api")) {
          const s = document.createElement("script");
          s.id = "youtube-iframe-api";
          s.src = "https://www.youtube.com/iframe_api";
          document.head.appendChild(s);
        }
      });
    }
    (async () => {
      await loadAPI();
      if (!cancelled) setApiReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Player 생성(1회)
  useEffect(() => {
    if (!apiReady || !mountRef.current || playerRef.current) return;
    const YT = window.YT;
    playerRef.current = new YT.Player(mountRef.current, {
      host: "https://www.youtube.com",
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 0,
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        origin: window.location.origin,
      },
      events: {
        onReady: (e) => {
          sizeToContainer();
          try {
            const d = e.target.getVideoData();
            if (d?.title) setCurrentTitle(d.title);
          } catch {}
        },
        onStateChange: (e) => {
          const YT = window.YT;
          if (
            e.data === YT.PlayerState.CUED ||
            e.data === YT.PlayerState.PLAYING
          ) {
            try {
              const d = e.target.getVideoData();
              if (d?.title) setCurrentTitle(d.title);
            } catch {}
          }
          if (e.data === YT.PlayerState.ENDED) {
            // ✅ 현재 곡 종료 → 다음 곡 재생
            advanceQueue();
          }
        },
      },
    });

    const ro = new ResizeObserver(() => sizeToContainer());
    if (wrapRef.current) ro.observe(wrapRef.current);

    function sizeToContainer() {
      const el = wrapRef.current;
      const p = playerRef.current;
      if (!el || !p?.setSize) return;
      const { width, height } = el.getBoundingClientRect();
      p.setSize(width, height);
    }

    return () => {
      ro?.disconnect?.();
      if (playerRef.current?.destroy) playerRef.current.destroy();
      playerRef.current = null;
    };
  }, [apiReady, advanceQueue]);

  // videoId 변경 시 로드
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !videoId) return;
    try {
      p.mute?.();
      p.loadVideoById(videoId);
      if (autoplay) p.playVideo?.();
      setTimeout(() => {
        try {
          p.unMute?.();
        } catch {}
      }, 150);
    } catch {
      try {
        p.cueVideoById?.(videoId);
        if (autoplay) p.playVideo?.();
      } catch {}
    }
  }, [videoId, autoplay]);

  return (
    <div className="w-full">
      <div
        ref={wrapRef}
        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black"
      >
        <div ref={mountRef} className="absolute inset-0" />
      </div>
      <div className="mt-3 text-sm text-[#17171B] ">
        {currentTitle ? (
          <span className="font-medium">{currentTitle}</span>
        ) : (
          <div className="inline-flex items-center gap-2">
            <Spinner />
            <span className="text-gray-500">노래 정보를 불러오는 중…</span>
          </div>
        )}
      </div>
    </div>
  );
}
