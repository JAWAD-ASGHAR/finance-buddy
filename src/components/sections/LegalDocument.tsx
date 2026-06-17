"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { PageHeroSection } from "@/components/sections/PageHeroSection";
import type { LegalSection } from "@/lib/content";
import { legalFooterLinks, site } from "@/lib/content";

function scrollToLegalSection(
  event: React.MouseEvent<HTMLAnchorElement>,
  id: string,
) {
  event.preventDefault();
  const target = document.getElementById(id);
  if (!target) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  target.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
  window.history.replaceState(null, "", `#${id}`);
}

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: readonly LegalSection[];
};

export function LegalDocument({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: LegalDocumentProps) {
  return (
    <>
      <PageHeroSection
        eyebrow={eyebrow}
        title={title}
        description={intro}
        meta={`Last updated ${updated}`}
      />

      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16 xl:gap-20">
            <ScrollReveal>
              <nav
                aria-label={`${title} sections`}
                className="lg:sticky lg:top-28 lg:self-start"
              >
                <p className="eyebrow mb-4">On this page</p>
                <ul className="space-y-3">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        onClick={(event) => scrollToLegalSection(event, section.id)}
                        className="text-sm text-muted-foreground transition-colors hover:text-accent-green"
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </ScrollReveal>

            <div className="space-y-14">
              {sections.map((section, index) => (
                <ScrollReveal key={section.id} delay={index * 0.04}>
                  <article
                    id={section.id}
                    className="scroll-mt-28 border-t border-border pt-10 first:border-t-0 first:pt-0"
                  >
                    <h2 className="heading-display text-2xl font-semibold sm:text-3xl">
                      {section.title}
                    </h2>
                    <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    {section.list && (
                      <ul className="mt-5 space-y-3">
                        {section.list.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base"
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-green" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-[#e6e6ea] py-12">
        <div className="container-main flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="heading-display text-lg font-semibold text-foreground">
              Questions about this document?
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Contact {site.name} at{" "}
              <a
                href={`mailto:${site.email}`}
                className="text-accent-green hover:underline"
              >
                {site.email}
              </a>
              .
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {legalFooterLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link inline-flex h-11 items-center text-muted-foreground transition-colors hover:text-accent-green"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-full bg-dark px-6 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-dark-muted"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
