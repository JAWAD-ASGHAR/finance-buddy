-- In-app notifications (friend requests, shared expenses, settlements)

create type notification_type as enum (
  'friend_request',
  'friend_request_accepted',
  'shared_expense',
  'settlement'
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text not null,
  href text not null default '/shared',
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on notifications(user_id);
create index if not exists notifications_user_unread_idx on notifications(user_id, read_at);

alter table notifications enable row level security;

create policy "Users can view own notifications"
  on notifications for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can update own notifications"
  on notifications for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
