"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  respondToFriendRequest,
  searchUsersByUsername,
  sendFriendRequest,
} from "@/actions/friends";
import {
  AppButton,
  AppCard,
  AppInput,
} from "@/components/app/ui";
import { normalizeUsername } from "@/lib/auth/username";
import type { Friend, FriendRequest } from "@/types/shared";

function friendLabel(friend: Friend) {
  if (friend.display_name && friend.username) {
    return `${friend.display_name} (@${friend.username})`;
  }
  return friend.display_name ?? (friend.username ? `@${friend.username}` : "User");
}

export function FriendSearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Friend[]>([]);
  const [searching, setSearching] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    const normalized = normalizeUsername(query);
    if (normalized.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      const result = await searchUsersByUsername(normalized);
      if (result.success) {
        setResults(result.data);
      } else {
        setResults([]);
      }
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  async function handleSendRequest(friend: Friend) {
    setPendingId(friend.id);

    const result = await sendFriendRequest(friend.id);
    if (!result.success) {
      toast.error(result.error);
      setPendingId(null);
      return;
    }

    toast.success(`Request sent to ${friendLabel(friend)}`);
    setResults((current) => current.filter((item) => item.id !== friend.id));
    setPendingId(null);
    router.refresh();
  }

  return (
    <div className="max-w-md">
      <AppInput
        label="Find people"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by username…"
        autoComplete="off"
      />

      {searching ? (
        <p className="mt-3 text-sm text-muted-foreground">Searching…</p>
      ) : null}

      {!searching && normalizeUsername(query).length >= 2 && results.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No people found matching that username.
        </p>
      ) : null}

      {results.length > 0 ? (
        <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
          {results.map((friend) => (
            <li
              key={friend.id}
              className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium">
                  {friend.display_name ?? "User"}
                </p>
                {friend.username ? (
                  <p className="text-xs text-muted-foreground">
                    @{friend.username}
                  </p>
                ) : null}
              </div>
              <AppButton
                type="button"
                loading={pendingId === friend.id}
                disabled={pendingId !== null && pendingId !== friend.id}
                onClick={() => handleSendRequest(friend)}
              >
                Add friend
              </AppButton>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
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
    return (
      <AppCard title="Requests">
        <p className="text-sm text-muted-foreground">No pending requests.</p>
      </AppCard>
    );
  }

  return (
    <AppCard title="Requests">
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
                  {request.requester?.display_name ?? "Someone"}
                  {request.requester?.username
                    ? ` (@${request.requester.username})`
                    : ""}{" "}
                  wants to connect
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
                Waiting for{" "}
                {request.recipient?.display_name ??
                  (request.recipient?.username
                    ? `@${request.recipient.username}`
                    : "friend")}{" "}
                to accept
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
        <a href="/friends#requests" className="font-medium text-accent-green underline-offset-4 hover:underline">
          Review requests
        </a>
      </p>
    </AppCard>
  );
}
