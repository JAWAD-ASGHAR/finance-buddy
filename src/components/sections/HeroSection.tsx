"use client";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { HeroVideo } from "@/components/motion/HeroVideo";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { HeroLogoMarquee } from "@/components/sections/HeroLogoMarquee";
import { hero } from "@/lib/content";

export function HeroSection() {
  return (
    <section className="relative h-svh min-h-[32rem] overflow-hidden">
      <Header placement="hero" />

      <div className="absolute inset-0">
        <HeroVideo className="h-full w-full" />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/25"
          aria-hidden
        />
      </div>

      <div className="container-main relative z-10 flex h-full flex-col justify-end pb-28 pt-24 sm:pb-32">
        <ScrollReveal>
          <p className="mb-4 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/65">
            {hero.eyebrow}
          </p>
          <h1 className="heading-display max-w-4xl text-[clamp(2.75rem,6.5vw,5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.25)]">
            {hero.title}
            <span className="quote-serif mt-2 block text-[0.92em] font-normal italic text-white/90">
              {hero.titleAccent}
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            {hero.description}
          </p>
          <div className="mt-8">
            <Button href="#services" variant="hero" cursorLabel="View">
              Explore Features
            </Button>
          </div>
        </ScrollReveal>
      </div>

      <HeroLogoMarquee />
    </section>
  );
}
