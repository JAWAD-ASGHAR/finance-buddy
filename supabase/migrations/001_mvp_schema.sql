-- Finance Buddy MVP schema

create extension if not exists "pgcrypto";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- Monthly budgets
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  year int not null check (year >= 2000 and year <= 2100),
  month int not null check (month >= 1 and month <= 12),
  income_cents int not null check (income_cents >= 0),
  alert_threshold_pct int not null default 80 check (alert_threshold_pct > 0 and alert_threshold_pct <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, year, month)
);

-- Categories per budget
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  allocated_cents int not null check (allocated_cents >= 0),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Expenses
create type public.expense_source as enum ('manual', 'receipt_text', 'nl_text');

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  budget_id uuid not null references public.budgets (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  suggested_category_id uuid references public.categories (id) on delete set null,
  amount_cents int not null check (amount_cents > 0),
  description text not null default '',
  expense_date date not null default current_date,
  source public.expense_source not null default 'manual',
  user_corrected boolean not null default false,
  created_at timestamptz not null default now()
);

-- Alerts
create type public.alert_type as enum ('category_threshold', 'monthly_pace');

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  budget_id uuid not null references public.budgets (id) on delete cascade,
  category_id uuid references public.categories (id) on delete cascade,
  type public.alert_type not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Monthly report snapshots
create table public.monthly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  budget_id uuid not null references public.budgets (id) on delete cascade,
  summary_json jsonb not null,
  generated_at timestamptz not null default now()
);

-- Indexes
create index budgets_user_id_idx on public.budgets (user_id);
create index categories_budget_id_idx on public.categories (budget_id);
create index expenses_budget_id_idx on public.expenses (budget_id);
create index expenses_user_id_idx on public.expenses (user_id);
create index expenses_expense_date_idx on public.expenses (expense_date);
create index alerts_budget_id_idx on public.alerts (budget_id);
create index alerts_user_id_unread_idx on public.alerts (user_id) where read_at is null;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger for budgets
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger budgets_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.budgets enable row level security;
alter table public.categories enable row level security;
alter table public.expenses enable row level security;
alter table public.alerts enable row level security;
alter table public.monthly_reports enable row level security;

-- Profiles policies
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Budgets policies
create policy "budgets_all_own" on public.budgets
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Categories policies
create policy "categories_all_own" on public.categories
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Expenses policies
create policy "expenses_all_own" on public.expenses
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Alerts policies
create policy "alerts_all_own" on public.alerts
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Monthly reports policies
create policy "monthly_reports_all_own" on public.monthly_reports
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
