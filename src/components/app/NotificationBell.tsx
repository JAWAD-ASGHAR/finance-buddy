"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, TriangleAlert, UserPlus, Users, Wallet } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { respondToFriendRequest } from "@/actions/friends";
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/actions/notifications";
import { AppButton } from "@/components/app/ui";
import { AppFlyoutPanel } from "@/components/app/AppFlyoutPanel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppNotification, NotificationType } from "@/types/notifications";

function notificationIcon(type: NotificationType) {
  switch (type) {
    case "friend_request":
    case "friend_request_accepted":
      return UserPlus;
    case "shared_expense":
      return Users;
    case "settlement":
      return Wallet;
    case "budget_alert":
      return TriangleAlert;
    default:
      return Bell;
  }
}

function getRequestId(notification: AppNotification): string | null {
  const requestId = notification.metadata.requestId;
  return typeof requestId === "string" ? requestId : null;
}

function NotificationListSkeleton() {
  return (
    <ul className="divide-y divide-border" aria-hidden>
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className="px-4 py-3">
          <div className="flex animate-pulse gap-3">
            <div className="size-8 shrink-0 rounded-full bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-3/4 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function NotificationBell() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const [pendingAccept, setPendingAccept] = useState<boolean | null>(null);

  const refreshUnreadCount = useCallback(async () => {
    const result = await getUnreadCount();
    if (result.success) {
      setUnreadCount(result.data);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setLoading(true);

    const result = await listNotifications();
    if (result.success) {
      setNotifications(result.data);
    } else {
      toast.error(result.error);
    }

    setLoading(false);
    await refreshUnreadCount();
  }, [refreshUnreadCount]);

  useEffect(() => {
    void refreshUnreadCount();
  }, [refreshUnreadCount]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("keydown", handleEscape);
      void loadNotifications();
    }

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, loadNotifications]);

  async function handleOpenNotification(notification: AppNotification) {
    if (!notification.read_at) {
      await markNotificationRead(notification.id);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, read_at: new Date().toISOString() }
            : item,
        ),
      );
      await refreshUnreadCount();
    }

    setOpen(false);
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        read_at: item.read_at ?? new Date().toISOString(),
      })),
    );
    setUnreadCount(0);
  }

  async function handleFriendRequestResponse(
    notification: AppNotification,
    accept: boolean,
  ) {
    const requestId = getRequestId(notification);
    if (!requestId) return;

    setPendingRequestId(requestId);
    setPendingAccept(accept);

    const result = await respondToFriendRequest(requestId, accept);
    if (!result.success) {
      toast.error(result.error);
      setPendingRequestId(null);
      setPendingAccept(null);
      return;
    }

    toast.success(accept ? "Friend request accepted" : "Friend request declined");

    await markNotificationRead(notification.id);
    setPendingRequestId(null);
    setPendingAccept(null);
    await loadNotifications();
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className={cn("relative", open && "border-primary/40 bg-primary/5 text-primary")}
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[0.625rem] font-semibold leading-4 text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </Button>

      <AppFlyoutPanel
        open={open}
        className="w-[min(22rem,calc(100vw-2rem))]"
      >
        <div role="menu">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Check className="size-3.5" />
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <NotificationListSkeleton />
            ) : null}

            {!loading && notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications yet.
              </p>
            ) : null}

            <ul className="divide-y divide-border">
              {notifications.map((notification) => {
                const Icon = notificationIcon(notification.type);
                const requestId = getRequestId(notification);
                const isPendingFriendRequest =
                  notification.type === "friend_request" && requestId;
                const isUnread = !notification.read_at;

                return (
                  <li key={notification.id}>
                    <div
                      className={cn(
                        "px-4 py-3",
                        isUnread && "bg-muted/40",
                      )}
                    >
                      <div className="flex gap-3">
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                          <Icon className="size-4 text-muted-foreground" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">
                              {notification.title}
                            </p>
                            <span className="shrink-0 text-[0.625rem] text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(notification.created_at),
                                { addSuffix: true },
                              )}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {notification.body}
                          </p>

                          {isPendingFriendRequest ? (
                            <div className="mt-3 flex gap-2">
                              <AppButton
                                type="button"
                                variant="secondary"
                                loading={
                                  pendingRequestId === requestId &&
                                  pendingAccept === false
                                }
                                disabled={pendingRequestId === requestId}
                                onClick={() =>
                                  void handleFriendRequestResponse(
                                    notification,
                                    false,
                                  )
                                }
                              >
                                Decline
                              </AppButton>
                              <AppButton
                                type="button"
                                loading={
                                  pendingRequestId === requestId &&
                                  pendingAccept === true
                                }
                                disabled={pendingRequestId === requestId}
                                onClick={() =>
                                  void handleFriendRequestResponse(
                                    notification,
                                    true,
                                  )
                                }
                              >
                                Accept
                              </AppButton>
                            </div>
                          ) : (
                            <Link
                              href={notification.href}
                              role="menuitem"
                              onClick={() => void handleOpenNotification(notification)}
                              className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                            >
                              View
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </AppFlyoutPanel>
    </div>
  );
}
