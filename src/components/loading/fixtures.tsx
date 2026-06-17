"use client";

import Link from "next/link";
import { CategoryProgressBar } from "@/components/app/CategoryProgressBar";
import { ForecastCard } from "@/components/app/ForecastCard";
import { MonthlyReportView } from "@/components/app/MonthlyReportView";
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
import type {
  CategorySummary,
  ForecastResult,
  MonthlyReportSummary,
} from "@/types/finance";
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
  {
    categoryId: "4",
    name: "Shopping",
    allocatedCents: 10000,
    spentCents: 5200,
    remainingCents: 4800,
    percentUsed: 52,
  },
  {
    categoryId: "5",
    name: "Other",
    allocatedCents: 5000,
    spentCents: 2100,
    remainingCents: 2900,
    percentUsed: 42,
  },
];

const mockReportSummary: MonthlyReportSummary = {
  periodLabel: "Jun 1 – 17, 2026",
  incomeCents: 250000,
  totalSpentCents: 128500,
  remainingCents: 121500,
  categoryBreakdown: mockSummaries.map((summary) => ({
    name: summary.name,
    spentCents: summary.spentCents,
    allocatedCents: summary.allocatedCents,
    percentUsed: summary.percentUsed,
  })),
  dailySpending: Array.from({ length: 17 }, (_, index) => {
    const day = index + 1;
    const spentCents = 1800 + index * 420;
    return {
      day,
      label: `${day} Jun`,
      spentCents,
      cumulativeCents: spentCents * day,
      paceCents: Math.round((250000 / 30) * day),
    };
  }),
  forecast: mockForecast,
  insights: [
    "You spent 22% of tracked spending on Food.",
    "Subscriptions crossed 80% of their category limits.",
    "At your current pace, you'll finish the month $420 under budget.",
  ],
  disclaimer:
    "This report is for informational purposes only and does not constitute financial advice.",
};

const expenseRows = [
  ["2026-06-17", "Campus cafe", 1450, "Food"],
  ["2026-06-16", "Bus pass top-up", 2000, "Transport"],
  ["2026-06-15", "Spotify", 1199, "Subscriptions"],
  ["2026-06-14", "Grocery run", 4820, "Food"],
  ["2026-06-13", "Textbooks", 3500, "Shopping"],
  ["2026-06-12", "Coffee shop", 650, "Food"],
  ["2026-06-11", "Uber home", 1850, "Transport"],
] as const;

function ChartPlaceholder({ className = "h-64" }: { className?: string }) {
  return (
    <div
      className={`w-full rounded-lg border border-border/60 bg-muted/40 ${className}`}
      aria-hidden
    />
  );
}

function AlertBannerFixture() {
  return (
    <AppCard
      title="Alerts"
      description="Guidance only — not financial advice."
      className="border-amber-200 bg-amber-50/60"
    >
      <div className="space-y-3 rounded-lg border border-border bg-background p-4 text-sm">
        <p>Food is at 71% of its monthly limit.</p>
        <AppButton variant="secondary">Dismiss</AppButton>
      </div>
    </AppCard>
  );
}

function FormFieldsFixture({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }, (_, index) => (
        <AppInput
          key={index}
          label={
            index === 0
              ? "Amount"
              : index === 1
                ? "Description"
                : `Field ${index + 1}`
          }
          defaultValue=""
          readOnly
        />
      ))}
      <AppButton>Save</AppButton>
    </div>
  );
}

function ExpenseTableFixture() {
  return (
    <AppCard title="All expenses">
      <div className="space-y-3 md:hidden">
        {expenseRows.slice(0, 4).map(([date, description, amount, category]) => (
          <div
            key={description}
            className="space-y-3 rounded-lg border border-border p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{description}</p>
                <p className="mt-1 text-xs text-muted-foreground">{date}</p>
              </div>
              <p className="text-sm font-semibold">{formatMoney(amount)}</p>
            </div>
            <AppInput label="Category" defaultValue={category} readOnly />
            <AppButton variant="secondary" className="w-full">
              Delete
            </AppButton>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
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
            {expenseRows.map(([date, description, amount, category]) => (
              <TableRow key={description}>
                <TableCell className="whitespace-nowrap">{date}</TableCell>
                <TableCell>{description}</TableCell>
                <TableCell className="font-medium">
                  {formatMoney(amount)}
                </TableCell>
                <TableCell>{category}</TableCell>
                <TableCell className="text-right">
                  <AppButton variant="secondary">Delete</AppButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppCard>
  );
}

export function DashboardFixture() {
  return (
    <>
      <AppPageHeader
        title="Dashboard"
        description="Your remaining budget, forecast, and alerts for this month."
        action={<AppButton>Add expense</AppButton>}
      />
      <div className="space-y-6">
        <AlertBannerFixture />

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Monthly income", formatMoney(250000)],
            ["Remaining this month", formatMoney(84500)],
            ["Alert threshold", "80%"],
          ].map(([label, value]) => (
            <AppCard key={label}>
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                {label}
              </p>
              <p className="mt-1 text-xl font-semibold sm:text-2xl">{value}</p>
            </AppCard>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <AppCard
            className="lg:col-span-3"
            title="Spending trend"
            description="Your cumulative spend this month against an even budget pace."
          >
            <ChartPlaceholder />
          </AppCard>
          <AppCard
            className="lg:col-span-2"
            title="Category spend"
            description="Quick view of where your budget is going."
          >
            <ChartPlaceholder className="h-56" />
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
      <ExpenseTableFixture />
    </>
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
        <div className="mb-4 flex gap-2">
          {["Manual", "Receipt", "Quick text"].map((tab) => (
            <div
              key={tab}
              className="rounded-md border border-border px-3 py-1.5 text-sm"
            >
              {tab}
            </div>
          ))}
        </div>
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
      <div className="mb-8 flex flex-wrap gap-4">
        {["Income", "Categories", "Review"].map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                index === 2
                  ? "bg-accent-green text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>
            <span className="text-sm font-medium">{step}</span>
          </div>
        ))}
      </div>
      <AppCard
        title="Split your budget"
        description="Adjust category limits until your full income is allocated."
      >
        <div className="space-y-4">
          <div className="grid gap-4 rounded-lg border border-border/80 bg-muted/30 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                Monthly income
              </p>
              <p className="mt-1 text-lg font-semibold">{formatMoney(250000)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                Alert threshold
              </p>
              <p className="mt-1 text-lg font-semibold">80%</p>
            </div>
          </div>
          <div className="space-y-3">
            {mockSummaries.map((summary) => (
              <div key={summary.categoryId} className="grid gap-3 sm:grid-cols-2">
                <AppInput label="Category" defaultValue={summary.name} readOnly />
                <AppInput
                  label="Limit"
                  defaultValue={String(summary.allocatedCents / 100)}
                  readOnly
                />
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-accent-green/25 bg-accent-green-light/40 px-4 py-3 text-sm">
            Budget fully allocated · {formatMoney(250000)} assigned
          </div>
          <AppButton>Save monthly budget</AppButton>
        </div>
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
      <div className="space-y-6">
        <AppCard
          title="Date range"
          description="Choose the period to include in your spending report."
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <AppInput label="Start date" type="date" defaultValue="2026-06-01" readOnly />
            <AppInput label="End date" type="date" defaultValue="2026-06-17" readOnly />
            <AppButton className="sm:mb-0.5">View report</AppButton>
          </div>
        </AppCard>
        <MonthlyReportView summary={mockReportSummary} />
      </div>
    </>
  );
}

export function ProfileFixture() {
  return (
    <>
      <AppPageHeader
        title="Profile"
        description="Your account details, preferences, and privacy settings."
      />
      <div className="space-y-6">
        <AppCard title="Account">
          <div className="grid gap-4 sm:grid-cols-2">
            <AppInput label="Username" defaultValue="jordanlee" readOnly />
            <AppInput label="Display name" defaultValue="Jordan Lee" readOnly />
            <AppInput label="Country" defaultValue="United Kingdom" readOnly />
            <AppInput label="Currency" defaultValue="GBP (£)" readOnly />
          </div>
          <div className="mt-4">
            <AppButton>Save preferences</AppButton>
          </div>
        </AppCard>

        <AppCard title="Friends">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">3</span> friends ·{" "}
              <span className="font-medium text-foreground">1</span> pending request
            </p>
            <span className="text-sm font-medium text-accent-green">
              Manage friends →
            </span>
          </div>
        </AppCard>

        <AppCard title="Privacy">
          <p className="text-sm text-muted-foreground">
            Finance Buddy never exposes one user&apos;s budget to another.
            Forecasts, alerts, and reports are informational only — not financial
            advice.
          </p>
        </AppCard>

        <AppCard
          title="API keys for MCP"
          description="Generate personal keys to connect Finance Buddy from Cursor or other MCP clients."
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <AppInput label="Key name" defaultValue="Cursor laptop" readOnly />
              <AppButton>Create key</AppButton>
            </div>
            <ul className="divide-y divide-border text-sm">
              {["Cursor laptop", "Claude Desktop"].map((name) => (
                <li
                  key={name}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-muted-foreground">fb_••••••••abcd</p>
                  </div>
                  <AppButton variant="secondary">Revoke</AppButton>
                </li>
              ))}
            </ul>
          </div>
        </AppCard>

        <AppCard
          title="Delete all data"
          description="Remove every budget, expense, alert, and report from your account."
        >
          <AppButton variant="danger">Delete all my data</AppButton>
        </AppCard>
      </div>
    </>
  );
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
      <div className="space-y-6">
        <AppCard title="Pending requests">
          <ul className="divide-y divide-border text-sm">
            <li className="flex items-center justify-between py-3">
              <span>Sam Rivera wants to connect</span>
              <div className="flex gap-2">
                <AppButton variant="secondary">Decline</AppButton>
                <AppButton>Accept</AppButton>
              </div>
            </li>
          </ul>
        </AppCard>
        <AppCard title="Balances" description="Who owes whom across shared bills.">
          <ul className="divide-y divide-border">
            {[
              ["Alex Chen", 2400, "owes you"],
              ["Sam Rivera", -1800, "you owe"],
              ["Jordan Lee", 900, "owes you"],
            ].map(([name, amount, direction]) => (
              <li
                key={name}
                className="flex items-center justify-between gap-4 py-4 text-sm"
              >
                <span className="font-medium">{name}</span>
                <span className="text-accent-green">
                  {direction} {formatMoney(Math.abs(amount as number))}
                </span>
              </li>
            ))}
          </ul>
        </AppCard>
      </div>
    </>
  );
}

export function FriendsFixture() {
  return (
    <>
      <AppPageHeader
        title="Friends"
        description="Find people, manage requests, and view your connections."
      />
      <div className="space-y-6">
        <AppCard
          title="Find people"
          description="Search by username to send a friend request and split costs together."
        >
          <AppInput label="Search username" defaultValue="alex" readOnly />
        </AppCard>
        <AppCard title="Pending requests">
          <ul className="divide-y divide-border text-sm">
            <li className="flex items-center justify-between py-3">
              <span>Incoming · Sam Rivera</span>
              <div className="flex gap-2">
                <AppButton variant="secondary">Decline</AppButton>
                <AppButton>Accept</AppButton>
              </div>
            </li>
            <li className="flex items-center justify-between py-3">
              <span>Outgoing · Jordan Lee</span>
              <AppButton variant="secondary">Cancel</AppButton>
            </li>
          </ul>
        </AppCard>
        <AppCard title="Your friends">
          <ul className="divide-y divide-border">
            {[
              ["Alex Chen", "alexchen"],
              ["Sam Rivera", "samr"],
              ["Jordan Lee", "jordanlee"],
            ].map(([name, username]) => (
              <li
                key={username}
                className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-medium">
                  {name}{" "}
                  <span className="font-normal text-muted-foreground">
                    @{username}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  View activity →
                </span>
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
          href="/friends"
          className="text-sm text-accent-green underline-offset-4 hover:underline"
        >
          Back to friends
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
            {[
              ["Dinner split", 4200],
              ["Uber home", 1800],
              ["Settlement", -3600],
              ["Coffee run", 950],
            ].map(([item, amount]) => (
              <li key={item} className="flex justify-between py-3">
                <span>{item}</span>
                <span className="text-muted-foreground">
                  {formatMoney(amount as number)}
                </span>
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
        <FormFieldsFixture rows={6} />
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
    <div className="section-padding bg-white">
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
    </div>
  );
}

export const SKELETON_FIXTURES: Record<
  SkeletonName,
  { fixture: React.ReactNode; snapshotConfig?: { leafTags: string[] } }
> = {
  [SKELETON_NAMES.dashboard]: {
    fixture: <DashboardFixture />,
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
  },
};
