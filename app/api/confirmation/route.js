// api/confirmation/route.js — Vérification + confirmation présence
import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

// ── GET — Chercher invité par nom ───────────────────
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 3)
    return NextResponse.json({ error: 'Minimum 3 caractères.' }, { status: 400 })

  const { data, error } = await supabase
    .from('guests')
    .select('id, name, table_id, status, present')
    .ilike('name', `%${q}%`)
    .limit(5)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

// ── POST — Enregistrer la réponse ──────────────────
export async function POST(req) {
  try {
    const { guestId, presence, guestName, phone } = await req.json()

    if (!guestId)
      return NextResponse.json({ error: 'Invité introuvable.' }, { status: 400 })

    // Mettre à jour statut + téléphone dans guests
    const status = presence === 'oui' ? 'confirmed' : 'declined'
    const updateData = { status }
    if (phone) updateData.phone = phone

    const { error: errGuest } = await supabase
      .from('guests')
      .update(updateData)
      .eq('id', guestId)

    if (errGuest)
      return NextResponse.json({ error: errGuest.message }, { status: 500 })

    return NextResponse.json({ ok: true, status })
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
