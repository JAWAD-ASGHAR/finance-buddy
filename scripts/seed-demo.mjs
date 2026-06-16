/**
 * Demo seed script — run after creating a Supabase user account.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... DEMO_EMAIL=... DEMO_PASSWORD=... node scripts/seed-demo.mjs
 *
 * Creates a sample budget and expenses matching the recommended demo story.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.DEMO_EMAIL;
const password = process.env.DEMO_PASSWORD ?? "demo123456";

if (!url || !serviceKey || !email) {
  console.error(
    "Required env: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY, DEMO_EMAIL",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;

async function main() {
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({ email, password });

  let userId = signInData.user?.id;

  if (signInError) {
    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({ email, password });
    if (signUpError || !signUpData.user) {
      throw signUpError ?? new Error("Failed to create demo user");
    }
    userId = signUpData.user.id;
  }

  if (!userId) throw new Error("No user id");

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
    { description: "Coffee before lecture", amount_cents: 1200, category_id: byName.Food },
    { description: "Uber home", amount_cents: 1500, category_id: byName.Transport },
    { description: "Netflix subscription", amount_cents: 999, category_id: byName.Subscriptions },
    { description: "Deliveroo dinner", amount_cents: 1850, category_id: byName.Shopping, suggested_category_id: byName.Shopping, user_corrected: true },
    { description: "Weekly groceries", amount_cents: 14500, category_id: byName.Food },
  ];

  const { error: expenseError } = await supabase.from("expenses").insert(
    expenses.map((e) => ({
      user_id: userId,
      budget_id: budget.id,
      expense_date: now.toISOString().slice(0, 10),
      source: "manual",
      suggested_category_id: e.suggested_category_id ?? e.category_id,
      user_corrected: e.user_corrected ?? false,
      description: e.description,
      amount_cents: e.amount_cents,
      category_id: e.category_id,
    })),
  );

  if (expenseError) throw expenseError;

  console.log("Demo data seeded for", email);
  console.log("- Budget:", `${year}-${month}`, "£800 income");
  console.log("- Expenses:", expenses.length, "records (Food should be near alert threshold)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
