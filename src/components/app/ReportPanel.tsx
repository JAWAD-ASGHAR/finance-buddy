"use client";

import { generateMonthlyReport } from "@/actions/reports";
import type { MonthlyReportSummary } from "@/types/finance";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MonthlyReportView } from "@/components/app/MonthlyReportView";
import { AppButton, AppError } from "@/components/app/ui";

export function ReportPanel({
  initialReport,
}: {
  initialReport: MonthlyReportSummary | null;
}) {
  const router = useRouter();
  const [report, setReport] = useState(initialReport);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleGenerate() {
    setPending(true);
    setError(null);
    const result = await generateMonthlyReport();
    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }
    setReport(result.data);
    router.refresh();
    setPending(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <AppButton type="button" disabled={pending} onClick={handleGenerate}>
          {pending ? "Generating..." : "Generate monthly report"}
        </AppButton>
      </div>
      {error ? <AppError message={error} /> : null}
      {report ? <MonthlyReportView summary={report} /> : null}
    </div>
  );
}
