// src/app/api/auth/signOut/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  const supabase = await createClient();
  // 이 호출이 Set-Cookie(삭제)를 내려줍니다.
  const { error } = await supabase.auth.signOut();
  if (error)
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 400 }
    );
  return NextResponse.json({ ok: true });
}
