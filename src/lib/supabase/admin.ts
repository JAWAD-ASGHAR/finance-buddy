import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl, requireSupabaseSecretKey } from "@/lib/supabase/env";

export function createAdminClient() {
  return createClient(getSupabaseUrl(), requireSupabaseSecretKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
