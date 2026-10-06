'use client';
import { useEffect, useState } from 'react';
import { LESSON_NAMES } from '../lib/constants';

function timeAgo(iso) {
  const sec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 60) return sec + 's ago';
  return Math.round(sec / 60) + 'm ago';
}

export default function TeacherDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    try {
      const res = await fetch('/api/progress', { cache: 'no-store' });
      const data = await res.json();
      if (data.ok) {
        setRows(data.rows);
        setError(null);
      } else {
        setError(data.error || 'Could not load progress.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  async function logout() {
    await fetch('/api/login', { method: 'DELETE' });
    window.location.href = '/login';
  }

  const playing = rows.filter((r) => r.status !== 'finished');
  const finished = rows.filter((r) => r.status === 'finished');

  return (
    <div className="page">
      <div className="wrap" style={{ maxWidth: 680 }}>
        <div className="brand">
          <span className="chip">✨ Eng. Sabah&apos;s Class</span>
          <h1 style={{ fontSize: '1.6rem' }}>Live Progress</h1>
          <p>Updates every 5 seconds · last 18 hours</p>
        </div>
        <div className="screen">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <a href="/results" style={{ fontSize: '.78rem', color: 'var(--lav-deep)', fontWeight: 800, textDecoration: 'none' }}>
              📜 See finished history ▸
            </a>
            <button className="close-btn" onClick={logout}>Log out</button>
          </div>

          {loading && <p>Loading…</p>}
          {error && <p style={{ color: 'var(--bad)' }}>{error}</p>}

          {!loading && !error && rows.length === 0 && (
            <p>No one has opened the game yet — once a student starts, they&apos;ll show up here live.</p>
          )}

          {playing.length > 0 && (
            <>
              <p className="field-label" style={{ marginTop: 4 }}>🟢 Playing now ({playing.length})</p>
              <div className="standings" style={{ marginBottom: 18 }}>
                {playing.map((r) => <Row key={r.session_id} r={r} />)}
              </div>
            </>
          )}

          {finished.length > 0 && (
            <>
              <p className="field-label">✅ Finished ({finished.length})</p>
              <div className="standings">
                {finished.map((r) => <Row key={r.session_id} r={r} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ r }) {
  const pct = r.total ? Math.min(100, Math.round((r.idx / r.total) * 100)) : 0;
  const stale = r.status !== 'finished' && Date.now() - new Date(r.updated_at).getTime() > 2 * 60 * 1000;
  return (
    <div className="standing-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="ava">{r.avatar}</span>
        <span className="nm">{r.name}</span>
        <span style={{ fontSize: '.72rem', color: 'var(--ink-soft)' }}>{LESSON_NAMES[r.mission] || r.mission}</span>
        <span style={{ fontSize: '.78rem', fontWeight: 800 }}>
          {r.status === 'finished' ? '✅' : stale ? '🟡 away' : '🟢'} {r.score}/{r.total}
          {r.streak >= 2 ? ' · 🔥' + r.streak : ''}
        </span>
      </div>
      <div className="mini-trail">
        <div className="fill" style={{ width: pct + '%' }} />
      </div>
      <span style={{ fontSize: '.68rem', color: 'var(--ink-soft)' }}>
        {r.idx}/{r.total} · {timeAgo(r.updated_at)}
      </span>
    </div>
  );
}
