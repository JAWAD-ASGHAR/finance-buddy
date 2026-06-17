"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  respondToFriendRequest,
  sendFriendRequestByEmail,
} from "@/actions/friends";
import {
  AppButton,
  AppCard,
  AppInput,
} from "@/components/app/ui";
import type { FriendRequest } from "@/types/shared";

export function FriendSearchForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);

    const result = await sendFriendRequestByEmail(email);
    if (!result.success) {
      toast.error(result.error);
      setPending(false);
      return;
    }

    toast.success(
      `Request sent to ${result.data.recipient?.display_name ?? "your friend"}`,
    );
    setEmail("");
    setPending(false);
    router.refresh();
  }

  return (
    <AppCard title="Add a friend" description="Search by the email they use to sign in.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AppInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="friend@university.ac.uk"
          required
        />
        <AppButton type="submit" loading={pending}>
          Send request
        </AppButton>
      </form>
    </AppCard>
  );
}

export function PendingRequestsPanel({
  incoming,
  outgoing,
}: {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingAccept, setPendingAccept] = useState<boolean | null>(null);

  async function handleRespond(requestId: string, accept: boolean) {
    setPendingId(requestId);
    setPendingAccept(accept);

    const result = await respondToFriendRequest(requestId, accept);
    if (!result.success) {
      toast.error(result.error);
      setPendingId(null);
      setPendingAccept(null);
      return;
    }

    toast.success(accept ? "Friend request accepted" : "Friend request declined");
    setPendingId(null);
    setPendingAccept(null);
    router.refresh();
  }

  if (incoming.length === 0 && outgoing.length === 0) {
    return null;
  }

  return (
    <AppCard title="Pending requests">
      {incoming.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Incoming
          </p>
          <ul className="space-y-3">
            {incoming.map((request) => (
              <li
                key={request.id}
                className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-medium">
                  {request.requester?.display_name ?? "Someone"} wants to connect
                </span>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <AppButton
                    type="button"
                    variant="secondary"
                    loading={pendingId === request.id && pendingAccept === false}
                    disabled={pendingId === request.id}
                    onClick={() => handleRespond(request.id, false)}
                  >
                    Decline
                  </AppButton>
                  <AppButton
                    type="button"
                    loading={pendingId === request.id && pendingAccept === true}
                    disabled={pendingId === request.id}
                    onClick={() => handleRespond(request.id, true)}
                  >
                    Accept
                  </AppButton>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {outgoing.length > 0 ? (
        <div className={incoming.length > 0 ? "mt-6 space-y-3" : "space-y-3"}>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Sent
          </p>
          <ul className="space-y-2">
            {outgoing.map((request) => (
              <li key={request.id} className="text-sm text-muted-foreground">
                Waiting for {request.recipient?.display_name ?? "friend"} to accept
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </AppCard>
  );
}

export function PendingRequestsBanner({
  incoming,
}: {
  incoming: FriendRequest[];
}) {
  if (incoming.length === 0) return null;

  return (
    <AppCard className="border-accent-green/30 bg-accent-green-light/30">
      <p className="text-sm">
        You have {incoming.length} pending friend request
        {incoming.length === 1 ? "" : "s"}.{" "}
        <a href="/shared/friends" className="font-medium text-accent-green underline-offset-4 hover:underline">
          Review requests
        </a>
      </p>
    </AppCard>
  );
}
