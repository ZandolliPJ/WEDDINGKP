// app/api/videos/route.js — CRUD vidéos
import { NextResponse } from 'next/server'
import { supabase }     from '../../../lib/supabase'

// GET — Liste des vidéos
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const search  = searchParams.get('q')     || null
  const sort    = searchParams.get('sort')  || 'created_at'
  const order   = searchParams.get('order') || 'desc'
  const trash   = searchParams.get('trash') === 'true'
  const fav     = searchParams.get('fav')   === 'true'

  let query = supabase.from('videos').select('*')
    .eq('deleted', trash)
    .order(sort, { ascending: order === 'asc' })

  if (search) query = query.ilike('name', `%${search}%`)
  if (fav)    query = query.eq('favorite', true)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

// POST — Enregistrer vidéo après upload Cloudinary
export async function POST(req) {
  try {
    const body = await req.json()
    const { public_id, url, name, size, format, duration, width, height, thumbnail } = body

    // Anti-doublon
    const { data: existing } = await supabase.from('videos')
      .select('id').eq('public_id', public_id).single()
    if (existing)
      return NextResponse.json({ error: 'Vidéo déjà existante' }, { status: 409 })

    const { data, error } = await supabase.from('videos').insert([{
      public_id, url,
      name:      name || public_id,
      size:      size || 0,
      format:    format || 'mp4',
      duration:  duration || 0,
      width:     width || 0,
      height:    height || 0,
      thumbnail: thumbnail || null,
      favorite:  false,
      deleted:   false,
      created_at: new Date().toISOString(),
    }]).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PATCH — Modifier vidéo
export async function PATCH(req) {
  try {
    const { id, ...updates } = await req.json()
    const allowed = ['name', 'favorite', 'deleted', 'caption', 'deleted_at']
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([k]) => allowed.includes(k))
    )
    const { data, error } = await supabase.from('videos')
      .update({ ...filtered, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE — Corbeille ou suppression définitive
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id        = searchParams.get('id')
    const permanent = searchParams.get('permanent') === 'true'

    if (permanent) {
      const { error } = await supabase.from('videos').delete().eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      const { error } = await supabase.from('videos')
        .update({ deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
