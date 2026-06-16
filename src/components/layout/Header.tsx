"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { SiteButton } from "@/components/ui/site-button";
import { navLinks } from "@/lib/content";
import { useInvertedTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

type HeaderProps = {
  placement?: "site" | "hero";
};

type HeaderBarProps = {
  light?: boolean;
  mobileOpen: boolean;
  onToggleMobile: () => void;
  pathname: string;
  showDesktopNav?: boolean;
};

function SiteLogo({ light = false }: { light?: boolean }) {
  return <BrandLogo href="/" light={light} />;
}

function HeaderBar({
  light = false,
  mobileOpen,
  onToggleMobile,
  pathname,
  showDesktopNav = true,
}: HeaderBarProps) {
  return (
    <div className="container-main flex h-[4.5rem] items-center justify-between gap-3 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
      <SiteLogo light={light} />

      {showDesktopNav ? (
        <nav
          className="hidden items-center gap-8 lg:flex lg:justify-self-center"
          aria-label="Main"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "nav-link transition-colors duration-300",
                light
                  ? pathname === link.href
                    ? "text-white"
                    : "text-white/75 hover:text-white"
                  : pathname === link.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : (
        <span className="hidden lg:block" aria-hidden />
      )}

      <div className="hidden items-center justify-end gap-3 lg:flex lg:justify-self-end">
        <ThemeToggle light={light} />
        <SiteButton href="/login" variant="primary" cursorLabel="App">
          Open App
        </SiteButton>
      </div>

      <div className="flex shrink-0 items-center gap-1 lg:hidden">
        <ThemeToggle light={light} />
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-end p-2",
            light ? "text-white" : "text-foreground",
          )}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
          onClick={onToggleMobile}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </div>
  );
}

type MobileMenuProps = {
  light?: boolean;
  onClose: () => void;
  pathname: string;
};

function MobileMenu({ light = false, onClose, pathname }: MobileMenuProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col lg:hidden",
        light ? "bg-dark text-white" : "bg-white text-foreground",
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      <div className="container-main flex h-[4.5rem] shrink-0 items-center justify-between gap-3">
        <SiteLogo light={light} />
        <div className="flex items-center gap-1">
          <ThemeToggle light={light} />
          <button
            type="button"
            className={cn("p-2", light ? "text-white" : "text-foreground")}
            aria-label="Close menu"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>
      </div>

      <nav
        className="container-main flex flex-1 flex-col gap-2 py-8"
        aria-label="Mobile"
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={cn(
              "rounded-2xl px-4 py-4 text-sm font-semibold uppercase tracking-[0.12em] transition-colors",
              light
                ? pathname === link.href
                  ? "bg-white/10 text-white"
                  : "text-white/75 hover:bg-white/5 hover:text-white"
                : pathname === link.href
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
        <SiteButton
          href="/login"
          className="mt-4 w-full"
          variant="primary"
          onClick={onClose}
          cursorLabel="App"
        >
          Open App
        </SiteButton>
        <Link
          href="/contact"
          onClick={onClose}
          className={cn(
            "mt-3 block text-center text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
            light
              ? "text-white/75 hover:text-white"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Contact support
        </Link>
      </nav>
    </div>
  );
}

export function Header({ placement = "site" }: HeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { inverted } = useInvertedTheme();
  const isHero = placement === "hero";
  const barLight = isHero ? true : inverted;
  const menuLight = isHero ? !inverted : inverted;
  const [revealed, setRevealed] = useState(!isHome);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);

  const closeMobile = () => setMobileOpen(false);
  const toggleMobile = () => setMobileOpen((open) => !open);

  useEffect(() => {
    setMobileOpen(false);
    setRevealed(!isHome);
  }, [pathname, isHome]);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (placement !== "site") return;

    const onScroll = () => {
      const y = window.scrollY;
      const scrollingUp = y < lastScrollY.current;

      if (isHome) {
        if (y <= 8) {
          setRevealed(false);
        } else if (scrollingUp) {
          setRevealed(true);
        } else {
          setRevealed(false);
        }
      } else if (y <= 8) {
        setRevealed(true);
      } else if (scrollingUp) {
        setRevealed(true);
      } else {
        setRevealed(false);
      }

      lastScrollY.current = y;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome, placement]);

  const mobileMenu = mobileOpen ? (
    <MobileMenu
      light={menuLight}
      onClose={closeMobile}
      pathname={pathname}
    />
  ) : null;

  if (placement === "hero") {
    if (!isHome) return null;

    return (
      <>
        <header
          className={cn(
            "absolute inset-x-0 top-0 z-20",
            mobileOpen ? "bg-dark" : "bg-transparent",
          )}
        >
          <HeaderBar
            light={barLight}
            mobileOpen={mobileOpen}
            onToggleMobile={toggleMobile}
            pathname={pathname}
            showDesktopNav
          />
        </header>
        {mobileMenu}
      </>
    );
  }

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-border bg-white transition-transform duration-300 ease-out",
          revealed
            ? "translate-y-0 shadow-sm"
            : "-translate-y-full pointer-events-none",
        )}
      >
        <HeaderBar
          light={barLight}
          mobileOpen={mobileOpen}
          onToggleMobile={toggleMobile}
          pathname={pathname}
        />
      </header>
      {mobileMenu}
    </>
  );
}
