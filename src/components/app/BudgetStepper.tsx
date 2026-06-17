"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type BudgetStep = {
  id: number;
  label: string;
};

export function BudgetStepper({
  steps,
  currentStep,
}: {
  steps: BudgetStep[];
  currentStep: number;
}) {
  return (
    <nav aria-label="Budget setup progress" className="mb-8">
      <ol className="flex items-center gap-2 sm:gap-0">
        {steps.map((step, index) => {
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className={cn("flex items-center", !isLast && "flex-1")}
            >
              <div className="flex min-w-0 flex-col items-center gap-1.5 sm:flex-row sm:gap-3">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                    isComplete &&
                      "border-accent-green bg-accent-green text-white",
                    isCurrent &&
                      "border-accent-green bg-accent-green-light text-accent-green",
                    !isComplete &&
                      !isCurrent &&
                      "border-border bg-muted/40 text-muted-foreground",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? (
                    <Check className="size-4" aria-hidden />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={cn(
                    "max-w-[4.5rem] text-center text-[11px] font-medium leading-tight sm:max-w-none sm:text-left sm:text-sm",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast ? (
                <div
                  className={cn(
                    "mx-2 hidden h-0.5 flex-1 sm:block",
                    isComplete ? "bg-accent-green" : "bg-border",
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
