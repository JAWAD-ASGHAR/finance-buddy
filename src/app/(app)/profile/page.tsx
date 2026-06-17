import { DeleteDataPanel } from "@/components/app/DeleteDataPanel";
import { McpApiKeysPanel } from "@/components/app/McpApiKeysPanel";
import { ProfileFriendsSummary } from "@/components/app/ProfileFriendsSummary";
import { UserPreferencesPanel } from "@/components/app/UserPreferencesForm";
import { AppCard, AppPageHeader } from "@/components/app/ui";
import { getUserPreferences } from "@/lib/auth/user-preferences";
import { listMcpApiKeysForUser } from "@/lib/auth/mcp-api-key";
import { displayNameFromEmail } from "@/lib/auth/email";
import { DEFAULT_CURRENCY } from "@/lib/finance/currency";
import {
  getAcceptedFriends,
  getPendingFriendRequests,
} from "@/lib/db/shared-queries";
import { requireAuthUser } from "@/lib/db/queries";

export default async function ProfilePage() {
  const user = await requireAuthUser();
  const [apiKeys, prefs, friends, pending] = await Promise.all([
    listMcpApiKeysForUser(user.id),
    getUserPreferences(user.id),
    getAcceptedFriends(user.id),
    getPendingFriendRequests(user.id),
  ]);

  return (
    <>
      <AppPageHeader
        title="Profile"
        description="Your account details, preferences, and privacy settings."
      />
      <div className="space-y-6">
        <UserPreferencesPanel
          initial={{
            username: prefs?.username ?? null,
            displayName:
              prefs?.displayName ??
              displayNameFromEmail(user.email ?? "user@example.com"),
            currencyCode: prefs?.currencyCode ?? DEFAULT_CURRENCY,
            countryCode: prefs?.countryCode ?? null,
            onboardingCompleted: prefs?.onboardingCompleted ?? true,
          }}
        />
        <ProfileFriendsSummary
          friendCount={friends.length}
          incomingRequestCount={pending.incoming.length}
          outgoingRequestCount={pending.outgoing.length}
        />
        <AppCard title="Privacy">
          <p className="text-sm text-muted-foreground">
            Finance Buddy never exposes one user&apos;s budget to another.
            Forecasts, alerts, and reports are informational only — not
            financial advice.
          </p>
        </AppCard>
        <McpApiKeysPanel initialKeys={apiKeys} />
        <DeleteDataPanel />
      </div>
    </>
  );
}
