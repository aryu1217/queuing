// app/api/auth/signout/route.js
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // 또는 PUBLISHABLE_KEY
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // RSC 등 일부 컨텍스트에선 set이 무시될 수 있음 (미들웨어 리프레시 사용 시 무시 가능)
          }
        },
      },
    }
  );

  await supabase.auth.signOut();

  return new Response(null, { status: 204 });
}
