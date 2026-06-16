"use client";

import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { SiteButton } from "@/components/ui/site-button";
import { founder } from "@/lib/content";

export function AboutFounderSection() {
  return (
    <section className="section-padding overflow-hidden bg-[#e6e6ea]">
      <div className="container-main">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <ScrollReveal direction="left">
            <div className="relative">
              <ParallaxImage
                src={founder.image}
                alt={founder.imageAlt}
                className="aspect-[4/5] min-h-[24rem] rounded-3xl"
                imageClassName="object-cover object-[center_15%]"
                speed={0.14}
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
              <ParallaxLayer
                className="absolute bottom-0 left-0 z-10 max-w-[16rem] sm:max-w-xs"
                speed={-0.06}
              >
                <div className="rounded-tr-3xl bg-dark p-6 sm:p-8">
                  <p className="quote-serif text-lg leading-snug text-white sm:text-xl">
                    &ldquo;{founder.quote}&rdquo;
                  </p>
                </div>
              </ParallaxLayer>
            </div>
          </ScrollReveal>

          <ParallaxLayer speed={0.04}>
            <ScrollReveal direction="right" delay={0.1}>
              <p className="eyebrow mb-4">{founder.role}</p>
              <h2 className="heading-display text-3xl font-semibold sm:text-4xl lg:text-[2.75rem]">
                {founder.name}
              </h2>
              <p className="mt-8 text-base leading-relaxed text-muted-foreground">
                {founder.bio}
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {founder.extendedBio}
              </p>
              <div className="mt-10 border-t border-dark/10 pt-8">
                <p className="heading-display text-lg font-semibold text-foreground">
                  {founder.name}
                </p>
                <p className="mt-1 text-sm font-medium text-accent-green">
                  {founder.credentials}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{founder.title}</p>
              </div>
              <div className="mt-8">
                <SiteButton href="/contact">Book a Free Consultation</SiteButton>
              </div>
            </ScrollReveal>
          </ParallaxLayer>
        </div>
      </div>
    </section>
  );
}
