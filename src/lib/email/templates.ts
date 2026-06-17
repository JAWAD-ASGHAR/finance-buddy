import { siteUrl } from "@/lib/seo";

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Segoe UI,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:16px;padding:32px;">
            <tr>
              <td>${content}</td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:#71717a;">Finance Buddy · Student budgeting</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;padding:14px 24px;border-radius:999px;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">${label}</a>`;
}

export function verificationEmailHtml({
  confirmUrl,
}: {
  confirmUrl: string;
}): string {
  return layout(`
    <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;">Confirm your email</p>
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;">One quick step to finish signing up</h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#52525b;">
      Tap the button below to confirm your email address and unlock your Finance Buddy account.
    </p>
    ${button(confirmUrl, "Confirm email")}
    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#71717a;">
      If you did not create an account, you can ignore this message.
    </p>
  `);
}

export function friendRequestEmailHtml({
  requesterName,
  friendsUrl,
}: {
  requesterName: string;
  friendsUrl: string;
}): string {
  return layout(`
    <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;">Friend request</p>
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;">${requesterName} wants to connect</h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#52525b;">
      They sent you a friend request on Finance Buddy so you can split expenses and settle up together.
    </p>
    ${button(friendsUrl, "View request")}
    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#71717a;">
      Open Finance Buddy to accept or decline the request.
    </p>
  `);
}

export function friendsPageUrl(): string {
  return new URL("/shared/friends", siteUrl).toString();
}

export function sharedPageUrl(): string {
  return new URL("/shared", siteUrl).toString();
}

export function friendRequestAcceptedEmailHtml({
  friendName,
  sharedUrl,
}: {
  friendName: string;
  sharedUrl: string;
}): string {
  return layout(`
    <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;">Friend request accepted</p>
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;">You're now connected with ${friendName}</h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#52525b;">
      You can split shared expenses and record settlements together in Finance Buddy.
    </p>
    ${button(sharedUrl, "Open shared expenses")}
  `);
}

export function sharedExpenseEmailHtml({
  creatorName,
  description,
  amount,
  sharedUrl,
}: {
  creatorName: string;
  description: string;
  amount: string;
  sharedUrl: string;
}): string {
  return layout(`
    <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;">Shared expense</p>
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;">${creatorName} added a shared expense</h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#52525b;">
      <strong>${description}</strong> — ${amount} total. Open Finance Buddy to see your share.
    </p>
    ${button(sharedUrl, "View shared expenses")}
  `);
}

export function settlementEmailHtml({
  payerName,
  amount,
  note,
  sharedUrl,
}: {
  payerName: string;
  amount: string;
  note: string;
  sharedUrl: string;
}): string {
  return layout(`
    <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;">Settlement recorded</p>
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;">${payerName} recorded a payment</h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#52525b;">
      Amount: <strong>${amount}</strong>${note ? `<br />Note: ${note}` : ""}
    </p>
    ${button(sharedUrl, "View balances")}
  `);
}

export function authCallbackUrl(nextPath = "/dashboard"): string {
  const url = new URL("/auth/callback", siteUrl);
  url.searchParams.set("next", nextPath);
  return url.toString();
}
