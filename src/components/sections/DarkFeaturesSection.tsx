"use client";

import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { whyChooseUs } from "@/lib/content";

export function DarkFeaturesSection() {
  const features = [whyChooseUs[0], whyChooseUs[1], whyChooseUs[2]];

  return (
    <section className="section-padding overflow-hidden bg-dark text-white">
      <div className="container-main">
        <ParallaxLayer speed={0.04}>
          <ScrollReveal>
            <h2 className="heading-display mx-auto max-w-3xl text-center text-3xl font-semibold sm:text-4xl lg:text-[2.75rem]">
              Budgeting Built for How Students Spend
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-white/55">
              We combine fast expense logging, smart categorization, and
              real-time forecasts to help you understand patterns, avoid
              overspending, and build savings habits that last beyond uni.
            </p>
          </ScrollReveal>
        </ParallaxLayer>

        <div className="mt-20 space-y-24 lg:space-y-32">
          {features.map((feature, index) => {
            const reversed = index % 2 === 1;
            const imageSpeed = 0.12 + index * 0.02;

            return (
              <div
                key={feature.title}
                className={`relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${reversed ? "lg:[&>*:first-child]:order-2" : ""}`}
              >
                <span
                  className="feature-number absolute -top-8 left-0 hidden lg:block"
                  aria-hidden
                >
                  {feature.number}
                </span>

                <ParallaxLayer speed={reversed ? -0.05 : 0.05}>
                  <ScrollReveal direction={reversed ? "right" : "left"}>
                    <div className="relative z-10 pt-4 lg:pt-8">
                      <span
                        className="feature-number mb-2 block lg:hidden"
                        aria-hidden
                      >
                        {feature.number}
                      </span>
                      <h3 className="heading-display text-2xl font-semibold sm:text-3xl">
                        {feature.title}
                      </h3>
                      <p className="mt-4 max-w-md text-base leading-relaxed text-white/55">
                        {feature.description}
                      </p>
                    </div>
                  </ScrollReveal>
                </ParallaxLayer>

                <ScrollReveal
                  direction={reversed ? "left" : "right"}
                  delay={0.1}
                >
                  <ParallaxImage
                    src={feature.image}
                    alt={feature.imageLabel}
                    className="aspect-[4/3] rounded-xl"
                    speed={imageSpeed}
                    sizes="(min-width: 1024px) 45vw, 100vw"
                  />
                </ScrollReveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
