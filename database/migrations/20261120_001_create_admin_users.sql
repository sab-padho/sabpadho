begin;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from public, anon, authenticated;
grant select on table public.admin_users to authenticated;

drop policy if exists "Read own admin membership" on public.admin_users;
create policy "Read own admin membership"
  on public.admin_users for select to authenticated
  using ((select auth.uid()) = user_id);

commit;
