"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useReducedMotion } from "framer-motion";

export function LoaderMark() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className="relative flex w-[min(18rem,78vw)] max-w-xs items-center justify-center"
      aria-hidden
    >
      <DotLottieReact
        src="/loading.lottie"
        loop={!reducedMotion}
        autoplay={!reducedMotion}
        className="size-[min(18rem,78vw)] max-w-xs"
      />
    </div>
  );
}
