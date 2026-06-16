"use client";

import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

type Stat = {
  value: number;
  suffix?: string;
  label: string;
};

export function StatsRow({ stats }: { stats: readonly Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <ScrollReveal key={stat.label} delay={index * 0.1}>
          <div className="text-center lg:text-left">
            <p className="heading-display text-4xl font-semibold text-foreground sm:text-5xl">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
