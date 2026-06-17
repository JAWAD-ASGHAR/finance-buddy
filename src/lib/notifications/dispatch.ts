import {
  friendRequestAcceptedEmailHtml,
  friendRequestEmailHtml,
  friendsPageUrl,
  settlementEmailHtml,
  sharedExpenseEmailHtml,
  sharedPageUrl,
} from "@/lib/email/templates";
import { notifyUser } from "@/lib/services/notifications";
import { formatMoney } from "@/types/finance";

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
    href: "/shared/friends",
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
}: {
  participantId: string;
  sharedExpenseId: string;
  creatorName: string;
  description: string;
  totalCents: number;
  shareCents: number;
}) {
  const amount = formatMoney(totalCents);
  const yourShare = formatMoney(shareCents);
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
  note,
  friendId,
}: {
  recipientId: string;
  settlementId: string;
  payerName: string;
  amountCents: number;
  note: string;
  friendId: string;
}) {
  const amount = formatMoney(amountCents);
  const sharedUrl = sharedPageUrl();

  await notifyUser({
    userId: recipientId,
    type: "settlement",
    title: "Settlement recorded",
    body: `${payerName} recorded a payment of ${amount}${note ? `: ${note}` : "."}`,
    href: `/shared/friends/${friendId}`,
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
