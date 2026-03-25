// app/api/budget/route.js — API Budget complète (CRUD Supabase)
import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

// ── GET — Charger tout le budget ─────────────────────
export async function GET() {
  try {
    const [cfg, cats, items] = await Promise.all([
      supabase.from('budget_config').select('*'),
      supabase.from('budget_categories').select('*').order('id'),
      supabase.from('budget_items').select('*').order('created_at'),
    ])
    if (cfg.error)   throw new Error(cfg.error.message)
    if (cats.error)  throw new Error(cats.error.message)
    if (items.error) throw new Error(items.error.message)

    // Reconstruire la config en objet clé/valeur
    const config = {}
    ;(cfg.data || []).forEach(row => { config[row.key] = row.value })

    return NextResponse.json({
      totalBudget: parseFloat(config.total_budget || '15000'),
      categories:  cats.data  || [],
      items:       items.data || [],
    })
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// ── PUT — Mettre à jour le budget total ──────────────
export async function PUT(req) {
  const body = await req.json()
  try {
    if (body.totalBudget !== undefined) {
      await supabase.from('budget_config')
        .upsert({ key: 'total_budget', value: String(body.totalBudget), updated_at: new Date().toISOString() })
    }
    if (body.category) {
      const { id, budgeted } = body.category
      await supabase.from('budget_categories')
        .upsert({ id, budgeted, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    }
    return NextResponse.json({ ok: true })
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// ── POST — Ajouter une dépense ───────────────────────
export async function POST(req) {
  const body = await req.json()

  // Upsert catégorie si pas encore en base
  if (body.category_id && body.label !== undefined) {
    try {
      // S'assurer que la catégorie existe
      await supabase.from('budget_categories')
        .upsert({
          id:        body.category_id,
          label:     body.category_label || body.category_id,
          icon:      body.category_icon  || '',
          budgeted:  parseFloat(body.budgeted) || 0,
          color:     body.color || '#c9a84c',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })

      // Insérer l'item
      const { data, error } = await supabase.from('budget_items')
        .insert({
          category_id: body.category_id,
          label:       body.label,
          amount:      parseFloat(body.amount) || 0,
          paid:        body.paid || false,
          note:        body.note || '',
        })
        .select()
        .single()
      if (error) throw new Error(error.message)
      return NextResponse.json(data)
    } catch(e) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }
  return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
}

// ── PATCH — Modifier un item (paid / montant) ────────
export async function PATCH(req) {
  const body = await req.json()
  try {
    if (body.itemId !== undefined) {
      const update = { updated_at: new Date().toISOString() }
      if (body.paid    !== undefined) update.paid    = body.paid
      if (body.amount  !== undefined) update.amount  = parseFloat(body.amount)
      if (body.label   !== undefined) update.label   = body.label
      if (body.note    !== undefined) update.note    = body.note

      const { data, error } = await supabase.from('budget_items')
        .update(update).eq('id', body.itemId).select().single()
      if (error) throw new Error(error.message)
      return NextResponse.json(data)
    }

    // Mettre à jour budgeted d'une catégorie
    if (body.categoryId !== undefined) {
      const { error } = await supabase.from('budget_categories')
        .upsert({
          id: body.categoryId,
          label: body.label || body.categoryId,
          budgeted: parseFloat(body.budgeted) || 0,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
      if (error) throw new Error(error.message)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// ── DELETE — Supprimer un item ───────────────────────
export async function DELETE(req) {
  const { searchParams } = new URL(req.url)
  const itemId = searchParams.get('itemId')
  if (!itemId) return NextResponse.json({ error: 'itemId requis' }, { status: 400 })
  try {
    const { error } = await supabase.from('budget_items').delete().eq('id', parseInt(itemId))
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
