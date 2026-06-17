import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isEmailVerified } from "@/lib/auth/verification";
import { isEmailVerificationRequired } from "@/lib/email/env";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

function redirectWithSession(
  request: NextRequest,
  supabaseResponse: NextResponse,
  destination: string,
) {
  const url = request.nextUrl.clone();
  const [pathname, search = ""] = destination.split("?");
  url.pathname = pathname;
  url.search = search ? `?${search}` : "";

  const redirectResponse = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
    redirectResponse.cookies.set(name, value);
  });

  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isOnboardingRoute = pathname === "/onboarding";
  const isAppRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/budget") ||
    pathname.startsWith("/expenses") ||
    pathname.startsWith("/shared") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings") ||
    isOnboardingRoute;
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/verify-email" ||
    pathname === "/check-email";
  const isGuestOnlyRoute = pathname === "/" || isAuthRoute;

  if (
    pathname === "/check-email" &&
    user &&
    isEmailVerificationRequired() &&
    !isEmailVerified(user)
  ) {
    return redirectWithSession(request, supabaseResponse, "/verify-email");
  }

  if (isGuestOnlyRoute && user && pathname !== "/verify-email") {
    return redirectWithSession(request, supabaseResponse, "/dashboard");
  }

  if (
    isEmailVerificationRequired() &&
    user &&
    !isEmailVerified(user) &&
    isAppRoute
  ) {
    return redirectWithSession(request, supabaseResponse, "/verify-email");
  }

  if (isAppRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return redirectWithSession(
      request,
      supabaseResponse,
      `${url.pathname}?${url.searchParams.toString()}`,
    );
  }

  if (user && isAppRoute && !isOnboardingRoute && pathname !== "/verify-email") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && !profile.onboarding_completed_at) {
      return redirectWithSession(request, supabaseResponse, "/onboarding");
    }
  }

  if (user && isOnboardingRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.onboarding_completed_at) {
      return redirectWithSession(request, supabaseResponse, "/dashboard");
    }
  }

  return supabaseResponse;
}
