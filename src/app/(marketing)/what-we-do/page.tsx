import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { HomeChairReveal } from "@/components/sections/HomeChairReveal";
import { PageHeroSection } from "@/components/sections/PageHeroSection";
import { ChairCTASection } from "@/components/sections/ChairCTASection";
import { TestimonialCarousel } from "@/components/sections/TestimonialCarousel";
import { WhatWeDoTimelineSection } from "@/components/sections/WhatWeDoTimelineSection";
import { testimonials, whatWeDoPage } from "@/lib/content";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  servicesItemListJsonLd,
} from "@/lib/seo";

const whatWeDoDescription =
  "Explore Finance Buddy features — monthly budget setup, expense tracking, auto-categorization, forecast and alerts, savings goals, and monthly summary reports.";

export const metadata = createPageMetadata({
  title: "Features",
  description: whatWeDoDescription,
  path: "/what-we-do",
});

export default function WhatWeDoPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Features", path: "/what-we-do" },
          ]),
          servicesItemListJsonLd(),
        ]}
      />

      <PageHeroSection
        eyebrow={whatWeDoPage.eyebrow}
        title={whatWeDoPage.title}
        titleAccent={whatWeDoPage.titleAccent}
        description={whatWeDoPage.description}
        highlights={whatWeDoPage.highlights}
        tall
      />

      <WhatWeDoTimelineSection />

      <section className="section-padding overflow-hidden bg-[#e6e6ea]">
        <div className="container-main">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow mb-5">Testimonials</p>
              <h2 className="heading-display text-3xl font-semibold sm:text-4xl lg:text-[2.75rem]">
                What students are saying
              </h2>
            </div>
          </ScrollReveal>
          <div className="mt-12">
            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </div>
      </section>

      <HomeChairReveal>
        <ChairCTASection />
      </HomeChairReveal>
    </>
  );
}
