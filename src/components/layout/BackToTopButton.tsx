"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const SHOW_AFTER_PX = 480;

export function BackToTopButton() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={scrollToTop}
      className={cn(
        "fixed right-5 z-40 inline-flex size-11 min-h-11 min-w-11 touch-manipulation cursor-pointer items-center justify-center rounded-full border border-border/80 bg-white/95 text-foreground shadow-sm backdrop-blur-sm transition-all duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue hover:-translate-y-0.5 hover:bg-white hover:shadow-md",
        "bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))]",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ArrowUp size={18} strokeWidth={2.25} aria-hidden />
    </button>
  );
}
