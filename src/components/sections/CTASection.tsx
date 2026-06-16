import { SiteButton } from "@/components/ui/site-button";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

type CTASectionProps = {
  title: string;
  description: string;
};

export function CTASection({ title, description }: CTASectionProps) {
  return (
    <section className="section-padding bg-white">
      <div className="container-main">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="heading-display text-3xl font-semibold sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
            <div className="mt-8">
              <SiteButton href="/contact">Book a Free Consultation</SiteButton>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
