# SabPadho Admin

An English-only admin app with its own entry point and build. The overview, learners, subjects, and mock tests are read-only sample data; only authentication and admin membership use Supabase.

## Set up Supabase

1. In your Supabase project, open **SQL Editor → New query** and run the migrations in [`database/migrations/`](../database/migrations) in filename order:

   - `20261120_001_create_admin_users.sql` — creates `public.admin_users`.
   - `20261120_002_align_admin_users_with_auth.sql` — keys the table by the Supabase Auth user id, **removes the placeholder `username` and `password` columns**, and restores the "read your own membership" row-level security policy. The portal identifies members by `user_id`; on the original table every membership check returned zero rows.

   Signed-in staff can only read their own membership row, and browser clients cannot add or edit members.

2. In **Authentication → Users → Add user → Create new user**, create the five accounts below. Enable **Auto Confirm User** only if you've verified that the account belongs to the intended person; otherwise use email confirmation. For an admin-only project, disable public signups in the Auth settings. If this is a shared project, leave existing signup settings intact.

   - `aditya@sabpadho.com`
   - `vallabh@sabpadho.com`
   - `aniket@sabpadho.com`
   - `rishabh@sabpadho.com`
   - `admin@sabpadho.com`

   Use unique, strong passwords. The proposed passwords were shared in chat and should not be used on a live project. Supabase Auth stores password hashes; never put passwords in `admin_users`, application code, or environment files — the table no longer has a password column at all.

3. Copy each intended account's **User UID** from Authentication → Users. In **Table Editor → admin_users → Insert row**, paste that UID into `user_id`; `permissionid` defaults to `1` and `created_at` to now. Repeat for each account. To revoke admin access, delete its membership row. The app checks membership at sign-in and when the session token changes. Any future live admin API or database policy must check membership on each protected request, not rely on the portal UI.

4. Copy `admin/.env.example` to `admin/.env.local`. From Supabase's **Connect** dialog or project settings, copy the project URL and **publishable** key into it. Never use a secret or `service_role` key in Vite. Restart the dev server after editing this file.

## Run and deploy

From the repository root:

```sh
npm ci
npm run admin:dev
```

The local dev server uses port `5174`. To deploy the portal separately, install from the repo root, set the same two public environment variables in the build environment, run `npm run admin:build`, and publish `admin/dist` to your admin host. The public site's existing `npm run build` still produces `dist` at the repo root.

## Sign in

The sign-in form has a **Show password** toggle (the eye button inside the password field) so you can confirm exactly what was typed before submitting. It also warns when Caps Lock is on.

Passwords are sent to Supabase exactly as typed — the portal never trims or rewrites them, because that would silently break a valid password. Submit the form to sign in; the email address is trimmed, but case is left to Supabase.

## Troubleshoot sign-in

The portal shows the Supabase error code under each message. `Invalid login credentials` is intentionally vague on Supabase's side (it must not reveal whether an email is registered), so check these in order:

1. **Does the account exist in this project?** The line under the form names the project host the portal is talking to. Compare it with the URL of the project where you created the users. To list accounts:

   ```sql
   select id, email, email_confirmed_at, last_sign_in_at from auth.users order by created_at desc;
   ```

2. **Was the password typed exactly as stored?** Turn on **Show password** and look for a leading or trailing space (common with autofill and copy/paste) or autocorrect. Caps Lock produces the warning under the field. Passwords are case-sensitive; emails are not.

3. **Was the account created in `admin_users` instead of Authentication?** Sign-in only reads Supabase Auth (`auth.users`). Rows in `admin_users` grant access to an existing Auth account; they never hold credentials.

4. **Is the email confirmed?** Unconfirmed accounts return `Email not confirmed`; the portal offers **Resend confirmation email**, and you can also confirm the user in Authentication → Users (⋮ → Confirm email).

5. **Did the account get created before "Auto Confirm" was on, or was signup disabled?** Manually re-set the password from Authentication → Users (⋮ → Reset password) or send a recovery link; do not recreate the user with a different email.

6. **Rate limits** return `Too many sign-in attempts`. Wait a minute before retrying.

If the password is accepted but the portal says **"This account does not have admin access."**, the Auth account is fine and only the membership row is missing — insert the account's UID into `admin_users.user_id`, or re-run migration `002` if the table still has the old columns.

## Verify access

- A valid Supabase account with a membership row should reach Overview.
- A valid account without a row should be denied, and an incorrect password should show a sign-in error.
- The password eye button should reveal and re-hide the typed password without clearing the field.
- Sign out and reload to confirm the portal returns to the sign-in form.
