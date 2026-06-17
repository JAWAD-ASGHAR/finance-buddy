import { NextResponse } from "next/server";
import { ensureUserProfile } from "@/lib/auth/profile";
import { parseEmailOtpType } from "@/lib/auth/otp-type";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = safeNextPath(
    requestUrl.searchParams.get("next"),
    "/onboarding",
  );
  const supabase = await createClient();

  const code = requestUrl.searchParams.get("code");
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const metaName = data.user.user_metadata?.display_name;
      await ensureUserProfile(
        data.user.id,
        typeof metaName === "string" ? metaName : null,
      );
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = parseEmailOtpType(requestUrl.searchParams.get("type"));
  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error && data.user) {
      const metaName = data.user.user_metadata?.display_name;
      await ensureUserProfile(
        data.user.id,
        typeof metaName === "string" ? metaName : null,
      );
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL("/auth/auth-code-error", requestUrl.origin));
}
