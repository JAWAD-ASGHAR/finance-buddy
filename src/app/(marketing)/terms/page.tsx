import { JsonLd } from "@/components/seo/JsonLd";
import { LegalDocument } from "@/components/sections/LegalDocument";
import { termsOfService } from "@/lib/content";
import { breadcrumbJsonLd, createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Terms of Service",
  description:
    "Terms governing use of the Finance Buddy website and application for student micro-budgeting.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Terms of Service", path: "/terms" },
        ])}
      />
      <LegalDocument
        eyebrow={termsOfService.eyebrow}
        title={termsOfService.title}
        updated={termsOfService.updated}
        intro={termsOfService.intro}
        sections={termsOfService.sections}
      />
    </>
  );
}
