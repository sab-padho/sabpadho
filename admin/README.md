# SabPadho Admin

An English-only admin app with its own entry point and build. The overview, learners, subjects, and mock tests are read-only sample data; only authentication and admin membership use Supabase.

## Set up Supabase

1. In your Supabase project, open **SQL Editor → New query**. Paste and run [`supabase/admin-users.sql`](supabase/admin-users.sql). It creates `public.admin_users` with row-level security: signed-in users can only read their own membership, and browser clients cannot add or edit members.
2. In **Authentication → Users → Add user → Create new user**, create the five accounts below. Enable **Auto Confirm User** only if you've verified that the account belongs to the intended person; otherwise use email confirmation. For an admin-only project, disable public signups in the Auth settings. If this is a shared project, leave existing signup settings intact.

   - `aditya@sabpadho.com`
   - `vallabh@sabpadho.com`
   - `aniket@sabpadho.com`
   - `rishabh@sabpadho.com`
   - `admin@sabpadho.com`

   Use unique, strong passwords. The proposed passwords were shared in chat and should not be used on a live project. Supabase Auth stores password hashes; never put passwords in `admin_users`, application code, or environment files.

3. Copy each intended account's **User UID** from Authentication → Users. In **Table Editor → admin_users → Insert row**, paste that UID into `user_id`; leave `created_at` at its default. Repeat for each account. To revoke admin access, delete its membership row. The app checks membership at sign-in and when the session token changes. Any future live admin API or database policy must check membership on each protected request, not rely on the portal UI.
4. Copy `admin/.env.example` to `admin/.env.local`. From Supabase's **Connect** dialog or project settings, copy the project URL and **publishable** key into it. Never use a secret or `service_role` key in Vite. Restart the dev server after editing this file.

## Run and deploy

From the repository root:

```sh
npm ci
npm run admin:dev
```

The local dev server uses port `5174`. To deploy the portal separately, install from the repo root, set the same two public environment variables in the build environment, run `npm run admin:build`, and publish `admin/dist` to your admin host. The public site's existing `npm run build` still produces `dist` at the repo root.

## Verify access

- A valid Supabase account with a membership row should reach Overview.
- A valid account without a row should be denied, and an incorrect password should show a sign-in error.
- Sign out and reload to confirm the portal returns to the sign-in form.
