"use client";

import { motion, useReducedMotion } from "framer-motion";

const BUDGET_BARS = [
  { label: "Food", height: 36, delay: 0 },
  { label: "Transport", height: 52, delay: 0.1 },
  { label: "Subs", height: 28, delay: 0.2 },
  { label: "Save", height: 44, delay: 0.3 },
] as const;

const TREND_PATH =
  "M 24 72 C 48 72, 56 58, 80 56 S 112 44, 136 40 S 168 28, 192 24 S 224 18, 256 12";

export function LoaderMark() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className="relative flex w-[min(18rem,78vw)] max-w-xs flex-col items-center gap-7"
      aria-hidden
    >
      <div className="relative flex size-[4.5rem] items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full border border-white/15"
          animate={
            reducedMotion
              ? undefined
              : { scale: [1, 1.08, 1], opacity: [0.35, 0.65, 0.35] }
          }
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <div className="absolute inset-[5px] rounded-full border border-white/10 bg-white/[0.04]" />
        <span className="heading-display relative text-[1.75rem] font-semibold tracking-tight text-white/90">
          $
        </span>
      </div>

      <div className="w-full">
        <svg
          viewBox="0 0 280 88"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-auto w-full overflow-visible"
          aria-hidden
        >
          <path
            d={TREND_PATH}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <motion.path
            d={TREND_PATH}
            stroke="rgba(255,255,255,0.82)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: reducedMotion ? 1 : 0 }}
            animate={{ pathLength: reducedMotion ? 1 : [0, 1, 1, 0] }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : {
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.55, 0.75, 1],
                  }
            }
          />
          <motion.circle
            cx="256"
            cy="12"
            r="4"
            fill="var(--accent-blue)"
            animate={
              reducedMotion
                ? { opacity: 0.9 }
                : { opacity: [0, 0, 1, 1, 0], scale: [0.6, 0.6, 1, 1.15, 0.6] }
            }
            transition={
              reducedMotion
                ? { duration: 0 }
                : {
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.5, 0.55, 0.75, 1],
                  }
            }
          />
        </svg>

        <div className="mt-2 flex items-end justify-center gap-2">
          {BUDGET_BARS.map((bar) => (
            <div key={bar.label} className="flex flex-col items-center gap-1.5">
              <motion.div
                className="w-2 rounded-full bg-accent-blue"
                style={{ originY: 1 }}
                initial={{
                  height: reducedMotion ? bar.height * 0.75 : 6,
                  opacity: reducedMotion ? 0.75 : 0.35,
                }}
                animate={
                  reducedMotion
                    ? { height: bar.height * 0.75, opacity: 0.75 }
                    : {
                        height: [6, bar.height, bar.height * 0.65, bar.height],
                        opacity: [0.35, 1, 0.55, 1],
                      }
                }
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : {
                        duration: 1.6,
                        repeat: Infinity,
                        delay: bar.delay,
                        ease: "easeInOut",
                      }
                }
              />
              <span className="text-[0.5625rem] font-medium uppercase tracking-[0.14em] text-white/25">
                {bar.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
