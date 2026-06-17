import Link from "next/link";
import { AppCard } from "@/components/app/ui";

export function ProfileFriendsSummary({
  friendCount,
  incomingRequestCount,
  outgoingRequestCount,
}: {
  friendCount: number;
  incomingRequestCount: number;
  outgoingRequestCount: number;
}) {
  const pendingCount = incomingRequestCount + outgoingRequestCount;

  return (
    <AppCard title="Friends">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">{friendCount}</span>{" "}
            {friendCount === 1 ? "friend" : "friends"}
            {pendingCount > 0 ? (
              <>
                {" "}
                ·{" "}
                <span className="font-medium text-foreground">
                  {pendingCount}
                </span>{" "}
                pending {pendingCount === 1 ? "request" : "requests"}
              </>
            ) : null}
          </p>
          <p>Find people and manage friend requests on the friends page.</p>
        </div>
        <Link
          href="/friends"
          className="shrink-0 text-sm font-medium text-accent-green underline-offset-4 hover:underline"
        >
          Manage friends →
        </Link>
      </div>
    </AppCard>
  );
}
