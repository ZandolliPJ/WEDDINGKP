// app/api/checkin/route.js
// ─────────────────────────────────────────────────────
// API pour le check-in le jour J
// POST → enregistrer l'arrivée d'un invité
// ─────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request) {
  const { guestId } = await request.json()

  const now = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit'
  })

  const { data, error } = await supabase
    .from('guests')
    .update({
      present:      true,
      arrival_time: now,
      status:       'confirmed',
    })
    .eq('id', guestId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    id: data.id, name: data.name,
    tableId: data.table_id, arrivalTime: data.arrival_time,
    present: data.present
  })
}
