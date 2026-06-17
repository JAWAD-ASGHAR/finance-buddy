import type {
  Friend,
  FriendRequest,
  Settlement,
  SharedExpense,
  SharedExpenseDetail,
  SharedExpenseSplit,
} from "@/types/shared";
import type {
  FriendRequestRow,
  SettlementRow,
  SharedExpenseRow,
  SharedExpenseSplitRow,
} from "@/db/schema";
import type { CurrencyCode } from "@/lib/finance/currency";
import { isCurrencyCode } from "@/lib/finance/currency";

function toCurrencyCode(value: string): CurrencyCode {
  return isCurrencyCode(value) ? value : "GBP";
}

export function mapFriend(
  id: string,
  displayName: string | null,
  username: string | null = null,
  avatarPath: string | null = null,
): Friend {
  return {
    id,
    display_name: displayName,
    username,
    avatar_path: avatarPath,
  };
}

export function mapFriendRequest(
  row: FriendRequestRow,
  extras?: { requester?: Friend; recipient?: Friend },
): FriendRequest {
  return {
    id: row.id,
    requester_id: row.requesterId,
    recipient_id: row.recipientId,
    status: row.status,
    created_at: row.createdAt.toISOString(),
    ...extras,
  };
}

export function mapSharedExpense(row: SharedExpenseRow): SharedExpense {
  return {
    id: row.id,
    description: row.description,
    total_cents: row.totalCents,
    currency_code: toCurrencyCode(row.currencyCode),
    expense_date: row.expenseDate,
    created_by_user_id: row.createdByUserId,
    created_at: row.createdAt.toISOString(),
  };
}

export function mapSharedExpenseSplit(
  row: SharedExpenseSplitRow,
  displayName?: string | null,
): SharedExpenseSplit {
  return {
    id: row.id,
    shared_expense_id: row.sharedExpenseId,
    user_id: row.userId,
    share_cents: row.shareCents,
    paid_cents: row.paidCents,
    personal_expense_id: row.personalExpenseId,
    display_name: displayName,
  };
}

export function mapSharedExpenseDetail(
  row: SharedExpenseRow,
  splits: SharedExpenseSplit[],
): SharedExpenseDetail {
  return {
    ...mapSharedExpense(row),
    splits,
  };
}

export function mapSettlement(row: SettlementRow): Settlement {
  return {
    id: row.id,
    from_user_id: row.fromUserId,
    to_user_id: row.toUserId,
    amount_cents: row.amountCents,
    currency_code: toCurrencyCode(row.currencyCode),
    note: row.note,
    created_by_user_id: row.createdByUserId,
    created_at: row.createdAt.toISOString(),
  };
}
