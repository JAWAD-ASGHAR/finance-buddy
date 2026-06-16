import type { ChartConfig } from "@/components/ui/chart";

export const spendingTrendChartConfig = {
  cumulative: {
    label: "Total spent",
    color: "var(--chart-1)",
  },
  pace: {
    label: "Budget pace",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export const categorySpendChartConfig = {
  spent: {
    label: "Spent",
    color: "var(--chart-1)",
  },
  allocated: {
    label: "Allocated",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;
