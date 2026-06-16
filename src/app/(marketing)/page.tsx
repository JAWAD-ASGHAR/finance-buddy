import { redirectIfAuthenticated } from "@/lib/auth/redirects";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { DarkFeaturesSection } from "@/components/sections/DarkFeaturesSection";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import {
  HeroSection,
} from "@/components/sections/HeroSection";
import { HomeIntroSection } from "@/components/sections/HomeIntroSection";
import { ImpactSection } from "@/components/sections/ImpactSection";
import { StackedServicesSection } from "@/components/sections/StackedServicesSection";
import { ChairCTASection } from "@/components/sections/ChairCTASection";
import { HomeChairReveal } from "@/components/sections/HomeChairReveal";
import { faqPageJsonLd, homeFaqs } from "@/lib/seo";

export default async function HomePage() {
  await redirectIfAuthenticated();

  return (
    <>
      <JsonLd data={faqPageJsonLd(homeFaqs)} />
      <HeroSection />

      <HomeIntroSection />

      <StackedServicesSection />

      <ImpactSection />

      <DarkFeaturesSection />

      <section
        id="faq"
        aria-labelledby="home-faq-heading"
        className="section-padding bg-white"
      >
        <div className="container-main">
          <ScrollReveal>
            <h2
              id="home-faq-heading"
              className="heading-display mb-12 text-center text-3xl font-semibold sm:text-4xl"
            >
              Frequently Asked Questions
            </h2>
          </ScrollReveal>
          <div className="mx-auto max-w-3xl">
            <FAQAccordion faqs={homeFaqs} />
          </div>
        </div>
      </section>

      <HomeChairReveal>
        <ChairCTASection />
      </HomeChairReveal>
    </>
  );
}
