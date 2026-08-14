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

// Next 16 renombró Middleware a Proxy, pero el objeto de configuración se sigue leyendo
// por el export `config` (docs/01-app/01-getting-started/16-proxy.md). Exportarlo como
// `proxyConfig` no da error: el matcher simplemente no entra al manifiesto y esta capa
// nunca llega a ejecutarse en producción.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/session).*)'],
};
