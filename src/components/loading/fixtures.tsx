import Link from "next/link";
import { CategoryProgressBar } from "@/components/app/CategoryProgressBar";
import { ForecastCard } from "@/components/app/ForecastCard";
import { AppButton, AppCard, AppInput, AppPageHeader } from "@/components/app/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SkeletonName } from "@/components/loading/skeleton-names";
import { SKELETON_NAMES } from "@/components/loading/skeleton-names";
import type { CategorySummary, ForecastResult } from "@/types/finance";
import { formatMoney } from "@/types/finance";

const mockForecast: ForecastResult = {
  projectedEndBalanceCents: 42000,
  dailyBurnRateCents: 1850,
  spentToDateCents: 128500,
  projectedTotalSpendCents: 165500,
  daysRemaining: 12,
  daysElapsed: 18,
  daysInMonth: 30,
  onTrack: true,
};

const mockSummaries: CategorySummary[] = [
  {
    categoryId: "1",
    name: "Food",
    allocatedCents: 40000,
    spentCents: 28500,
    remainingCents: 11500,
    percentUsed: 71,
  },
  {
    categoryId: "2",
    name: "Transport",
    allocatedCents: 15000,
    spentCents: 9200,
    remainingCents: 5800,
    percentUsed: 61,
  },
  {
    categoryId: "3",
    name: "Subscriptions",
    allocatedCents: 8000,
    spentCents: 6400,
    remainingCents: 1600,
    percentUsed: 80,
  },
];

export function DashboardFixture() {
  return (
    <>
      <AppPageHeader
        title="Dashboard"
        description="Your remaining budget, forecast, and alerts for this month."
        action={<AppButton>Add expense</AppButton>}
      />
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <AppCard>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Monthly income
            </p>
            <p className="mt-1 text-2xl font-semibold">{formatMoney(250000)}</p>
          </AppCard>
          <AppCard>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Remaining this month
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-700">
              {formatMoney(84500)}
            </p>
          </AppCard>
          <AppCard>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Alert threshold
            </p>
            <p className="mt-1 text-2xl font-semibold">80%</p>
          </AppCard>
        </div>
        <ForecastCard forecast={mockForecast} />
        <AppCard title="Category budgets">
          <div className="space-y-5">
            {mockSummaries.map((summary) => (
              <CategoryProgressBar key={summary.categoryId} summary={summary} />
            ))}
          </div>
        </AppCard>
      </div>
    </>
  );
}

export function ExpensesFixture() {
  return (
    <>
      <AppPageHeader
        title="Expenses"
        description="Review, recategorize, or delete your spending records."
        action={<AppButton>Add expense</AppButton>}
      />
      <AppCard title="All expenses">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ["12 Jun", "Campus cafe", "$14.50", "Food"],
              ["11 Jun", "Bus pass top-up", "$20.00", "Transport"],
              ["10 Jun", "Spotify", "$11.99", "Subscriptions"],
            ].map(([date, description, amount, category]) => (
              <TableRow key={description}>
                <TableCell>{date}</TableCell>
                <TableCell>{description}</TableCell>
                <TableCell>{amount}</TableCell>
                <TableCell>{category}</TableCell>
                <TableCell className="text-right">
                  <AppButton variant="secondary">Delete</AppButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AppCard>
    </>
  );
}

function FormFieldsFixture({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }, (_, index) => (
        <AppInput
          key={index}
          label={index === 0 ? "Amount" : index === 1 ? "Description" : "Field"}
          defaultValue=""
          readOnly
        />
      ))}
      <AppButton>Save</AppButton>
    </div>
  );
}

export function ExpenseFormFixture() {
  return (
    <>
      <AppPageHeader
        title="Add expense"
        description="Log manually, paste receipt text, or use quick text like '12 uber home Friday'."
      />
      <AppCard title="New expense">
        <FormFieldsFixture rows={5} />
      </AppCard>
    </>
  );
}

export function BudgetFormFixture() {
  return (
    <>
      <AppPageHeader
        title="Monthly budget"
        description="Set your allowance, pick your categories, and we'll split it evenly across them."
      />
      <div className="mb-8 flex gap-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-muted" />
            <div className="h-3 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>
      <AppCard title="Budget setup">
        <FormFieldsFixture rows={4} />
      </AppCard>
    </>
  );
}

export function ReportsFixture() {
  return (
    <>
      <AppPageHeader
        title="Spending report"
        description="Review spending patterns and forecasts for any date range in your current budget."
      />
      <AppCard title="Date range">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-10 animate-pulse rounded-md bg-muted" />
          <div className="h-10 animate-pulse rounded-md bg-muted" />
        </div>
      </AppCard>
      <AppCard title="Spending summary">
        <div className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total spent</span>
            <span className="font-medium">{formatMoney(128500)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Top category</span>
            <span className="font-medium">Food</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Daily average</span>
            <span className="font-medium">{formatMoney(1850)}</span>
          </div>
        </div>
      </AppCard>
    </>
  );
}

export function ProfileFixture() {
  return (
    <>
      <AppPageHeader
        title="Profile"
        description="Manage your account, find friends, and control privacy and data."
      />
      <div className="space-y-6">
        <AppCard title="Friends & sharing">
          <div className="flex flex-wrap gap-2">
            <AppButton variant="secondary">Friends</AppButton>
            <AppButton variant="secondary">Requests</AppButton>
            <AppButton variant="secondary">Shared expenses</AppButton>
          </div>
        </AppCard>
        <AppCard title="Privacy">
          <p className="text-sm text-muted-foreground">
            Finance Buddy never exposes one user&apos;s budget to another.
          </p>
        </AppCard>
        <AppCard title="Delete data">
          <p className="mb-4 text-sm text-muted-foreground">
            Permanently remove your budget, expenses, and alerts.
          </p>
          <AppButton variant="danger">Delete all my data</AppButton>
        </AppCard>
      </div>
    </>
  );
}

/** @deprecated Use ProfileFixture */
export function SettingsFixture() {
  return <ProfileFixture />;
}

export function SharedFixture() {
  return (
    <>
      <AppPageHeader
        title="Shared expenses"
        description="Split bills with friends and track who owes what."
        action={
          <div className="flex flex-wrap gap-2">
            <AppButton variant="secondary">Manage friends</AppButton>
            <AppButton>Add expense</AppButton>
          </div>
        }
      />
      <AppCard title="Balances" description="Who owes whom across shared bills.">
        <ul className="divide-y divide-border">
          {["Alex Chen", "Sam Rivera", "Jordan Lee"].map((name) => (
            <li
              key={name}
              className="flex items-center justify-between gap-4 py-4 text-sm"
            >
              <span className="font-medium">{name}</span>
              <span className="text-accent-green">owes you {formatMoney(2400)}</span>
            </li>
          ))}
        </ul>
      </AppCard>
    </>
  );
}

export function FriendsFixture() {
  return (
    <>
      <AppPageHeader
        title="Friends"
        description="Connect with people you split bills with."
      />
      <div className="space-y-6">
        <AppCard title="Add friend">
          <FormFieldsFixture rows={2} />
        </AppCard>
        <AppCard title="Your friends">
          <ul className="divide-y divide-border">
            {["Alex Chen", "Sam Rivera"].map((name) => (
              <li key={name} className="py-3 text-sm font-medium">
                {name}
              </li>
            ))}
          </ul>
        </AppCard>
      </div>
    </>
  );
}

export function FriendDetailFixture() {
  return (
    <>
      <p className="mb-4">
        <Link
          href="/shared"
          className="text-sm text-accent-green underline-offset-4 hover:underline"
        >
          Back to shared expenses
        </Link>
      </p>
      <AppPageHeader
        title="Alex Chen"
        description="Shared bills and settlements with this friend."
      />
      <div className="space-y-6">
        <AppCard title="Balance">
          <p className="text-lg font-medium text-accent-green">
            {formatMoney(2400)} owed to you
          </p>
        </AppCard>
        <AppCard title="Activity">
          <ul className="divide-y divide-border text-sm">
            {["Dinner split", "Uber home", "Settlement"].map((item) => (
              <li key={item} className="flex justify-between py-3">
                <span>{item}</span>
                <span className="text-muted-foreground">{formatMoney(1200)}</span>
              </li>
            ))}
          </ul>
        </AppCard>
      </div>
    </>
  );
}

export function SharedExpenseFormFixture() {
  return (
    <>
      <p className="mb-4">
        <Link
          href="/shared"
          className="text-sm text-accent-green underline-offset-4 hover:underline"
        >
          Back to shared expenses
        </Link>
      </p>
      <AppPageHeader
        title="Add shared expense"
        description="Split a bill equally or record who paid the full amount."
      />
      <AppCard title="Shared expense">
        <FormFieldsFixture rows={5} />
      </AppCard>
    </>
  );
}

export function AuthFormFixture() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="h-8 w-32 rounded-md bg-muted" aria-hidden />
        <p className="text-sm text-muted-foreground">
          Sign in to your private budget
        </p>
      </div>
      <div className="w-full max-w-md">
        <AppCard
          title="Welcome back"
          description="Private budgeting for student life. Your data stays yours."
        >
          <FormFieldsFixture rows={3} />
        </AppCard>
      </div>
    </div>
  );
}

export function MarketingHeroFixture() {
  return (
    <section className="section-padding bg-white">
      <div className="container-main">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-5">About</p>
          <h1 className="heading-display text-4xl font-semibold sm:text-5xl">
            Student budgeting made simple
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Track spending, split bills with friends, and stay on top of your
            monthly allowance without spreadsheet stress.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-3">
          {["Track", "Forecast", "Split"].map((label) => (
            <div key={label} className="rounded-xl border border-border p-6">
              <p className="font-semibold">{label}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Placeholder card content for loading preview.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const SKELETON_FIXTURES: Record<
  SkeletonName,
  { fixture: React.ReactNode; snapshotConfig?: { leafTags: string[] } }
> = {
  [SKELETON_NAMES.dashboard]: {
    fixture: <DashboardFixture />,
    snapshotConfig: { leafTags: ["section"] },
  },
  [SKELETON_NAMES.expenses]: {
    fixture: <ExpensesFixture />,
  },
  [SKELETON_NAMES.expenseForm]: {
    fixture: <ExpenseFormFixture />,
  },
  [SKELETON_NAMES.budgetForm]: {
    fixture: <BudgetFormFixture />,
  },
  [SKELETON_NAMES.reports]: {
    fixture: <ReportsFixture />,
  },
  [SKELETON_NAMES.profile]: {
    fixture: <ProfileFixture />,
  },
  [SKELETON_NAMES.shared]: {
    fixture: <SharedFixture />,
  },
  [SKELETON_NAMES.friends]: {
    fixture: <FriendsFixture />,
  },
  [SKELETON_NAMES.friendDetail]: {
    fixture: <FriendDetailFixture />,
  },
  [SKELETON_NAMES.sharedExpenseForm]: {
    fixture: <SharedExpenseFormFixture />,
  },
  [SKELETON_NAMES.authForm]: {
    fixture: <AuthFormFixture />,
  },
  [SKELETON_NAMES.marketingHero]: {
    fixture: <MarketingHeroFixture />,
    snapshotConfig: { leafTags: ["section"] },
  },
};
