"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", match: "exact" as const },
  { href: "/expenses", label: "Expenses", match: "prefix" as const },
  { href: "/friends", label: "Friends", match: "prefix" as const },
  { href: "/shared", label: "Shared", match: "prefix" as const },
  { href: "/reports", label: "Reports", match: "prefix" as const },
  { href: "/profile", label: "Profile", match: "prefix" as const },
];

function isActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") {
    return pathname === href;
  }

  if (href === "/expenses") {
    return pathname === "/expenses" || pathname.startsWith("/expenses/");
  }

  if (href === "/friends") {
    return pathname === "/friends" || pathname.startsWith("/friends/");
  }

  if (href === "/shared") {
    return pathname === "/shared" || pathname.startsWith("/shared/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href, item.match);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent-green-light text-accent-green"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebarMobileTrigger({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-label={open ? "Close navigation" : "Open navigation"}
      onClick={onToggle}
      className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="size-5"
      >
        {open ? (
          <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
        ) : (
          <>
            <path strokeLinecap="round" d="M4 7h16" />
            <path strokeLinecap="round" d="M4 12h16" />
            <path strokeLinecap="round" d="M4 17h16" />
          </>
        )}
      </svg>
    </button>
  );
}

export function AppSidebar({
  mobileOpen,
  onMobileOpenChange,
}: {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    onMobileOpenChange(false);
  }, [pathname, onMobileOpenChange]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onMobileOpenChange(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileOpen, onMobileOpenChange]);

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => onMobileOpenChange(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-sidebar-border bg-sidebar pt-[env(safe-area-inset-top,0px)] transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-4">
          <BrandLogo href="/dashboard" variant="compact" />
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav
            pathname={pathname}
            onNavigate={() => onMobileOpenChange(false)}
          />
        </div>
      </aside>
    </>
  );
}
