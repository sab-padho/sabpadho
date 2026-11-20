-- Align public.admin_users with the admin portal.
--
-- The first migration created a placeholder table with `username` and `password`
-- columns, but the portal signs in through Supabase Auth and looks members up by
-- their Auth user id (`user_id`). Two consequences:
--   1. Plaintext passwords sat in a public table even though nothing reads them.
--   2. The table's row-level security was enabled after a `drop policy` with no
--      matching `create policy`, so every membership check returned zero rows and
--      correctly signed-in admins were told they had no access.
-- This migration moves the table to `user_id`, removes the stored passwords, and
-- restores the "read your own membership" policy.

begin;

-- Fresh projects get the final shape straight away.
create table if not exists public.admin_users (
    user_id uuid primary key references auth.users (id) on delete cascade,
    permissionid integer not null default 1,
    created_at timestamptz not null default now()
);

alter table public.admin_users add column if not exists user_id uuid;

-- Carry legacy rows over by matching the placeholder username to an Auth email.
do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'admin_users'
          and column_name = 'username'
    ) then
        execute $mig$
            update public.admin_users as a
               set user_id = u.id
              from auth.users as u
             where a.user_id is null
               and lower(u.email) = lower(trim(a.username))
        $mig$;
    end if;
end
$$;

-- Memberships that never matched a real Auth account cannot grant access.
delete from public.admin_users as a
 where a.user_id is null
    or not exists (select 1 from auth.users as u where u.id = a.user_id);

-- Passwords belong to Supabase Auth (hashed), never to a public table.
alter table public.admin_users drop column if exists username;
alter table public.admin_users drop column if exists password;

alter table public.admin_users alter column user_id set not null;
alter table public.admin_users alter column permissionid set default 1;

-- Key the table by the Auth user id, one membership per account.
do $$
begin
    if not exists (
        select 1
        from pg_constraint as c
        join pg_attribute as a
          on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
        where c.conrelid = 'public.admin_users'::regclass
          and c.contype in ('p', 'u')
          and a.attname = 'user_id'
          and array_length(c.conkey, 1) = 1
    ) then
        execute 'alter table public.admin_users add constraint admin_users_pkey primary key (user_id)';
    end if;

    if not exists (
        select 1
        from pg_constraint as c
        join pg_attribute as a
          on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
        where c.conrelid = 'public.admin_users'::regclass
          and c.contype = 'f'
          and a.attname = 'user_id'
    ) then
        execute 'alter table public.admin_users add constraint admin_users_user_id_fkey '
             || 'foreign key (user_id) references auth.users (id) on delete cascade';
    end if;
end
$$;

-- Row-level security: a signed-in admin can read only their own membership row.
alter table public.admin_users enable row level security;

revoke all on table public.admin_users from public, anon, authenticated;
grant select on table public.admin_users to authenticated;

drop policy if exists "Read own admin membership" on public.admin_users;

create policy "Read own admin membership"
on public.admin_users
for select
to authenticated
using ((select auth.uid()) = user_id);

commit;
