// middleware.js — racine du projet
// ─────────────────────────────────────────────────
// Protège toutes les routes /admin/*
// Redirige vers /admin/login si non authentifié
// ─────────────────────────────────────────────────

import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  const SESSION_SECRET = process.env.SESSION_SECRET || 'kp-wedding-secret-token-2026'

  // Routes publiques — toujours accessibles
  if (
    pathname.startsWith('/bienvenue') ||
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/public-tables') ||
    pathname.startsWith('/api/rsvp') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // Protection des routes /admin et /api (sauf /api/auth)
  const isAdminRoute = pathname.startsWith('/admin')
  const isApiRoute   = pathname.startsWith('/api') && 
    !pathname.startsWith('/api/auth') &&
    !pathname.startsWith('/api/public-tables') &&
    !pathname.startsWith('/api/rsvp')

  if (isAdminRoute || isApiRoute) {
    const session = request.cookies.get('admin_session')

    if (!session || session.value !== SESSION_SECRET) {
      // Redirection vers la page de login
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
}
