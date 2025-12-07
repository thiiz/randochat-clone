import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

// Rotas que requerem autenticação
const protectedRoutes = ['/home'];

// Rotas públicas de autenticação (redireciona para /home se já logado)
const authRoutes = ['/sign-in', '/sign-up'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Obtém o cookie de sessão (verificação rápida, sem chamada ao banco)
  const sessionCookie = getSessionCookie(request);

  // Verifica se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Verifica se é uma rota de autenticação
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Se não tem sessão e tenta acessar rota protegida, redireciona para login
  if (isProtectedRoute && !sessionCookie) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Se já tem sessão e tenta acessar rotas de auth, redireciona para home
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
