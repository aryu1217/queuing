// src/components/room/youtube-player.jsx
"use client";

import { useEffect, useRef } from "react";

export default function YoutubePlayer({
  videoId = "M7lc1UVf-VE",
  autoplay = false,
}) {
  const wrapRef = useRef(null); // 라운딩/비율 적용하는 래퍼
  const mountRef = useRef(null); // YT.Player가 붙는 div
  const playerRef = useRef(null);

  // API 로더 (중복 로드 방지)
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

    async function init() {
      const YT = await loadAPI();
      if (cancelled || !mountRef.current) return;

      // 기존 파괴
      if (playerRef.current?.destroy) playerRef.current.destroy();

      playerRef.current = new YT.Player(mountRef.current, {
        videoId,
        host: "https://www.youtube.com",
        width: "100%", // ← 컨테이너 100%
        height: "100%", // ← 컨테이너 100%
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            // 한 번 컨테이너 실제 사이즈로 보정
            sizeToContainer();
            if (autoplay) {
              try {
                e.target.mute();
              } catch {}
              e.target.playVideo();
            }
          },
        },
      });

      // 컨테이너 리사이즈에 맞춰 iframe 크기 갱신
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
        ro.disconnect();
      };
    }

    init();

    return () => {
      cancelled = true;
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, [videoId, autoplay]);

  return (
    // 비율 + 라운딩 + 가운데(절대배치로 꽉 채움)
    <div
      ref={wrapRef}
      className="relative w-[800px] aspect-video rounded-2xl overflow-hidden bg-black"
    >
      {/* 이 div 안에 iframe이 생성됨 */}
      <div ref={mountRef} className="absolute inset-0" />
    </div>
  );
}
