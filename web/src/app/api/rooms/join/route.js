// src/app/api/rooms/join/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/admin";

export async function POST(req) {
  const supabase = await createClient();
  const admin = createServiceClient(); // 게스트 경로/집계용
  const cookieStore = cookies();

  // 입력 파싱
  const body = await req.json().catch(() => ({}));
  const code = String(body?.code || "")
    .trim()
    .toUpperCase();
  const password = String(body?.password || "");

  if (!code) {
    return NextResponse.json(
      { error: "방 코드가 필요합니다." },
      { status: 400 }
    );
  }

  // 1) 방 조회
  const { data: room, error: roomErr } = await supabase
    .from("rooms")
    .select(
      "id, code, title, is_locked, password_hash, max_listeners, host_nickname, tags"
    )
    .eq("code", code)
    .maybeSingle();

  if (roomErr) {
    return NextResponse.json({ error: roomErr.message }, { status: 400 });
  }
  if (!room) {
    return NextResponse.json(
      { error: "존재하지 않는 방 코드입니다." },
      { status: 404 }
    );
  }

  // 2) 잠금방이면 비밀번호 검증
  if (room.is_locked) {
    if (!password) {
      return NextResponse.json(
        { error: "비밀번호가 필요합니다." },
        { status: 401 }
      );
    }
    const ok = await bcrypt.compare(password, room.password_hash || "");
    if (!ok) {
      return NextResponse.json(
        { error: "비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }
  }

  // 3) 사용자/게스트 식별
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isGuest = false;
  let guestId = null;
  let guestNickname = null;

  if (user) {
    // 로그인 유저
  } else {
    // 게스트: 쿠키 기반
    const nicknameCookie = cookieStore.get("nickname")?.value?.trim() || "";
    if (!nicknameCookie) {
      return NextResponse.json(
        { error: "닉네임이 필요합니다." },
        { status: 401 }
      );
    }
    guestId = cookieStore.get("guest_id")?.value || randomUUID();
    guestNickname = nicknameCookie;
    isGuest = true;
  }

  // 4) 이미 멤버인지 확인 (idempotent)
  if (user) {
    const { data: existing, error: exErr } = await supabase
      .from("room_members")
      .select("id, role")
      .eq("room_id", room.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (exErr) {
      return NextResponse.json({ error: exErr.message }, { status: 400 });
    }
    if (existing) {
      const listenersCount = await countMembers(admin, room.id);
      return NextResponse.json(
        {
          room: summarizeRoom(room, listenersCount),
          member: existing,
          alreadyJoined: true,
        },
        { status: 200 }
      );
    }
  } else {
    const { data: existing, error: exErr } = await admin
      .from("room_members")
      .select("id, role")
      .eq("room_id", room.id)
      .eq("guest_id", guestId)
      .maybeSingle();
    if (exErr) {
      return NextResponse.json({ error: exErr.message }, { status: 400 });
    }
    if (existing) {
      // 게스트 쿠키 보장
      ensureGuestCookie(cookieStore, guestId);
      const listenersCount = await countMembers(admin, room.id);
      return NextResponse.json(
        {
          room: summarizeRoom(room, listenersCount),
          member: existing,
          alreadyJoined: true,
        },
        { status: 200 }
      );
    }
  }

  // 5) 정원 체크 (무제한 = null)
  const listenersCount = await countMembers(admin, room.id);
  const capacity = room.max_listeners ?? null;
  const isUnlimited = capacity == null;
  const isFull = !isUnlimited && listenersCount >= capacity;

  if (isFull) {
    return NextResponse.json({ error: "가득 찬 방입니다." }, { status: 409 });
  }

  // 6) 멤버 등록
  if (user) {
    const { data: inserted, error: insErr } = await supabase
      .from("room_members")
      .upsert(
        {
          room_id: room.id,
          user_id: user.id,
          role: "member", // 호스트면 이미 존재할 것이고, 없으면 멤버로
        },
        { onConflict: "room_id,identity_key" }
      )
      .select("id, room_id, user_id, guest_id, role")
      .single();

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 400 });
    }

    const newCount = await countMembers(admin, room.id);
    return NextResponse.json(
      { room: summarizeRoom(room, newCount), member: inserted },
      { status: 201 }
    );
  } else {
    const { data: inserted, error: insErr } = await admin
      .from("room_members")
      .upsert(
        {
          room_id: room.id,
          guest_id: guestId,
          guest_nickname: guestNickname,
          role: "member",
        },
        { onConflict: "room_id,identity_key" }
      )
      .select("id, room_id, user_id, guest_id, guest_nickname, role")
      .single();

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 400 });
    }

    // 게스트 쿠키 보장
    ensureGuestCookie(cookieStore, guestId);

    const newCount = await countMembers(admin, room.id);
    return NextResponse.json(
      { room: summarizeRoom(room, newCount), member: inserted },
      { status: 201 }
    );
  }
}

/** 멤버 수 집계 (identity 기준 유니크) */
async function countMembers(admin, roomId) {
  const { count, error } = await admin
    .from("room_members")
    .select("identity_key", { count: "exact", head: true })
    .eq("room_id", roomId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

/** 프론트 카드가 기대하는 최소한의 방 요약 */
function summarizeRoom(room, listenersCount) {
  return {
    id: room.id,
    code: room.code,
    title: room.title,
    hostNickname: room.host_nickname || "호스트",
    isPrivate: !!room.is_locked,
    tags: Array.isArray(room.tags) ? room.tags : [],
    listenersCount,
    capacity: room.max_listeners ?? null,
    isUnlimited: room.max_listeners == null,
  };
}

/** 게스트 쿠키 세팅 */
function ensureGuestCookie(cookieStore, guestId) {
  // 이미 있으면 덮어쓰기(만료 갱신 효과)
  cookieStore.set("guest_id", guestId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1y
    secure: process.env.NODE_ENV === "production",
  });
}
