"use client";

import { useEffect, useRef } from "react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { useReducedMotion } from "framer-motion";
import loadingAnimation from "@/assets/loading-animation.json";

export function LoaderMark() {
  const reducedMotion = useReducedMotion();
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (reducedMotion) {
      lottieRef.current?.goToAndStop(0, true);
    }
  }, [reducedMotion]);

  return (
    <div className="relative w-[min(22rem,88vw)] max-w-md">
      <Lottie
        lottieRef={lottieRef}
        animationData={loadingAnimation}
        loop={!reducedMotion}
        autoplay={!reducedMotion}
        aria-hidden
        className="h-auto w-full"
      />
    </div>
  );
}
