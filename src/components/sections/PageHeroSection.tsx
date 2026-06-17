"use client";

import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

type Highlight = {
  label: string;
  value: string;
};

type PageHeroSectionProps = {
  eyebrow: string;
  title: string;
  titleAccent?: string;
  description: string;
  highlights?: readonly Highlight[];
  tall?: boolean;
};

export function PageHeroSection({
  eyebrow,
  title,
  titleAccent,
  description,
  highlights,
  tall = false,
}: PageHeroSectionProps) {
  return (
    <section
      className={`page-hero relative -mt-[4.5rem] overflow-hidden bg-dark text-white ${tall ? "min-h-[min(88vh,46rem)]" : ""}`}
    >
      <div
        className="marketing-hero-glow pointer-events-none absolute inset-0"
        aria-hidden
      />

      <div
        className={`container-main relative z-10 flex flex-col ${tall ? "min-h-[min(88vh,46rem)] justify-end pb-16 pt-[calc(4.5rem+7rem)] sm:pb-20 sm:pt-[calc(4.5rem+8rem)]" : "pb-16 pt-[calc(4.5rem+7rem)] sm:pb-20 sm:pt-[calc(4.5rem+8rem)]"}`}
      >
        <ParallaxLayer speed={0.04}>
          <ScrollReveal>
            <p className="mb-4 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/60">
              {eyebrow}
            </p>
            <h1 className="heading-display max-w-4xl text-[clamp(2.75rem,6.5vw,5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-white">
              {title}
              {titleAccent ? (
                <span className="quote-serif mt-2 block text-[0.92em] font-normal italic text-white/90">
                  {titleAccent}
                </span>
              ) : null}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              {description}
            </p>
          </ScrollReveal>
        </ParallaxLayer>

        {highlights && highlights.length > 0 ? (
          <ScrollReveal delay={0.12}>
            <dl className="mt-12 grid gap-6 border-t border-white/15 pt-8 sm:grid-cols-3 sm:gap-8">
              {highlights.map((item) => (
                <div key={item.label}>
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/45">
                    {item.label}
                  </dt>
                  <dd className="heading-display mt-2 text-2xl font-semibold text-white sm:text-3xl">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </ScrollReveal>
        ) : null}
      </div>
    </section>
  );
}
