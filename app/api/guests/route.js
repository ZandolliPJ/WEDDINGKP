import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

function toGuest(g) {
  return {
    id: g.id,
    name: g.name,
    email: g.email,
    phone: g.phone,
    tableId: g.table_id ? parseInt(g.table_id) : null,
    status: g.status,
    present: g.present,
    arrivalTime: g.arrival_time,
    group: g.group,
    familyGroup: g.family_group,
    friendGroup: g.friend_group,
    diet: g.diet,
    dietNotes: g.diet_notes,
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') // ex: ?status=confirmed

  let query = supabase.from('guests').select('*').order('name', { ascending: true })
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data.map(toGuest))
}

export async function POST(req) {
  try {
    const b = await req.json()

    // ── Validation nom obligatoire ──────────────────────
    if (!b.name?.trim())
      return NextResponse.json({ error: 'Le nom est requis.' }, { status: 400 })

    if (b.name.trim().length < 2)
      return NextResponse.json({ error: 'Le nom doit contenir au moins 2 caractères.' }, { status: 400 })

    // ── Vérification doublon (insensible casse & espaces) ──
    const nomNormalise = b.name.trim().toLowerCase()
    const { data: existing } = await supabase
      .from('guests')
      .select('id, name')
      .ilike('name', b.name.trim())

    if (existing && existing.length > 0) {
      return NextResponse.json({
        error: `⚠️ L'invité "${existing[0].name}" existe déjà dans la base de données.`
      }, { status: 409 })
    }

    // ── Insertion ───────────────────────────────────────
    const newId = `G${Date.now().toString().slice(-6)}`
    const { data, error } = await supabase.from('guests').insert([{
      id: newId,
      name: b.name.trim(),
      email: b.email?.trim() || null,
      phone: b.phone?.trim() || null,
      table_id: b.tableId || null,
      status: 'pending',
      present: false,
      group: b.group || 'autre',
      family_group: b.familyGroup || null,
      friend_group: b.friendGroup || null,
      diet: b.diet || 'standard',
      diet_notes: b.dietNotes || null,
    }]).select().single()

    if (error) {
      // Doublon détecté par contrainte Supabase
      if (error.code === '23505')
        return NextResponse.json({
          error: `⚠️ Cet invité existe déjà dans la base de données.`
        }, { status: 409 })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(toGuest(data), { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req) {
  const b = await req.json()
  const u = {}
  if (b.status !== undefined) u.status = b.status
  if (b.present !== undefined) u.present = b.present
  if (b.arrivalTime !== undefined) u.arrival_time = b.arrivalTime
  if (b.tableId !== undefined) u.table_id = b.tableId
  if (b.group !== undefined) u.group = b.group
  if (b.familyGroup !== undefined) u.family_group = b.familyGroup
  if (b.friendGroup !== undefined) u.friend_group = b.friendGroup
  if (b.diet !== undefined) u.diet = b.diet
  if (b.dietNotes !== undefined) u.diet_notes = b.dietNotes
  if (b.name !== undefined) u.name = b.name
  if (b.email !== undefined) u.email = b.email
  if (b.phone !== undefined) u.phone = b.phone
  const { data, error } = await supabase.from('guests').update(u).eq('id', b.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(toGuest(data))
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const { error } = await supabase.from('guests').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
