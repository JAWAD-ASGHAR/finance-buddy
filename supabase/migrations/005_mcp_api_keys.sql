-- Personal API keys for external MCP / API access

create table if not exists mcp_api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create index if not exists mcp_api_keys_user_id_idx on mcp_api_keys(user_id);
create index if not exists mcp_api_keys_key_hash_idx on mcp_api_keys(key_hash);

alter table mcp_api_keys enable row level security;

create policy "Users can view own api keys"
  on mcp_api_keys for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own api keys"
  on mcp_api_keys for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own api keys"
  on mcp_api_keys for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own api keys"
  on mcp_api_keys for delete
  to authenticated
  using ((select auth.uid()) = user_id);
