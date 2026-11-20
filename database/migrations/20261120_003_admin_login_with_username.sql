-- Simple staff credentials: username + password + permissionid, nothing else.
--
-- The portal no longer uses Supabase Auth (which forces an email-shaped identifier);
-- it calls `public.admin_login(username, password)`, a SECURITY DEFINER function that
-- compares the credentials against `public.admin_users` and returns only the username
-- and permission id. Passwords never travel to the browser.
--
-- This migration converges the table from either earlier shape:
--   * migration 001: username / password / permissionid / created_at  (the target)
--   * migration 002: user_id (auth.users) / permissionid / created_at

begin;

-- Needed for bcrypt password checks below (Supabase keeps it in `extensions`).
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.admin_users (
    username text primary key,
    password text not null,
    permissionid integer not null default 1,
    created_at timestamptz not null default now()
);

alter table public.admin_users add column if not exists username text;
alter table public.admin_users add column if not exists password text;
alter table public.admin_users add column if not exists permissionid integer not null default 1;
alter table public.admin_users add column if not exists created_at timestamptz not null default now();

-- Admins are identified by username now, so the Auth user id means nothing here.
do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'admin_users'
          and column_name = 'user_id'
    ) then
        execute 'alter table public.admin_users drop column user_id cascade';
    end if;
end
$$;

-- Rows carried over from the auth-based schema have no credentials and cannot sign in.
delete from public.admin_users where username is null or password is null;

update public.admin_users set permissionid = 1 where permissionid is null;

alter table public.admin_users alter column username set not null;
alter table public.admin_users alter column password set not null;
alter table public.admin_users alter column permissionid set not null;
alter table public.admin_users alter column permissionid set default 1;

-- One row per username, so inserts can use `on conflict (username) do update`.
do $$
begin
    if not exists (
        select 1
        from pg_constraint as c
        join pg_attribute as a
          on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
        where c.conrelid = 'public.admin_users'::regclass
          and c.contype in ('p', 'u')
          and a.attname = 'username'
          and array_length(c.conkey, 1) = 1
    ) then
        execute 'alter table public.admin_users add constraint admin_users_username_unique unique (username)';
    end if;
end
$$;

-- Sign-in ignores case, so `Admin` and `admin` must not be two accounts.
create unique index if not exists admin_users_username_lower_key
    on public.admin_users (lower(username));

-- Credentials check. Rows may store a bcrypt hash (crypt()) or, for quick hand-inserted
-- dev rows, a plain value; both are accepted. Only username + permission id are returned.
create or replace function public.admin_login(p_username text, p_password text)
returns table (username text, permissionid integer)
language sql
security definer
set search_path = ''
as $$
    select a.username, a.permissionid
    from public.admin_users as a
    where lower(a.username) = lower(btrim(p_username))
      and case
            when a.password like '$2%' then a.password = extensions.crypt(p_password, a.password)
            else a.password = p_password
          end
    limit 1;
$$;

-- The table itself stays private: no client reads or writes, only the function above.
alter table public.admin_users enable row level security;

drop policy if exists "Read own admin membership" on public.admin_users;

revoke all on table public.admin_users from public, anon, authenticated;

revoke all on function public.admin_login(text, text) from public;
grant execute on function public.admin_login(text, text) to anon, authenticated;

commit;
