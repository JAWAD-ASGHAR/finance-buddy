"use server";

import { requireAuthUser } from "@/lib/db/queries";
import {
  listFriendsForUser,
  listPendingRequestsForUser,
  respondToFriendRequestForUser,
  searchUserByUsernameForUser,
  searchUsersByUsernameForUser,
  sendFriendRequestByUsernameForUser,
  sendFriendRequestForUser,
} from "@/lib/services/friends";
import { revalidateSharedPaths } from "@/lib/services/revalidate";
import type { ActionResult } from "@/types/finance";
import type { Friend, FriendRequest } from "@/types/shared";

export async function searchUsersByUsername(
  rawQuery: string,
): Promise<ActionResult<Friend[]>> {
  const user = await requireAuthUser();
  return searchUsersByUsernameForUser(user.id, rawQuery);
}

export async function searchUserByUsername(
  rawUsername: string,
): Promise<ActionResult<Friend>> {
  const user = await requireAuthUser();
  return searchUserByUsernameForUser(user.id, rawUsername);
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

export async function sendFriendRequestByUsername(
  rawUsername: string,
): Promise<ActionResult<FriendRequest>> {
  const user = await requireAuthUser();
  const result = await sendFriendRequestByUsernameForUser(user.id, rawUsername);
  if (result.success) {
    revalidateSharedPaths();
  }
  return result;
}
