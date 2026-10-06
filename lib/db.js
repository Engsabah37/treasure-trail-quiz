import { neon } from '@neondatabase/serverless';

// Vercel's Postgres storage (Storage tab → Create Database → Postgres,
// backed by Neon) auto-injects one of these env vars once connected to the
// project. No manual setup needed beyond connecting it in the dashboard.
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING;

function getSql() {
  if (!connectionString) {
    throw new Error(
      'No database connection string found. In Vercel, add a Postgres database under the Storage tab and connect it to this project, then redeploy.'
    );
  }
  return neon(connectionString);
}

let ensured = false;

// Idempotent: creates the results table on first use. Fine for a small
// classroom project — no separate migration step needed before deploying.
async function ensureTable(sql) {
  if (ensured) return;
  await sql`
    CREATE TABLE IF NOT EXISTS results (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      avatar TEXT NOT NULL,
      mission TEXT NOT NULL,
      score INT NOT NULL,
      total INT NOT NULL,
      best_streak INT NOT NULL DEFAULT 0,
      finish_seconds NUMERIC NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  ensured = true;
}

export async function saveResult({ name, avatar, mission, score, total, bestStreak, finishSeconds }) {
  const sql = getSql();
  await ensureTable(sql);
  await sql`
    INSERT INTO results (name, avatar, mission, score, total, best_streak, finish_seconds)
    VALUES (${name}, ${avatar}, ${mission}, ${score}, ${total}, ${bestStreak}, ${finishSeconds});
  `;
}

export async function listResults() {
  const sql = getSql();
  await ensureTable(sql);
  const rows = await sql`
    SELECT id, name, avatar, mission, score, total, best_streak, finish_seconds, created_at
    FROM results
    ORDER BY created_at DESC
    LIMIT 500;
  `;
  return rows;
}
