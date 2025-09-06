// src/app/api/rooms/leave/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/admin";

function dbg(...args) {
  // 서버 콘솔에 찍힘 (Vercel/localhost 모두)
  console.log("[rooms.leave]", ...args);
}

// sendBeacon(text/plain)도 처리
async function parseBody(req) {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      return (await req.json()) || {};
    } catch {
      return {};
    }
  }
  try {
    const txt = await req.text();
    try {
      return JSON.parse(txt);
    } catch {
      return {};
    }
  } catch {
    return {};
  }
}

export async function POST(req) {
  const url = new URL(req.url);
  const wantDebug = url.searchParams.get("debug") === "1";
  const cookieStore = await cookies();

  const body = await parseBody(req);
  dbg("REQ", {
    method: req.method,
    contentType: req.headers.get("content-type"),
    body: JSON.stringify(body).slice(0, 300),
    qs: Object.fromEntries(url.searchParams.entries()),
    hasCookies: cookieStore.getAll().length > 0,
  });

  const code = body.code || url.searchParams.get("code");
  if (!code) {
    dbg("NO_CODE – nothing to do");
    return NextResponse.json({
      ok: true,
      debug: wantDebug ? { reason: "NO_CODE" } : undefined,
    });
  }

  const supa = await createClient();
  const admin = createServiceClient();

  // 1) code -> roomId
  const roomQ = await admin
    .from("rooms")
    .select("id, title, is_public, host_user_id")
    .eq("code", code)
    .maybeSingle();
  const roomId = roomQ.data?.id || null;
  dbg("ROOM_LOOKUP", { code, roomId, error: roomQ.error?.message });
  if (!roomId) {
    return NextResponse.json({
      ok: true,
      debug: wantDebug
        ? { step: "room_lookup", error: roomQ.error?.message || "not_found" }
        : undefined,
    });
  }

  // 2) auth/guest 파악
  const {
    data: { user },
    error: userErr,
  } = await supa.auth.getUser();
  const guestId = cookieStore.get("guest_id")?.value || null;
  dbg("IDENTITY", {
    userId: user?.id || null,
    guestId,
    userErr: userErr?.message,
  });

  // 3) 삭제 전 존재 여부(둘 다 체크)
  const beforeUser = user?.id
    ? await admin
        .from("room_members")
        .select("id, role")
        .eq("room_id", roomId)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null, error: null };
  const beforeGuest = guestId
    ? await admin
        .from("room_members")
        .select("id, role")
        .eq("room_id", roomId)
        .eq("guest_id", guestId)
        .maybeSingle()
    : { data: null, error: null };
  dbg("BEFORE", { userRow: beforeUser.data, guestRow: beforeGuest.data });

  // 4) 삭제 시도
  let del = { path: null, error: null, count: 0 };

  if (user?.id) {
    // RLS 경로: 본인 행만 삭제 허용되어 있어야 함
    const tryDel = await supa
      .from("room_members")
      .delete()
      .match({ room_id: roomId, user_id: user.id })
      .select("id"); // 삭제된 행 반환
    del = {
      path: "auth",
      error: tryDel.error?.message || null,
      count: tryDel.data?.length || 0,
    };
    dbg("DELETE_AUTH", del);

    // RLS에 막히거나 0건이면(정책 미비 등) 안전한 관리자 fallback (동일 user_id만)
    if (del.count === 0) {
      const fb = await admin
        .from("room_members")
        .delete()
        .match({ room_id: roomId, user_id: user.id })
        .select("id");
      del = {
        path: "auth_fallback_admin",
        error: fb.error?.message || null,
        count: fb.data?.length || 0,
      };
      dbg("DELETE_AUTH_FALLBACK", del);
    }
  } else if (guestId) {
    // 게스트는 service_role로 삭제
    const tryDel = await admin
      .from("room_members")
      .delete()
      .match({ room_id: roomId, guest_id: guestId })
      .select("id");
    del = {
      path: "guest_admin",
      error: tryDel.error?.message || null,
      count: tryDel.data?.length || 0,
    };
    dbg("DELETE_GUEST", del);
  } else {
    dbg("NO_IDENTITY – neither user nor guest");
  }

  // 5) 삭제 후 확인
  const afterUser = user?.id
    ? await admin
        .from("room_members")
        .select("id")
        .eq("room_id", roomId)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null, error: null };
  const afterGuest = guestId
    ? await admin
        .from("room_members")
        .select("id")
        .eq("room_id", roomId)
        .eq("guest_id", guestId)
        .maybeSingle()
    : { data: null, error: null };
  dbg("AFTER", { userRow: afterUser.data, guestRow: afterGuest.data });

  const res = { ok: true };
  if (wantDebug) {
    res.debug = {
      code,
      roomId,
      identity: { userId: user?.id || null, guestId },
      before: { userRow: beforeUser.data, guestRow: beforeGuest.data },
      delete: del,
      after: { userRow: afterUser.data, guestRow: afterGuest.data },
    };
  }
  return NextResponse.json(res);
}
