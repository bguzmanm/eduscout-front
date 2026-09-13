import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE = 'eduscout_admin_session';
const CANDIDATE_COOKIE = 'eduscout_candidate_session';

export const config = {
  matcher: ['/admin/:path*', '/alertas/:path*'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/alertas')) {
    const token = request.cookies.get(CANDIDATE_COOKIE)?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/perfil', request.url));
    }
    return NextResponse.next();
  }

  if (pathname === '/admin/login') {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}