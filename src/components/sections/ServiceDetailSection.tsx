import { Button } from "@/components/ui/Button";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

type ServiceDetail = {
  id: string;
  title: string;
  shortTitle: string;
  comingSoon?: boolean;
  stackImage: string;
  stackImageLabel: string;
  details: {
    intro: string;
    benefits: readonly string[];
    whoWeHelp: string;
    steps: readonly string[];
  };
};

export function ServiceDetailSection({
  service,
  index,
}: {
  service: ServiceDetail;
  index: number;
}) {
  const reversed = index % 2 === 1;
  const muted = index % 2 === 1;

  return (
    <section
      id={service.id}
      className={`scroll-mt-28 section-padding overflow-hidden ${muted ? "bg-[#e6e6ea]" : "bg-white"}`}
    >
      <div className="container-main">
        <div
          className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20 ${reversed ? "lg:[&>*:first-child]:order-2" : ""}`}
        >
          <ParallaxLayer speed={reversed ? -0.04 : 0.04}>
            <ScrollReveal direction={reversed ? "right" : "left"}>
              <div>
                <p className="eyebrow mb-4">{service.shortTitle}</p>
                <h2 className="heading-display text-3xl font-semibold sm:text-4xl lg:text-[2.75rem]">
                  {service.title}
                </h2>
                {service.comingSoon ? (
                  <span className="mt-4 inline-block rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Coming Soon
                  </span>
                ) : null}
                <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {service.details.intro}
                </p>
                <div className="mt-8">
                  <Button href="/contact">Book a Free Consultation</Button>
                </div>
              </div>
            </ScrollReveal>
          </ParallaxLayer>

          <ScrollReveal direction={reversed ? "left" : "right"} delay={0.1}>
            <ParallaxImage
              src={service.stackImage}
              alt={service.stackImageLabel}
              className="aspect-[4/3] min-h-[18rem] rounded-3xl"
              speed={0.12}
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </ScrollReveal>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3 lg:gap-6">
          <ScrollReveal delay={0.05}>
            <article className="h-full rounded-3xl bg-white p-7 sm:p-8">
              <h3 className="heading-display text-lg font-semibold">
                Benefits & Features
              </h3>
              <ul className="mt-5 space-y-3.5">
                {service.details.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-blue"
                      aria-hidden
                    />
                    {benefit}
                  </li>
                ))}
              </ul>
            </article>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <article className="h-full rounded-3xl bg-white p-7 sm:p-8">
              <h3 className="heading-display text-lg font-semibold">
                Who We Help
              </h3>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {service.details.whoWeHelp}
              </p>
            </article>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <article className="h-full rounded-3xl bg-white p-7 sm:p-8">
              <h3 className="heading-display text-lg font-semibold">
                How It Works
              </h3>
              <ol className="mt-5 space-y-3.5">
                {service.details.steps.map((step, stepIndex) => (
                  <li
                    key={step}
                    className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-blue">
                      {String(stepIndex + 1).padStart(2, "0")}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </article>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
