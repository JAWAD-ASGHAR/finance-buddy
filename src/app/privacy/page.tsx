import { JsonLd } from "@/components/seo/JsonLd";
import { LegalDocument } from "@/components/sections/LegalDocument";
import { privacyPolicy } from "@/lib/content";
import { breadcrumbJsonLd, createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "Read how Finance Buddy collects, uses, and protects personal and financial information for student users.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy" },
        ])}
      />
      <LegalDocument
        eyebrow={privacyPolicy.eyebrow}
        title={privacyPolicy.title}
        updated={privacyPolicy.updated}
        intro={privacyPolicy.intro}
        sections={privacyPolicy.sections}
      />
    </>
  );
}
