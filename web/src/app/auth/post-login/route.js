// src/app/auth/post-login/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function normalizeNextParam(url) {
  const raw = url.searchParams.get("next") || "/main";
  if (
    !raw ||
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("//")
  ) {
    return "/main";
  }
  return raw.startsWith("/") ? raw : `/${raw}`;
}

const PLACEHOLDER_HOST = "yourcdn.com/default-avatar.png"; // 기존 플레이스홀더 식별용

export async function GET(req) {
  const requestUrl = new URL(req.url);
  const supabase = await createClient();

  // 1) code → 세션 교환
  const code = requestUrl.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[post-login] exchange error:", error.message);
      return NextResponse.redirect(new URL("/login?error=auth", requestUrl));
    }
  }

  // 2) 유저
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("[post-login] no user:", userErr?.message);
    return NextResponse.redirect(new URL("/login", requestUrl));
  }

  // 3) 프로필 조회
  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("nickname, avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  if (profErr) console.error("[post-login] profile error:", profErr.message);

  // 4) 구글 아바타 확보 (picture 또는 avatar_url)
  const meta = user.user_metadata || {};
  const providerAvatar = meta.picture || meta.avatar_url || null;

  // 5) avatar_url 채우기: 없거나 플레이스홀더(또는 따옴표 포함)일 때만 업데이트
  if (providerAvatar) {
    const current = profile?.avatar_url || "";
    const isPlaceholder =
      !current ||
      current.includes(PLACEHOLDER_HOST) ||
      /^'+https?:\/\//.test(current); // 따옴표로 저장된 케이스

    if (isPlaceholder) {
      const clean = String(providerAvatar).replace(/^'+|'+$/g, ""); // 혹시 모를 따옴표 제거
      const upsertPayload = { id: user.id, avatar_url: clean };

      await supabase
        .from("profiles")
        .upsert(upsertPayload, { onConflict: "id" }); // RLS: auth.uid() = id 정책이면 OK
    }
  } else if (!profile) {
    // 프로필 자체가 없고 provider 사진도 없다면 최소 row만 생성
    await supabase
      .from("profiles")
      .upsert({ id: user.id }, { onConflict: "id" });
  }

  // 6) 리디렉트 분기
  const safeNext = normalizeNextParam(requestUrl);
  const dest = profile?.nickname ? safeNext : "/login/createNickname";
  return NextResponse.redirect(new URL(dest, requestUrl));
}
