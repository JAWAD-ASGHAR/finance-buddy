"use server";

import { requireAuthUser } from "@/lib/db/queries";
import {
  listFriendsForUser,
  listPendingRequestsForUser,
  respondToFriendRequestForUser,
  searchUserByEmailForUser,
  sendFriendRequestByEmailForUser,
  sendFriendRequestForUser,
} from "@/lib/services/friends";
import { revalidateSharedPaths } from "@/lib/services/revalidate";
import type { ActionResult } from "@/types/finance";
import type { Friend, FriendRequest } from "@/types/shared";

export async function searchUserByEmail(
  rawEmail: string,
): Promise<ActionResult<Friend>> {
  const user = await requireAuthUser();
  return searchUserByEmailForUser(user.id, rawEmail);
}

export async function sendFriendRequest(
  recipientId: string,
): Promise<ActionResult<FriendRequest>> {
  const user = await requireAuthUser();
  const result = await sendFriendRequestForUser(user.id, recipientId);
  if (result.success) {
    revalidateSharedPaths();
  }
  return result;
}

export async function respondToFriendRequest(
  requestId: string,
  accept: boolean,
): Promise<ActionResult<FriendRequest>> {
  const user = await requireAuthUser();
  const result = await respondToFriendRequestForUser(user.id, requestId, accept);
  if (result.success) {
    revalidateSharedPaths();
  }
  return result;
}

export async function listFriends(): Promise<ActionResult<Friend[]>> {
  const user = await requireAuthUser();
  return listFriendsForUser(user.id);
}

export async function listPendingRequests(): Promise<
  ActionResult<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>
> {
  const user = await requireAuthUser();
  return listPendingRequestsForUser(user.id);
}

export async function sendFriendRequestByEmail(
  rawEmail: string,
): Promise<ActionResult<FriendRequest>> {
  const user = await requireAuthUser();
  const result = await sendFriendRequestByEmailForUser(user.id, rawEmail);
  if (result.success) {
    revalidateSharedPaths();
  }
  return result;
}
