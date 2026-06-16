"use client";

import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { impactQuote, stats } from "@/lib/content";

export function ImpactSection() {
  const primaryStats = stats.slice(0, 2);

  return (
    <section
      id="impact"
      className="section-padding-follow-stack overflow-hidden bg-white"
    >
      <div className="container-main">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <ParallaxLayer speed={0.05}>
            <ScrollReveal>
              <p className="eyebrow mb-5">Our Impact</p>
              <h2 className="heading-display text-3xl font-semibold sm:text-4xl lg:text-[2.75rem]">
                The Fastest Way to See Where Your Money Goes
              </h2>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
                Because clarity beats guesswork. Finance Buddy turns daily
                expenses into actionable insight — category budgets, spending
                analytics, forecasts, and alerts that help you finish the month
                on track.
              </p>
              <div className="mt-12 flex gap-12">
                {primaryStats.map((stat) => (
                  <div key={stat.label}>
                    <p className="heading-display text-5xl font-semibold sm:text-6xl">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </ParallaxLayer>

          <ScrollReveal direction="right" delay={0.1}>
            <div className="relative">
              <ParallaxImage
                src="/marketing/features/impact-growth.webp"
                alt="Student reviewing budget progress and spending analytics"
                className="aspect-[4/5] min-h-[28rem]"
                imageClassName="object-top"
                speed={0.16}
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
              <ParallaxLayer
                className="absolute bottom-0 left-0 z-10 max-w-[16rem] sm:max-w-xs"
                speed={-0.08}
              >
                <div className="bg-dark p-6 sm:p-8">
                  <p className="quote-serif text-lg leading-snug text-white sm:text-xl">
                    &ldquo;{impactQuote}&rdquo;
                  </p>
                </div>
              </ParallaxLayer>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
