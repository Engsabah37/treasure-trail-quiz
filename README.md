# Treasure Trail — Unit 1 Review Game

A pastel treasure-hunt review game for WE ATS Grade 1 / Unit 1 (Basic Computer
Hardware & Software), built with Next.js. Covers all 275 Question Bank items
(packaged as 260 interactive questions — the 5 "match the column" groups are
each one matching exercise holding all 4 of their pairs).

- Mixed question types, each with its own UI: True/False, Multiple Choice,
  Fill-in-the-blank, Matching (tap-to-pair), and Essay/Compare (type-then-reveal
  self-check).
- Mission picker: play one lesson at a time, or the full marathon.
- Streak counter + confetti celebration on reaching the treasure.
- Race Map screen with ghost rivals, paced to the chosen mission's length.
- Every finished game is saved to a Postgres database, with a `/results`
  page for the teacher to see every student's score.
- A QR code (pointing at the page's own URL) shows on the start and end
  screens, and disappears while a student is mid-quiz.

## Deploying on Vercel (first time)

1. **Import the project**
   - Go to [vercel.com/new](https://vercel.com/new) and import this GitHub
     repository (`treasure-trail-quiz`).
   - Framework preset: Next.js (detected automatically). Click **Deploy**.
   - The first deploy will work for playing the game, but scores won't save
     yet — that needs a database (next step).

2. **Add a Postgres database**
   - In your Vercel project, open the **Storage** tab.
   - Click **Create Database** → choose **Postgres** (Vercel's own, powered
     by Neon) → create it, and **Connect** it to this project.
   - Vercel automatically adds the `POSTGRES_URL` (and related) environment
     variables — no manual setup needed.
   - Go to **Deployments** → redeploy the latest deployment (or just push
     any commit) so the app picks up the new environment variables.

3. **Done**
   - Open your deployment's URL — that's the link/QR code students scan.
   - Visit `/results` on the same domain any time to see every submitted
     score.

## Local development

```bash
npm install
npm run dev
```

Without a `POSTGRES_URL` env var set locally, the game itself still works —
only the save-to-database call (and the `/results` page) need the database.

## Project structure

- `app/page.js` — the game page
- `components/GameApp.jsx` — game state machine (start/game/end screens)
- `components/QuestionCard.jsx` — per-type question UI (TF/MCQ/Fill/Match/Essay)
- `components/QRBox.jsx` — the QR code box
- `app/api/results/route.js` — saves/lists results (Postgres)
- `app/results/page.js` — teacher's results table
- `data/questions.json` — all 260 question records
