"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import type { DailySpendPoint } from "@/lib/finance/chart-data";
import { toChartCurrency } from "@/lib/finance/chart-data";
import { useCurrency } from "@/components/app/CurrencyProvider";
import { compactCurrencyFormatter } from "@/lib/finance/currency";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { spendingTrendChartConfig } from "@/components/charts/chart-config";

type SpendingTrendChartProps = {
  data: DailySpendPoint[];
  className?: string;
};

export function SpendingTrendChart({ data, className }: SpendingTrendChartProps) {
  const { formatMoney, currency } = useCurrency();
  const compactFormat = compactCurrencyFormatter(currency);
  const chartData = data.map((point) => ({
    ...point,
    cumulative: toChartCurrency(point.cumulativeCents),
    pace: toChartCurrency(point.paceCents),
  }));

  const tickInterval = Math.max(1, Math.floor(data.length / 6));

  return (
    <ChartContainer
      config={spendingTrendChartConfig}
      className={className ?? "aspect-[2/1] min-h-[240px] w-full"}
    >
      <AreaChart
        data={chartData}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="spendingFill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-cumulative)"
              stopOpacity={0.45}
            />
            <stop
              offset="100%"
              stopColor="var(--color-cumulative)"
              stopOpacity={0.02}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={tickInterval}
          tickFormatter={(day) => String(day)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={56}
          tickFormatter={(value) => compactFormat(Number(value))}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.label ?? ""
              }
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">
                    {spendingTrendChartConfig[
                      name as keyof typeof spendingTrendChartConfig
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
        <Area
          dataKey="cumulative"
          type="monotone"
          fill="url(#spendingFill)"
          stroke="var(--color-cumulative)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Line
          dataKey="pace"
          type="monotone"
          stroke="var(--color-pace)"
          strokeWidth={1.5}
          strokeDasharray="6 4"
          dot={false}
          activeDot={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
