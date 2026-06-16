"use client";

import { useEffect } from "react";

/** Native scroll — Lenis breaks CSS position:sticky stacking. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove("lenis", "lenis-smooth");
    document.body.classList.remove("lenis", "lenis-smooth");
  }, []);

  return <>{children}</>;
}
