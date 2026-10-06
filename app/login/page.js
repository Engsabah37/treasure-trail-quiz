'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push(params.get('next') || '/teacher');
      } else {
        setError(data.error || 'Wrong password');
      }
    } catch {
      setError('Something went wrong — try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="wrap">
        <div className="brand">
          <span className="chip">✨ Eng. Sabah&apos;s Class</span>
          <h1 style={{ fontSize: '1.6rem' }}>Teacher Login</h1>
          <p>This page is for you only — students never see it.</p>
        </div>
        <div className="screen">
          <form onSubmit={submit}>
            <p className="field-label">Password</p>
            <input
              className="name-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && <p style={{ color: 'var(--bad)', fontSize: '.85rem', marginTop: -8, marginBottom: 14 }}>{error}</p>}
            <button className="start-btn" type="submit" disabled={loading}>
              {loading ? 'Checking…' : 'Enter ▸'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
