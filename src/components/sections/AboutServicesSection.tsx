"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ServiceGlowCard } from "@/components/motion/ServiceGlowCard";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { services } from "@/lib/content";

function serviceEyebrow(shortTitle: string) {
  return shortTitle.split("|")[0]?.trim() ?? shortTitle;
}

export function AboutServicesSection() {
  return (
    <section
      className="section-padding overflow-hidden bg-dark text-white"
      aria-labelledby="about-services-heading"
    >
      <div className="container-main">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/45">
              What We Offer
            </p>
            <h2
              id="about-services-heading"
              className="heading-display text-3xl font-semibold sm:text-4xl lg:text-[2.75rem]"
            >
              Features for every part of your budget
            </h2>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {services.map((service, index) => (
            <ScrollReveal key={service.id} delay={index * 0.06} className="h-full">
              <ServiceGlowCard className="h-full">
                <article className="flex h-full flex-col p-6 sm:p-7">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/40">
                    {serviceEyebrow(service.shortTitle)}
                  </p>
                  <h3 className="heading-display mt-3 text-xl font-semibold">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">
                    {service.description}
                  </p>
                  <ul className="mt-4 flex flex-1 flex-col gap-2">
                    {service.details.benefits.slice(0, 1).map((item) => (
                      <li
                        key={item}
                        className="relative pl-3.5 text-sm leading-relaxed text-white/45 before:absolute before:left-0 before:top-[0.55em] before:size-1 before:rounded-full before:bg-accent-blue"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/what-we-do#${service.id}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
                  >
                    Learn more
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </article>
              </ServiceGlowCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
