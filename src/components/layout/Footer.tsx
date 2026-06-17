"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { legalFooterLinks, navLinks, site } from "@/lib/content";
import { cn } from "@/lib/utils";

function FooterUtility({ compact }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "footer-utility border-t border-border/60",
        compact ? "pt-8 pb-5" : "pt-12 pb-10",
      )}
    >
      <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="heading-display text-sm font-semibold">{site.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {site.tagline}
          </p>
        </div>

        <nav
          className="flex flex-wrap gap-x-8 gap-y-3 sm:justify-end"
          aria-label="Footer"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link text-muted-foreground transition-colors hover:text-accent-green"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-10 flex flex-col gap-3 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 sm:justify-end">
          {legalFooterLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-accent-green">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function FooterDisplay({ parallax }: { parallax?: boolean }) {
  const display = (
    <p className="footer-display-text" aria-hidden>
      {site.logoMark}
      {site.logoSuffix}
    </p>
  );

  return (
    <div className="footer-display-clip">
      {parallax ? (
        <ParallaxLayer className="h-full" speed={0.1}>
          {display}
        </ParallaxLayer>
      ) : (
        display
      )}
    </div>
  );
}

export function Footer() {
  const isHome = usePathname() === "/";
  const reducedMotion = useReducedMotion();
  const useReveal = isHome && !reducedMotion;

  const footerInner = (
    <div className="container-main">
      <FooterUtility compact={useReveal} />
      <FooterDisplay parallax={!useReveal} />
    </div>
  );

  if (useReveal) {
    return (
      <footer className="home-footer-fixed overflow-hidden bg-background text-foreground">
        {footerInner}
      </footer>
    );
  }

  return (
    <footer className="overflow-hidden bg-background text-foreground">
      {footerInner}
    </footer>
  );
}
