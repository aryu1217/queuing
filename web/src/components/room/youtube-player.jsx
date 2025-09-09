// src/components/room/youtube-player.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import Spinner from "../ui/spinner";

export default function YoutubePlayer({ videoId, autoplay = false }) {
  const wrapRef = useRef(null);
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [apiReady, setApiReady] = useState(false);

  // 1) IFrame API 로드 (한 번만)
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

  // 2) Player 생성 (한 번만)
  useEffect(() => {
    if (!apiReady || !mountRef.current || playerRef.current) return;

    const YT = window.YT;
    playerRef.current = new YT.Player(mountRef.current, {
      // 처음엔 videoId 없이 생성해도 됨
      host: "https://www.youtube.com",
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 0, // 최초엔 0, 실제 재생은 아래 loadVideoById에서 처리
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
            const data = e.target.getVideoData();
            if (data?.title) setCurrentTitle(data.title);
          } catch {}
        },
        onStateChange: (e) => {
          if (
            e.data === YT.PlayerState.CUED ||
            e.data === YT.PlayerState.PLAYING
          ) {
            try {
              const data = e.target.getVideoData();
              if (data?.title) setCurrentTitle(data.title);
            } catch {}
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
  }, [apiReady]);

  // 3) videoId가 바뀔 때마다 로드
  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    if (!videoId || typeof videoId !== "string") return; // null/빈 값이면 무시

    try {
      // 자동재생 정책 회피
      p.mute?.();
      p.loadVideoById(videoId);
      if (autoplay) p.playVideo?.();
      // 살짝 딜레이 뒤에 unMute
      setTimeout(() => {
        try {
          p.unMute?.();
        } catch {}
      }, 150);
    } catch (e) {
      // 실패 시 마지막 수단으로 cue 후 play
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

      <div className="mt-3 text-sm text-[#17171B]">
        {currentTitle ? (
          <span className="font-medium">{currentTitle}</span>
        ) : (
          <div className="inline-flex items-center gap-2">
            <Spinner />
            <span className="text-gray-500 whitespace-nowrap">
              노래 정보를 불러오는 중…
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
