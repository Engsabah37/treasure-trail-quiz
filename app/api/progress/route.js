import { NextResponse } from 'next/server';
import { upsertSession, listSessions } from '../../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, name, avatar, mission, idx, total, score, streak, status } = body || {};
    if (typeof sessionId !== 'string' || typeof total !== 'number') {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }
    await upsertSession({
      sessionId,
      name: (name || 'Explorer').slice(0, 40),
      avatar: (avatar || '🧑‍🚀').slice(0, 8),
      mission: mission || '',
      idx: typeof idx === 'number' ? idx : 0,
      total,
      score: typeof score === 'number' ? score : 0,
      streak: typeof streak === 'number' ? streak : 0,
      status: status === 'finished' ? 'finished' : 'playing',
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to save progress', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rows = await listSessions();
    return NextResponse.json({ ok: true, rows });
  } catch (err) {
    console.error('Failed to list sessions', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
