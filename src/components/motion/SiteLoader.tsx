"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { site } from "@/lib/content";
import { preloadHeroContent } from "@/lib/hero-videos";
import { LoaderMark } from "@/components/motion/LoaderMark";

type Phase = "loading" | "exit" | "done";

const EXIT_MS = 1150;

export function SiteLoader({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    let cancelled = false;

    preloadHeroContent().then(() => {
      if (!cancelled) setPhase("exit");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (phase !== "exit") return;

    const timer = window.setTimeout(
      () => setPhase("done"),
      reducedMotion ? 400 : EXIT_MS,
    );

    return () => window.clearTimeout(timer);
  }, [phase, reducedMotion]);

  useEffect(() => {
    if (phase === "done") {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  const isExiting = phase === "exit";

  const sheetTransition = reducedMotion
    ? { duration: 0.35, ease: "easeOut" as const }
    : { duration: 1.05, ease: [0.76, 0, 0.24, 1] as const };

  const wingTransition = reducedMotion
    ? { duration: 0.35, ease: "easeOut" as const }
    : { duration: 0.95, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <>
      {children}

      <AnimatePresence>
        {phase !== "done" && (
          <motion.div
            key="site-loader"
            className="fixed inset-0 z-[200] overflow-hidden"
            style={{ perspective: 1400 }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden={phase === "exit"}
            aria-live="polite"
            aria-busy={phase === "loading"}
          >
            {/* Left wing — peels toward viewer */}
            <motion.div
              className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[22vw] max-w-[280px] origin-left bg-gradient-to-r from-[#121212] via-[#0c0c0c] to-transparent"
              style={{ transformStyle: "preserve-3d" }}
              animate={
                isExiting
                  ? {
                      rotateY: reducedMotion ? 0 : -32,
                      x: reducedMotion ? "-100%" : "-8%",
                      scale: reducedMotion ? 1 : 1.18,
                      opacity: 0,
                    }
                  : { rotateY: 0, x: 0, scale: 1, opacity: 1 }
              }
              transition={{ ...wingTransition, delay: reducedMotion ? 0 : 0.04 }}
            />

            {/* Right wing — peels toward viewer */}
            <motion.div
              className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[22vw] max-w-[280px] origin-right bg-gradient-to-l from-[#121212] via-[#0c0c0c] to-transparent"
              style={{ transformStyle: "preserve-3d" }}
              animate={
                isExiting
                  ? {
                      rotateY: reducedMotion ? 0 : 32,
                      x: reducedMotion ? "100%" : "8%",
                      scale: reducedMotion ? 1 : 1.18,
                      opacity: 0,
                    }
                  : { rotateY: 0, x: 0, scale: 1, opacity: 1 }
              }
              transition={{ ...wingTransition, delay: reducedMotion ? 0 : 0.04 }}
            />

            {/* Main sheet — lifts up and away */}
            <motion.div
              className="absolute inset-0 z-10 bg-[#080808]"
              style={{ transformOrigin: "50% 100%", transformStyle: "preserve-3d" }}
              animate={
                isExiting
                  ? {
                      y: reducedMotion ? 0 : "-108%",
                      rotateX: reducedMotion ? 0 : -14,
                      scale: reducedMotion ? 1 : 1.06,
                      opacity: reducedMotion ? 0 : 1,
                    }
                  : { y: 0, rotateX: 0, scale: 1, opacity: 1 }
              }
              transition={sheetTransition}
            >
              {/* Subtle top sheen */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.06),transparent_55%)]" />
            </motion.div>

            {/* Focal mark + label */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-8"
              animate={
                isExiting
                  ? {
                      opacity: 0,
                      scale: 0.94,
                      y: reducedMotion ? 0 : -24,
                      z: reducedMotion ? 0 : 120,
                    }
                  : { opacity: 1, scale: 1, y: 0, z: 0 }
              }
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <LoaderMark />
              <p className="nav-link text-white/35">{site.name}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
