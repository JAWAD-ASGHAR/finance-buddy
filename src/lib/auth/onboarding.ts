export function userNeedsOnboarding(
  profile: {
    onboarding_completed_at: string | null;
    username?: string | null;
  } | null,
): boolean {
  return !profile?.onboarding_completed_at || !profile?.username;
}
