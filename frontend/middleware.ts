import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/auth/login', '/auth/register'];
const AUTH_PATHS = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read auth state from cookie (we'll store it there)
  const authCookie = request.cookies.get('scaleafrique-auth');
  let isAuthenticated = false;

  if (authCookie?.value) {
    try {
      const parsed = JSON.parse(decodeURIComponent(authCookie.value));
      isAuthenticated = parsed?.state?.isAuthenticated === true;
    } catch {}
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && AUTH_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login for protected paths
  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/auth/');
  if (!isAuthenticated && !isPublic && pathname !== '/onboarding') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
