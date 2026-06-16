"use client";

import { PageHeroSection } from "@/components/sections/PageHeroSection";
import { contactPage } from "@/lib/content";

export function ContactHeroSection() {
  return (
    <PageHeroSection
      eyebrow={contactPage.eyebrow}
      title={contactPage.title}
      titleAccent={contactPage.titleAccent}
      description={contactPage.description}
      highlights={contactPage.highlights}
      tall
    />
  );
}
