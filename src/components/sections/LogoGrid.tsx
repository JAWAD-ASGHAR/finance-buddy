"use client";

import { clientLogos } from "@/lib/content";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export function LogoGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {clientLogos.map((logo, index) => (
        <ScrollReveal key={logo.src} delay={index * 0.06}>
          <div className="flex aspect-[3/2] items-center justify-center rounded-xl border border-border/60 bg-white px-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.src}
              alt={logo.name}
              className="h-10 w-auto max-w-full object-contain"
            />
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
