"use client";

import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export function HomeIntroSection() {
  return (
    <section className="section-padding overflow-hidden bg-white">
      <div className="container-main">
        <ParallaxLayer speed={0.06}>
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow mb-5">The Solution</p>
              <h2 className="heading-display text-3xl font-semibold sm:text-4xl lg:text-[2.75rem]">
                The Smarter Way to Manage a Student Budget
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                Student life means juggling food, transport, subscriptions, and
                surprise costs on a tight allowance. Finance Buddy tracks
                spending, predicts your month-end balance, and nudges you before
                limits are crossed — so you stay in control without the stress.
              </p>
            </div>
          </ScrollReveal>
        </ParallaxLayer>
      </div>
    </section>
  );
}
