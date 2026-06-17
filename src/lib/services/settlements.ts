import { z } from "zod";
import { mapSettlement } from "@/db/shared-mappers";
import { getDb } from "@/db/index";
import { settlements } from "@/db/schema";
import { areFriends, getProfile } from "@/lib/db/shared-queries";
import { getUserCurrency } from "@/lib/auth/user-preferences";
import { computeFriendBalance } from "@/lib/finance/friend-balances";
import { notifySettlementRecorded } from "@/lib/notifications/dispatch";
import type { ActionResult } from "@/types/finance";
import { parseMoneyToCents } from "@/types/finance";
import type { Settlement, SettlementDirection } from "@/types/shared";

const recordSettlementSchema = z.object({
  friendId: z.string().uuid(),
  amountCents: z.number().int().positive(),
  note: z.string().max(200).default(""),
  direction: z.enum(["pay_friend", "record_friend_payment"]).default("pay_friend"),
});

export async function recordSettlementForUser(
  userId: string,
  input: {
    friendId: string;
    amount: string;
    note?: string;
    direction?: SettlementDirection;
  },
): Promise<ActionResult<Settlement>> {
  const amountCents = parseMoneyToCents(input.amount);

  if (amountCents === null || amountCents <= 0) {
    return { success: false, error: "Enter a valid amount" };
  }

  const parsed = recordSettlementSchema.safeParse({
    friendId: input.friendId,
    amountCents,
    note: input.note?.trim() ?? "",
    direction: input.direction ?? "pay_friend",
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

  const {
    getSharedExpensesForUser,
    getSettlementsBetweenUsers,
  } = await import("@/lib/db/shared-queries");

  const [expenses, friendSettlements] = await Promise.all([
    getSharedExpensesForUser(userId),
    getSettlementsBetweenUsers(userId, parsed.data.friendId),
  ]);

  const currentBalance = computeFriendBalance(
    userId,
    parsed.data.friendId,
    expenses,
    friendSettlements,
  );

  if (parsed.data.direction === "pay_friend") {
    if (currentBalance >= 0) {
      return {
        success: false,
        error: "You do not owe this friend anything right now",
      };
    }

    if (amountCents > Math.abs(currentBalance)) {
      return {
        success: false,
        error: "Amount is more than you currently owe",
      };
    }
  } else if (currentBalance <= 0) {
    return {
      success: false,
      error: "This friend does not owe you anything right now",
    };
  } else if (amountCents > currentBalance) {
    return {
      success: false,
      error: "Amount is more than they currently owe you",
    };
  }

  const fromUserId =
    parsed.data.direction === "record_friend_payment"
      ? parsed.data.friendId
      : userId;
  const toUserId =
    parsed.data.direction === "record_friend_payment"
      ? userId
      : parsed.data.friendId;

  const db = getDb();
  const settlementCurrency = await getUserCurrency(userId);
  const [row] = await db
    .insert(settlements)
    .values({
      fromUserId,
      toUserId,
      amountCents: parsed.data.amountCents,
      currencyCode: settlementCurrency,
      note: parsed.data.note,
      createdByUserId: userId,
    })
    .returning();

  if (!row) {
    return { success: false, error: "Failed to record settlement" };
  }

  const recorder = (await getProfile(userId)) ?? undefined;
  const friend = (await getProfile(parsed.data.friendId)) ?? undefined;

  void notifySettlementRecorded({
    recipientId: parsed.data.friendId,
    settlementId: row.id,
    recorderName: recorder?.display_name ?? "Someone",
    friendName: friend?.display_name ?? "Friend",
    amountCents: parsed.data.amountCents,
    currencyCode: settlementCurrency,
    note: parsed.data.note,
    counterpartyUserId: userId,
    direction: parsed.data.direction,
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
