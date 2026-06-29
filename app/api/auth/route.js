// app/api/auth/route.js
// ─────────────────────────────────────────────────
// 2 profils :
//   ADMIN       → accès complet
//   ORGANISATEUR → lecture + modification invités seulement
// ─────────────────────────────────────────────────
import { NextResponse } from 'next/server'
import { cookies }      from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD       || 'KattyPascal2026!'
const ORG_PASSWORD   = process.env.ORGANISATEUR_PASSWORD || 'Organisateur2026!'
const SESSION_TOKEN  = process.env.SESSION_SECRET        || 'kp-wedding-secret-token-2026'
const ORG_TOKEN      = 'kp-organisateur-token-2026'

export async function POST(request) {
  const { password } = await request.json()

  // ── Admin ──────────────────────────────────────
  if (password === ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true, role: 'admin' })
    response.cookies.set('admin_session', SESSION_TOKEN, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   60 * 60 * 8,
      path:     '/',
    })
    return response
  }

  // ── Organisateur ───────────────────────────────
  if (password === ORG_PASSWORD) {
    const response = NextResponse.json({ success: true, role: 'organisateur' })
    response.cookies.set('org_session', ORG_TOKEN, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   60 * 60 * 8,
      path:     '/',
    })
    return response
  }

  // ── Échec ──────────────────────────────────────
  await new Promise(r => setTimeout(r, 800))
  return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_session')
  response.cookies.delete('org_session')
  return response
}

export async function GET() {
  const cookieStore   = cookies()
  const adminSession  = cookieStore.get('admin_session')
  const orgSession    = cookieStore.get('org_session')
  const isAdmin       = adminSession?.value === SESSION_TOKEN
  const isOrg         = orgSession?.value   === ORG_TOKEN

  return NextResponse.json({
    authenticated: isAdmin || isOrg,
    role: isAdmin ? 'admin' : isOrg ? 'organisateur' : null,
  })
}
