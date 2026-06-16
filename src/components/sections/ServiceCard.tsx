"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  BarChart3,
  Bell,
  PiggyBank,
  Receipt,
  Sparkles,
  Wallet,
} from "lucide-react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

const iconMap = {
  "budget-setup": Wallet,
  "expense-tracking": Receipt,
  "auto-categorize": Sparkles,
  "forecast-alerts": Bell,
  "savings-goals": PiggyBank,
  "monthly-reports": BarChart3,
} as const;

type ServiceCardProps = {
  id: string;
  title: string;
  description: string;
  index?: number;
};

export function ServiceCard({
  id,
  title,
  description,
  index = 0,
}: ServiceCardProps) {
  const Icon = iconMap[id as keyof typeof iconMap] ?? Wallet;

  return (
    <ScrollReveal delay={index * 0.06}>
      <article className="group flex h-full flex-col border border-border bg-white p-8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        <Icon
          size={22}
          strokeWidth={1.5}
          className="text-accent-green"
          aria-hidden
        />
        <h3 className="heading-display mt-6 text-lg font-semibold">{title}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <Link
          href={`/what-we-do#${id}`}
          className="mt-8 inline-flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-foreground transition-colors group-hover:text-accent-green"
        >
          Learn More
          <ArrowRight size={12} />
        </Link>
      </article>
    </ScrollReveal>
  );
}
