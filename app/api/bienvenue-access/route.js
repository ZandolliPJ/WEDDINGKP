// api/bienvenue-access/route.js
// Valide le mot de passe et pose un cookie sécurisé HttpOnly
import { NextResponse } from 'next/server'

const BIENVENUE_TOKEN = process.env.BIENVENUE_TOKEN || 'balade2026'

export async function POST(req) {
  try {
    const { password } = await req.json()

    if (!password?.trim())
      return NextResponse.json({ error: 'Mot de passe requis.' }, { status: 400 })

    if (password.trim().toLowerCase() !== BIENVENUE_TOKEN)
      return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 })

    // Cookie sécurisé HttpOnly — 30 jours
    const response = NextResponse.json({ ok: true })
    response.cookies.set('bienvenue_ok', BIENVENUE_TOKEN, {
      httpOnly: false,   // false car lu côté client aussi
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 30, // 30 jours
      path:     '/',
    })

    return response
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
