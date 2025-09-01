// src/app/api/login/nicknameStart/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  const { nickname } = await req.json();
  if (!nickname?.trim()) {
    return NextResponse.json({ error: "nickname required" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("nickname", nickname.trim(), {
    httpOnly: false, // UI에서 읽으려면 false
    sameSite: "lax",
    path: "/",
    // expires/maxAge 지정 안 함 -> 세션 쿠키
  });
  return res;
}
