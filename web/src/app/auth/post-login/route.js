// src/app/auth/post-login/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function normalizeNextParam(url) {
  const raw = url.searchParams.get("next") || "/main";
  // 절대 URL, 프로토콜-상대 //url, 빈 값은 차단 → 기본값
  if (
    !raw ||
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("//")
  ) {
    return "/main";
  }
  // 쿼리만 들어와도 안전하게 처리
  return raw.startsWith("/") ? raw : `/${raw}`;
}

export async function GET(req) {
  const requestUrl = new URL(req.url);
  const supabase = await createClient();

  // 1) OAuth code → 세션 교환 (실패 시 로그인으로)
  const code = requestUrl.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[post-login] exchange error:", error.message);
      return NextResponse.redirect(new URL("/login?error=auth", requestUrl));
    }
  }

  // 2) 유저 확인
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("[post-login] no user:", userErr?.message);
    return NextResponse.redirect(new URL("/login", requestUrl));
  }

  // 3) 닉네임 존재 여부에 따라 분기
  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .maybeSingle();
  if (profErr) console.error("[post-login] profile error:", profErr.message);

  const safeNext = normalizeNextParam(requestUrl);
  const dest = profile?.nickname ? safeNext : "/login/createNickname";

  // ✅ 현재 요청의 origin을 기준으로 리디렉트 (로컬/배포 모두 OK)
  return NextResponse.redirect(new URL(dest, requestUrl));
}
