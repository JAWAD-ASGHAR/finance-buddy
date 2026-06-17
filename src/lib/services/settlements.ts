import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { mapSettlement } from "@/db/shared-mappers";
import { getDb } from "@/db/index";
import { settlements } from "@/db/schema";
import { areFriends, getProfile } from "@/lib/db/shared-queries";
import { getUserCurrency } from "@/lib/auth/user-preferences";
import { notifySettlementRecorded } from "@/lib/notifications/dispatch";
import type { ActionResult } from "@/types/finance";
import { parseMoneyToCents } from "@/types/finance";
import type { Settlement } from "@/types/shared";

const recordSettlementSchema = z.object({
  friendId: z.string().uuid(),
  amountCents: z.number().int().positive(),
  note: z.string().max(200).default(""),
});

export async function recordSettlementForUser(
  userId: string,
  input: { friendId: string; amount: string; note?: string },
): Promise<ActionResult<Settlement>> {
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

  if (!(await areFriends(userId, parsed.data.friendId))) {
    return { success: false, error: "You can only settle with accepted friends" };
  }

  const db = getDb();
  const payerCurrency = await getUserCurrency(userId);
  const [row] = await db
    .insert(settlements)
    .values({
      fromUserId: userId,
      toUserId: parsed.data.friendId,
      amountCents: parsed.data.amountCents,
      currencyCode: payerCurrency,
      note: parsed.data.note,
      createdByUserId: userId,
    })
    .returning();

  if (!row) {
    return { success: false, error: "Failed to record settlement" };
  }

  const payer = (await getProfile(userId)) ?? undefined;
  void notifySettlementRecorded({
    recipientId: parsed.data.friendId,
    settlementId: row.id,
    payerName: payer?.display_name ?? "Someone",
    amountCents: parsed.data.amountCents,
    currencyCode: payerCurrency,
    note: parsed.data.note,
    friendId: parsed.data.friendId,
  });

  return { success: true, data: mapSettlement(row) };
}

export async function getFriendBalancesForUser(userId: string) {
  const {
    getAcceptedFriends,
    getSharedExpensesForUser,
    getSettlementsForUser,
  } = await import("@/lib/db/shared-queries");
  const { buildFriendBalances } = await import("@/lib/finance/friend-balances");

  const [friends, expenses, allSettlements] = await Promise.all([
    getAcceptedFriends(userId),
    getSharedExpensesForUser(userId),
    getSettlementsForUser(userId),
  ]);

  return buildFriendBalances(userId, friends, expenses, allSettlements);
}

export async function getFriendActivityForUser(
  userId: string,
  friendId: string,
) {
  if (!(await areFriends(userId, friendId))) {
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

  const [expenses, friendSettlements, friend] = await Promise.all([
    getSharedExpensesForUser(userId),
    getSettlementsBetweenUsers(userId, friendId),
    getProfile(friendId),
  ]);

  if (!friend) return null;

  const netCents = computeFriendBalance(
    userId,
    friendId,
    expenses,
    friendSettlements,
  );

  return {
    friend,
    netCents,
    activity: buildActivityWithFriend(
      userId,
      friendId,
      expenses,
      friendSettlements,
    ),
  };
}
