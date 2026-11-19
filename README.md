# SabPadho


Sab padho, sab badho.

SabPadho is a bilingual SSC CGL & CHSL preparation workspace: public chapter primers, short topic sprints with worked reasoning, timed mock papers, and a revision queue that gives every missed question a return date.

This repository is the preview build — it runs entirely on sample data in the browser. There is no backend, account system or database in this phase.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle
npm run preview  # serve the production bundle
```

Requires Node 20+.

## What is in the build

**Public site**

- `/` — product tour with a live-feeling study-desk preview
- `/subjects`, `/subjects/:subject`, `/subjects/:subject/:chapter` — 5 subjects, 25 chapters, worked examples
- `/mocks` — the mock series and the marking scheme
- `/how-it-works` — the four journeys through the product
- `/signin` — demo sign-in (no credentials are stored)

**Study workspace**

- `/app` — study desk: continue a sprint, weekly activity, subjects, revision queue
- `/app/practice` — pick a subject, chapter and length, then a one-question-at-a-time sprint with reasoning and save-to-shelf
- `/app/practice/:chapter?len=N` — the sprint runner
- `/app/mocks`, `/app/mocks/:id/instructions`, `/app/mocks/:id/attempt`, `/app/mocks/:id/result` — instructions, exam hall with server-style clock and palette, and a scored result with section and chapter breakdown
- `/app/revision` — recall calendar, due questions, retry dialog that hides the previous answer
- `/app/shelf` — saved questions with answers and reasoning
- `/app/progress` — accuracy, study time, weekly activity, chapter pulse and mock history
- `/app/settings` — the single dark-theme switch, question language, sprint defaults

## Design notes

- Light lavender canvas with white cards by default; one persisted dark theme (`sabpadho-theme`), applied before paint so there is no flash.
- Purple primary `#6a45e8`, gold accent `#b07d24`, Inter for text, Plus Jakarta Sans for display, Noto Sans Devanagari for Hindi.
- Hairline borders, 14px card radius, no decorative gradients. Tokens live in `src/index.css`.
- Mobile-first: five-item tab bar, sticky study-desk header, exam hall that hides the app chrome, and layouts that hold at 360–1440px.

## Data and persistence

All content lives in `src/data` — subjects, questions, mock papers, the demo learner and generated chapter notes. Progress, saved questions, revision dates and preferences are kept in `localStorage` under `sabpadho-*` keys; **Preferences → Clear preview data** removes them (theme and language are kept).

Bilingual content is stored per field (`{ en, hi }`). Option order is identical in both languages, so switching language cannot change which option is selected.

## Stack

Vite 8, React 19, TypeScript 7, React Router 7, Tailwind CSS 4 and lucide-react icons. No UI kit, no chart library, no state library.

SabPadho is an independent study aid and is not affiliated with the Staff Selection Commission.
