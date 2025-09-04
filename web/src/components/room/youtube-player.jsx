// src/components/room/youtube-player.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import Spinner from "../ui/spinner";

export default function YoutubePlayer({
  videoId = "M7lc1UVf-VE",
  autoplay = false,
}) {
  const wrapRef = useRef(null);
  const mountRef = useRef(null);
  const playerRef = useRef(null);

  const [currentTitle, setCurrentTitle] = useState("");

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

      if (playerRef.current?.destroy) playerRef.current.destroy();

      playerRef.current = new YT.Player(mountRef.current, {
        videoId,
        host: "https://www.youtube.com",
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          origin: window.location.origin,
        },
        events: {
          // 방 입장 시 1회
          onReady: (e) => {
            sizeToContainer();
            const data = e.target.getVideoData();
            if (data?.title) setCurrentTitle(data.title);
            if (autoplay) {
              try {
                e.target.mute();
              } catch {}
              e.target.playVideo();
            }
          },
          // 영상 바뀔 때 (cue/play 시 제목 갱신)
          onStateChange: (e) => {
            if (
              e.data === YT.PlayerState.CUED ||
              e.data === YT.PlayerState.PLAYING
            ) {
              const data = e.target.getVideoData();
              if (data?.title) setCurrentTitle(data.title);
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
    }

    init();

    return () => {
      cancelled = true;
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, [videoId, autoplay]);

  return (
    <div className="w-full">
      {/* 플레이어 (16:9 비율 유지) */}
      <div
        ref={wrapRef}
        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black"
      >
        {/* YouTube iframe이 여기 붙음 */}
        <div ref={mountRef} className="absolute inset-0" />
      </div>

      {/* ↓↓↓ 영상 아래 일반 텍스트 캡션 */}
      <div className="mt-3 text-sm text-[#17171B] ">
        {currentTitle ? (
          <span className="font-medium">{currentTitle}</span>
        ) : (
          <div className="inline-flex items-center gap-2">
            <Spinner />
            <span className="text-gray-500 whitespace-nowrap ">
              노래 정보를 불러오는 중…
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
