// components/room-card.jsx
"use client";

import { Music2, Users2, Lock } from "lucide-react";
import { TAG_META, tagClasses, tagLabel } from "@/constants/tags";
import { joinRoom } from "@/lib/joinRoom";
import { useRouter } from "next/navigation";

// 레이블/변형값을 TAG_META의 정식 키로 정규화
function normalizeTagKey(input) {
  if (!input) return null;
  const raw =
    typeof input === "string"
      ? input
      : input.key ?? input.tag ?? input.value ?? "";
  const s = String(raw).trim();
  if (!s) return null;

  if (Object.prototype.hasOwnProperty.call(TAG_META, s)) return s;

  const lower = s.toLowerCase();
  for (const k of Object.keys(TAG_META)) {
    if (String(tagLabel(k)).toLowerCase() === lower) return k;
  }
  const canonical = lower.replace(/[\s-]/g, "");
  const alias = {
    kpop: "kpop",
    "k-pop": "kpop",
    jpop: "jpop",
    "j-pop": "jpop",
    citypop: "citypop",
    "city-pop": "citypop",
    hiphop: "hiphop",
    rnb: "rnb",
    "r&b": "rnb",
    lofi: "lofi",
    indieband: "indie_band",
    "indie-band": "indie_band",
    edm: "edm",
    chill: "chill",
    study: "study",
  };
  return alias[canonical] ?? null;
}

export default function RoomCard({ room, onJoin }) {
  const router = useRouter();

  const {
    title,
    hostNickname,
    isPrivate = false,
    tags = [],
    listenersCount = 0,
    capacity,
    isUnlimited = false,
    nowPlaying,
    code, // joinRoom에 필요
  } = room;

  const normalizedTags = Array.isArray(tags)
    ? tags.map(normalizeTagKey).filter(Boolean)
    : [];

  const cap = isUnlimited ? Infinity : capacity ?? 8;
  const isFull = !isUnlimited && listenersCount >= cap;
  const capDisplay = isUnlimited ? "∞" : cap;

  const progress = nowPlaying?.durationSec
    ? Math.min(
        100,
        ((nowPlaying.positionMs ?? 0) / (nowPlaying.durationSec * 1000)) * 100
      )
    : 0;

  // 내부 입장 로직 (항상 실행)
  const handleJoin = async (r) => {
    try {
      let password;
      if (r.isPrivate) {
        password = window.prompt("비밀번호를 입력하세요") || "";
      }
      const data = await joinRoom({ code: r.code ?? code, password });
      // 성공 시 이동
      if (data?.room?.code) {
        router.push(`/room/${data.room.code}`);
      }
      return data; // onJoin 콜백에서 쓰게 반환
    } catch (e) {
      alert(e.message || "입장에 실패했어요.");
      return null;
    }
  };

  return (
    <div
      className="
        rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm
        transition hover:shadow-md hover:ring-[#17171B]/25
      "
    >
      <div className="p-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-[#17171B] truncate">
            {title}
          </h3>
          {isPrivate && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#17171B]/5 px-2 py-0.5 text-xs text-[#17171B] ring-1 ring-[#17171B]/15">
              <Lock className="h-3.5 w-3.5 text-[#17171B]" />
              잠금
            </span>
          )}
        </div>

        {/* 방장 */}
        <p className="mt-1 text-sm text-gray-500">
          방장:{" "}
          <span className="font-medium text-gray-700">{hostNickname}</span>
        </p>

        {/* 현재 재생 (기존 박스 UI 유지) */}
        {nowPlaying && (
          <div className="mt-3 rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-800">
              <Music2 className="h-4 w-4 text-gray-400" />
              <span className="truncate">{nowPlaying.title}</span>
              <span className="text-gray-300">·</span>
              <span className="truncate text-gray-600">
                {nowPlaying.artist}
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-rose-100">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-rose-400 to-rose-100 transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* 태그 */}
        {!!normalizedTags.length && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {normalizedTags.map((k) => (
              <span
                key={k}
                className={`rounded-full px-2 py-0.5 text-xs  ${tagClasses(k)}`}
                title={tagLabel(k)}
              >
                {tagLabel(k)}
              </span>
            ))}
          </div>
        )}

        {/* 푸터 */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm">
            <Users2
              className={`h-4 w-4 ${
                isFull ? "text-rose-600" : "text-gray-500"
              }`}
            />
            <span
              className={`${
                isFull ? "text-rose-700 font-semibold" : "text-gray-800"
              }`}
            >
              {listenersCount} / {capDisplay} 명
            </span>
            {isFull && !isUnlimited && (
              <span className="ml-2 rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-700 ring-1 ring-rose-200">
                가득참
              </span>
            )}
          </div>

          <button
            onClick={async () => {
              if (isFull) return;
              const result = await handleJoin(room); // ← 항상 내부 join 실행
              if (result && typeof onJoin === "function") {
                onJoin(result); // 선택: 부모에서 후속처리 할 수 있게 콜백
              }
            }}
            disabled={isFull && !isUnlimited}
            className={[
              "rounded-full px-4 py-1.5 text-xs font-medium transition focus:outline-none",
              "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#17171B]/30",
              isFull && !isUnlimited
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[#17171B] text-white hover:opacity-90",
            ].join(" ")}
          >
            입장하기
          </button>
        </div>
      </div>
    </div>
  );
}
