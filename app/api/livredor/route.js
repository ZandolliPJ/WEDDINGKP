import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('livre_or')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req) {
  const { auteur, message } = await req.json()
  if (!auteur?.trim() || !message?.trim())
    return NextResponse.json({ error: 'Champs requis' }, { status: 400 })
  if (auteur.trim().length < 3 || message.trim().length < 3)
    return NextResponse.json({ error: 'Minimum 3 caractères' }, { status: 400 })
  const { data, error } = await supabase
    .from('livre_or')
    .insert({ auteur: auteur.trim(), message: message.trim() })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
