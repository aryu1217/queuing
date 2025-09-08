export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function POST(req) {
  const supabase = await createClient();

  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const roomId = String(body?.roomId || "").trim();
  const targetMemberId = String(body?.targetMemberId || "").trim();

  if (!roomId || !targetMemberId) {
    return NextResponse.json(
      { error: "roomId와 targetMemberId가 필요합니다." },
      { status: 400 }
    );
  }

  // ✅ 로그인 여부 상관없이 진행: 게스트 식별용 쿠키도 함께 전달
  const c = cookies();
  const guestId = c.get("guest_id")?.value || c.get("guestId")?.value || null;
  const nickname = c.get("nickname")?.value || null;

  const { error } = await supabase.rpc("transfer_host", {
    p_room_id: roomId,
    p_target_member_id: targetMemberId,
    p_caller_guest_id: guestId, // 게스트일 경우 검증용
    p_caller_nickname: nickname, // (폴백) 닉네임 쿠키만 있는 경우
  });

  if (error) {
    const msg = error.message || "";
    if (msg.includes("NOT_HOST")) {
      return NextResponse.json(
        { error: "방장만 가능합니다." },
        { status: 403 }
      );
    }
    if (msg.includes("TARGET_NOT_FOUND")) {
      return NextResponse.json(
        { error: "대상 멤버를 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
