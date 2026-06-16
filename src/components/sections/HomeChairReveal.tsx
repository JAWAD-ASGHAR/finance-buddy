"use client";

import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function HomeChairReveal({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className={cn(!reducedMotion && "home-chair-reveal")}>{children}</div>
  );
}
