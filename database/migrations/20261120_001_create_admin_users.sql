begin;

create table if not exists public.admin_users (
    username text primary key,
    password text not null,
    permissionid integer not null,
    created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

revoke all on table public.admin_users
from public, anon, authenticated;

grant select on table public.admin_users to authenticated;

drop policy if exists "Read own admin membership"
on public.admin_users;

commit;