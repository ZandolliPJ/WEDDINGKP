// middleware.js
// ═══════════════════════════════════════════════════════════
// Architecture sécurité simplifiée :
//
//  /bienvenue     → PUBLIC — accès direct pour tous les invités
//  /organisateur  → PROTÉGÉ — admin ou organisateur
//  /admin/*       → PROTÉGÉ — cookie "admin_session" requis
//  /api/*         → PROTÉGÉ — sauf routes publiques
// ═══════════════════════════════════════════════════════════
import { NextResponse } from 'next/server'

const SESSION_SECRET = process.env.SESSION_SECRET || 'kp-wedding-secret-token-2026'
const ORG_TOKEN = 'kp-organisateur-token-2026'

export function proxy(request) {
  const { pathname } = request.nextUrl

  // ── 1. Routes toujours publiques ──────────────────────────
  if (
    pathname.startsWith('/bienvenue') ||
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/public-tables') ||
    pathname.startsWith('/api/livredor') ||
    pathname.startsWith('/api/test-email') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/'

  ) {
    return NextResponse.next()
  }


  const adminSession = request.cookies.get('admin_session')
  const orgSession = request.cookies.get('org_session')
  const isAdmin = adminSession?.value === SESSION_SECRET
  const isOrg = orgSession?.value === ORG_TOKEN

  // ── 2. Protection /organisateur ───────────────────────────
  if (pathname.startsWith('/organisateur')) {
    if (isAdmin || isOrg) return NextResponse.next()
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // ── 3. Protection /admin ──────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!isAdmin) return NextResponse.redirect(new URL('/admin/login', request.url))
    return NextResponse.next()
  }

  // ── 4. Protection /api ────────────────────────────────────
  const isApiProtected = pathname.startsWith('/api') &&
    !pathname.startsWith('/api/auth') &&
    !pathname.startsWith('/api/public-tables') &&
    !pathname.startsWith('/api/livredor') &&
    !pathname.startsWith('/api/test-email')

  if (isApiProtected) {
    if (pathname.startsWith('/api/guests') && (isAdmin || isOrg)) return NextResponse.next()
    if (pathname.startsWith('/api/photos') && (isAdmin || isOrg)) return NextResponse.next()
    if (pathname.startsWith('/api/folders') && (isAdmin || isOrg)) return NextResponse.next()
    if (!isAdmin) return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/organisateur/:path*',
    '/api/:path*',
  ],
}
