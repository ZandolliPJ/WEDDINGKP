'use client'
import { useState } from 'react'
import { TABLES, WEDDING } from '../../lib/data'
import QRCodeDisplay from '../QRCodeDisplay'

export default function Invitations({ guests }) {
  const [sel,     setSel]     = useState('all')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState([])

  async function send() {
    const targets = sel === 'all' ? guests : guests.filter(g => g.id === sel)
    if (!targets.length) return
    setSending(true)
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    targets.forEach(g => {
      if (!sent.find(s => s.id === g.id))
        setSent(s => [...s, { id: g.id, name: g.name, email: g.email, time: now }])
    })
    await new Promise(r => setTimeout(r, 800))
    alert(`✅ Faire-part ${sel === 'all' ? `envoyé à ${targets.length} invité(s)` : `envoyé à ${targets[0].name}`}`)
    setSending(false)
  }

  return (
    <div className="p-6 md:p-10 fade-in">
      <h2 className="text-3xl text-gold-light italic playfair mb-1">Faire-Part</h2>
      <p className="text-green-light text-xs tracking-widest uppercase mb-8">Balade Tropicale · QR Code par invité</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ══ APERÇU FAIRE-PART ══ */}
        <div>
          <p className="text-xs tracking-widest uppercase text-green-light mb-4">Aperçu du Faire-Part</p>
          <FairePartCard />
        </div>

        {/* ══ PANNEAU ENVOI ══ */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-gold/25 p-6"
               style={{ background: 'linear-gradient(160deg,#1a4a2e,#0d2b1a)' }}>
            <h3 className="text-gold-light italic text-xl playfair mb-5">Envoyer le faire-part</h3>

            <div className="mb-4">
              <label className="text-xs tracking-widest uppercase text-green-light block mb-2">Destinataire</label>
              <select value={sel} onChange={e => setSel(e.target.value)}
                      className="w-full bg-green-dark border border-gold/25 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold">
                <option value="all">📧 Tous les invités ({guests.length})</option>
                {guests.map(g => (
                  <option key={g.id} value={g.id}>{g.name}{g.email ? ` — ${g.email}` : ' (sans email)'}</option>
                ))}
              </select>
            </div>

            <button onClick={send} disabled={sending}
                    className="w-full py-3.5 rounded-xl text-sm tracking-widest uppercase font-bold text-green-dark disabled:opacity-50 hover:-translate-y-0.5 transition-all"
                    style={{ background: 'linear-gradient(135deg,#c9a84c,#f0d080)' }}>
              {sending ? '⏳ Envoi en cours…' : '🌺 Envoyer le Faire-Part'}
            </button>

            {/* QR codes individuels */}
            {guests.length > 0 && (
              <div className="mt-6">
                <p className="text-xs tracking-widest uppercase text-green-light mb-3">
                  QR Codes individuels ({guests.length})
                </p>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {guests.map(g => {
                    const tbl = TABLES.find(t => t.id === g.tableId)
                    return (
                      <div key={g.id} className="flex items-center justify-between p-3 rounded-xl"
                           style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="overflow-hidden mr-3">
                          <div className="text-white text-sm font-medium truncate">{g.name}</div>
                          <div className="text-white/40 text-xs">{tbl ? `${tbl.flower} ${tbl.name}` : '⏳ Sans table'}</div>
                          <div className="text-white/25 text-xs font-mono">{g.id}</div>
                        </div>
                        <div className="bg-white rounded-lg p-1.5 flex-shrink-0 shadow">
                          <QRCodeDisplay text={`KP2026|${g.id}|T${g.tableId || '0'}|${encodeURIComponent(g.name)}`} size={52} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {sent.length > 0 && (
            <div className="rounded-xl border border-green-light/20 p-4" style={{ background: 'rgba(76,175,125,0.05)' }}>
              <p className="text-xs tracking-widest uppercase text-green-light mb-3">✓ Envois récents</p>
              {sent.slice(-6).reverse().map(s => (
                <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                  <div>
                    <div className="text-white text-sm">{s.name}</div>
                    <div className="text-white/40 text-xs">{s.email || 'sans email'}</div>
                  </div>
                  <span className="text-green-light text-xs">✓ {s.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   FAIRE-PART — Construit 100% en CSS, zéro image de fond
   → Fleurs déco aux 4 coins en emojis / CSS
   → Fond crème élégant
   → Noms écrits UNE SEULE FOIS
══════════════════════════════════════════════════════ */
function FairePartCard() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '380px',
      aspectRatio: '3/4',
      background: 'linear-gradient(160deg, #fdf8f0 0%, #fff9f2 50%, #f8f4ec 100%)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
      border: '1px solid rgba(201,168,76,0.3)',
      fontFamily: '"Josefin Sans", sans-serif',
    }}>

      {/* ── Bordure or fine intérieure ── */}
      <div style={{
        position: 'absolute', inset: '10px',
        border: '1px solid rgba(201,168,76,0.4)',
        borderRadius: '10px',
        pointerEvents: 'none',
        zIndex: 5,
      }}/>

      {/* ── Coins floraux CSS — HAUT GAUCHE ── */}
      <div style={{ position:'absolute', top:0, left:0, fontSize:'3.8rem', lineHeight:1, transform:'rotate(-15deg) translate(-8px,-8px)', zIndex:2, filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>🌺</div>
      <div style={{ position:'absolute', top:'32px', left:'28px', fontSize:'2rem', lineHeight:1, transform:'rotate(10deg)', zIndex:2, opacity:0.85 }}>🌸</div>
      <div style={{ position:'absolute', top:'18px', left:'58px', fontSize:'1.6rem', lineHeight:1, transform:'rotate(-5deg)', zIndex:2, opacity:0.7 }}>🌿</div>
      <div style={{ position:'absolute', top:'58px', left:'12px', fontSize:'1.8rem', lineHeight:1, transform:'rotate(20deg)', zIndex:2, opacity:0.8 }}>🌻</div>

      {/* ── Coins floraux CSS — HAUT DROIT ── */}
      <div style={{ position:'absolute', top:0, right:0, fontSize:'3.5rem', lineHeight:1, transform:'rotate(20deg) translate(10px,-6px)', zIndex:2, filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>🌸</div>
      <div style={{ position:'absolute', top:'30px', right:'30px', fontSize:'1.8rem', lineHeight:1, transform:'rotate(-10deg)', zIndex:2, opacity:0.8 }}>🌺</div>
      <div style={{ position:'absolute', top:'60px', right:'10px', fontSize:'1.5rem', lineHeight:1, transform:'rotate(5deg)', zIndex:2, opacity:0.7 }}>🌷</div>

      {/* ── Coins floraux CSS — BAS GAUCHE ── */}
      <div style={{ position:'absolute', bottom:0, left:0, fontSize:'3.5rem', lineHeight:1, transform:'rotate(15deg) translate(-6px,8px)', zIndex:2, filter:'drop-shadow(0 -2px 4px rgba(0,0,0,0.1))' }}>🌷</div>
      <div style={{ position:'absolute', bottom:'30px', left:'28px', fontSize:'1.8rem', lineHeight:1, transform:'rotate(-8deg)', zIndex:2, opacity:0.8 }}>🌻</div>
      <div style={{ position:'absolute', bottom:'60px', left:'10px', fontSize:'1.4rem', lineHeight:1, zIndex:2, opacity:0.65 }}>🍃</div>

      {/* ── Coins floraux CSS — BAS DROIT ── */}
      <div style={{ position:'absolute', bottom:0, right:0, fontSize:'3.8rem', lineHeight:1, transform:'rotate(-20deg) translate(8px,10px)', zIndex:2, filter:'drop-shadow(0 -2px 4px rgba(0,0,0,0.1))' }}>🌺</div>
      <div style={{ position:'absolute', bottom:'28px', right:'30px', fontSize:'2rem', lineHeight:1, transform:'rotate(12deg)', zIndex:2, opacity:0.85 }}>🌸</div>
      <div style={{ position:'absolute', bottom:'62px', right:'12px', fontSize:'1.5rem', lineHeight:1, zIndex:2, opacity:0.7 }}>🌿</div>

      {/* ── Halo doré décoratif central ── */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '220px', height: '220px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
        zIndex: 1,
      }}/>

      {/* ══ CONTENU TEXTE — z-index 10 ══ */}
      <div style={{
        position: 'absolute', inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '28px 24px 22px',
        textAlign: 'center',
      }}>

        {/* Haut */}
        <div>
          <p style={{ fontSize:'0.55rem', letterSpacing:'0.35em', textTransform:'uppercase', color:'#2d7a4f', marginBottom:'4px' }}>
            ✿ Save the Date ✿
          </p>
          <p style={{ fontSize:'0.6rem', letterSpacing:'0.2em', color:'#c9a84c', fontWeight:600 }}>
            30 · 06 · 2026
          </p>
        </div>

        {/* Noms — écrits UNE SEULE FOIS */}
        <div>
          {/* Ligne déco */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px', justifyContent:'center' }}>
            <div style={{ height:'1px', width:'30px', background:'linear-gradient(90deg,transparent,#c9a84c)' }}/>
            <span style={{ color:'#c9a84c', fontSize:'0.6rem' }}>✦</span>
            <div style={{ height:'1px', width:'30px', background:'linear-gradient(90deg,#c9a84c,transparent)' }}/>
          </div>

          <p style={{
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic',
            fontSize: 'clamp(2.4rem, 8vw, 3.2rem)',
            lineHeight: 1.05,
            color: '#1a4a2e',
            textShadow: '0 2px 8px rgba(26,74,46,0.15)',
            margin: 0,
          }}>
            Katty
          </p>

          <p style={{
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic',
            fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)',
            color: '#2d7a4f',
            margin: '2px 0',
            opacity: 0.85,
          }}>
            &amp;
          </p>

          <p style={{
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic',
            fontSize: 'clamp(2.4rem, 8vw, 3.2rem)',
            lineHeight: 1.05,
            color: '#1a4a2e',
            textShadow: '0 2px 8px rgba(26,74,46,0.15)',
            margin: 0,
          }}>
            Pascal
          </p>

          {/* Badge Balade Tropicale */}
          <div style={{
            display: 'inline-block',
            marginTop: '12px',
            padding: '5px 16px',
            borderRadius: '20px',
            background: 'rgba(26,74,46,0.08)',
            border: '1px solid rgba(201,168,76,0.5)',
          }}>
            <p style={{ fontSize:'0.6rem', letterSpacing:'0.22em', textTransform:'uppercase', color:'#1a4a2e', margin:0 }}>
              Balade Tropicale
            </p>
          </div>
        </div>

        {/* Bas — lieu + QR */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
          <div style={{ height:'1px', width:'60px', background:'linear-gradient(90deg,transparent,#c9a84c,transparent)', marginBottom:'4px' }}/>

          <p style={{ fontSize:'0.58rem', color:'#1a4a2e', opacity:0.7, margin:0, letterSpacing:'0.12em', textTransform:'uppercase' }}>
            Vous invitent à leur grand jour
          </p>
          <p style={{ fontSize:'0.6rem', color:'#2d7a4f', fontWeight:600, margin:0, letterSpacing:'0.08em' }}>
            Salle Jasmine · Garges-lès-Gonesse
          </p>

          {/* QR code */}
          <div style={{
            background: 'white',
            padding: '8px',
            borderRadius: '10px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            border: '1px solid rgba(201,168,76,0.25)',
          }}>
            <QRCodeDisplay text="https://katty-pascal.vercel.app/bienvenue" size={68} />
          </div>

          <p style={{ fontSize:'0.5rem', color:'#2d7a4f', opacity:0.6, margin:0, letterSpacing:'0.15em', textTransform:'uppercase' }}>
            Confirmez avant le 01.05.2026
          </p>
        </div>
      </div>
    </div>
  )
}
