// src/components/topbar/tag-bar.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TAG_META, tagClasses, tagLabel } from "@/constants/tags";
import { SlidersHorizontal, X } from "lucide-react";

export default function TagBar({
  initialVisibleCount = 7,
  maxFavorites = 7,
  defaultFavorites = [],
  onFavoritesChange,
  onTagClick,
}) {
  const allTags = useMemo(() => Object.keys(TAG_META), []);
  const initial = useMemo(() => {
    const base = defaultFavorites?.length
      ? defaultFavorites
      : allTags.slice(0, initialVisibleCount);
    const uniq = Array.from(new Set(base)).filter((t) => allTags.includes(t));
    return uniq.slice(0, maxFavorites);
  }, [allTags, defaultFavorites, initialVisibleCount, maxFavorites]);

  const [favorites, setFavorites] = useState(initial);

  useEffect(() => {
    setFavorites((prev) => {
      const keep = prev.filter((t) => allTags.includes(t));
      const cap = Math.min(maxFavorites, initialVisibleCount);
      if (keep.length >= cap) {
        const next = keep.slice(0, maxFavorites);
        onFavoritesChange?.(next);
        return next;
      }
      const need = cap - keep.length;
      const fill = allTags.filter((t) => !keep.includes(t)).slice(0, need);
      const next = [...keep, ...fill].slice(0, maxFavorites);
      onFavoritesChange?.(next);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTags.join(","), initialVisibleCount, maxFavorites]);

  const [openEdit, setOpenEdit] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!openEdit) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpenEdit(false);
      }
    };
    const onEsc = (e) => e.key === "Escape" && setOpenEdit(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [openEdit]);

  const atLimit = favorites.length >= maxFavorites;

  const addFavorite = (t) => {
    if (atLimit || favorites.includes(t)) return;
    const next = [...favorites, t];
    setFavorites(next);
    onFavoritesChange?.(next);
  };
  const removeFavorite = (t) => {
    if (!favorites.includes(t)) return;
    const next = favorites.filter((x) => x !== t);
    setFavorites(next);
    onFavoritesChange?.(next);
  };
  const toggleFavorite = (t) => {
    if (favorites.includes(t)) removeFavorite(t);
    else addFavorite(t);
  };
  const clearFavorites = () => {
    setFavorites([]);
    onFavoritesChange?.([]);
  };

  return (
    <div ref={rootRef} className="relative w-full bg-white">
      {/* 상단 즐겨찾기 바 (중립 스타일) */}
      <div className="flex items-center justify-between gap-2 px-4 pt-5">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {favorites.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTagClick?.(t)}
              className={[
                "shrink-0 whitespace-nowrap rounded-full px-4 py-1 text-xs transition cursor-pointer",
                `${tagClasses(t)} hover:bg-gray-200`,
              ].join(" ")}
              title={tagLabel(t)}
            >
              {tagLabel(t)}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpenEdit((v) => !v)}
          aria-expanded={openEdit}
          className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-[#17171B] hover:bg-gray-50 cursor-pointer"
          title="필터 편집"
        >
          <SlidersHorizontal className="h-4 w-4" />
          필터 편집
        </button>
      </div>

      {/* 편집 패널 */}
      {openEdit && (
        <div className="absolute left-4 right-4 top-full z-40 mt-2 rounded-2xl border border-gray-100 bg-white/98 p-3 px-5 shadow-xl">
          {/* 즐겨찾기 칩 + 카운터 */}
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {favorites.length ? (
                favorites.map((t) => (
                  <span
                    key={`fav-${t}`}
                    className="inline-flex items-center gap-1 rounded-full bg-[#17171B]/5 px-2.5 py-1 text-xs text-[#17171B] border border-gray-200"
                  >
                    {tagLabel(t)}
                    <button
                      type="button"
                      onClick={() => removeFavorite(t)}
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-gray-200/80 cursor-pointer"
                      aria-label={`${tagLabel(t)} 제거`}
                      title="제거"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500">즐겨찾기 없음</span>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span
                className={`text-xs ${
                  atLimit ? "text-red-600 font-medium" : "text-gray-500"
                }`}
              >
                {atLimit
                  ? `즐겨찾기 최대 ${maxFavorites}/${maxFavorites}개`
                  : `즐겨찾기 ${favorites.length}/${maxFavorites}`}
              </span>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={clearFavorites}
                  className="rounded-full px-2.5 py-1 text-xs text-[#17171B] hover:bg-gray-100 cursor-pointer"
                >
                  초기화
                </button>
                <button
                  type="button"
                  onClick={() => setOpenEdit(false)}
                  className="rounded-full bg-[#17171B] px-3 py-1 text-xs font-medium text-white hover:opacity-90 cursor-pointer"
                >
                  완료
                </button>
              </div>
            </div>
          </div>

          {/* 전체 태그 목록: 선택=선명, 미선택=확 흐림, 선택불가=더 흐림 */}
          <div className="flex max-h-64 flex-wrap gap-2 overflow-auto py-1">
            {allTags.map((t) => {
              const active = favorites.includes(t);
              const disabled = !active && atLimit;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleFavorite(t)}
                  aria-pressed={active}
                  disabled={disabled}
                  className={[
                    "rounded-full px-3 py-1 text-xs transition",
                    "focus:outline-none focus:ring-2 focus:ring-black/5",
                    tagClasses(t),
                    active
                      ? "opacity-100 shadow-sm" // 선택: 또렷
                      : disabled
                      ? "opacity-25 cursor-not-allowed" // 선택불가: 아주 흐림
                      : "opacity-40 hover:opacity-60", // 미선택: 확실히 흐림
                  ].join(" ")}
                  title={tagLabel(t)}
                >
                  {tagLabel(t)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
