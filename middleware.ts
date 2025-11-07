/**
 * Next.js Middleware
 *
 * Suojaa autentikoituja reittejä ja käsittelee Supabase-istunnon.
 *
 * TÄRKEÄ: Tämä middleware tarkistaa Supabase-autentikoinnin
 * ja ohjaa kirjautumattomat käyttäjät /login -sivulle.
 */

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/database.types';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Päivitä istunto (tärkeää autentikoinnin toimimiseksi)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Tarkista onko käyttäjä kirjautunut
  const isAuthenticated = !!session;

  // Määrittele suojatut reitit
  const protectedRoutes = ['/dashboard', '/onboarding', '/profile'];
  const authRoutes = ['/login'];

  const path = req.nextUrl.pathname;

  // Jos käyttäjä yrittää päästä suojatulle reitille ilman autentikointia
  if (
    protectedRoutes.some((route) => path.startsWith(route)) &&
    !isAuthenticated
  ) {
    // Tallenna alkuperäinen URL, jotta voidaan ohjata takaisin kirjautumisen jälkeen
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }

  // Jos kirjautunut käyttäjä yrittää päästä kirjautumissivulle
  if (authRoutes.some((route) => path.startsWith(route)) && isAuthenticated) {
    // Tarkista redirect-parametri
    const redirect = req.nextUrl.searchParams.get('redirect');
    if (redirect) {
      return NextResponse.redirect(new URL(redirect, req.url));
    }
    // Ohjaa Dashboardiin
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

/**
 * Määrittele mitkä reitit käyttävät middlewarea
 *
 * HUOM: matcher-sääntö on tarkkaan määritelty välttämään
 * middleware-suorituksia staattisille resursseille (_next/*, api/*, etc.)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
