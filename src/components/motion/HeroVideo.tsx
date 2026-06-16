"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

import { HERO_VIDEOS } from "@/lib/hero-videos";

const CROSSFADE_MS = 9000;
const FADE_DURATION_MS = 1800;

type HeroVideoProps = {
  className?: string;
};

function HeroVideoElement({
  asset,
  isActive,
  shouldLoad,
  autoPlay,
}: {
  asset: (typeof HERO_VIDEOS)[number];
  isActive: boolean;
  shouldLoad: boolean;
  autoPlay?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    if (isActive) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [isActive, shouldLoad]);

  return (
    <>
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center transition-opacity ease-in-out",
          isActive ? "opacity-100" : "opacity-0",
        )}
        style={{
          backgroundImage: `url(${asset.poster})`,
          transitionDuration: `${FADE_DURATION_MS}ms`,
        }}
        aria-hidden
      />
      {shouldLoad ? (
        <video
          ref={videoRef}
          src={asset.src}
          poster={asset.poster}
          autoPlay={autoPlay}
          muted
          loop
          playsInline
          preload={isActive ? "auto" : "metadata"}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out",
            isActive ? "opacity-100" : "opacity-0",
          )}
          style={{ transitionDuration: `${FADE_DURATION_MS}ms` }}
        />
      ) : null}
    </>
  );
}

export function HeroVideo({ className }: HeroVideoProps) {
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(
    () => new Set([0]),
  );

  useEffect(() => {
    if (reducedMotion) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % HERO_VIDEOS.length);
    }, CROSSFADE_MS);

    return () => window.clearInterval(interval);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    const nextIndex = (activeIndex + 1) % HERO_VIDEOS.length;
    setLoadedIndices((current) => {
      if (current.has(nextIndex)) return current;
      const updated = new Set(current);
      updated.add(nextIndex);
      return updated;
    });
  }, [activeIndex, reducedMotion]);

  if (reducedMotion) {
    const asset = HERO_VIDEOS[0];
    return (
      <div className={cn("absolute inset-0 bg-[#111111]", className)} aria-hidden>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${asset.poster})` }}
        />
        <video
          src={asset.src}
          poster={asset.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={cn("absolute inset-0 bg-[#111111]", className)} aria-hidden>
      {HERO_VIDEOS.map((asset, index) => (
        <HeroVideoElement
          key={asset.src}
          asset={asset}
          isActive={index === activeIndex}
          shouldLoad={loadedIndices.has(index)}
          autoPlay={index === 0}
        />
      ))}
    </div>
  );
}
