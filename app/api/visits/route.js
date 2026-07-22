// app/api/visits/route.js — Compteur de visites global
import { NextResponse } from 'next/server'
import { supabase }     from '../../../lib/supabase'

// GET — Lire le compteur
export async function GET() {
  const { data, error } = await supabase
    .from('visits')
    .select('count, updated_at')
    .eq('id', 1)
    .single()

  if (error) return NextResponse.json({ count: 0 }, { status: 200 })
  return NextResponse.json({ count: data?.count || 0, updated_at: data?.updated_at })
}

// POST — Incrémenter le compteur
export async function POST(req) {
  try {
    const { page = 'bienvenue' } = await req.json().catch(() => ({}))

    // Incrémenter le compteur global
    const { data, error } = await supabase.rpc('increment_visits', { page_name: page })
    if (error) throw error

    // Lire la valeur mise à jour
    const { data: updated } = await supabase
      .from('visits')
      .select('count, updated_at')
      .eq('id', 1)
      .single()

    return NextResponse.json({ count: updated?.count || 0, ok: true })
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
