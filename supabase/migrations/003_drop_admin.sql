-- Remove admin portal flag from profiles
drop index if exists public.profiles_is_admin_idx;

alter table public.profiles
  drop column if exists is_admin;
