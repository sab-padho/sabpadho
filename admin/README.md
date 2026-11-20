# SabPadho Admin

An English-only admin app with its own entry point and build. The overview, learners, subjects, and mock tests are read-only sample data; only sign-in uses Supabase.

## How sign-in works

Admins sign in with a **username** and password — not an email address. Credentials live in `public.admin_users`:

| Column         | Type        | Notes                                  |
| -------------- | ----------- | -------------------------------------- |
| `username`     | `text`      | unique, case-insensitive at sign-in    |
| `password`     | `text`      | plain value or a bcrypt hash (`$2…`)   |
| `permissionid` | `integer`   | defaults to `1`                        |
| `created_at`   | `timestamptz` | defaults to now                      |

The browser calls one RPC, `public.admin_login(p_username, p_password)`. It is `security definer`, so:

- the comparison happens inside Postgres and the browser never receives a password or hash — only `username` and `permissionid`, and only when the credentials match;
- `admin_users` grants nothing to `anon`/`authenticated` and has no row-level security policy, so the table cannot be read or written through the API with the publishable key.

The signed-in state is a `sessionStorage` flag in the portal. That is fine for this preview build, where every screen is sample data — it is **not** an authorisation boundary. Before the portal reads or writes anything real, move each protected action behind a server-side check (an RPC or Edge Function that re-verifies the credentials or a signed token); do not rely on the portal UI.

## Set up Supabase

1. In your Supabase project, open **SQL Editor → New query** and run the migrations in [`database/migrations/`](../database/migrations) in filename order. The last one, `20261120_003_admin_login_with_username.sql`, is what the portal needs: it restores the `username`/`password`/`permissionid` columns, drops the Auth-linked `user_id` column, and creates the `admin_login` function. Re-running it is safe.

2. Insert the staff accounts. Plain values work immediately:

   ```sql
   insert into public.admin_users (username, password, permissionid) values
       ('admin',   'Admin@123',   1),
       ('aditya',  'Aditya@123',  2),
       ('vallabh', 'Vallabh@123', 3),
       ('aniket',  'Aniket@123',  4),
       ('rishabh', 'Rishabh@123', 5)
   on conflict (username) do update
       set password = excluded.password,
           permissionid = excluded.permissionid;
   ```

   To store bcrypt hashes instead, wrap the value in `extensions.crypt('…', extensions.gen_salt('bf'))`. Both forms are accepted by `admin_login`, so you can switch row by row:

   ```sql
   update public.admin_users
      set password = extensions.crypt(password, extensions.gen_salt('bf'))
    where password not like '$2%';
   ```

   Use unique, strong passwords. The values above are placeholders that have been shared in chat — replace them and store them **only** in the database. Never commit passwords to SQL files, application code, or `.env`.

3. Copy `admin/.env.example` to `admin/.env.local` and fill in the project URL and **publishable** key from Supabase's **Connect** dialog. Never use a secret or `service_role` key in Vite. Restart the dev server after editing this file.

To change a password, update the row (`update public.admin_users set password = '…' where username = 'aditya';`). To revoke access, delete the row. Usernames are unique ignoring case, so `Admin` and `admin` are the same account.

## Run and deploy

From the repository root:

```sh
npm ci
npm run admin:dev
```

The local dev server uses port `5174`. To deploy the portal separately, install from the repo root, set the same two public environment variables in the build environment, run `npm run admin:build`, and publish `admin/dist` to your admin host. The public site's existing `npm run build` still produces `dist` at the repo root.

## Sign in

The form takes a **username** and password. The password field has a **Show password** toggle (the eye button) so you can confirm what was typed, and it warns when Caps Lock is on. The username is trimmed and matched case-insensitively; the **password is sent exactly as typed** — it is never trimmed, because that would silently break a valid password.

A successful sign-in keeps `{ username, permissionid }` in `sessionStorage`, so a reload stays signed in but closing the tab signs you out. **Sign out** clears it.

## Troubleshoot sign-in

- **"That username and password did not match an admin account."** — the function returned no row. Check the spelling, then the row itself:

  ```sql
  select username, permissionid, created_at from public.admin_users order by permissionid;
  ```

  The password is compared byte for byte (or as a bcrypt hash), so `Admin@123 ` with a trailing space does not match. Use **Show password** to check.

- **"The admin sign-in function is missing from this project."** — run migration `003`.
- **"The portal is not allowed to run the admin sign-in function."** — re-run migration `003` to restore `grant execute … to anon, authenticated`.
- **"Could not reach Supabase."** — the URL/publishable key in `admin/.env.local` is wrong or empty; the project host under the form shows which project the portal is pointing at.
- **Hashed vs plain rows.** A row whose password starts with `$2` is treated as bcrypt; anything else is compared as plain text. If you paste a hash and it does not start with `$2`, sign-in will fail — re-hash with `extensions.crypt(...)`.

Because the login RPC is reachable with the publishable key, add rate limiting (a counter table inside the function, or Supabase's edge rate limits) before this portal faces the public internet.

## Verify access

- The seeded accounts reach Overview with the right permission id in the topbar.
- A wrong password shows the "did not match" message and stays on the form.
- The password eye button reveals and re-hides the typed password without clearing the field.
- Sign out and reload to confirm the portal returns to the sign-in form.
- With the publishable key, `select * from admin_users` through the REST API returns no rows (permission denied) — only `admin_login` can read it.
