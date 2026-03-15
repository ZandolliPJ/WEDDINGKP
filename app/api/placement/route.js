// app/api/placement/route.js
// ═══════════════════════════════════════════════════════
// ALGORITHME DE PLACEMENT AUTOMATIQUE INTELLIGENT
//
// PRIORITÉS (dans l'ordre) :
// 1. Table 11 "Coeur d'Amour" = réservée aux mariés
// 2. Familles regroupées par family_group sur la même table
// 3. Famille côté marié (marie) vs côté mariée (mariee)
// 4. Groupes d'amis (friend_group) ensemble
// 5. Régimes alimentaires : regrouper halal/casher/vegan
// 6. Compléter les tables restantes avec les autres invités
// ═══════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { supabase }     from '../../../lib/supabase'

// ── Récupérer les invités non placés ─────────────────
export async function GET() {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .is('table_id', null)   // seulement les non placés

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ unassigned: data.length, guests: data })
}

// ── Lancer le placement automatique ──────────────────
export async function POST(request) {
  const body = await request.json()
  // mode: 'preview' -> retourne le plan sans sauvegarder
  // mode: 'apply'   -> sauvegarde dans Supabase
  const mode = body.mode || 'preview'

  // 1. Charger tous les invités
  const { data: allGuests, error: gErr } = await supabase
    .from('guests')
    .select('*')
    .neq('status', 'declined')  // ignorer les déclinés

  if (gErr) return NextResponse.json({ error: gErr.message }, { status: 500 })

  // 2. Charger toutes les tables
  const { data: allTables, error: tErr } = await supabase
    .from('tables')
    .select('*')
    .order('id')

  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 })

  // 3. Initialiser le plan : tableId -> [guestIds]
  const plan = {}
  allTables.forEach(t => { plan[t.id] = [] })

  // Garder les invités déjà placés manuellement
  const alreadyPlaced = new Set()
  allGuests.forEach(g => {
    if (g.table_id) {
      plan[g.table_id] = plan[g.table_id] || []
      plan[g.table_id].push(g.id)
      alreadyPlaced.add(g.id)
    }
  })

  // Invités à placer (non encore placés)
  let toPlace = allGuests.filter(g => !alreadyPlaced.has(g.id))

  // Capacités disponibles par table
  const capacity = {}
  allTables.forEach(t => {
    capacity[t.id] = t.capacity - (plan[t.id]?.length || 0)
  })

  // Table 11 = mariés uniquement, on la réserve
  capacity[11] = 0

  // ── Fonction utilitaire : placer un groupe sur la meilleure table ──
  function placerGroupe(guests, preferredTableId = null) {
    if (!guests.length) return

    // Trouver la table avec assez de place
    let tableId = null

    // Essayer la table préférée d'abord
    if (preferredTableId && capacity[preferredTableId] >= guests.length) {
      tableId = preferredTableId
    }

    // Sinon chercher la table avec le plus de place disponible (pas la 11)
    if (!tableId) {
      let bestCap = 0
      allTables.forEach(t => {
        if (t.id === 11) return
        if (capacity[t.id] >= guests.length && capacity[t.id] > bestCap) {
          bestCap = capacity[t.id]
          tableId = t.id
        }
      })
    }

    // Si aucune table assez grande, placer un par un
    if (!tableId) {
      guests.forEach(g => placerGroupe([g]))
      return
    }

    guests.forEach(g => {
      plan[tableId].push(g.id)
      capacity[tableId]--
      toPlace = toPlace.filter(x => x.id !== g.id)
    })
  }

  // ════════════════════════════════════════════
  // ÉTAPE 1 : Familles regroupées (priorité max)
  // ════════════════════════════════════════════
  const familyGroups = {}
  toPlace.forEach(g => {
    if (g.family_group) {
      if (!familyGroups[g.family_group]) familyGroups[g.family_group] = []
      familyGroups[g.family_group].push(g)
    }
  })

  // Trier les groupes familiaux : côté marié en premier, puis mariée
  const familyOrder = (a, b) => {
    const sideScore = { marie: 0, mariee: 1, commun: 2, autre: 3 }
    const sideA = familyGroups[a][0]?.family_side || 'autre'
    const sideB = familyGroups[b][0]?.family_side || 'autre'
    return (sideScore[sideA] || 3) - (sideScore[sideB] || 3)
  }

  Object.keys(familyGroups).sort(familyOrder).forEach(groupName => {
    placerGroupe(familyGroups[groupName])
  })

  // ════════════════════════════════════════════
  // ÉTAPE 2 : Groupes d'amis
  // ════════════════════════════════════════════
  const friendGroups = {}
  toPlace.forEach(g => {
    if (g.friend_group) {
      if (!friendGroups[g.friend_group]) friendGroups[g.friend_group] = []
      friendGroups[g.friend_group].push(g)
    }
  })

  Object.keys(friendGroups).forEach(groupName => {
    placerGroupe(friendGroups[groupName])
  })

  // ════════════════════════════════════════════
  // ÉTAPE 3 : Régimes alimentaires spéciaux
  // Regrouper halal / casher / vegan ensemble
  // ════════════════════════════════════════════
  const specialDiets = ['halal', 'casher', 'vegan', 'vegetarien']
  specialDiets.forEach(diet => {
    const group = toPlace.filter(g => g.diet === diet)
    if (group.length > 0) placerGroupe(group)
  })

  // ════════════════════════════════════════════
  // ÉTAPE 4 : Invités restants (remplir les trous)
  // ════════════════════════════════════════════
  toPlace.forEach(g => placerGroupe([g]))

  // ── Construire le résultat avec les détails ───────
  const guestMap = {}
  allGuests.forEach(g => { guestMap[g.id] = g })

  const tableMap = {}
  allTables.forEach(t => { tableMap[t.id] = t })

  const result = allTables.map(t => ({
    tableId:    t.id,
    tableName:  t.name,
    flower:     t.flower,
    capacity:   t.capacity,
    guests:     plan[t.id].map(id => ({
      id:          guestMap[id]?.id,
      name:        guestMap[id]?.name,
      familySide:  guestMap[id]?.family_side,
      familyGroup: guestMap[id]?.family_group,
      friendGroup: guestMap[id]?.friend_group,
      diet:        guestMap[id]?.diet,
    })),
    filled:     plan[t.id].length,
    available:  t.capacity - plan[t.id].length,
  }))

  // ── Statistiques du placement ─────────────────────
  const stats = {
    totalGuests:   allGuests.filter(g => g.status !== 'declined').length,
    placed:        allGuests.length - toPlace.length,
    unplaced:      toPlace.length,
    familyGroups:  Object.keys(familyGroups).length,
    friendGroups:  Object.keys(friendGroups).length,
  }

  // ── Si mode 'apply' : sauvegarder dans Supabase ──
  if (mode === 'apply') {
    const updates = []
    allTables.forEach(t => {
      plan[t.id].forEach(guestId => {
        // Ne pas écraser les placements manuels existants
        if (!alreadyPlaced.has(guestId)) {
          updates.push({ id: guestId, table_id: t.id })
        }
      })
    })

    for (const upd of updates) {
      await supabase.from('guests').update({ table_id: upd.table_id }).eq('id', upd.id)
    }

    return NextResponse.json({ success: true, stats, tables: result })
  }

  // Mode 'preview' : retourner sans sauvegarder
  return NextResponse.json({ preview: true, stats, tables: result })
}
