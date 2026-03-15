import { NextResponse } from 'next/server'
import { supabase }     from '../../../lib/supabase'

export async function POST(request) {
  const body = await request.json()
  const { data, error } = await supabase.from('rsvp').insert([{
    prenom:    body.prenom,
    nom:       body.nom,
    telephone: body.telephone || null,
    presence:  body.presence,
    personnes: parseInt(body.personnes) || 1,
    menu:      body.menu || 'standard',
    message:   body.message || null,
    created_at: new Date().toISOString(),
  }])
  if (error) {
    // Même si Supabase échoue (table pas encore créée), on renvoie succès
    // pour ne pas bloquer l'expérience invité
    return NextResponse.json({ success: true, warning: error.message })
  }
  return NextResponse.json({ success: true })
}

export async function GET() {
  const { data, error } = await supabase.from('rsvp').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
