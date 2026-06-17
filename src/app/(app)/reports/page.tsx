import { ReportPanel } from "@/components/app/ReportPanel";
import { AppButton, AppCard, AppPageHeader } from "@/components/app/ui";
import { getSpendingReport } from "@/actions/reports";
import { getDefaultReportDateRange } from "@/lib/finance/report-date-range";
import { getCurrentBudget } from "@/lib/supabase/queries";
import Link from "next/link";

export default async function ReportsPage() {
  const { budget } = await getCurrentBudget();
  const { startDate, endDate } = getDefaultReportDateRange();
  const reportResult = budget
    ? await getSpendingReport({ startDate, endDate })
    : null;
  const report = reportResult?.success ? reportResult.data : null;

  if (!budget) {
    return (
      <>
        <AppPageHeader title="Spending report" />
        <AppCard title="Budget required">
          <p className="mb-4 text-sm text-muted-foreground">
            Create a budget and log expenses to view a spending report.
          </p>
          <Link href="/budget/setup">
            <AppButton>Set up budget</AppButton>
          </Link>
        </AppCard>
      </>
    );
  }

  return (
    <>
      <AppPageHeader
        title="Spending report"
        description="Review spending patterns and forecasts for any date range in your current budget."
      />
      <ReportPanel
        initialReport={report}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
    </>
  );
}
