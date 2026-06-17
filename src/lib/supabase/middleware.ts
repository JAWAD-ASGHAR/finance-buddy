import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { userNeedsOnboarding } from "@/lib/auth/onboarding";
import { isEmailVerified } from "@/lib/auth/verification";
import { isEmailVerificationRequired } from "@/lib/email/env";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

type SessionCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

function redirectWithSession(
  request: NextRequest,
  sessionCookies: SessionCookie[],
  destination: string,
) {
  const url = request.nextUrl.clone();
  const [pathname, search = ""] = destination.split("?");
  url.pathname = pathname;
  url.search = search ? `?${search}` : "";

  const redirectResponse = NextResponse.redirect(url);
  sessionCookies.forEach(({ name, value, options }) => {
    redirectResponse.cookies.set(name, value, options);
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
  let sessionCookies: SessionCookie[] = [];

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          sessionCookies = cookiesToSet.map(({ name, value, options }) => ({
            name,
            value,
            options: options ?? {},
          }));
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
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isProtectedPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return redirectWithSession(
        request,
        sessionCookies,
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
      return redirectWithSession(request, sessionCookies, "/verify-email");
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
      return redirectWithSession(request, sessionCookies, "/onboarding");
    }

    return supabaseResponse;
  }

  if (pathname === "/onboarding" || pathname === "/verify-email") {
    return redirectWithSession(request, sessionCookies, "/dashboard");
  }

  const isGuestAuthPath =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/check-email";

  if (isGuestAuthPath) {
    return redirectWithSession(request, sessionCookies, "/dashboard");
  }

  return supabaseResponse;
}
