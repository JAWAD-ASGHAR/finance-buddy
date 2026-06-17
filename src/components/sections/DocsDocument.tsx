"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { PageHeroSection } from "@/components/sections/PageHeroSection";
import type { DocsSection } from "@/lib/docs-content";
import { legalFooterLinks, site } from "@/lib/content";
import { cn } from "@/lib/utils";

function scrollToDocsSection(
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

function CodeBlock({ filename, code }: { filename?: string; code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="docs-code-block group relative overflow-hidden rounded-xl border border-border bg-muted">
      {filename ? (
        <div className="flex items-center justify-between gap-3 border-b border-border/80 bg-background/70 px-4 py-2.5">
          <p className="font-mono text-xs text-muted-foreground">{filename}</p>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            aria-label={copied ? "Copied" : "Copy code"}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-background/80 px-2 py-1 text-xs font-medium text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-foreground group-hover:opacity-100"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-[0.8125rem] leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

type DocsDocumentProps = {
  eyebrow: string;
  title: string;
  titleAccent?: string;
  updated: string;
  intro: string;
  sections: readonly DocsSection[];
};

export function DocsDocument({
  eyebrow,
  title,
  titleAccent,
  updated,
  intro,
  sections,
}: DocsDocumentProps) {
  return (
    <>
      <PageHeroSection
        eyebrow={eyebrow}
        title={title}
        titleAccent={titleAccent}
        description={intro}
        meta={`Last updated ${updated}`}
      />

      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16 xl:gap-20">
            <ScrollReveal>
              <nav
                aria-label="Documentation sections"
                className="lg:sticky lg:top-28 lg:self-start"
              >
                <p className="eyebrow mb-4">On this page</p>
                <ul className="space-y-3">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        onClick={(event) =>
                          scrollToDocsSection(event, section.id)
                        }
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

                    {section.paragraphs?.length ? (
                      <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    ) : null}

                    {section.codeBlocks?.length ? (
                      <div
                        className={cn(
                          "space-y-4",
                          section.paragraphs?.length ? "mt-6" : "mt-5",
                        )}
                      >
                        {section.codeBlocks.map((block) => (
                          <CodeBlock
                            key={`${section.id}-${block.filename ?? block.code.slice(0, 24)}`}
                            filename={block.filename}
                            code={block.code}
                          />
                        ))}
                      </div>
                    ) : null}

                    {section.table ? (
                      <div
                        className={cn(
                          "mt-6 overflow-x-auto rounded-xl border border-border",
                          !section.paragraphs?.length &&
                            !section.codeBlocks?.length &&
                            "mt-5",
                        )}
                      >
                        <table className="w-full min-w-[32rem] text-left text-sm">
                          <thead className="border-b border-border bg-muted">
                            <tr>
                              {section.table.headers.map((header) => (
                                <th
                                  key={header}
                                  className="px-4 py-3 font-semibold text-foreground"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {section.table.rows.map((row) => (
                              <tr
                                key={row.join("-")}
                                className="border-b border-border/70 last:border-b-0"
                              >
                                {row.map((cell, cellIndex) => (
                                  <td
                                    key={`${row[0]}-${cellIndex}`}
                                    className="px-4 py-3 align-top text-muted-foreground"
                                  >
                                    {cellIndex === 0 ? (
                                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                                        {cell}
                                      </code>
                                    ) : (
                                      cell
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}

                    {section.list?.length ? (
                      <ul
                        className={cn(
                          "space-y-3",
                          section.paragraphs?.length ||
                            section.codeBlocks?.length ||
                            section.table
                            ? "mt-6"
                            : "mt-5",
                        )}
                      >
                        {section.list.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base"
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-green" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-[#e6e6ea] py-12">
        <div className="container-main flex flex-col gap-8">
          <div className="max-w-xl">
            <p className="heading-display text-lg font-semibold text-foreground">
              Need help connecting MCP?
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Reach {site.name} at{" "}
              <a
                href={`mailto:${site.supportEmail}`}
                className="text-accent-green hover:underline"
              >
                {site.supportEmail}
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
