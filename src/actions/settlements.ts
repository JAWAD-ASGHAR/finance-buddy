"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { mapSettlement } from "@/db/shared-mappers";
import { getDb } from "@/db/index";
import { settlements } from "@/db/schema";
import { areFriends } from "@/lib/db/shared-queries";
import { requireAuthUser } from "@/lib/db/queries";
import type { ActionResult } from "@/types/finance";
import { parseMoneyToCents } from "@/types/finance";
import type { Settlement } from "@/types/shared";

const recordSettlementSchema = z.object({
  friendId: z.string().uuid(),
  amountCents: z.number().int().positive(),
  note: z.string().max(200).default(""),
});

export async function recordSettlement(input: {
  friendId: string;
  amount: string;
  note?: string;
}): Promise<ActionResult<Settlement>> {
  const user = await requireAuthUser();
  const amountCents = parseMoneyToCents(input.amount);

  if (amountCents === null || amountCents <= 0) {
    return { success: false, error: "Enter a valid amount" };
  }

  const parsed = recordSettlementSchema.safeParse({
    friendId: input.friendId,
    amountCents,
    note: input.note?.trim() ?? "",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  if (!(await areFriends(user.id, parsed.data.friendId))) {
    return { success: false, error: "You can only settle with accepted friends" };
  }

  const db = getDb();
  const [row] = await db
    .insert(settlements)
    .values({
      fromUserId: user.id,
      toUserId: parsed.data.friendId,
      amountCents: parsed.data.amountCents,
      note: parsed.data.note,
      createdByUserId: user.id,
    })
    .returning();

  if (!row) {
    return { success: false, error: "Failed to record settlement" };
  }

  revalidatePath("/shared");
  revalidatePath(`/shared/friends/${parsed.data.friendId}`);

  return { success: true, data: mapSettlement(row) };
}

export async function getFriendBalancesForCurrentUser() {
  const user = await requireAuthUser();
  const {
    getAcceptedFriends,
    getSharedExpensesForUser,
    getSettlementsForUser,
  } = await import("@/lib/db/shared-queries");
  const { buildFriendBalances } = await import("@/lib/finance/friend-balances");

  const [friends, expenses, allSettlements] = await Promise.all([
    getAcceptedFriends(user.id),
    getSharedExpensesForUser(user.id),
    getSettlementsForUser(user.id),
  ]);

  return buildFriendBalances(user.id, friends, expenses, allSettlements);
}

export async function getFriendActivity(friendId: string) {
  const user = await requireAuthUser();

  if (!(await areFriends(user.id, friendId))) {
    return null;
  }

  const {
    getSharedExpensesForUser,
    getSettlementsBetweenUsers,
    getProfile,
  } = await import("@/lib/db/shared-queries");
  const {
    buildActivityWithFriend,
    computeFriendBalance,
  } = await import("@/lib/finance/friend-balances");

  const [expenses, settlements, friend] = await Promise.all([
    getSharedExpensesForUser(user.id),
    getSettlementsBetweenUsers(user.id, friendId),
    getProfile(friendId),
  ]);

  if (!friend) return null;

  const netCents = computeFriendBalance(
    user.id,
    friendId,
    expenses,
    settlements,
  );

  return {
    friend,
    netCents,
    activity: buildActivityWithFriend(user.id, friendId, expenses, settlements),
  };
}
