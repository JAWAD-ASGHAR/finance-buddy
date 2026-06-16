"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function scrollToHash(): boolean {
  const hash = window.location.hash;
  if (!hash) return false;

  const id = decodeURIComponent(hash.slice(1));
  const target = document.getElementById(id);
  if (!target) return false;

  target.scrollIntoView({ block: "start" });
  return true;
}

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      if (scrollToHash()) return;

      requestAnimationFrame(() => {
        if (!scrollToHash()) window.scrollTo(0, 0);
      });
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
