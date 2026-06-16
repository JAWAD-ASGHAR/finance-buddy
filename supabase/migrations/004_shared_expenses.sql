-- Shared expenses (Splitwise-style friends)

create type public.friend_request_status as enum ('pending', 'accepted', 'declined');

create table public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users (id) on delete cascade,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  status public.friend_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (requester_id, recipient_id),
  check (requester_id <> recipient_id)
);

create table public.shared_expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null default '',
  total_cents int not null check (total_cents > 0),
  expense_date date not null default current_date,
  created_by_user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.shared_expense_splits (
  id uuid primary key default gen_random_uuid(),
  shared_expense_id uuid not null references public.shared_expenses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  share_cents int not null check (share_cents >= 0),
  paid_cents int not null check (paid_cents >= 0),
  personal_expense_id uuid references public.expenses (id) on delete set null,
  unique (shared_expense_id, user_id)
);

create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references auth.users (id) on delete cascade,
  to_user_id uuid not null references auth.users (id) on delete cascade,
  amount_cents int not null check (amount_cents > 0),
  note text not null default '',
  created_by_user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (from_user_id <> to_user_id)
);

create index friend_requests_requester_id_idx on public.friend_requests (requester_id);
create index friend_requests_recipient_id_idx on public.friend_requests (recipient_id);
create index shared_expenses_created_by_user_id_idx on public.shared_expenses (created_by_user_id);
create index shared_expense_splits_shared_expense_id_idx on public.shared_expense_splits (shared_expense_id);
create index shared_expense_splits_user_id_idx on public.shared_expense_splits (user_id);
create index settlements_from_user_id_idx on public.settlements (from_user_id);
create index settlements_to_user_id_idx on public.settlements (to_user_id);

create trigger friend_requests_updated_at
  before update on public.friend_requests
  for each row execute function public.set_updated_at();

alter table public.friend_requests enable row level security;
alter table public.shared_expenses enable row level security;
alter table public.shared_expense_splits enable row level security;
alter table public.settlements enable row level security;

create policy "friend_requests_select_participant" on public.friend_requests
  for select using (auth.uid() = requester_id or auth.uid() = recipient_id);

create policy "friend_requests_insert_requester" on public.friend_requests
  for insert with check (auth.uid() = requester_id);

create policy "friend_requests_update_participant" on public.friend_requests
  for update
  using (auth.uid() = requester_id or auth.uid() = recipient_id)
  with check (auth.uid() = requester_id or auth.uid() = recipient_id);

create policy "shared_expenses_select_participant" on public.shared_expenses
  for select using (
    exists (
      select 1 from public.shared_expense_splits s
      where s.shared_expense_id = id and s.user_id = auth.uid()
    )
  );

create policy "shared_expenses_insert_creator" on public.shared_expenses
  for insert with check (auth.uid() = created_by_user_id);

create policy "shared_expense_splits_select_participant" on public.shared_expense_splits
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.shared_expense_splits s
      where s.shared_expense_id = shared_expense_id and s.user_id = auth.uid()
    )
  );

create policy "shared_expense_splits_insert_participant" on public.shared_expense_splits
  for insert with check (
    exists (
      select 1 from public.shared_expenses e
      where e.id = shared_expense_id and e.created_by_user_id = auth.uid()
    )
  );

create policy "settlements_select_participant" on public.settlements
  for select using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "settlements_insert_creator" on public.settlements
  for insert with check (auth.uid() = created_by_user_id);
