"use server";

import { requireAuthUser } from "@/lib/db/queries";
import {
  getUnreadNotificationCount,
  listNotificationsForUser,
  markAllNotificationsReadForUser,
  markNotificationReadForUser,
} from "@/lib/services/notifications";
import type { ActionResult } from "@/types/finance";
import type { AppNotification } from "@/types/notifications";

export async function listNotifications(
  limit = 30,
): Promise<ActionResult<AppNotification[]>> {
  const user = await requireAuthUser();
  const items = await listNotificationsForUser(user.id, limit);
  return { success: true, data: items };
}

export async function getUnreadCount(): Promise<ActionResult<number>> {
  const user = await requireAuthUser();
  const count = await getUnreadNotificationCount(user.id);
  return { success: true, data: count };
}

export async function markNotificationRead(
  notificationId: string,
): Promise<ActionResult<void>> {
  const user = await requireAuthUser();
  const updated = await markNotificationReadForUser(user.id, notificationId);

  if (!updated) {
    return { success: false, error: "Notification not found" };
  }

  return { success: true, data: undefined };
}

export async function markAllNotificationsRead(): Promise<ActionResult<void>> {
  const user = await requireAuthUser();
  await markAllNotificationsReadForUser(user.id);
  return { success: true, data: undefined };
}
