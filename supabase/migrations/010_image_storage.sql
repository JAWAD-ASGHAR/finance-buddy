-- Image storage: profile avatars and expense attachments

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'images',
  'images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.profiles
  add column if not exists avatar_path text;

create table if not exists public.expense_attachments (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  content_type text not null,
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 5242880),
  sort_order smallint not null default 0 check (sort_order >= 0 and sort_order <= 2),
  created_at timestamptz not null default now(),
  unique (expense_id, storage_path)
);

create index if not exists expense_attachments_expense_id_idx
  on public.expense_attachments (expense_id);

create index if not exists expense_attachments_user_id_idx
  on public.expense_attachments (user_id);

create or replace function public.enforce_expense_attachment_limit()
returns trigger
language plpgsql
as $$
declare
  attachment_count integer;
begin
  select count(*)
  into attachment_count
  from public.expense_attachments
  where expense_id = new.expense_id;

  if attachment_count >= 3 then
    raise exception 'An expense can have at most 3 images';
  end if;

  return new;
end;
$$;

drop trigger if exists expense_attachments_limit on public.expense_attachments;

create trigger expense_attachments_limit
  before insert on public.expense_attachments
  for each row execute function public.enforce_expense_attachment_limit();

alter table public.expense_attachments enable row level security;

create policy "expense_attachments_select_own"
  on public.expense_attachments
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "expense_attachments_insert_own"
  on public.expense_attachments
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.expenses e
      where e.id = expense_id
        and e.user_id = (select auth.uid())
    )
  );

create policy "expense_attachments_delete_own"
  on public.expense_attachments
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Storage policies for the images bucket
create policy "images_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'images'
    and (
      (
        (storage.foldername(name))[1] = 'profiles'
        and (storage.foldername(name))[2] = (select auth.uid()::text)
      )
      or (
        (storage.foldername(name))[1] = 'expenses'
        and (storage.foldername(name))[2] = (select auth.uid()::text)
      )
    )
  );

create policy "images_select_profiles"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = 'profiles'
  );

create policy "images_select_expenses_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = 'expenses'
    and (storage.foldername(name))[2] = (select auth.uid()::text)
  );

create policy "images_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'images'
    and (
      (
        (storage.foldername(name))[1] = 'profiles'
        and (storage.foldername(name))[2] = (select auth.uid()::text)
      )
      or (
        (storage.foldername(name))[1] = 'expenses'
        and (storage.foldername(name))[2] = (select auth.uid()::text)
      )
    )
  )
  with check (
    bucket_id = 'images'
    and (
      (
        (storage.foldername(name))[1] = 'profiles'
        and (storage.foldername(name))[2] = (select auth.uid()::text)
      )
      or (
        (storage.foldername(name))[1] = 'expenses'
        and (storage.foldername(name))[2] = (select auth.uid()::text)
      )
    )
  );

create policy "images_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'images'
    and (
      (
        (storage.foldername(name))[1] = 'profiles'
        and (storage.foldername(name))[2] = (select auth.uid()::text)
      )
      or (
        (storage.foldername(name))[1] = 'expenses'
        and (storage.foldername(name))[2] = (select auth.uid()::text)
      )
    )
  );
