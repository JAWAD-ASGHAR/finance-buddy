"use client";

import { generateMonthlyReport } from "@/actions/reports";
import type { MonthlyReportSummary } from "@/types/finance";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MonthlyReportView } from "@/components/app/MonthlyReportView";
import { AppButton } from "@/components/app/ui";

export function ReportPanel({
  initialReport,
}: {
  initialReport: MonthlyReportSummary | null;
}) {
  const router = useRouter();
  const [report, setReport] = useState(initialReport);
  const [pending, setPending] = useState(false);

  async function handleGenerate() {
    setPending(true);
    const result = await generateMonthlyReport();
    if (!result.success) {
      toast.error(result.error);
      setPending(false);
      return;
    }
    setReport(result.data);
    toast.success("Monthly report generated");
    router.refresh();
    setPending(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <AppButton type="button" loading={pending} onClick={handleGenerate}>
          Generate monthly report
        </AppButton>
      </div>
      {report ? <MonthlyReportView summary={report} /> : null}
    </div>
  );
}
