import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const haySesion = request.cookies.has('sesion');
  const esLogin = request.nextUrl.pathname.startsWith('/login');

  if (!haySesion && !esLogin) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('volver', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  if (haySesion && esLogin) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const proxyConfig = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/session).*)'],
};
