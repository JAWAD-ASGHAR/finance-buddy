import type { GenerateLinkProperties } from "@supabase/supabase-js";
import { siteUrl } from "@/lib/seo";

/** Server-side confirm route — avoids PKCE code exchange from email clients. */
export function buildEmailConfirmUrl(
  properties: Pick<
    GenerateLinkProperties,
    "hashed_token" | "verification_type" | "action_link"
  >,
  nextPath = "/onboarding",
): string | null {
  const {
    hashed_token: tokenHash,
    verification_type: type,
    action_link: actionLink,
  } = properties;

  if (tokenHash && type) {
    const url = new URL("/auth/confirm", siteUrl);
    url.searchParams.set("token_hash", tokenHash);
    url.searchParams.set("type", type);
    url.searchParams.set("next", nextPath);
    return url.toString();
  }

  return actionLink ?? null;
}
