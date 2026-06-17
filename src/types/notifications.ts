export type NotificationType =
  | "friend_request"
  | "friend_request_accepted"
  | "shared_expense"
  | "settlement"
  | "budget_alert";

export type AppNotification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};
