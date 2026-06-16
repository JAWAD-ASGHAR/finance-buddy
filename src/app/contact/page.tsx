import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContactDetailsSection } from "@/components/sections/ContactDetailsSection";
import { ContactHeroSection } from "@/components/sections/ContactHeroSection";
import { ContactProcessSection } from "@/components/sections/ContactProcessSection";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { breadcrumbJsonLd, createPageMetadata, faqPageJsonLd, homeFaqs } from "@/lib/seo";

const contactDescription =
  "Request early access to Finance Buddy. Join the waitlist for student micro-budgeting with expense tracking, forecasts, and privacy-first design.";

export const metadata = createPageMetadata({
  title: "Contact",
  description: contactDescription,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
          faqPageJsonLd(homeFaqs),
        ]}
      />
      <ContactHeroSection />
      <ContactDetailsSection />
      <ContactProcessSection />

      <section
        id="faq"
        aria-labelledby="contact-faq-heading"
        className="section-padding bg-white"
      >
        <div className="container-main">
          <ScrollReveal>
            <h2
              id="contact-faq-heading"
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
    </>
  );
}
