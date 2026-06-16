"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { chairCta } from "@/lib/content";

export function ChairCTASection() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="section-padding relative z-10 overflow-hidden bg-[#e6e6ea]">
      <div className="container-main relative z-10 lg:min-h-[36rem] xl:min-h-[40rem]">
        <ParallaxLayer speed={0.05}>
          <ScrollReveal>
            <div className="relative max-w-lg py-4 lg:max-w-xl lg:py-8">
              <h2 className="heading-display text-[clamp(2.75rem,6.5vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-foreground">
                {chairCta.title}
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                {chairCta.description}
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-dark px-7 py-4 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-dark-muted"
                >
                  {chairCta.primaryLabel}
                  <MessageCircle size={15} strokeWidth={2.25} aria-hidden />
                </Link>
                <Link
                  href="/what-we-do"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-7 py-4 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-white/90"
                >
                  {chairCta.secondaryLabel}
                  <CalendarDays size={15} strokeWidth={2.25} aria-hidden />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </ParallaxLayer>
      </div>

      <div
        className="relative z-0 mt-10 flex w-full justify-end sm:mt-12 lg:pointer-events-none lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:w-[min(62vw,48rem)] lg:items-center lg:overflow-hidden xl:w-[min(55vw,52rem)]"
        aria-hidden
      >
        <motion.div
          className="relative w-[138%] max-w-none translate-x-[14%] sm:translate-x-[16%] lg:translate-x-[18%]"
          animate={
            reducedMotion
              ? undefined
              : {
                  y: [0, -14, 0],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          <Image
            src="/home/chairarm.avif"
            alt=""
            width={900}
            height={700}
            className="h-auto w-full object-contain object-right"
            priority={false}
          />
        </motion.div>
      </div>
    </section>
  );
}
