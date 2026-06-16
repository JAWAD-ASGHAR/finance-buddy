/**
 * Demo seed script — run after creating a user account.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SECRET_KEY=... DEMO_EMAIL=... DEMO_PASSWORD=... node scripts/seed-demo.mjs
 *
 * Optional second user for shared expense demo:
 *   DEMO_FRIEND_EMAIL=friend@example.com DEMO_FRIEND_PASSWORD=... 
 *
 * Legacy SUPABASE_SERVICE_ROLE_KEY is still accepted during migration.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.DEMO_EMAIL?.trim().toLowerCase();
const password = process.env.DEMO_PASSWORD ?? "demo123456";
const friendEmail = process.env.DEMO_FRIEND_EMAIL?.trim().toLowerCase();
const friendPassword = process.env.DEMO_FRIEND_PASSWORD ?? password;

if (!url || !secretKey || !email) {
  console.error(
    "Required env: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY), DEMO_EMAIL",
  );
  process.exit(1);
}

const supabase = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;
const today = now.toISOString().slice(0, 10);

async function ensureUser(targetEmail, targetPassword, displayName) {
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: targetPassword,
    });

  if (!signInError && signInData.user) {
    return signInData.user.id;
  }

  const { data: createData, error: createError } =
    await supabase.auth.admin.createUser({
      email: targetEmail,
      password: targetPassword,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    });

  if (createError || !createData.user) {
    throw createError ?? new Error(`Failed to create user ${targetEmail}`);
  }

  return createData.user.id;
}

async function seedBudget(userId) {
  await supabase.from("budgets").delete().eq("user_id", userId);

  const { data: budget, error: budgetError } = await supabase
    .from("budgets")
    .insert({
      user_id: userId,
      year,
      month,
      income_cents: 80000,
      alert_threshold_pct: 80,
    })
    .select("*")
    .single();

  if (budgetError || !budget) throw budgetError;

  const categoryDefs = [
    { name: "Food", allocated_cents: 20000, sort_order: 0 },
    { name: "Transport", allocated_cents: 8000, sort_order: 1 },
    { name: "Subscriptions", allocated_cents: 4000, sort_order: 2 },
    { name: "Shopping", allocated_cents: 10000, sort_order: 3 },
    { name: "Other", allocated_cents: 5000, sort_order: 4 },
  ];

  const { data: categories, error: catError } = await supabase
    .from("categories")
    .insert(
      categoryDefs.map((c) => ({
        ...c,
        budget_id: budget.id,
        user_id: userId,
      })),
    )
    .select("*");

  if (catError || !categories) throw catError;

  const byName = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  const expenses = [
    {
      description: "Coffee before lecture",
      amount_cents: 1200,
      category_id: byName.Food,
    },
    {
      description: "Uber home",
      amount_cents: 1500,
      category_id: byName.Transport,
    },
    {
      description: "Netflix subscription",
      amount_cents: 999,
      category_id: byName.Subscriptions,
    },
    {
      description: "Deliveroo dinner",
      amount_cents: 1850,
      category_id: byName.Shopping,
      suggested_category_id: byName.Shopping,
      user_corrected: true,
    },
    {
      description: "Weekly groceries",
      amount_cents: 14500,
      category_id: byName.Food,
    },
  ];

  const { error: expenseError } = await supabase.from("expenses").insert(
    expenses.map((e) => ({
      user_id: userId,
      budget_id: budget.id,
      expense_date: today,
      source: "manual",
      suggested_category_id: e.suggested_category_id ?? e.category_id,
      user_corrected: e.user_corrected ?? false,
      description: e.description,
      amount_cents: e.amount_cents,
      category_id: e.category_id,
    })),
  );

  if (expenseError) throw expenseError;

  return { budget, categories };
}

async function seedSharedDemo(userId, friendId) {
  await supabase
    .from("friend_requests")
    .delete()
    .or(
      `and(requester_id.eq.${userId},recipient_id.eq.${friendId}),and(requester_id.eq.${friendId},recipient_id.eq.${userId})`,
    );

  const { error: friendError } = await supabase.from("friend_requests").insert({
    requester_id: userId,
    recipient_id: friendId,
    status: "accepted",
  });

  if (friendError) throw friendError;

  const { data: sharedExpense, error: sharedError } = await supabase
    .from("shared_expenses")
    .insert({
      description: "Pizza night",
      total_cents: 3600,
      expense_date: today,
      created_by_user_id: userId,
    })
    .select("*")
    .single();

  if (sharedError || !sharedExpense) throw sharedError;

  const { error: splitsError } = await supabase
    .from("shared_expense_splits")
    .insert([
      {
        shared_expense_id: sharedExpense.id,
        user_id: userId,
        share_cents: 1800,
        paid_cents: 3600,
      },
      {
        shared_expense_id: sharedExpense.id,
        user_id: friendId,
        share_cents: 1800,
        paid_cents: 0,
      },
    ]);

  if (splitsError) throw splitsError;

  const { error: settlementError } = await supabase.from("settlements").insert({
    from_user_id: friendId,
    to_user_id: userId,
    amount_cents: 1000,
    note: "Partial payback via Monzo",
    created_by_user_id: friendId,
  });

  if (settlementError) throw settlementError;

  console.log("- Shared expense: Pizza night £36 (friend still owes £8)");
}

async function main() {
  const displayName = email.split("@")[0] ?? email;
  const userId = await ensureUser(email, password, displayName);
  await seedBudget(userId);

  console.log("Demo data seeded for", email);
  console.log("- Budget:", `${year}-${month}`, "£800 income");
  console.log("- Expenses: 5 records (Food should be near alert threshold)");

  if (friendEmail) {
    const friendDisplayName = friendEmail.split("@")[0] ?? friendEmail;
    const friendId = await ensureUser(
      friendEmail,
      friendPassword,
      friendDisplayName,
    );
    await seedBudget(friendId);
    await seedSharedDemo(userId, friendId);
    console.log("- Friend demo seeded with", friendEmail);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
