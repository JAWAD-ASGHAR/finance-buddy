-- Savings goals and manual contributions

create table public.saving_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_cents int not null check (target_cents > 0),
  target_date date,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.saving_contributions (
  id uuid primary key default gen_random_uuid(),
  saving_goal_id uuid not null references public.saving_goals (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount_cents int not null check (amount_cents > 0),
  contributed_at date not null default current_date,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index saving_goals_user_id_idx on public.saving_goals (user_id);
create index saving_contributions_saving_goal_id_idx on public.saving_contributions (saving_goal_id);
create index saving_contributions_user_id_idx on public.saving_contributions (user_id);

alter table public.saving_goals enable row level security;
alter table public.saving_contributions enable row level security;

create policy "saving_goals_all_own" on public.saving_goals
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "saving_contributions_all_own" on public.saving_contributions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
