import { and, eq } from "drizzle-orm";
import { mapFriendRequest } from "@/db/shared-mappers";
import { getDb } from "@/db/index";
import { friendRequests } from "@/db/schema";
import { parseEmail } from "@/lib/auth/email";
import {
  areFriends,
  findUserIdByEmail,
  getAcceptedFriends,
  getExistingFriendRequest,
  getPendingFriendRequests,
  getProfile,
} from "@/lib/db/shared-queries";
import type { ActionResult } from "@/types/finance";
import type { Friend, FriendRequest } from "@/types/shared";

export async function searchUserByEmailForUser(
  userId: string,
  rawEmail: string,
): Promise<ActionResult<Friend>> {
  const parsed = parseEmail(rawEmail);
  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }

  const targetId = await findUserIdByEmail(parsed.email);
  if (!targetId) {
    return { success: false, error: "No account found with that email" };
  }

  if (targetId === userId) {
    return { success: false, error: "You cannot add yourself" };
  }

  if (await areFriends(userId, targetId)) {
    return { success: false, error: "You are already connected with this person" };
  }

  const existing = await getExistingFriendRequest(userId, targetId);
  if (existing?.status === "pending") {
    return { success: false, error: "A friend request is already pending" };
  }

  const profile = await getProfile(targetId);
  if (!profile) {
    return { success: false, error: "User profile not found" };
  }

  return { success: true, data: profile };
}

export async function sendFriendRequestForUser(
  userId: string,
  recipientId: string,
): Promise<ActionResult<FriendRequest>> {
  const db = getDb();

  if (recipientId === userId) {
    return { success: false, error: "You cannot add yourself" };
  }

  if (await areFriends(userId, recipientId)) {
    return { success: false, error: "You are already connected" };
  }

  const existing = await getExistingFriendRequest(userId, recipientId);
  if (existing?.status === "pending") {
    if (existing.requesterId === userId) {
      return { success: false, error: "Request already sent" };
    }
    return {
      success: false,
      error: "This person already sent you a request — accept it instead",
    };
  }

  if (existing?.status === "declined") {
    await db
      .delete(friendRequests)
      .where(eq(friendRequests.id, existing.id));
  }

  const [row] = await db
    .insert(friendRequests)
    .values({
      requesterId: userId,
      recipientId,
      status: "pending",
    })
    .returning();

  if (!row) {
    return { success: false, error: "Failed to send request" };
  }

  const recipient = await getProfile(recipientId);
  return {
    success: true,
    data: mapFriendRequest(row, {
      requester: (await getProfile(userId)) ?? undefined,
      recipient: recipient ?? undefined,
    }),
  };
}

export async function respondToFriendRequestForUser(
  userId: string,
  requestId: string,
  accept: boolean,
): Promise<ActionResult<FriendRequest>> {
  const db = getDb();

  const row = await db.query.friendRequests.findFirst({
    where: and(
      eq(friendRequests.id, requestId),
      eq(friendRequests.recipientId, userId),
      eq(friendRequests.status, "pending"),
    ),
  });

  if (!row) {
    return { success: false, error: "Friend request not found" };
  }

  const [updated] = await db
    .update(friendRequests)
    .set({ status: accept ? "accepted" : "declined" })
    .where(eq(friendRequests.id, requestId))
    .returning();

  if (!updated) {
    return { success: false, error: "Failed to update request" };
  }

  return {
    success: true,
    data: mapFriendRequest(updated, {
      requester: (await getProfile(updated.requesterId)) ?? undefined,
      recipient: (await getProfile(updated.recipientId)) ?? undefined,
    }),
  };
}

export async function listFriendsForUser(
  userId: string,
): Promise<ActionResult<Friend[]>> {
  const friends = await getAcceptedFriends(userId);
  return { success: true, data: friends };
}

export async function listPendingRequestsForUser(
  userId: string,
): Promise<
  ActionResult<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>
> {
  const pending = await getPendingFriendRequests(userId);
  return { success: true, data: pending };
}

export async function sendFriendRequestByEmailForUser(
  userId: string,
  rawEmail: string,
): Promise<ActionResult<FriendRequest>> {
  const search = await searchUserByEmailForUser(userId, rawEmail);
  if (!search.success) {
    return { success: false, error: search.error };
  }

  return sendFriendRequestForUser(userId, search.data.id);
}
