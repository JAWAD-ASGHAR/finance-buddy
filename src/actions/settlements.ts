"use server";

import { requireAuthUser } from "@/lib/db/queries";
import {
  getFriendActivityForUser,
  getFriendBalancesForUser,
  recordSettlementForUser,
} from "@/lib/services/settlements";
import { revalidateSharedPaths } from "@/lib/services/revalidate";
import type { ActionResult } from "@/types/finance";
import type { Settlement, SettlementDirection } from "@/types/shared";

export async function recordSettlement(input: {
  friendId: string;
  amount: string;
  note?: string;
  direction?: SettlementDirection;
}): Promise<ActionResult<Settlement>> {
  const user = await requireAuthUser();
  const result = await recordSettlementForUser(user.id, input);
  if (result.success) {
    revalidateSharedPaths(input.friendId);
  }
  return result;
}

export async function getFriendBalancesForCurrentUser() {
  const user = await requireAuthUser();
  return getFriendBalancesForUser(user.id);
}

export async function getFriendActivity(friendId: string) {
  const user = await requireAuthUser();
  return getFriendActivityForUser(user.id, friendId);
}
