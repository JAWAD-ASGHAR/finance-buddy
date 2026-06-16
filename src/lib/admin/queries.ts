import { count, desc, gte } from "drizzle-orm";
import { getDb } from "@/db/index";
import {
  alerts,
  budgets,
  expenses,
  profiles,
} from "@/db/schema";

export type AdminStats = {
  totalUsers: number;
  totalBudgets: number;
  totalExpenses: number;
  totalAlerts: number;
  recentUsers: Array<{
    id: string;
    displayName: string | null;
    createdAt: string;
    isAdmin: boolean;
  }>;
};

export async function getAdminStats(): Promise<AdminStats> {
  const db = getDb();

  const [
    usersResult,
    budgetsResult,
    expensesResult,
    alertsResult,
    recentUsers,
  ] = await Promise.all([
    db.select({ value: count() }).from(profiles),
    db.select({ value: count() }).from(budgets),
    db.select({ value: count() }).from(expenses),
    db.select({ value: count() }).from(alerts),
    db.query.profiles.findMany({
      orderBy: desc(profiles.createdAt),
      limit: 10,
      columns: {
        id: true,
        displayName: true,
        createdAt: true,
        isAdmin: true,
      },
    }),
  ]);

  return {
    totalUsers: usersResult[0]?.value ?? 0,
    totalBudgets: budgetsResult[0]?.value ?? 0,
    totalExpenses: expensesResult[0]?.value ?? 0,
    totalAlerts: alertsResult[0]?.value ?? 0,
    recentUsers: recentUsers.map((user) => ({
      id: user.id,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
      isAdmin: user.isAdmin,
    })),
  };
}

export async function getMonthlySignupCount(): Promise<number> {
  const db = getDb();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const result = await db
    .select({ value: count() })
    .from(profiles)
    .where(gte(profiles.createdAt, startOfMonth));

  return result[0]?.value ?? 0;
}
