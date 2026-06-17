import Link from "next/link";
import { AppCard } from "@/components/app/ui";
import type { SharedExpenseDetail } from "@/types/shared";
import type { CurrencyCode } from "@/lib/finance/currency";
import { formatMoney } from "@/types/finance";

function participantSummary(
  expense: SharedExpenseDetail,
  currentUserId: string,
): string {
  const others = expense.splits.filter((split) => split.user_id !== currentUserId);
  const names = others
    .map((split) => split.display_name ?? "Friend")
    .slice(0, 3);

  if (others.length === 0) {
    return "Just you";
  }

  if (others.length <= 3) {
    return names.join(", ");
  }

  return `${names.join(", ")} + ${others.length - 3} more`;
}

function payerLabel(
  expense: SharedExpenseDetail,
  currentUserId: string,
): string {
  const payer = expense.splits.find((split) => split.paid_cents > 0);
  if (!payer) return "Unknown payer";

  if (payer.user_id === currentUserId) {
    return "You paid";
  }

  return `${payer.display_name ?? "Friend"} paid`;
}

export function SharedExpensesList({
  expenses,
  currentUserId,
  currency,
}: {
  expenses: SharedExpenseDetail[];
  currentUserId: string;
  currency: CurrencyCode;
}) {
  if (expenses.length === 0) {
    return (
      <AppCard title="Recent shared bills">
        <p className="text-sm text-muted-foreground">
          No shared expenses yet.{" "}
          <Link
            href="/shared/expenses/new"
            className="font-medium text-accent-green underline-offset-4 hover:underline"
          >
            Add one
          </Link>{" "}
          to split with friends.
        </p>
      </AppCard>
    );
  }

  return (
    <AppCard
      title="Recent shared bills"
      description="Group expenses split between you and your friends."
    >
      <ul className="divide-y divide-border">
        {expenses.slice(0, 8).map((expense) => {
          const userSplit = expense.splits.find(
            (split) => split.user_id === currentUserId,
          );
          const participantCount = expense.splits.length;

          return (
            <li key={expense.id} className="py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium">{expense.description}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {expense.expense_date} · {participantCount}{" "}
                    {participantCount === 1 ? "person" : "people"} ·{" "}
                    {payerLabel(expense, currentUserId)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    With {participantSummary(expense, currentUserId)}
                  </p>
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  <p className="font-medium">
                    {formatMoney(expense.total_cents, currency)}
                  </p>
                  {userSplit ? (
                    <p className="text-sm text-muted-foreground">
                      Your share {formatMoney(userSplit.share_cents, currency)}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </AppCard>
  );
}
