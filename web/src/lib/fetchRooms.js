// lib/fetchRooms.js
import { createClient } from "@/utils/supabase/client";

const DUMMY_NOW_PLAYING = {
  title: "재생 정보 준비 중",
  artist: "—",
  durationSec: 180,
  positionMs: 0,
};

export async function fetchRooms() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("rooms")
    .select(
      `
      id, title, code, is_locked, tags, host_nickname, max_listeners,
      room_members(count)
    `
    ) // ← profiles 조인 제거
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    code: r.code,
    title: r.title,
    hostNickname: r.host_nickname || "호스트",
    isPrivate: !!r.is_locked, // 공개 여부 무시, 잠금만 사용
    tags: Array.isArray(r.tags) ? r.tags : [],
    listenersCount: r.room_members?.[0]?.count ?? 0,
    capacity: r.max_listeners ?? null,
    isUnlimited: r.max_listeners == null,
    nowPlaying: DUMMY_NOW_PLAYING, // 임시 하드코딩
  }));
}
