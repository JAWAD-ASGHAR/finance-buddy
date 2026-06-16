import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { services } from "@/lib/content";

type Service = (typeof services)[number];

function TimelineRow({
  service,
  index,
}: {
  service: Service;
  index: number;
}) {
  const imageLeft = index % 2 === 0;

  const imageBlock = (
    <ScrollReveal direction={imageLeft ? "left" : "right"} delay={0.05}>
      <ParallaxImage
        src={service.stackImage}
        alt={service.stackImageLabel}
        className="aspect-[4/3] min-h-[16rem] rounded-3xl sm:min-h-[18rem]"
        speed={0.1}
        sizes="(min-width: 1024px) 40vw, 100vw"
      />
    </ScrollReveal>
  );

  const textBlock = (
    <ScrollReveal direction={imageLeft ? "right" : "left"}>
      <div className="what-we-do-timeline__content">
        <p className="eyebrow mb-4">{service.shortTitle}</p>
        <h2 className="heading-display text-2xl font-semibold sm:text-3xl lg:text-[2rem]">
          {service.title}
        </h2>
        {service.comingSoon ? (
          <span className="mt-3 inline-block rounded-full bg-accent-green-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-accent-green">
            Coming Soon
          </span>
        ) : null}
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          {service.details.intro}
        </p>
        <ul className="what-we-do-timeline__list mt-6 space-y-3.5">
          {service.details.benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex gap-3 text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]"
            >
              <span className="what-we-do-timeline__bullet" aria-hidden />
              {benefit}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground/90">
          {service.details.whoWeHelp}
        </p>
        <div className="mt-8 border-t border-border/70 pt-6">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            How it works
          </p>
          <ol className="mt-4 space-y-3">
            {service.details.steps.map((step, stepIndex) => (
              <li
                key={step}
                className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-green">
                  {String(stepIndex + 1).padStart(2, "0")}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </ScrollReveal>
  );

  return (
    <article
      id={service.id}
      className="what-we-do-timeline__row scroll-mt-28"
    >
      <div
        className="what-we-do-timeline__marker hidden lg:block"
        aria-hidden
      >
        <span className="what-we-do-timeline__marker-dot" />
      </div>

      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-x-20 xl:gap-x-24">
        {imageLeft ? (
          <>
            <div className="what-we-do-timeline__media lg:pr-6 xl:pr-10">
              {imageBlock}
            </div>
            <div className="what-we-do-timeline__copy lg:pl-6 xl:pl-10">
              {textBlock}
            </div>
          </>
        ) : (
          <>
            <div className="what-we-do-timeline__copy order-2 lg:order-1 lg:pr-6 xl:pr-10">
              {textBlock}
            </div>
            <div className="what-we-do-timeline__media order-1 lg:order-2 lg:pl-6 xl:pl-10">
              {imageBlock}
            </div>
          </>
        )}
      </div>
    </article>
  );
}

export function WhatWeDoTimelineSection() {
  return (
    <section className="what-we-do-timeline section-padding overflow-hidden bg-muted pb-28">
      <div className="container-main">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow mb-5">Overview</p>
            <h2 className="heading-display text-3xl font-semibold sm:text-4xl lg:text-[2.75rem]">
              Every feature built for student budgets
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              From monthly setup to forecasts and reports — each feature supports
              the full MVP workflow: log expenses, track categories, get alerts,
              and understand where your money goes.
            </p>
          </div>
        </ScrollReveal>
      </div>

      <div className="what-we-do-timeline__track mt-16 sm:mt-20 lg:mt-24">
        <div className="container-main what-we-do-timeline__container">
          <div className="what-we-do-timeline__line hidden lg:block" aria-hidden />

          <div className="space-y-16 sm:space-y-20 lg:space-y-28">
            {services.map((service, index) => (
              <TimelineRow key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
