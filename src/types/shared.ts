export type FriendRequestStatus = "pending" | "accepted" | "declined";

export type SplitMode = "equal" | "single_payer";

export type Friend = {
  id: string;
  display_name: string | null;
};

export type FriendRequest = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: FriendRequestStatus;
  created_at: string;
  requester?: Friend;
  recipient?: Friend;
};

import type { CurrencyCode } from "@/lib/finance/currency";

export type SharedExpense = {
  id: string;
  description: string;
  total_cents: number;
  currency_code: CurrencyCode;
  expense_date: string;
  created_by_user_id: string;
  created_at: string;
};

export type SharedExpenseSplit = {
  id: string;
  shared_expense_id: string;
  user_id: string;
  share_cents: number;
  paid_cents: number;
  personal_expense_id: string | null;
  display_name?: string | null;
};

export type SharedExpenseDetail = SharedExpense & {
  splits: SharedExpenseSplit[];
};

export type Settlement = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  amount_cents: number;
  currency_code: CurrencyCode;
  note: string;
  created_by_user_id: string;
  created_at: string;
};

export type FriendBalance = {
  friend: Friend;
  net_cents: number;
};

export type FriendActivityItem =
  | {
      type: "expense";
      id: string;
      date: string;
      description: string;
      total_cents: number;
      your_share_cents: number;
      your_paid_cents: number;
      original_currency_code?: CurrencyCode;
      original_total_cents?: number;
    }
  | {
      type: "settlement";
      id: string;
      date: string;
      amount_cents: number;
      direction: "you_paid" | "you_received";
      note: string;
      original_currency_code?: CurrencyCode;
      original_amount_cents?: number;
    };
