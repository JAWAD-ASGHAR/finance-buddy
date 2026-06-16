import { DeleteDataPanel } from "@/components/app/DeleteDataPanel";
import { McpApiKeysPanel } from "@/components/app/McpApiKeysPanel";
import { AppCard, AppPageHeader } from "@/components/app/ui";
import { listMcpApiKeysForUser } from "@/lib/auth/mcp-api-key";
import { requireAuthUser } from "@/lib/db/queries";

export default async function SettingsPage() {
  const user = await requireAuthUser();
  const apiKeys = await listMcpApiKeysForUser(user.id);

  return (
    <>
      <AppPageHeader
        title="Settings"
        description="Manage your privacy, API keys, and data. Your budget stays private to your account."
      />
      <div className="space-y-6">
        <AppCard title="Privacy">
          <p className="text-sm text-muted-foreground">
            Finance Buddy never exposes one user&apos;s budget to another. Forecasts,
            alerts, and reports are informational only — not financial advice.
          </p>
        </AppCard>
        <McpApiKeysPanel initialKeys={apiKeys} />
        <DeleteDataPanel />
      </div>
    </>
  );
}
