// src/app/api/rooms/create/route.js
export const runtime = "nodejs"; // bcrypt 사용을 위해 Node 런타임

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/admin";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const MAX_TAGS = 5;
// DB 제약(rooms_tags_allowed_chk)과 반드시 동일 유지
const ALLOWED_TAGS = new Set([
  "kpop",
  "jpop",
  "pop",
  "indie",
  "indie_band",
  "rock",
  "metal",
  "ballad",
  "rnb",
  "hiphop",
  "edm",
  "house",
  "techno",
  "lofi",
  "jazz",
  "blues",
  "classical",
  "ost",
  "anime",
  "acoustic",
  "chill",
  "study",
  "workout",
  "driving",
  "party",
  "citypop",
  "trot",
  "folk",
  "soul",
  "trap",
]);

function makeCode(n = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 0,1,I,O 제외
  let out = "";
  for (let i = 0; i < n; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// 코드 중복은 INSERT 시 고유 제약으로 판별 → 충돌 시 재시도
async function insertRoomWithUniqueCode(
  client,
  payload,
  selectCols = "id, code, title, tags, host_nickname, is_locked, max_listeners"
) {
  for (let i = 0; i < 5; i++) {
    const code = makeCode();
    const { data, error } = await client
      .from("rooms")
      .insert({ ...payload, code })
      .select(selectCols)
      .single();

    if (!error) return { data };

    const msg = (error?.message || "") + " " + (error?.details || "");
    // 고유 제약 위반(코드 중복)이면 재시도, 그 외 에러면 중단
    if (
      error?.code === "23505" ||
      /duplicate key value/i.test(msg) ||
      /rooms_code_key/i.test(msg)
    ) {
      continue;
    }
    return { error };
  }
  return { error: { message: "고유한 방 코드를 생성하지 못했습니다." } };
}

export async function POST(req) {
  const cookieStore = cookies(); // ← await 불필요
  const nicknameCookie = cookieStore.get("nickname")?.value?.trim() || "";

  // 입력 파싱
  const body = await req.json().catch(() => ({}));
  const title = String(body?.title || "").trim();
  const isPrivate = !!body?.isPrivate;
  const password = String(body?.password || "");

  // tags 정제
  let inputTags = Array.isArray(body?.tags) ? body.tags : [];
  inputTags = Array.from(
    new Set(
      inputTags
        .map((s) => String(s).trim())
        .filter(Boolean)
        .filter((t) => ALLOWED_TAGS.has(t))
    )
  ).slice(0, MAX_TAGS);

  if (!title) {
    return NextResponse.json(
      { error: "방 이름을 입력해 주세요." },
      { status: 400 }
    );
  }
  if (isPrivate && password.length < 4) {
    return NextResponse.json(
      { error: "비밀번호는 4자 이상이어야 합니다." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let password_hash = null;
  let is_locked = false;
  if (isPrivate) {
    password_hash = await bcrypt.hash(password, 10);
    is_locked = true;
  }

  // ────────────────────────────────────────────────────────────────
  // 로그인 사용자 (RLS 삽입)
  // ────────────────────────────────────────────────────────────────
  if (user) {
    // 프로필 닉네임 조회 → host_nickname 채움
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", user.id)
      .maybeSingle();

    const hostNickname =
      profile?.nickname?.trim() || nicknameCookie || "호스트";

    const { data: room, error: roomErr } = await insertRoomWithUniqueCode(
      supabase,
      {
        title,
        host_user_id: user.id, // RLS: auth.uid()와 일치
        host_nickname: hostNickname, // ★ 로그인 호스트 닉네임 저장
        is_public: !isPrivate, // 지금은 모두 공개 운용
        is_locked,
        password_hash, // 공개 방이면 null
        tags: inputTags,
      }
    );

    if (roomErr) {
      return NextResponse.json(
        { error: roomErr.message || roomErr },
        { status: 400 }
      );
    }

    // 생성자를 멤버로 등록 (role='host')
    // ⚠ identity_key는 generated column → 절대 명시하지 않음
    const { error: memErr } = await supabase.from("room_members").upsert(
      {
        room_id: room.id,
        user_id: user.id,
        role: "host",
      },
      { onConflict: "room_id,identity_key" }
    );

    if (memErr) {
      return NextResponse.json({ error: memErr.message }, { status: 400 });
    }

    return NextResponse.json({ room }, { status: 201 });
  }

  // ────────────────────────────────────────────────────────────────
  // 게스트 사용자 (service_role로 삽입)
  // ────────────────────────────────────────────────────────────────
  if (!nicknameCookie) {
    return NextResponse.json(
      { error: "닉네임이 필요합니다." },
      { status: 401 }
    );
  }

  // guest_id 쿠키 보장
  let guestId = cookieStore.get("guest_id")?.value;
  if (!guestId) {
    guestId = randomUUID();
  }

  const admin = createServiceClient();

  const { data: room, error: roomErr } = await insertRoomWithUniqueCode(admin, {
    title,
    host_guest_id: guestId,
    host_nickname: nicknameCookie,
    is_public: !isPrivate,
    is_locked,
    password_hash,
    tags: inputTags,
  });

  if (roomErr) {
    return NextResponse.json(
      { error: roomErr.message || roomErr },
      { status: 400 }
    );
  }

  // 게스트 호스트 멤버 등록
  const { error: memErr } = await admin.from("room_members").upsert(
    {
      room_id: room.id,
      guest_id: guestId,
      guest_nickname: nicknameCookie,
      role: "host",
    },
    { onConflict: "room_id,identity_key" }
  );

  if (memErr) {
    return NextResponse.json({ error: memErr.message }, { status: 400 });
  }

  // guest_id 쿠키 설정
  const res = NextResponse.json({ room }, { status: 201 });
  res.cookies.set("guest_id", guestId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1y
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
