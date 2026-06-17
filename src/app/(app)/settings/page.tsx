import { DeleteDataPanel } from "@/components/app/DeleteDataPanel";
import { McpApiKeysPanel } from "@/components/app/McpApiKeysPanel";
import { UserPreferencesPanel } from "@/components/app/UserPreferencesForm";
import { AppCard, AppPageHeader } from "@/components/app/ui";
import { getUserPreferences } from "@/lib/auth/user-preferences";
import { listMcpApiKeysForUser } from "@/lib/auth/mcp-api-key";
import { displayNameFromEmail } from "@/lib/auth/email";
import { DEFAULT_CURRENCY } from "@/lib/finance/currency";
import { requireAuthUser } from "@/lib/db/queries";

export default async function SettingsPage() {
  const user = await requireAuthUser();
  const [apiKeys, prefs] = await Promise.all([
    listMcpApiKeysForUser(user.id),
    getUserPreferences(user.id),
  ]);

  return (
    <>
      <AppPageHeader
        title="Settings"
        description="Manage your profile, privacy, API keys, and data. Your budget stays private to your account."
      />
      <div className="space-y-6">
        <UserPreferencesPanel
          initial={{
            displayName:
              prefs?.displayName ??
              displayNameFromEmail(user.email ?? "user@example.com"),
            currencyCode: prefs?.currencyCode ?? DEFAULT_CURRENCY,
            countryCode: prefs?.countryCode ?? null,
            onboardingCompleted: prefs?.onboardingCompleted ?? true,
          }}
        />
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
