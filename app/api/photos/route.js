// app/api/photos/route.js
import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { cookies } from 'next/headers'

const SESSION_SECRET = process.env.SESSION_SECRET || 'kp-wedding-secret-token-2026'
const ORG_TOKEN = 'kp-organisateur-token-2026'

async function getRole(request) {
  const cookieStore = await cookies()
  const admin = cookieStore.get('admin_session')
  const org = cookieStore.get('org_session')
  if (admin?.value === SESSION_SECRET) return 'admin'
  if (org?.value === ORG_TOKEN) return 'organisateur'
  return null
}

// Permissions par rôle
const PERMS = {
  admin: { read: true, upload: true, update: true, delete: true, restore: true },
  organisateur: { read: true, upload: true, update: true, delete: false, restore: false },
  lecteur: { read: true, upload: false, update: false, delete: false, restore: false },
}

// GET — Liste des photos
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const folder = searchParams.get('folder') || null
  const tag = searchParams.get('tag') || null
  const search = searchParams.get('q') || null
  const sort = searchParams.get('sort') || 'created_at'
  const order = searchParams.get('order') || 'desc'
  const trash = searchParams.get('trash') === 'true'
  const favorites = searchParams.get('favorites') === 'true'

  let query = supabase.from('photos').select('*')
    .eq('deleted', trash)
    .order(sort, { ascending: order === 'asc' })

  if (folder) query = query.eq('folder_id', folder)
  if (favorites) query = query.eq('favorite', true)
  if (tag) query = query.contains('tags', [tag])
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

// POST — Enregistrer photo après upload Cloudinary
export async function POST(req) {
  const role = await getRole(req)
  if (!role || !PERMS[role]?.upload)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const body = await req.json()
  const { public_id, url, name, size, format, width, height, folder_id, tags } = body

  // Protection doublons
  const { data: existing } = await supabase.from('photos')
    .select('id').eq('public_id', public_id).single()
  if (existing)
    return NextResponse.json({ error: 'Photo déjà existante' }, { status: 409 })

  const { data, error } = await supabase.from('photos').insert([{
    public_id, url, name: name || public_id,
    size, format, width, height,
    folder_id: folder_id || null,
    tags: tags || [],
    favorite: false,
    deleted: false,
    uploaded_by: role,
    created_at: new Date().toISOString(),
  }]).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Journal d'audit
  await supabase.from('audit_log').insert([{
    action: 'photo.upload', resource_id: data.id,
    user_role: role, details: { name, size, format },
    created_at: new Date().toISOString(),
  }])

  return NextResponse.json(data, { status: 201 })
}

// PATCH — Modifier photo
export async function PATCH(req) {
  const role = await getRole(req)
  if (!role || !PERMS[role]?.update)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { id, ...updates } = await req.json()
  const allowed = ['name', 'tags', 'favorite', 'folder_id', 'caption']
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  )

  const { data, error } = await supabase.from('photos')
    .update({ ...filtered, updated_at: new Date().toISOString() })
    .eq('id', id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE — Corbeille ou suppression définitive
export async function DELETE(req) {
  const role = await getRole(req)
  if (!role || !PERMS[role]?.delete)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const permanent = searchParams.get('permanent') === 'true'

  if (permanent) {
    const { error } = await supabase.from('photos').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase.from('photos')
      .update({ deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.from('audit_log').insert([{
    action: permanent ? 'photo.delete_permanent' : 'photo.trash',
    resource_id: id, user_role: role,
    created_at: new Date().toISOString(),
  }])

  return NextResponse.json({ ok: true })
}
