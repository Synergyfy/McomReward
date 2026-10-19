import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Namespaced per app: cookies are shared across ports on the same host, so
  // the mall's `access`/`refresh` cookies must not be mistaken for ours.
  const accessToken = request.cookies.get('mcom_rewards_access');
  const refreshToken = request.cookies.get('mcom_rewards_refresh');

  // A valid refresh token is enough to restore the session client-side
  // (see AuthBootstrap). Redirecting purely on the access cookie would sign
  // users out as soon as the short-lived access cookie is missing.
  if (!accessToken && !refreshToken) {
    const signInUrl = new URL('/login', request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};
