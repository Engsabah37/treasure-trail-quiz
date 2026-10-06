import { NextResponse } from 'next/server';
import { saveResult, listResults } from '../../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, avatar, mission, score, total, bestStreak, finishSeconds } = body || {};
    if (
      typeof name !== 'string' ||
      typeof avatar !== 'string' ||
      typeof mission !== 'string' ||
      typeof score !== 'number' ||
      typeof total !== 'number'
    ) {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }
    await saveResult({
      name: name.slice(0, 40),
      avatar: avatar.slice(0, 8),
      mission,
      score,
      total,
      bestStreak: typeof bestStreak === 'number' ? bestStreak : 0,
      finishSeconds: typeof finishSeconds === 'number' ? finishSeconds : 0,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to save result', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rows = await listResults();
    return NextResponse.json({ ok: true, rows });
  } catch (err) {
    console.error('Failed to list results', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
