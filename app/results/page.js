import { listResults } from '../../lib/db';

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  let rows = [];
  let error = null;
  try {
    rows = await listResults();
  } catch (e) {
    error = 'Could not load results yet — make sure a Postgres database is connected to this project in Vercel (Storage tab), then reload.';
  }

  return (
    <div className="page">
      <div className="wrap">
        <div className="brand">
          <span className="chip">✨ Eng. Sabah&apos;s Class</span>
          <h1 style={{ fontSize: '1.6rem' }}>Teacher Results</h1>
          <p>Every student submission, newest first</p>
        </div>
        <div className="screen">
          {error && <p style={{ color: 'var(--bad)' }}>{error}</p>}
          {!error && rows.length === 0 && <p>No results yet — once students play, their scores will show up here.</p>}
          {!error && rows.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Student</th>
                    <th>Mission</th>
                    <th>Score</th>
                    <th>Best streak</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{new Date(r.created_at).toLocaleString()}</td>
                      <td>{r.avatar} {r.name}</td>
                      <td>{r.mission}</td>
                      <td>{r.score}/{r.total}</td>
                      <td>{r.best_streak}🔥</td>
                      <td>{Math.round(Number(r.finish_seconds))}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
