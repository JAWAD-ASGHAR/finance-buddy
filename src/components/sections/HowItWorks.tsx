"use client";

import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { ServiceGlowCard } from "@/components/motion/ServiceGlowCard";
import { howItWorks } from "@/lib/content";

export function HowItWorks() {
  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
      {howItWorks.map((step, index) => (
        <ScrollReveal key={step.title} delay={index * 0.08} className="h-full">
          <ServiceGlowCard className="h-full">
            <article className="relative h-full p-7 sm:p-8">
              <span
                className="feature-number absolute -right-2 -top-4 text-[clamp(4rem,10vw,7rem)]"
                aria-hidden
              >
                {step.step.padStart(2, "0")}
              </span>
              <div className="relative z-10">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/40">
                  Step {step.step}
                </p>
                <h3 className="heading-display mt-4 text-xl font-semibold sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/55 sm:text-base">
                  {step.description}
                </p>
              </div>
            </article>
          </ServiceGlowCard>
        </ScrollReveal>
      ))}
    </div>
  );
}

export function HowItWorksIntro() {
  return (
    <ParallaxLayer speed={0.04}>
      <ScrollReveal>
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/45">
            Our Process
          </p>
          <h2 className="heading-display text-3xl font-semibold sm:text-4xl lg:text-[2.75rem]">
            Three steps to a clearer budget
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/55">
            Each step is designed to fit between lectures — quick to set up,
            easy to maintain, and built to keep you ahead of month-end.
          </p>
        </div>
      </ScrollReveal>
    </ParallaxLayer>
  );
}
