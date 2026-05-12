// middleware.js
// ═══════════════════════════════════════════════════════════
// Architecture sécurité :
//
//  /confirmation  → PUBLIC — entrée obligatoire invités
//  /bienvenue     → PROTÉGÉ — cookie "bienvenue_ok" requis
//                   OU cookie "admin_session" (bypass admin)
//  /admin/*       → PROTÉGÉ — cookie "admin_session" requis
//  /api/*         → PROTÉGÉ — cookie "admin_session" requis
//                   (sauf routes publiques)
// ═══════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'

const SESSION_SECRET = process.env.SESSION_SECRET || 'kp-wedding-secret-token-2026'
const BIENVENUE_TOKEN = process.env.BIENVENUE_TOKEN || 'balade2026'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // ── 1. Routes toujours publiques ──────────────────────────
  if (
    pathname.startsWith('/confirmation') ||
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/public-tables') ||
    pathname.startsWith('/api/rsvp') ||
    pathname.startsWith('/api/livredor') ||
    pathname.startsWith('/api/confirmation') ||
    pathname.startsWith('/api/confirm') ||
    pathname.startsWith('/api/bienvenue-access') ||
    pathname.startsWith('/api/test-email') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  const adminSession = request.cookies.get('admin_session')
  const isAdmin = adminSession?.value === SESSION_SECRET

  // ── 2. Protection /bienvenue ──────────────────────────────
  //    Accessible si : admin OU cookie bienvenue_ok valide
  if (pathname.startsWith('/bienvenue')) {
    if (isAdmin) return NextResponse.next()

    const bienvenueOk = request.cookies.get('bienvenue_ok')
    if (bienvenueOk?.value === BIENVENUE_TOKEN) return NextResponse.next()

    // Non autorisé → redirection vers /confirmation
    const url = new URL('/confirmation', request.url)
    url.searchParams.set('redirect', 'bienvenue')
    return NextResponse.redirect(url)
  }

  // ── 3. Protection /admin et /api ─────────────────────────
  const isAdminRoute = pathname.startsWith('/admin')
  const isApiRoute = pathname.startsWith('/api') &&
    !pathname.startsWith('/api/auth') &&
    !pathname.startsWith('/api/public-tables') &&
    !pathname.startsWith('/api/rsvp') &&
    !pathname.startsWith('/api/livredor') &&
    !pathname.startsWith('/api/confirmation') &&
    !pathname.startsWith('/api/confirm')

  if (isAdminRoute || isApiRoute) {
    if (!isAdmin) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/bienvenue/:path*',
    '/admin/:path*',
    '/api/:path*',
    '/confirmation/:path*',
  ],
}
