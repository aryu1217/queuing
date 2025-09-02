import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Supabase가 res에 세팅한 쿠키들을 리다이렉트 응답으로 복사
function redirectWithCookies(res, url) {
  const r = NextResponse.redirect(url);
  res.cookies.getAll().forEach((c) => r.cookies.set(c));
  return r;
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const isPublic =
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") || // post-login은 프리패스
    pathname === "/login" || // 로그인 페이지만 프리패스
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname);

  if (isPublic) {
    console.log("[MW] public pass", pathname);
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) =>
          res.cookies.set({ name, value, ...options }),
        remove: (name, options) =>
          res.cookies.set({ name, value: "", ...options }),
      },
    }
  );

  // 1) 로그인 여부
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  console.log(
    "[MW] path:",
    pathname,
    "| user:",
    !!user,
    "| userErr:",
    userErr?.message
  );

  if (!user) {
    const hasNickCookie = !!req.cookies.get("nickname")?.value;
    console.log("[MW] guest:", { hasNickCookie });
    if (!hasNickCookie && pathname !== "/login") {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return redirectWithCookies(res, url);
    }
    return res;
  }

  // 2) 로그인 유저 → DB 닉네임 확인
  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .maybeSingle();

  console.log("[MW] profile:", {
    hasNickname: !!profile?.nickname,
    profErr: profErr?.message,
  });

  // 닉네임 없으면 강제 이동
  if (!profile?.nickname && pathname !== "/login/createNickname") {
    const url = req.nextUrl.clone();
    url.pathname = "/login/createNickname";
    console.log("[MW] redirect -> /login/createNickname");
    return redirectWithCookies(res, url);
  }

  // 닉네임 있으면 /login, /login/createNickname 접근 시 메인으로
  if (
    profile?.nickname &&
    (pathname === "/login" || pathname === "/login/createNickname")
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/main";
    console.log("[MW] redirect -> /main");
    return redirectWithCookies(res, url);
  }

  // 진단용 헤더(네트워크 탭에서 확인 가능)
  res.headers.set("x-mw-path", pathname);
  res.headers.set("x-mw-user", user?.id || "none");
  res.headers.set("x-mw-has-nickname", String(!!profile?.nickname));

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
