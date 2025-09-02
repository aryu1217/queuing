import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req) {
  const url = new URL(req.url);
  const origin = url.origin;
  const next = url.searchParams.get("next") || "/main";
  const code = url.searchParams.get("code");

  const supabase = await createClient();

  // ✅ 반드시 세션 교환 먼저
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[post-login] exchange error:", error.message);
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }
  }

  // 로그인 유저 확인
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("[post-login] no user:", userErr?.message);
    return NextResponse.redirect(`${origin}/login`);
  }

  // 닉네임 조회
  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .maybeSingle();

  if (profErr) console.error("[post-login] profile error:", profErr.message);

  const dest = profile?.nickname ? next : "/login/createNickname";
  return NextResponse.redirect(`${origin}${dest}`);
}
