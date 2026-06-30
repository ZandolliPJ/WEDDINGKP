import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

// Route PUBLIQUE — uniquement nom + tableId (pas d'email ni téléphone)
export async function GET() {
  const { data, error } = await supabase
    .from('guests')
    .select('id, name, table_id, group, present')
    .order('name', { ascending: true })

  if (error) return NextResponse.json([], { status: 200 })

  const safe = (data || []).map(g => ({
    id:      g.id,
    name:    g.name,
    tableId: g.table_id ? parseInt(g.table_id) : null,
    group:   g.group,
    present: g.present,
  }))

  return NextResponse.json(safe)
}
