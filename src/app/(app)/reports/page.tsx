import { ReportPanel } from "@/components/app/ReportPanel";
import { AppButton, AppCard, AppPageHeader } from "@/components/app/ui";
import { getLatestReport } from "@/actions/reports";
import { getCurrentBudget } from "@/lib/supabase/queries";
import Link from "next/link";

export default async function ReportsPage() {
  const { budget } = await getCurrentBudget();
  const report = budget ? await getLatestReport() : null;

  if (!budget) {
    return (
      <>
        <AppPageHeader title="Monthly report" />
        <AppCard title="Budget required">
          <p className="mb-4 text-sm text-muted-foreground">
            Create a budget and log expenses to generate a monthly summary.
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
        title="Monthly report"
        description="Summarize spending patterns and forecast from your actual expense data."
      />
      <ReportPanel initialReport={report?.summary_json ?? null} />
    </>
  );
}
