import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { userNeedsOnboarding } from "@/lib/auth/onboarding";
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

function isAuthFlowPath(pathname: string): boolean {
  return pathname.startsWith("/auth/");
}

function isAppPath(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/budget") ||
    pathname.startsWith("/expenses") ||
    pathname.startsWith("/friends") ||
    pathname.startsWith("/shared") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/profile")
  );
}

function isProtectedPath(pathname: string): boolean {
  return isAppPath(pathname) || pathname === "/onboarding";
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

  if (isAuthFlowPath(pathname)) {
    return supabaseResponse;
  }

  if (!user) {
    if (isProtectedPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return redirectWithSession(
        request,
        supabaseResponse,
        `${url.pathname}?${url.searchParams.toString()}`,
      );
    }
    return supabaseResponse;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at, username")
    .eq("id", user.id)
    .maybeSingle();

  const needsOnboarding = userNeedsOnboarding(profile);
  const needsEmailVerify =
    isEmailVerificationRequired() && !isEmailVerified(user);

  if (needsEmailVerify) {
    if (pathname !== "/verify-email") {
      return redirectWithSession(request, supabaseResponse, "/verify-email");
    }
    return supabaseResponse;
  }

  if (needsOnboarding) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Complete onboarding before using this feature." },
        { status: 403 },
      );
    }

    if (pathname !== "/onboarding") {
      return redirectWithSession(request, supabaseResponse, "/onboarding");
    }

    return supabaseResponse;
  }

  if (pathname === "/onboarding" || pathname === "/verify-email") {
    return redirectWithSession(request, supabaseResponse, "/dashboard");
  }

  const isGuestAuthPath =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/check-email";

  if (isGuestAuthPath) {
    return redirectWithSession(request, supabaseResponse, "/dashboard");
  }

  return supabaseResponse;
}
