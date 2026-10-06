import { NextResponse } from 'next/server';
import { COOKIE_NAME, makeToken } from '../../../lib/auth';

export async function POST(request) {
  const { password } = await request.json().catch(() => ({}));
  const expected = process.env.TEACHER_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      { ok: false, error: 'TEACHER_PASSWORD is not set in this deployment yet.' },
      { status: 500 }
    );
  }
  if (password !== expected) {
    return NextResponse.json({ ok: false, error: 'Wrong password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, await makeToken(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return res;
}
