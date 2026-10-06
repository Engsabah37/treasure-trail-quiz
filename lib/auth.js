// Uses the Web Crypto API (not Node's `crypto` module) so this also works
// in the Edge runtime, where middleware.js runs.
const COOKIE_NAME = 'teacher_auth';

function secret() {
  return process.env.TEACHER_PASSWORD || '';
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// A simple token derived from the password, so the raw password never sits
// in the browser's cookie jar. Good enough for a single shared classroom
// password — not meant to protect anything more sensitive than quiz scores.
export async function makeToken() {
  return sha256Hex('ttq:' + secret());
}

export async function isValidToken(token) {
  if (!secret() || !token) return false;
  const expected = await makeToken();
  return token === expected;
}

export { COOKIE_NAME };
