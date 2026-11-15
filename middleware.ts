import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that strictly require authentication
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/abdm');

  if (isProtectedRoute) {
    const sessionCookie = request.cookies.get('caresync_session');

    // If no session cookie exists, redirect to /login
    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('unauthorized', 'true');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/abdm/:path*',
  ],
};
