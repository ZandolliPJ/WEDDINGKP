// api/confirmation/route.js — Vérification + confirmation + notification email
import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const NOTIFY_FROM = process.env.NOTIFY_FROM


const TABLES = {
  1: 'Hibiscus', 2: 'Frangipanier', 3: 'Balisier', 4: 'Bouganvillée',
  5: 'Lantana', 6: 'Alamanda', 7: 'Anthurium', 8: 'Heliconias',
  9: 'Oiseau du Paradis', 10: 'Cactus', 11: "Cœur d'Amour",
  12: 'Alpinia Rose', 13: 'Orchidée', 14: 'Pivoine Tropicale', 15: 'Rose de Porcelaine',
}

// ── GET — Chercher invité par nom ───────────────────
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 3)
    return NextResponse.json({ error: 'Minimum 3 caractères.' }, { status: 400 })

  const { data, error } = await supabase
    .from('guests')
    .select('id, name, table_id, status, present')
    .ilike('name', `%${q}%`)
    .limit(5)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

// ── POST — Enregistrer la réponse + notifier admin ──
export async function POST(req) {
  try {
    const { guestId, presence, guestName, phone } = await req.json()

    if (!guestId)
      return NextResponse.json({ error: 'Invité introuvable.' }, { status: 400 })

    // ── 1. Mettre à jour statut + téléphone ──────────
    const status = presence === 'oui' ? 'confirmed' : 'declined'
    const updateData = { status }
    if (phone) updateData.phone = phone

    const { data: guestData, error: errGuest } = await supabase
      .from('guests')
      .update(updateData)
      .eq('id', guestId)
      .select('id, name, table_id, phone')
      .single()

    if (errGuest)
      return NextResponse.json({ error: errGuest.message }, { status: 500 })

    const guest = guestData || { name: guestName, table_id: null }
    const nomTable = guest.table_id ? TABLES[guest.table_id] || `Table ${guest.table_id}` : 'Non assignée'
    const now = new Date().toLocaleString('fr-FR', {
      dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Paris'
    })

    // ── 2. Envoyer email de notification via Resend ──
    if (RESEND_API_KEY && RESEND_API_KEY !== 'your_resend_api_key_here') {
      const emoji = presence === 'oui' ? '✅' : '❌'
      const couleur = presence === 'oui' ? '#22C55E' : '#EF4444'
      const libelle = presence === 'oui' ? 'a CONFIRMÉ sa présence' : 'a DÉCLINÉ l\'invitation'

      const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a4a2e,#2d6a4f);padding:32px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.6);">Balade Tropicale · 30 Juin 2026</p>
            <h1 style="margin:0;font-size:26px;font-style:italic;color:#e8c97a;font-weight:400;">Katty &amp; Pascal</h1>
            <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.5);">Notification de confirmation invité</p>
          </td>
        </tr>

        <!-- Badge statut -->
        <tr>
          <td style="padding:32px 40px 0;text-align:center;">
            <div style="display:inline-block;background:${couleur}18;border:2px solid ${couleur};border-radius:50px;padding:10px 28px;">
              <span style="font-size:20px;">${emoji}</span>
              <span style="font-size:15px;font-weight:600;color:${couleur};margin-left:8px;">${libelle}</span>
            </div>
          </td>
        </tr>

        <!-- Infos invité -->
        <tr>
          <td style="padding:28px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f2;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #ede8df;">
                  <p style="margin:0 0 4px;font-size:11px;color:#9e9e9e;text-transform:uppercase;letter-spacing:2px;">Invité(e)</p>
                  <p style="margin:0;font-size:20px;font-weight:600;color:#1a4a2e;">${guest.name || guestName}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px;border-bottom:1px solid #ede8df;">
                  <p style="margin:0 0 4px;font-size:11px;color:#9e9e9e;text-transform:uppercase;letter-spacing:2px;">Table assignée</p>
                  <p style="margin:0;font-size:15px;color:#2d6a4f;font-weight:500;">🌸 ${nomTable}</p>
                </td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding:16px 24px;border-bottom:1px solid #ede8df;">
                  <p style="margin:0 0 4px;font-size:11px;color:#9e9e9e;text-transform:uppercase;letter-spacing:2px;">Téléphone</p>
                  <p style="margin:0;font-size:15px;color:#333;">📱 ${phone}</p>
                </td>
              </tr>` : ''}
              <tr>
                <td style="padding:16px 24px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#9e9e9e;text-transform:uppercase;letter-spacing:2px;">Date &amp; heure</p>
                  <p style="margin:0;font-size:14px;color:#666;">🕐 ${now}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Lien admin -->
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://baladetropicale.fr'}/admin/dashboard"
               style="display:inline-block;background:linear-gradient(135deg,#1a4a2e,#2d6a4f);color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:13px;font-weight:600;letter-spacing:1px;">
              Voir le Dashboard Admin →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f0ebe0;padding:16px 40px;text-align:center;border-top:1px solid #e0d9cc;">
            <p style="margin:0;font-size:11px;color:#aaa;letter-spacing:1px;">
              Katty &amp; Pascal · Balade Tropicale · 30 Juin 2026<br>
              Salle Jasmine · 8 rue des Gaillards · 95140 Garges-lès-Gonesse
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `Balade Tropicale <${NOTIFY_FROM}>`,
            to: [ADMIN_EMAIL],
            subject: `${emoji} ${guest.name || guestName} — ${presence === 'oui' ? 'Confirmé' : 'Décliné'} · Balade Tropicale`,
            html,
          }),
        })
      } catch (emailErr) {
        console.error('Email notification failed:', emailErr)
        // Non bloquant — la confirmation est enregistrée même si l'email échoue
      }
    }

    return NextResponse.json({ ok: true, status })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
