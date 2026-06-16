"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

type ParallaxImageProps = {
  src?: string;
  alt?: string;
  label?: string;
  className?: string;
  imageClassName?: string;
  speed?: number;
  sizes?: string;
};

export function ParallaxImage({
  src,
  alt,
  label,
  className,
  imageClassName,
  speed = 0.14,
  sizes = "100vw",
}: ParallaxImageProps) {
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

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
    >
      <motion.div
        style={reducedMotion ? undefined : { y }}
        className={cn(
          "will-change-transform",
          src
            ? "absolute inset-x-0 -top-[12.5%] h-[125%] w-full"
            : "placeholder-skeleton absolute inset-0 min-h-full w-full",
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt ?? ""}
            fill
            className={cn("object-cover", imageClassName)}
            sizes={sizes}
            aria-hidden={!alt}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-center">
            [Image Placeholder: {label}]
          </span>
        )}
      </motion.div>
    </div>
  );
}
