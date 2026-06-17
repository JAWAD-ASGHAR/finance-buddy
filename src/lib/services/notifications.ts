import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/db/index";
import { notifications } from "@/db/schema";
import { findEmailByUserId } from "@/lib/db/shared-queries";
import { sendEmail } from "@/lib/email/send";
import { isEmailConfigured } from "@/lib/email/env";
import type { AppNotification, NotificationType } from "@/types/notifications";

function mapNotification(row: typeof notifications.$inferSelect): AppNotification {
  return {
    id: row.id,
    user_id: row.userId,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    read_at: row.readAt?.toISOString() ?? null,
    created_at: row.createdAt.toISOString(),
  };
}

export type NotifyUserInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  metadata?: Record<string, unknown>;
  email?: {
    subject: string;
    html: string;
    text?: string;
  };
};

export async function notifyUser(input: NotifyUserInput): Promise<AppNotification | null> {
  const db = getDb();

  const [row] = await db
    .insert(notifications)
    .values({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href,
      metadata: input.metadata ?? {},
    })
    .returning();

  if (!row) return null;

  if (input.email && isEmailConfigured()) {
    const recipientEmail = await findEmailByUserId(input.userId);
    if (recipientEmail) {
      void sendEmail({
        to: recipientEmail,
        subject: input.email.subject,
        html: input.email.html,
        text: input.email.text,
      });
    }
  }

  return mapNotification(row);
}

export async function listNotificationsForUser(
  userId: string,
  limit = 30,
): Promise<AppNotification[]> {
  const db = getDb();
  const rows = await db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: desc(notifications.createdAt),
    limit,
  });

  return rows.map(mapNotification);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), isNull(notifications.readAt)),
    );

  return rows[0]?.count ?? 0;
}

export async function markNotificationReadForUser(
  userId: string,
  notificationId: string,
): Promise<boolean> {
  const db = getDb();
  const [row] = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
      ),
    )
    .returning({ id: notifications.id });

  return Boolean(row);
}

export async function markAllNotificationsReadForUser(
  userId: string,
): Promise<void> {
  const db = getDb();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(eq(notifications.userId, userId), isNull(notifications.readAt)),
    );
}

export async function markFriendRequestNotificationsRead(
  userId: string,
  requestId: string,
): Promise<void> {
  const db = getDb();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.type, "friend_request"),
        sql`${notifications.metadata}->>'requestId' = ${requestId}`,
      ),
    );
}
