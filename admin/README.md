# SabPadho Admin

An English-only admin app with its own entry point and build. The overview, learners, subjects, and mock tests are read-only sample data.

Staff sign in with a username and password; accounts are managed in Supabase.

## Run

From the repository root:

```sh
npm ci
npm run admin:dev
```

The dev server uses port `5174`. `npm run admin:build` emits `admin/dist` for a separate admin host; the public site's `npm run build` still writes `dist` at the repo root.
