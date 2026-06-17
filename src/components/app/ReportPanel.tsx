"use client";

import { getSpendingReport } from "@/actions/reports";
import type { MonthlyReportSummary } from "@/types/finance";
import { useState } from "react";
import { toast } from "sonner";
import { MonthlyReportView } from "@/components/app/MonthlyReportView";
import { AppButton, AppCard, AppInput } from "@/components/app/ui";

export function ReportPanel({
  initialReport,
  initialStartDate,
  initialEndDate,
}: {
  initialReport: MonthlyReportSummary | null;
  initialStartDate: string;
  initialEndDate: string;
}) {
  const [report, setReport] = useState(initialReport);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [pending, setPending] = useState(false);

  async function handleViewReport() {
    if (startDate > endDate) {
      toast.error("Start date must be on or before end date");
      return;
    }

    setPending(true);
    const result = await getSpendingReport({ startDate, endDate });
    if (!result.success) {
      toast.error(result.error);
      setPending(false);
      return;
    }

    setReport(result.data);
    setPending(false);
  }

  return (
    <div className="space-y-6">
      <AppCard
        title="Date range"
        description="Choose the period to include in your spending report."
      >
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
      </AppCard>

      {report ? <MonthlyReportView summary={report} /> : null}
    </div>
  );
}
