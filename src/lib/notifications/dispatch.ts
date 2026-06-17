import {
  budgetAlertEmailHtml,
  dashboardPageUrl,
  friendRequestAcceptedEmailHtml,
  friendRequestEmailHtml,
  friendsPageUrl,
  settlementEmailHtml,
  sharedExpenseEmailHtml,
  sharedPageUrl,
} from "@/lib/email/templates";
import { notifyUser } from "@/lib/services/notifications";
import { getUserCurrency } from "@/lib/auth/user-preferences";
import { convertCents, refreshExchangeRatesIfStale, type CurrencyCode } from "@/lib/finance/currency";
import { formatMoney } from "@/types/finance";
import type { AlertType } from "@/types/finance";

function budgetAlertTitle(alertType: AlertType): string {
  return alertType === "category_threshold"
    ? "Category budget alert"
    : "Spending pace alert";
}

export async function notifyBudgetAlert({
  userId,
  alertId,
  alertType,
  message,
}: {
  userId: string;
  alertId: string;
  alertType: AlertType;
  message: string;
}) {
  const title = budgetAlertTitle(alertType);
  const dashboardUrl = dashboardPageUrl();

  await notifyUser({
    userId,
    type: "budget_alert",
    title,
    body: message,
    href: "/dashboard",
    metadata: { alertId, alertType },
    email: {
      subject: `${title} — Finance Buddy`,
      html: budgetAlertEmailHtml({ title, message, dashboardUrl }),
      text: `${message}\n\nGuidance only — not financial advice.\n\nOpen ${dashboardUrl}`,
    },
  });
}

export async function notifyFriendRequestReceived({
  recipientId,
  requestId,
  requesterName,
}: {
  recipientId: string;
  requestId: string;
  requesterName: string;
}) {
  const friendsUrl = friendsPageUrl();
  await notifyUser({
    userId: recipientId,
    type: "friend_request",
    title: "New friend request",
    body: `${requesterName} wants to connect with you on Finance Buddy.`,
    href: "/friends",
    metadata: { requestId, requesterName },
    email: {
      subject: `${requesterName} sent you a friend request on Finance Buddy`,
      html: friendRequestEmailHtml({ requesterName, friendsUrl }),
      text: `${requesterName} sent you a friend request. Open ${friendsUrl} to respond.`,
    },
  });
}

export async function notifyFriendRequestAccepted({
  requesterId,
  requestId,
  friendName,
}: {
  requesterId: string;
  requestId: string;
  friendName: string;
}) {
  const sharedUrl = sharedPageUrl();
  await notifyUser({
    userId: requesterId,
    type: "friend_request_accepted",
    title: "Friend request accepted",
    body: `${friendName} accepted your friend request. You can split expenses together now.`,
    href: "/shared",
    metadata: { requestId, friendName },
    email: {
      subject: `${friendName} accepted your friend request`,
      html: friendRequestAcceptedEmailHtml({ friendName, sharedUrl }),
      text: `${friendName} accepted your friend request. Open ${sharedUrl} to split expenses.`,
    },
  });
}

export async function notifySharedExpenseCreated({
  participantId,
  sharedExpenseId,
  creatorName,
  description,
  totalCents,
  shareCents,
  currencyCode,
}: {
  participantId: string;
  sharedExpenseId: string;
  creatorName: string;
  description: string;
  totalCents: number;
  shareCents: number;
  currencyCode: CurrencyCode;
}) {
  await refreshExchangeRatesIfStale();
  const recipientCurrency = await getUserCurrency(participantId);
  const displayTotal = convertCents(totalCents, currencyCode, recipientCurrency);
  const displayShare = convertCents(shareCents, currencyCode, recipientCurrency);
  const amount = formatMoney(displayTotal, recipientCurrency);
  const yourShare = formatMoney(displayShare, recipientCurrency);
  const sharedUrl = sharedPageUrl();

  await notifyUser({
    userId: participantId,
    type: "shared_expense",
    title: "New shared expense",
    body: `${creatorName} added "${description}" (${amount}). Your share: ${yourShare}.`,
    href: "/shared",
    metadata: { sharedExpenseId, creatorName, totalCents, shareCents },
    email: {
      subject: `${creatorName} added a shared expense on Finance Buddy`,
      html: sharedExpenseEmailHtml({
        creatorName,
        description,
        amount,
        sharedUrl,
      }),
      text: `${creatorName} added "${description}" (${amount}). Your share: ${yourShare}. Open ${sharedUrl}.`,
    },
  });
}

export async function notifySettlementRecorded({
  recipientId,
  settlementId,
  payerName,
  amountCents,
  currencyCode,
  note,
  friendId,
}: {
  recipientId: string;
  settlementId: string;
  payerName: string;
  amountCents: number;
  currencyCode: CurrencyCode;
  note: string;
  friendId: string;
}) {
  await refreshExchangeRatesIfStale();
  const recipientCurrency = await getUserCurrency(recipientId);
  const displayAmount = convertCents(amountCents, currencyCode, recipientCurrency);
  const amount = formatMoney(displayAmount, recipientCurrency);
  const sharedUrl = sharedPageUrl();

  await notifyUser({
    userId: recipientId,
    type: "settlement",
    title: "Settlement recorded",
    body: `${payerName} recorded a payment of ${amount}${note ? `: ${note}` : "."}`,
    href: `/friends/${friendId}`,
    metadata: { settlementId, payerName, amountCents, friendId },
    email: {
      subject: `${payerName} recorded a settlement on Finance Buddy`,
      html: settlementEmailHtml({
        payerName,
        amount,
        note,
        sharedUrl,
      }),
      text: `${payerName} recorded a payment of ${amount}. Open ${sharedUrl}.`,
    },
  });
}
