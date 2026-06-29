// middleware.js
// ═══════════════════════════════════════════════════════════
// Profils :
//   ADMIN        → accès complet /admin/*
//   ORGANISATEUR → /organisateur (lecture + modif invités)
//   INVITÉ       → /bienvenue (avec cookie bienvenue_ok)
// ═══════════════════════════════════════════════════════════
import { NextResponse } from 'next/server'

const SESSION_SECRET  = process.env.SESSION_SECRET   || 'kp-wedding-secret-token-2026'
const ORG_TOKEN       = 'kp-organisateur-token-2026'
const BIENVENUE_TOKEN = process.env.BIENVENUE_TOKEN  || 'balade2026'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // ── 1. Routes toujours publiques ──────────────────────────
  if (
    pathname.startsWith('/confirmation')      ||
    pathname.startsWith('/admin/login')       ||
    pathname.startsWith('/api/auth')          ||
    pathname.startsWith('/api/public-tables') ||
    pathname.startsWith('/api/rsvp')          ||
    pathname.startsWith('/api/livredor')      ||
    pathname.startsWith('/api/confirmation')  ||
    pathname.startsWith('/api/confirm')       ||
    pathname.startsWith('/api/bienvenue-access') ||
    pathname.startsWith('/api/test-email')    ||
    pathname.startsWith('/_next')             ||
    pathname.startsWith('/favicon')           ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  const adminSession = request.cookies.get('admin_session')
  const orgSession   = request.cookies.get('org_session')
  const isAdmin      = adminSession?.value === SESSION_SECRET
  const isOrg        = orgSession?.value   === ORG_TOKEN

  // ── 2. Protection /bienvenue ──────────────────────────────
  if (pathname.startsWith('/bienvenue')) {
    if (isAdmin || isOrg) return NextResponse.next()
    const bienvenueOk = request.cookies.get('bienvenue_ok')
    if (bienvenueOk?.value === BIENVENUE_TOKEN) return NextResponse.next()
    return NextResponse.redirect(new URL('/confirmation', request.url))
  }

  // ── 3. Protection /organisateur ───────────────────────────
  if (pathname.startsWith('/organisateur')) {
    if (isAdmin || isOrg) return NextResponse.next()
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // ── 4. Protection /admin ──────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!isAdmin) return NextResponse.redirect(new URL('/admin/login', request.url))
    return NextResponse.next()
  }

  // ── 5. Protection /api ────────────────────────────────────
  const isApiProtected = pathname.startsWith('/api') &&
    !pathname.startsWith('/api/auth') &&
    !pathname.startsWith('/api/public-tables') &&
    !pathname.startsWith('/api/rsvp') &&
    !pathname.startsWith('/api/livredor') &&
    !pathname.startsWith('/api/confirmation') &&
    !pathname.startsWith('/api/confirm') &&
    !pathname.startsWith('/api/bienvenue-access') &&
    !pathname.startsWith('/api/test-email')

  if (isApiProtected) {
    // Organisateur peut accéder uniquement à /api/guests
    if (pathname.startsWith('/api/guests') && (isAdmin || isOrg)) return NextResponse.next()
    if (!isAdmin) return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/bienvenue/:path*',
    '/admin/:path*',
    '/organisateur/:path*',
    '/api/:path*',
    '/confirmation/:path*',
  ],
}
