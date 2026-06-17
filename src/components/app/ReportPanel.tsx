"use client";

import { getSpendingReport } from "@/actions/reports";
import type { MonthlyReportSummary } from "@/types/finance";
import { useState } from "react";
import { toast } from "sonner";
import { MonthlyReportView } from "@/components/app/MonthlyReportView";
import { useCurrency } from "@/components/app/CurrencyProvider";
import { AppButton, AppCard, AppInput } from "@/components/app/ui";
import { downloadSpendingReportPdf } from "@/lib/finance/report-pdf";
import {
  getMonthlyReportDateRange,
  getWeeklyReportDateRange,
  type ReportPeriodPreset,
} from "@/lib/finance/report-date-range";
import { cn } from "@/lib/utils";

const PRESETS: Array<{
  id: ReportPeriodPreset;
  label: string;
  description: string;
}> = [
  {
    id: "weekly",
    label: "Weekly",
    description: "Monday through today",
  },
  {
    id: "monthly",
    label: "Monthly",
    description: "First of month through today",
  },
  {
    id: "custom",
    label: "Custom",
    description: "Pick your own dates",
  },
];

function getRangeForPreset(preset: ReportPeriodPreset) {
  if (preset === "weekly") {
    return getWeeklyReportDateRange();
  }

  if (preset === "monthly") {
    return getMonthlyReportDateRange();
  }

  return null;
}

export function ReportPanel({
  initialReport,
  initialStartDate,
  initialEndDate,
}: {
  initialReport: MonthlyReportSummary | null;
  initialStartDate: string;
  initialEndDate: string;
}) {
  const { formatMoney } = useCurrency();
  const [report, setReport] = useState(initialReport);
  const [preset, setPreset] = useState<ReportPeriodPreset>("monthly");
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [pending, setPending] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function loadReport(
    nextStartDate: string,
    nextEndDate: string,
    nextPreset = preset,
  ) {
    if (nextStartDate > nextEndDate) {
      toast.error("Start date must be on or before end date");
      return;
    }

    setPending(true);
    const result = await getSpendingReport({
      startDate: nextStartDate,
      endDate: nextEndDate,
    });

    if (!result.success) {
      toast.error(result.error);
      setPending(false);
      return;
    }

    setReport(result.data);
    setStartDate(nextStartDate);
    setEndDate(nextEndDate);
    setPreset(nextPreset);
    setPending(false);
  }

  async function handlePresetChange(nextPreset: ReportPeriodPreset) {
    setPreset(nextPreset);

    if (nextPreset === "custom") {
      return;
    }

    const range = getRangeForPreset(nextPreset);
    if (!range) return;

    await loadReport(range.startDate, range.endDate, nextPreset);
  }

  async function handleViewReport() {
    await loadReport(startDate, endDate, "custom");
  }

  async function handleDownloadPdf() {
    if (!report) {
      toast.error("Generate a report first");
      return;
    }

    setDownloading(true);

    try {
      await downloadSpendingReportPdf({
        summary: report,
        formatMoney,
        preset,
      });
      toast.success("PDF downloaded");
    } catch {
      toast.error("Could not generate PDF");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <AppCard
        title="Report period"
        description="Choose a weekly or monthly report, or set a custom date range."
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {PRESETS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => void handlePresetChange(option.id)}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left transition-colors",
                  preset === option.id
                    ? "border-accent-green bg-accent-green-light/50"
                    : "border-border hover:border-foreground/20",
                )}
              >
                <p className="font-medium">{option.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {option.description}
                </p>
              </button>
            ))}
          </div>

          {preset === "custom" ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <AppInput
                label="Start date"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
              <AppInput
                label="End date"
                name="endDate"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
              <AppButton
                type="button"
                loading={pending}
                className="sm:mb-0.5"
                onClick={() => void handleViewReport()}
              >
                View report
              </AppButton>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {startDate} to {endDate}
              </p>
              <AppButton
                type="button"
                variant="secondary"
                loading={pending}
                onClick={() => void loadReport(startDate, endDate, preset)}
              >
                Refresh report
              </AppButton>
            </div>
          )}
        </div>
      </AppCard>

      {report ? (
        <AppCard
          title="Export"
          description="Download a formatted PDF copy of the current report."
        >
          <AppButton
            type="button"
            loading={downloading}
            onClick={() => void handleDownloadPdf()}
          >
            Download PDF
          </AppButton>
        </AppCard>
      ) : null}

      {report ? <MonthlyReportView summary={report} /> : null}
    </div>
  );
}
