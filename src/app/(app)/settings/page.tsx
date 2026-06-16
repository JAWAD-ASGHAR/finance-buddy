import { DeleteDataPanel } from "@/components/app/DeleteDataPanel";
import { AppCard, AppPageHeader } from "@/components/app/ui";

export default function SettingsPage() {
  return (
    <>
      <AppPageHeader
        title="Settings"
        description="Manage your privacy and data. Your budget stays private to your account."
      />
      <div className="space-y-6">
        <AppCard title="Privacy">
          <p className="text-sm text-muted-foreground">
            Finance Buddy never exposes one user&apos;s budget to another. Forecasts,
            alerts, and reports are informational only — not financial advice.
          </p>
        </AppCard>
        <DeleteDataPanel />
      </div>
    </>
  );
}
