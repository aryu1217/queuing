// src/utils/supabase/admin.js
import { createClient as createAdminClient } from "@supabase/supabase-js";

export function createServiceClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // 절대 브라우저에 노출 금지
    { auth: { persistSession: false } }
  );
}
