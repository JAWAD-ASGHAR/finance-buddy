"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

type ParallaxLayerProps = {
  children: React.ReactNode;
  className?: string;
  /** Scroll shift strength. Negative values move opposite to scroll. */
  speed?: number;
};

export function ParallaxLayer({
  children,
  className,
  speed = 0.12,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const magnitude = Math.abs(speed);
  const sign = speed < 0 ? -1 : 1;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${-sign * magnitude * 100}%`, `${sign * magnitude * 100}%`],
  );

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
