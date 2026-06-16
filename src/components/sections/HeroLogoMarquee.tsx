"use client";

import { useReducedMotion } from "framer-motion";
import { clientLogos } from "@/lib/content";
import { useMounted } from "@/lib/use-mounted";

const TRACK_REPEATS = 4;

function LogoMark({ name, src }: { name: string; src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className="h-7 w-auto max-w-[8.5rem] shrink-0 object-contain opacity-70 brightness-0 invert sm:h-8"
      draggable={false}
    />
  );
}

function MarqueeTrack({ ariaHidden = false }: { ariaHidden?: boolean }) {
  const items = Array.from({ length: TRACK_REPEATS }, () => clientLogos).flat();

  return (
    <div
      className="flex shrink-0 items-center gap-12 pr-12 sm:gap-16 sm:pr-16"
      aria-hidden={ariaHidden || undefined}
    >
      {items.map((logo, index) => (
        <LogoMark key={`${logo.src}-${index}`} {...logo} />
      ))}
    </div>
  );
}

export function HeroLogoMarquee() {
  const reducedMotion = useReducedMotion();
  const mounted = useMounted();
  const staticLogos = mounted && reducedMotion;

  if (staticLogos) {
    return (
      <div className="absolute inset-x-0 bottom-0 z-10 py-6 sm:py-8">
        <div className="container-main">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {clientLogos.map((logo) => (
              <LogoMark key={logo.src} {...logo} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 py-6 sm:py-8">
      <div className="pointer-events-none overflow-hidden">
        <div className="hero-logo-marquee flex w-max">
          <MarqueeTrack />
          <MarqueeTrack ariaHidden />
        </div>
      </div>
    </div>
  );
}
