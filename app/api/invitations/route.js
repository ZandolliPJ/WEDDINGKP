// app/api/invitations/route.js
// ─────────────────────────────────────────────────────
// API pour les invitations envoyées
// GET  → récupérer l'historique d'envois
// POST → enregistrer un envoi
// ─────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

// ── GET : Récupérer les invitations ───────────────────
export async function GET() {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// ── POST : Enregistrer un envoi ───────────────────────
export async function POST(request) {
  const body = await request.json()
  // body.guests = tableau d'invités à qui on envoie

  const rows = body.guests.map(g => ({
    guest_id:    g.id,
    guest_name:  g.name,
    guest_email: g.email || null,
  }))

  const { data, error } = await supabase
    .from('invitations')
    .insert(rows)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, count: data.length })
}
