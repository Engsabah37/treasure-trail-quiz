import { NextResponse } from 'next/server';
import { COOKIE_NAME, isValidToken } from './lib/auth';

// Gates the teacher-only pages and their read APIs behind a single shared
// password (set as TEACHER_PASSWORD in Vercel). Students never hit this —
// their only writes are POST /api/progress and POST /api/results, which
// stay open so the game itself needs no login.
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const authed = await isValidToken(token);

  const isApi = pathname.startsWith('/api/');
  const isProtectedApiRead = (pathname === '/api/progress' || pathname === '/api/results') && request.method === 'GET';

  if (isApi) {
    if (isProtectedApiRead && !authed) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (!authed && pathname !== '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  if (authed && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/teacher';
    url.search = '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/teacher', '/results', '/login', '/api/progress', '/api/results'],
};
