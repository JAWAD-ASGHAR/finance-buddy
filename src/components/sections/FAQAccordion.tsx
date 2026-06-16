"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

type FAQ = {
  question: string;
  answer: string;
};

export function FAQAccordion({ faqs }: { faqs: readonly FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="border-t border-border">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <ScrollReveal key={faq.question} delay={index * 0.04}>
            <div className="border-b border-border">
              <button
                type="button"
                id={`faq-question-${index}`}
                className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors hover:text-accent-green"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className="heading-display text-base font-medium sm:text-lg">
                  {faq.question}
                </span>
                <Plus
                  size={18}
                  className={cn(
                    "shrink-0 text-muted-foreground transition-transform duration-300",
                    isOpen && "rotate-45",
                  )}
                />
              </button>
              <div
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
                className={cn(
                  "grid transition-all duration-300 ease-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <p className="pb-6 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
