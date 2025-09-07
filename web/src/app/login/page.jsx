import { Suspense } from "react";
import LoginInner from "./_login-inner";

export const dynamic = "force-dynamic"; // 프리렌더 끔
export const revalidate = 0; // 캐시 안 함 (server에서만 허용)
// 또는: export const fetchCache = "default-no-store";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">확인 중…</div>}>
      <LoginInner />
    </Suspense>
  );
}
