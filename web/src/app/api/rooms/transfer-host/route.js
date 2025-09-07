// src/app/api/rooms/transfer-host/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
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

  // 로그인 필요 (RPC에서도 auth.uid() 체크하지만 프리체크)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const { error } = await supabase.rpc("transfer_host", {
    p_room_id: roomId,
    p_target_member_id: targetMemberId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
