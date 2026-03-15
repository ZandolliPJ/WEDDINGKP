// app/api/auth/route.js
// ─────────────────────────────────────────────────
// API d'authentification admin — cookie HttpOnly
// ─────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { cookies }      from 'next/headers'

// ⚠️ Changez ce mot de passe dans .env.local
// ADMIN_PASSWORD=votre_mot_de_passe_secret
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'KattyPascal2026!'
const SESSION_TOKEN  = process.env.SESSION_SECRET  || 'kp-wedding-secret-token-2026'

export async function POST(request) {
  const { password } = await request.json()

  if (password !== ADMIN_PASSWORD) {
    // Délai anti-brute-force
    await new Promise(r => setTimeout(r, 800))
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })

  // Cookie HttpOnly sécurisé — 8h de session
  response.cookies.set('admin_session', SESSION_TOKEN, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   60 * 60 * 8,   // 8 heures
    path:     '/',
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_session')
  return response
}

export async function GET() {
  const cookieStore = cookies()
  const SESSION_SECRET = process.env.SESSION_SECRET || 'kp-wedding-secret-token-2026'
  const session = cookieStore.get('admin_session')
  const valid   = session?.value === SESSION_SECRET
  return NextResponse.json({ authenticated: valid })
}
