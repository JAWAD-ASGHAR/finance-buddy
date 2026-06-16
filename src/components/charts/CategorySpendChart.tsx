"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { CategoryChartPoint } from "@/lib/finance/chart-data";
import { formatMoney } from "@/types/finance";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { categorySpendChartConfig } from "@/components/charts/chart-config";

type CategorySpendChartProps = {
  data: CategoryChartPoint[];
  className?: string;
};

export function CategorySpendChart({ data, className }: CategorySpendChartProps) {
  return (
    <ChartContainer
      config={categorySpendChartConfig}
      className={className ?? "aspect-[4/3] min-h-[260px] w-full"}
    >
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={0}
          angle={data.length > 4 ? -24 : 0}
          textAnchor={data.length > 4 ? "end" : "middle"}
          height={data.length > 4 ? 56 : 32}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={56}
          tickFormatter={(value) =>
            new Intl.NumberFormat("en-GB", {
              style: "currency",
              currency: "GBP",
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(Number(value))
          }
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">
                    {categorySpendChartConfig[
                      name as keyof typeof categorySpendChartConfig
                    ]?.label ?? name}
                  </span>
                  <span className="font-mono font-medium tabular-nums">
                    {formatMoney(Math.round(Number(value) * 100))}
                  </span>
                </div>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="allocated"
          fill="var(--color-allocated)"
          radius={[4, 4, 0, 0]}
          maxBarSize={36}
        />
        <Bar
          dataKey="spent"
          fill="var(--color-spent)"
          radius={[4, 4, 0, 0]}
          maxBarSize={36}
        />
      </BarChart>
    </ChartContainer>
  );
}
