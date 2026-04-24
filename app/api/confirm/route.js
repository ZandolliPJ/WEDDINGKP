import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(req) {
  try {
    const { nom, prenom, presence } = await req.json()

    // Validation
    if (!nom?.trim() || nom.trim().length < 2)
      return NextResponse.json({ error: 'Nom invalide (minimum 2 caractères).' }, { status: 400 })
    if (!prenom?.trim() || prenom.trim().length < 2)
      return NextResponse.json({ error: 'Prénom invalide (minimum 2 caractères).' }, { status: 400 })
    if (!['oui','non'].includes(presence))
      return NextResponse.json({ error: 'Présence requise.' }, { status: 400 })

    // Recherche dans guests (insensible casse, prénom ou nom)
    const { data: guests, error: gErr } = await supabase
      .from('guests')
      .select('id, name, table_id, status')

    if (gErr) throw new Error(gErr.message)

    const search = `${prenom.trim()} ${nom.trim()}`.toLowerCase()
    const searchAlt = `${nom.trim()} ${prenom.trim()}`.toLowerCase()

    const guest = (guests || []).find(g => {
      const n = g.name.toLowerCase()
      return n === search || n === searchAlt ||
             (n.includes(prenom.trim().toLowerCase()) && n.includes(nom.trim().toLowerCase()))
    })

    if (!guest) {
      return NextResponse.json({
        found: false,
        message: `"${prenom.trim()} ${nom.trim()}" n'est pas dans la liste des invités. Vérifiez l'orthographe ou contactez Katty & Pascal.`
      })
    }

    // Mise à jour statut guest
    const newStatus = presence === 'oui' ? 'confirmed' : 'declined'
    await supabase.from('guests').update({ status: newStatus }).eq('id', guest.id)

    // Enregistrement confirmation
    await supabase.from('confirmations').insert({
      nom:      nom.trim(),
      prenom:   prenom.trim(),
      presence,
      guest_id: guest.id,
      table_id: guest.table_id,
    })

    return NextResponse.json({
      found:    true,
      presence,
      guest: {
        name:    guest.name,
        tableId: guest.table_id,
      }
    })
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
