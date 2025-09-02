// app/api/profile/nickname/route.js
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req) {
  const where = "[API profile/nickname]";
  try {
    const { nickname } = await req.json();

    if (!nickname || typeof nickname !== "string") {
      return NextResponse.json(
        { error: "닉네임이 필요합니다." },
        { status: 400 }
      );
    }

    // 서버용 supabase (쿠키 연동) — utils가 async라면 꼭 await
    const supabase = await createClient();

    // 세션 확인
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr) {
      console.error(where, "getUser error:", userErr.message);
    }
    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // upsert (없으면 insert, 있으면 update)
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, nickname }, { onConflict: "id" }); // onConflict 명시(선택)

    if (error) {
      console.error(where, "upsert error:", error);
      // 중복 닉네임 (UNIQUE 위반)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "이미 사용 중인 닉네임입니다." },
          { status: 409 }
        );
      }
      // RLS 위반 시 보통 401/403 류가 떨어짐
      if (
        String(error.message || "")
          .toLowerCase()
          .includes("row-level security")
      ) {
        return NextResponse.json(
          { error: "권한 정책(RLS)에 의해 거부되었습니다." },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("[API profile/nickname] fatal:", e);
    return NextResponse.json(
      { error: "서버 예외가 발생했습니다." },
      { status: 500 }
    );
  }
}
