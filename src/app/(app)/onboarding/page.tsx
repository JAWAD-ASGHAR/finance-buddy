import { redirect } from "next/navigation";
import { getCurrentUserPreferences } from "@/actions/profile";
import { UserPreferencesForm } from "@/components/app/UserPreferencesForm";
import { AppCard, AppPageHeader } from "@/components/app/ui";
import { getAppSession } from "@/lib/auth/session";
import { DEFAULT_CURRENCY } from "@/lib/finance/currency";

export default async function OnboardingPage() {
  const session = await getAppSession();
  if (!session) {
    redirect("/login");
  }

  if (session.onboardingCompleted) {
    redirect("/dashboard");
  }

  const prefs = await getCurrentUserPreferences();

  return (
    <div className="mx-auto max-w-lg">
      <AppPageHeader
        title="Welcome to Finance Buddy"
        description="Tell us a bit about yourself so we can personalize budgets, reports, and shared expenses."
      />
      <AppCard title="Your details">
        <UserPreferencesForm
          mode="onboarding"
          initial={{
            displayName: prefs?.displayName ?? session.displayName,
            currencyCode: prefs?.currencyCode ?? DEFAULT_CURRENCY,
            countryCode: prefs?.countryCode ?? null,
            onboardingCompleted: false,
          }}
        />
      </AppCard>
    </div>
  );
}
