"use server";

import { revalidatePath } from "next/cache";
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
import { requireAuthUser } from "@/lib/db/queries";
import type { ActionResult } from "@/types/finance";
import type { Friend, FriendRequest } from "@/types/shared";

export async function searchUserByEmail(
  rawEmail: string,
): Promise<ActionResult<Friend>> {
  const user = await requireAuthUser();
  const parsed = parseEmail(rawEmail);
  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }

  const targetId = await findUserIdByEmail(parsed.email);
  if (!targetId) {
    return { success: false, error: "No account found with that email" };
  }

  if (targetId === user.id) {
    return { success: false, error: "You cannot add yourself" };
  }

  if (await areFriends(user.id, targetId)) {
    return { success: false, error: "You are already connected with this person" };
  }

  const existing = await getExistingFriendRequest(user.id, targetId);
  if (existing?.status === "pending") {
    return { success: false, error: "A friend request is already pending" };
  }

  const profile = await getProfile(targetId);
  if (!profile) {
    return { success: false, error: "User profile not found" };
  }

  return { success: true, data: profile };
}

export async function sendFriendRequest(
  recipientId: string,
): Promise<ActionResult<FriendRequest>> {
  const db = getDb();
  const user = await requireAuthUser();

  if (recipientId === user.id) {
    return { success: false, error: "You cannot add yourself" };
  }

  if (await areFriends(user.id, recipientId)) {
    return { success: false, error: "You are already connected" };
  }

  const existing = await getExistingFriendRequest(user.id, recipientId);
  if (existing?.status === "pending") {
    if (existing.requesterId === user.id) {
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
      requesterId: user.id,
      recipientId,
      status: "pending",
    })
    .returning();

  if (!row) {
    return { success: false, error: "Failed to send request" };
  }

  revalidatePath("/shared");
  revalidatePath("/shared/friends");

  const recipient = await getProfile(recipientId);
  return {
    success: true,
    data: mapFriendRequest(row, {
      requester: (await getProfile(user.id)) ?? undefined,
      recipient: recipient ?? undefined,
    }),
  };
}

export async function respondToFriendRequest(
  requestId: string,
  accept: boolean,
): Promise<ActionResult<FriendRequest>> {
  const db = getDb();
  const user = await requireAuthUser();

  const row = await db.query.friendRequests.findFirst({
    where: and(
      eq(friendRequests.id, requestId),
      eq(friendRequests.recipientId, user.id),
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

  revalidatePath("/shared");
  revalidatePath("/shared/friends");

  return {
    success: true,
    data: mapFriendRequest(updated, {
      requester: (await getProfile(updated.requesterId)) ?? undefined,
      recipient: (await getProfile(updated.recipientId)) ?? undefined,
    }),
  };
}

export async function listFriends(): Promise<ActionResult<Friend[]>> {
  const user = await requireAuthUser();
  const friends = await getAcceptedFriends(user.id);
  return { success: true, data: friends };
}

export async function listPendingRequests(): Promise<
  ActionResult<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>
> {
  const user = await requireAuthUser();
  const pending = await getPendingFriendRequests(user.id);
  return { success: true, data: pending };
}

export async function sendFriendRequestByEmail(
  rawEmail: string,
): Promise<ActionResult<FriendRequest>> {
  const search = await searchUserByEmail(rawEmail);
  if (!search.success) {
    return { success: false, error: search.error };
  }

  return sendFriendRequest(search.data.id);
}
