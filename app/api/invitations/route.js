// api/invitations/route.js — Envoi faire-part via Resend
import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://baladetropicale.fr'
const RESEND_API_KEY = process.env.RESEND_API_KEY || null

// ── Template email HTML ──────────────────────────────
function buildEmailHTML(guest, tableInfo) {
  const qrUrl = `${SITE_URL}/bienvenue`
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Faire-Part — Katty & Pascal</title></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Georgia',serif;">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);">
    
    <!-- En-tête vert tropical -->
    <div style="background:linear-gradient(135deg,#1a4a2e,#0d2b1a);padding:40px 32px;text-align:center;">
      <p style="color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 8px;">✿ Save the Date ✿</p>
      <p style="color:#c9a84c;font-size:13px;letter-spacing:3px;margin:0 0 20px;">30 · 06 · 2026</p>
      <h1 style="color:#f0d080;font-size:3rem;font-style:italic;margin:0;line-height:1.1;">Katty</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:1.2rem;font-style:italic;margin:8px 0;">&amp;</p>
      <h1 style="color:#f0d080;font-size:3rem;font-style:italic;margin:0;line-height:1.1;">Pascal</h1>
      <div style="display:inline-block;margin-top:16px;padding:6px 18px;border-radius:20px;border:1px solid rgba(201,168,76,0.5);">
        <p style="color:#c9a84c;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0;">Balade Tropicale</p>
      </div>
    </div>

    <!-- Corps -->
    <div style="padding:32px;text-align:center;">
      <p style="color:#2d7a4f;font-size:14px;letter-spacing:1px;margin:0 0 8px;">Cher(e) <strong>${guest.name}</strong>,</p>
      <p style="color:#1a4a2e;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Nous avons l'immense joie de vous convier à notre mariage le <strong>30 Juin 2026</strong>.<br>
        Venez partager avec nous cette <em>Balade Tropicale</em> pleine d'amour et de couleurs !
      </p>

      <!-- Infos -->
      <div style="background:#fafcf8;border:1px solid rgba(201,168,76,0.3);border-radius:12px;padding:20px;margin:0 0 24px;text-align:left;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #f0f0f0;">
          <span style="font-size:1.4rem;">⚖️</span>
          <div>
            <p style="font-weight:bold;color:#1a4a2e;margin:0;font-size:13px;">Cérémonie Civile — 14h00</p>
            <p style="color:#666;margin:2px 0 0;font-size:12px;">Mairie de Grigny · 19 Rte de Corbeil, 91350 Grigny</p>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #f0f0f0;">
          <span style="font-size:1.4rem;">💍</span>
          <div>
            <p style="font-weight:bold;color:#1a4a2e;margin:0;font-size:13px;">Cérémonie Laïque — 17h30</p>
            <p style="color:#666;margin:2px 0 0;font-size:12px;">Salle Jasmine · 8 rue des Gaillards, 95140 Garges-lès-Gonesse</p>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:1.4rem;">🍽️</span>
          <div>
            <p style="font-weight:bold;color:#1a4a2e;margin:0;font-size:13px;">Dîner & Soirée — 19h30</p>
            <p style="color:#666;margin:2px 0 0;font-size:12px;">Salle Jasmine · Menu Balade Tropicale</p>
          </div>
        </div>
        ${tableInfo ? `
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid #f0f0f0;display:flex;align-items:center;gap:12px;">
          <span style="font-size:1.4rem;">${tableInfo.flower}</span>
          <div>
            <p style="font-weight:bold;color:#1a4a2e;margin:0;font-size:13px;">Votre table — ${tableInfo.name}</p>
            <p style="color:#666;margin:2px 0 0;font-size:12px;">${tableInfo.theme}</p>
          </div>
        </div>` : ''}
      </div>

      <!-- CTA -->
      <a href="${qrUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a4a2e,#2d7a4f);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;">
        🌺 Voir le programme complet
      </a>

      <p style="color:#999;font-size:11px;margin:20px 0 0;">
        Merci de confirmer votre présence avant le <strong>01.05.2026</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#1a4a2e;padding:20px;text-align:center;">
      <p style="color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:2px;margin:0;">
        Katty &amp; Pascal · Balade Tropicale · 30 Juin 2026 🌺
      </p>
    </div>
  </div>
</body></html>`
}

// ── POST — Envoi ─────────────────────────────────────
export async function POST(req) {
  const { guestId, mode } = await req.json()

  // Charger les invités
  const query = guestId
    ? supabase.from('guests').select('*').eq('id', guestId)
    : supabase.from('guests').select('*').not('email', 'is', null).neq('email', '')

  const { data: guestsList, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const results = []

  for (const g of (guestsList || [])) {
    if (!g.email) {
      results.push({ id: g.id, name: g.name, status: 'no_email', email: null })
      continue
    }

    // Infos table
    let tableInfo = null
    if (g.table_id) {
      const { data: tbl } = await supabase
        .from('guests').select('table_id').eq('id', g.id).single()
    }

    // Générer le HTML
    const html = buildEmailHTML({ name: g.name, id: g.id }, tableInfo)

    // Envoi via Resend si clé disponible
    if (RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Katty & Pascal <mariagekatty2026@resend.dev>',
            to: [g.email],
            subject: '🌺 Vous êtes invité(e) — Mariage Katty & Pascal · 30 Juin 2026',
            html,
          }),
        })
        const data = await res.json()
        if (res.ok) {
          results.push({ id: g.id, name: g.name, status: 'sent', email: g.email, resendId: data.id })
          // Marquer comme invité dans Supabase
          await supabase.from('guests').update({ status: 'pending' }).eq('id', g.id)
        } else {
          results.push({ id: g.id, name: g.name, status: 'error', email: g.email, error: data.message })
        }
      } catch (e) {
        results.push({ id: g.id, name: g.name, status: 'error', email: g.email, error: e.message })
      }
    } else {
      // Mode simulation (pas de clé Resend)
      results.push({ id: g.id, name: g.name, status: 'simulated', email: g.email })
    }
  }

  const sent = results.filter(r => r.status === 'sent' || r.status === 'simulated').length
  const noEmail = results.filter(r => r.status === 'no_email').length
  const errors = results.filter(r => r.status === 'error').length

  return NextResponse.json({ results, sent, noEmail, errors, hasResend: !!RESEND_API_KEY })
}
