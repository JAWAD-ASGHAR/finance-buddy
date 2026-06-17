import type {
  FriendActivityItem,
  FriendBalance,
  SharedExpenseSplit,
} from "@/types/shared";
import type { Settlement } from "@/types/shared";

type ExpenseWithSplits = {
  id: string;
  description: string;
  total_cents: number;
  expense_date: string;
  created_at: string;
  splits: SharedExpenseSplit[];
};

function getPayerId(splits: SharedExpenseSplit[]): string | null {
  const payer = splits.find((s) => s.paid_cents > 0);
  return payer?.user_id ?? null;
}

/**
 * Net balance with a friend from shared expenses (positive = friend owes you).
 * Only direct debts between the two users (single payer model).
 */
export function computePairwiseBalanceFromExpense(
  userId: string,
  friendId: string,
  splits: SharedExpenseSplit[],
): number {
  const userSplit = splits.find((s) => s.user_id === userId);
  const friendSplit = splits.find((s) => s.user_id === friendId);
  if (!userSplit || !friendSplit) return 0;

  const payerId = getPayerId(splits);
  if (!payerId) return 0;

  if (payerId === userId) {
    return friendSplit.share_cents - friendSplit.paid_cents;
  }

  if (payerId === friendId) {
    return -(userSplit.share_cents - userSplit.paid_cents);
  }

  return 0;
}

export function computeSettlementAdjustment(
  userId: string,
  friendId: string,
  settlement: Settlement,
): number {
  if (settlement.from_user_id === userId && settlement.to_user_id === friendId) {
    return settlement.amount_cents;
  }

  if (settlement.from_user_id === friendId && settlement.to_user_id === userId) {
    return -settlement.amount_cents;
  }

  return 0;
}

export function computeFriendBalance(
  userId: string,
  friendId: string,
  expenses: ExpenseWithSplits[],
  settlements: Settlement[],
): number {
  let net = 0;

  for (const expense of expenses) {
    const bothPresent = expense.splits.some((s) => s.user_id === userId)
      && expense.splits.some((s) => s.user_id === friendId);
    if (!bothPresent) continue;

    net += computePairwiseBalanceFromExpense(
      userId,
      friendId,
      expense.splits,
    );
  }

  for (const settlement of settlements) {
    net += computeSettlementAdjustment(userId, friendId, settlement);
  }

  return net;
}

export function buildFriendBalances(
  userId: string,
  friends: Array<{ id: string; display_name: string | null; username?: string | null }>,
  expenses: ExpenseWithSplits[],
  settlements: Settlement[],
): FriendBalance[] {
  return friends
    .map((friend) => ({
      friend: {
        id: friend.id,
        display_name: friend.display_name,
        username: friend.username ?? null,
      },
      net_cents: computeFriendBalance(userId, friend.id, expenses, settlements),
    }))
    .sort((a, b) => Math.abs(b.net_cents) - Math.abs(a.net_cents));
}

export function buildActivityWithFriend(
  userId: string,
  friendId: string,
  expenses: ExpenseWithSplits[],
  settlements: Settlement[],
): FriendActivityItem[] {
  const items: FriendActivityItem[] = [];

  for (const expense of expenses) {
    const userSplit = expense.splits.find((s) => s.user_id === userId);
    const friendSplit = expense.splits.find((s) => s.user_id === friendId);
    if (!userSplit || !friendSplit) continue;

    items.push({
      type: "expense",
      id: expense.id,
      date: expense.expense_date,
      description: expense.description,
      total_cents: expense.total_cents,
      your_share_cents: userSplit.share_cents,
      your_paid_cents: userSplit.paid_cents,
    });
  }

  for (const settlement of settlements) {
    const involvesUser =
      (settlement.from_user_id === userId && settlement.to_user_id === friendId)
      || (settlement.from_user_id === friendId && settlement.to_user_id === userId);

    if (!involvesUser) continue;

    items.push({
      type: "settlement",
      id: settlement.id,
      date: settlement.created_at.slice(0, 10),
      amount_cents: settlement.amount_cents,
      direction:
        settlement.from_user_id === userId ? "you_paid" : "you_received",
      note: settlement.note,
    });
  }

  items.sort((a, b) => b.date.localeCompare(a.date));
  return items;
}
