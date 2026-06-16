"use client";

import { useCallback, useSyncExternalStore } from "react";
import { THEME_ATTR, THEME_STORAGE_KEY } from "@/lib/theme-config";

export function isInvertedTheme(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute(THEME_ATTR) === "inverted";
}

export function applyInvertedTheme(inverted: boolean) {
  if (inverted) {
    document.documentElement.setAttribute(THEME_ATTR, "inverted");
  } else {
    document.documentElement.removeAttribute(THEME_ATTR);
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, inverted ? "inverted" : "light");
  } catch {
    // localStorage may be unavailable in private browsing.
  }
}

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [THEME_ATTR],
  });
  return () => observer.disconnect();
}

export function useInvertedTheme() {
  const inverted = useSyncExternalStore(
    subscribe,
    isInvertedTheme,
    () => false,
  );

  const toggle = useCallback((event?: React.MouseEvent) => {
    const apply = () => applyInvertedTheme(!isInvertedTheme());

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || !document.startViewTransition) {
      apply();
      return;
    }

    if (event) {
      document.documentElement.style.setProperty(
        "--vt-x",
        `${event.clientX}px`,
      );
      document.documentElement.style.setProperty(
        "--vt-y",
        `${event.clientY}px`,
      );
    }

    document.startViewTransition(() => {
      apply();
    });
  }, []);

  return { inverted, toggle };
}
