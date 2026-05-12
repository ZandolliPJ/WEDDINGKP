// api/test-email/route.js — Diagnostic Resend
import { NextResponse } from 'next/server'

export async function GET() {
  const key   = process.env.RESEND_API_KEY
  const to    = process.env.ADMIN_EMAIL
  const from  = process.env.NOTIFY_FROM

  // ── 1. Vérifier les variables ──────────────────────
  const checks = {
    RESEND_API_KEY: key  ? `✅ Défini (${key.slice(0,8)}...)` : '❌ MANQUANT',
    ADMIN_EMAIL:    to   ? `✅ ${to}`                         : '❌ MANQUANT',
    NOTIFY_FROM:    from ? `✅ ${from}`                       : '❌ MANQUANT',
  }

  if (!key || key === 'your_resend_api_key_here') {
    return NextResponse.json({
      status: 'error',
      message: 'RESEND_API_KEY non configuré',
      checks,
    }, { status: 400 })
  }

  // ── 2. Envoyer un email de test ────────────────────
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    from || 'onboarding@resend.dev',
        to:      [to  || 'delivered@resend.dev'],
        subject: '🌺 Test email — Balade Tropicale',
        html:    `
          <div style="font-family:Arial,sans-serif;padding:24px;background:#f5f0e8;">
            <div style="background:#1a4a2e;color:#e8c97a;padding:20px;border-radius:10px;text-align:center;">
              <h2 style="margin:0;font-style:italic;">Katty &amp; Pascal</h2>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Test email — Resend fonctionne ✅</p>
            </div>
            <div style="background:white;padding:20px;border-radius:10px;margin-top:12px;">
              <p style="color:#333;">Si vous recevez cet email, la configuration Resend est correcte.</p>
              <p style="color:#666;font-size:12px;">Envoyé le : ${new Date().toLocaleString('fr-FR')}</p>
            </div>
          </div>
        `,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({
        status:  'error',
        message: 'Resend API erreur',
        checks,
        resend_error: data,
        resend_status: res.status,
      }, { status: 400 })
    }

    return NextResponse.json({
      status:   'success',
      message:  `✅ Email envoyé à ${to}`,
      email_id: data.id,
      checks,
    })

  } catch(e) {
    return NextResponse.json({
      status:  'error',
      message: `Erreur réseau : ${e.message}`,
      checks,
    }, { status: 500 })
  }
}
