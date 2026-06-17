-- Unique usernames for friend search and sharing

alter table public.profiles
  add column username text;

-- Backfill from sign-in email local part
update public.profiles p
set username = lower(regexp_replace(split_part(u.email, '@', 1), '[^a-z0-9_]', '', 'g'))
from auth.users u
where p.id = u.id
  and p.username is null;

update public.profiles
set username = 'user_' || substr(replace(id::text, '-', ''), 1, 8)
where username is null
   or length(username) < 3;

-- Resolve duplicate usernames
with ranked as (
  select
    id,
    username,
    row_number() over (partition by username order by created_at, id) as rn
  from public.profiles
  where username is not null
)
update public.profiles p
set username = left(p.username, 24) || '_' || substr(replace(p.id::text, '-', ''), 1, 4)
from ranked r
where p.id = r.id
  and r.rn > 1;

create unique index profiles_username_unique_idx on public.profiles (username);
