// app/api/folders/route.js
import { NextResponse } from 'next/server'
import { supabase }     from '../../../lib/supabase'

export async function GET() {
  const { data, error } = await supabase.from('folders')
    .select('*').order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req) {
  const { name, parent_id, color } = await req.json()
  if (!name?.trim())
    return NextResponse.json({ error: 'Nom requis' }, { status: 400 })

  const { data, error } = await supabase.from('folders').insert([{
    name: name.trim(), parent_id: parent_id || null,
    color: color || '#c9a84c', created_at: new Date().toISOString(),
  }]).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await supabase.from('photos').update({ folder_id: null }).eq('folder_id', id)
  const { error } = await supabase.from('folders').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
