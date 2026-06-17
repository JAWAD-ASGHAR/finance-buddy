import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import {
  mapFriend,
  mapFriendRequest,
  mapSettlement,
  mapSharedExpense,
  mapSharedExpenseDetail,
  mapSharedExpenseSplit,
} from "@/db/shared-mappers";
import { getDb } from "@/db/index";
import {
  friendRequests,
  profiles,
  settlements,
  sharedExpenseSplits,
  sharedExpenses,
} from "@/db/schema";
import { getUserCurrency } from "@/lib/auth/user-preferences";
import {
  convertSettlementsForViewer,
  convertSharedExpenseDetailsForViewer,
} from "@/lib/finance/shared-currency";
import type {
  Friend,
  FriendRequest,
  Settlement,
  SharedExpense,
  SharedExpenseDetail,
} from "@/types/shared";

export async function findUserIdByEmail(email: string): Promise<string | null> {
  const db = getDb();
  const rows = await db.execute<{ id: string }>(
    sql`select id from auth.users where lower(email) = ${email.toLowerCase()} limit 1`,
  );

  return rows[0]?.id ?? null;
}

export async function findEmailByUserId(userId: string): Promise<string | null> {
  const db = getDb();
  const rows = await db.execute<{ email: string }>(
    sql`select email from auth.users where id = ${userId} limit 1`,
  );

  return rows[0]?.email ?? null;
}

export async function getProfile(userId: string): Promise<Friend | null> {
  const db = getDb();
  const row = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
  });

  if (!row) return null;
  return mapFriend(row.id, row.displayName);
}

export async function getAcceptedFriendIds(userId: string): Promise<string[]> {
  const db = getDb();
  const rows = await db.query.friendRequests.findMany({
    where: and(
      eq(friendRequests.status, "accepted"),
      or(
        eq(friendRequests.requesterId, userId),
        eq(friendRequests.recipientId, userId),
      ),
    ),
  });

  return rows.map((row) =>
    row.requesterId === userId ? row.recipientId : row.requesterId,
  );
}

export async function areFriends(
  userId: string,
  otherUserId: string,
): Promise<boolean> {
  const friendIds = await getAcceptedFriendIds(userId);
  return friendIds.includes(otherUserId);
}

export async function getAcceptedFriends(userId: string): Promise<Friend[]> {
  const db = getDb();
  const friendIds = await getAcceptedFriendIds(userId);
  if (friendIds.length === 0) return [];

  const rows = await db.query.profiles.findMany({
    where: inArray(profiles.id, friendIds),
  });

  const byId = new Map(rows.map((row) => [row.id, row]));
  return friendIds
    .map((id) => {
      const row = byId.get(id);
      return row ? mapFriend(row.id, row.displayName) : mapFriend(id, null);
    })
    .sort((a, b) =>
      (a.display_name ?? a.id).localeCompare(b.display_name ?? b.id),
    );
}

export async function getPendingFriendRequests(
  userId: string,
): Promise<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }> {
  const db = getDb();

  const rows = await db.query.friendRequests.findMany({
    where: and(
      eq(friendRequests.status, "pending"),
      or(
        eq(friendRequests.requesterId, userId),
        eq(friendRequests.recipientId, userId),
      ),
    ),
    orderBy: desc(friendRequests.createdAt),
  });

  const userIds = new Set<string>();
  for (const row of rows) {
    userIds.add(row.requesterId);
    userIds.add(row.recipientId);
  }

  const profileRows =
    userIds.size > 0
      ? await db.query.profiles.findMany({
          where: inArray(profiles.id, [...userIds]),
        })
      : [];
  const profilesById = new Map(
    profileRows.map((row) => [row.id, mapFriend(row.id, row.displayName)]),
  );

  const incoming: FriendRequest[] = [];
  const outgoing: FriendRequest[] = [];

  for (const row of rows) {
    const mapped = mapFriendRequest(row, {
      requester: profilesById.get(row.requesterId),
      recipient: profilesById.get(row.recipientId),
    });

    if (row.recipientId === userId) {
      incoming.push(mapped);
    } else {
      outgoing.push(mapped);
    }
  }

  return { incoming, outgoing };
}

export async function getExistingFriendRequest(
  userId: string,
  otherUserId: string,
) {
  const db = getDb();
  return db.query.friendRequests.findFirst({
    where: or(
      and(
        eq(friendRequests.requesterId, userId),
        eq(friendRequests.recipientId, otherUserId),
      ),
      and(
        eq(friendRequests.requesterId, otherUserId),
        eq(friendRequests.recipientId, userId),
      ),
    ),
  });
}

export async function getSharedExpensesForUser(
  userId: string,
): Promise<SharedExpenseDetail[]> {
  const db = getDb();

  const splitRows = await db.query.sharedExpenseSplits.findMany({
    where: eq(sharedExpenseSplits.userId, userId),
  });

  const expenseIds = [...new Set(splitRows.map((s) => s.sharedExpenseId))];
  if (expenseIds.length === 0) return [];

  const [expenseRows, allSplits] = await Promise.all([
    db.query.sharedExpenses.findMany({
      where: inArray(sharedExpenses.id, expenseIds),
      orderBy: desc(sharedExpenses.expenseDate),
    }),
    db.query.sharedExpenseSplits.findMany({
      where: inArray(sharedExpenseSplits.sharedExpenseId, expenseIds),
    }),
  ]);

  const userIds = [...new Set(allSplits.map((s) => s.userId))];
  const profileRows =
    userIds.length > 0
      ? await db.query.profiles.findMany({
          where: inArray(profiles.id, userIds),
        })
      : [];
  const namesById = new Map(
    profileRows.map((row) => [row.id, row.displayName]),
  );

  const splitsByExpense = new Map<string, typeof allSplits>();
  for (const split of allSplits) {
    const list = splitsByExpense.get(split.sharedExpenseId) ?? [];
    list.push(split);
    splitsByExpense.set(split.sharedExpenseId, list);
  }

  const details = expenseRows.map((row) =>
    mapSharedExpenseDetail(
      row,
      (splitsByExpense.get(row.id) ?? []).map((split) =>
        mapSharedExpenseSplit(split, namesById.get(split.userId)),
      ),
    ),
  );

  const viewerCurrency = await getUserCurrency(userId);
  return convertSharedExpenseDetailsForViewer(details, viewerCurrency);
}

export async function getSettlementsForUser(userId: string): Promise<Settlement[]> {
  const db = getDb();
  const rows = await db.query.settlements.findMany({
    where: or(
      eq(settlements.fromUserId, userId),
      eq(settlements.toUserId, userId),
    ),
    orderBy: desc(settlements.createdAt),
  });

  const mapped = rows.map(mapSettlement);
  const viewerCurrency = await getUserCurrency(userId);
  return convertSettlementsForViewer(mapped, viewerCurrency);
}

export async function getSettlementsBetweenUsers(
  userId: string,
  friendId: string,
): Promise<Settlement[]> {
  const all = await getSettlementsForUser(userId);
  return all.filter(
    (s) =>
      (s.from_user_id === userId && s.to_user_id === friendId)
      || (s.from_user_id === friendId && s.to_user_id === userId),
  );
}

export async function getSharedExpenseDetailForUser(
  expenseId: string,
  userId: string,
): Promise<SharedExpenseDetail | null> {
  const expenses = await getSharedExpensesForUser(userId);
  return expenses.find((e) => e.id === expenseId) ?? null;
}

export async function listRecentSharedExpenses(
  userId: string,
  limit = 20,
): Promise<SharedExpense[]> {
  const details = await getSharedExpensesForUser(userId);
  return details.slice(0, limit).map(({ splits: _splits, ...expense }) => expense);
}
