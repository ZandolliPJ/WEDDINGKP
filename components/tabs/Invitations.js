// Invitations.js — Faire-Part avec envoi email réel + WhatsApp
'use client'
import { useState, useCallback } from 'react'
import { TABLES, WEDDING } from '../../lib/data'
import QRCodeDisplay from '../QRCodeDisplay'

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://mariage.tasteandsee.fr'

export default function Invitations({ guests, onGuestsChange }) {
  const [sel,       setSel]       = useState('all')
  const [sending,   setSending]   = useState(false)
  const [results,   setResults]   = useState([])   // résultats envoi
  const [showGuide, setShowGuide] = useState(false)
  const [search,    setSearch]    = useState('')
  const [tab,       setTab]       = useState('send')  // 'send' | 'qr' | 'whatsapp'

  const withEmail    = guests.filter(g => g.email && g.email.trim())
  const withoutEmail = guests.filter(g => !g.email || !g.email.trim())
  const withPhone    = guests.filter(g => g.phone && g.phone.trim())

  const filteredGuests = guests.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase())
  )

  // ── Envoi email ──────────────────────────────────────
  async function sendEmails() {
    const targets = sel === 'all'
      ? withEmail
      : guests.filter(g => g.id === sel && g.email)

    if (!targets.length) {
      alert('Aucun invité avec email sélectionné.')
      return
    }

    setSending(true)
    setResults([])

    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: sel === 'all' ? null : sel,
          mode: 'send',
        }),
      })
      const data = await res.json()
      setResults(data.results || [])

      if (!data.hasResend) {
        setShowGuide(true)
      }
    } catch(e) {
      alert('Erreur : ' + e.message)
    } finally {
      setSending(false)
    }
  }

  // ── Message WhatsApp ─────────────────────────────────
  function whatsappMsg(guest) {
    const tbl = TABLES.find(t => t.id === guest.tableId)
    const msg = [
      `🌺 *Katty & Pascal vous invitent !*`,
      ``,
      `Cher(e) *${guest.name}*,`,
      ``,
      `C'est avec grande joie que nous vous convions à notre mariage le *30 Juin 2026* 💍`,
      ``,
      `📅 *Programme de la journée :*`,
      ``,
      `⚖️ Cérémonie Civile — *11h30*`,
      `   Mairie de Grigny`,
      `   19 Rte de Corbeil, 91350 Grigny`,
      ``,
      `💒 Cérémonie Laïque — *16h00*`,
      `   Salle Jasmine`,
      `   8 rue des Gaillards, 95140 Garges-lès-Gonesse`,
      ``,
      `🍽️ Dîner & Soirée — *19h30*`,
      `   Menu Balade Tropicale`,
      ``,
      tbl ? `🌸 *Votre table :* ${tbl.flower} ${tbl.name}` : ``,
      tbl ? `` : ``,
      `👉 *Programme complet :* ${SITE_URL}/bienvenue`,
      ``,
      `_Merci de confirmer votre présence avant le 01.05.2026_ 🌺`,
      ``,
      `— Katty & Pascal`,
    ].filter(l => l !== undefined).join('\n')
    return encodeURIComponent(msg)
  }

  function openWhatsApp(guest) {
    const phone = guest.phone.replace(/[\s\-\(\)]/g, '')
    const intl  = phone.startsWith('0') ? '33' + phone.slice(1) : phone.replace('+', '')
    window.open(`https://wa.me/${intl}?text=${whatsappMsg(guest)}`, '_blank')
  }

  function openWhatsAppAll() {
    if (!confirm(`Ouvrir WhatsApp pour ${withPhone.length} invité(s) avec téléphone ?`)) return
    withPhone.forEach((g, i) => {
      setTimeout(() => openWhatsApp(g), i * 800)
    })
  }

  // ── Status badge ─────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const map = {
      sent:       { color:'#27ae60', bg:'rgba(39,174,96,0.15)',  label:'✓ Envoyé' },
      simulated:  { color:'#c9a84c', bg:'rgba(201,168,76,0.15)', label:'✓ Simulé' },
      no_email:   { color:'#e74c3c', bg:'rgba(231,76,60,0.15)',  label:'✗ Sans email' },
      error:      { color:'#e74c3c', bg:'rgba(231,76,60,0.15)',  label:'✗ Erreur' },
    }
    const s = map[status] || map.simulated
    return (
      <span style={{
        fontSize:'0.62rem', padding:'2px 8px', borderRadius:'10px',
        background:s.bg, color:s.color, fontWeight:600,
      }}>{s.label}</span>
    )
  }

  return (
    <div style={{fontFamily:'"Josefin Sans",sans-serif', padding:'24px 28px'}}>

      <h2 style={{fontFamily:'"Playfair Display",serif', fontStyle:'italic', fontSize:'1.75rem', color:'#f0d080', margin:'0 0 4px'}}>
        Faire-Part
      </h2>
      <p style={{color:'#4caf7d', fontSize:'0.6rem', letterSpacing:'0.3em', textTransform:'uppercase', margin:'0 0 20px'}}>
        Email · WhatsApp · QR Codes individuels
      </p>

      {/* ── Stats invités ── */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:'10px', marginBottom:'20px'}}>
        {[
          {n:guests.length,      l:'Total invités',  c:'#c9a84c', icon:'👥'},
          {n:withEmail.length,   l:'Avec email',     c:'#27ae60', icon:'📧'},
          {n:withoutEmail.length,l:'Sans email',     c:'#f39c12', icon:'⚠️'},
          {n:withPhone.length,   l:'WhatsApp dispo', c:'#25d366', icon:'💬'},
        ].map(s => (
          <div key={s.l} style={{
            background:'rgba(0,0,0,0.2)', borderRadius:'12px', padding:'12px 14px',
            border:'1px solid rgba(255,255,255,0.07)', textAlign:'center',
          }}>
            <div style={{fontSize:'1.1rem', marginBottom:'3px'}}>{s.icon}</div>
            <div style={{fontSize:'1.3rem', fontWeight:700, color:s.c, fontFamily:'"Playfair Display",serif', lineHeight:1}}>{s.n}</div>
            <div style={{fontSize:'0.56rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginTop:'2px'}}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>

        {/* ── Colonne gauche : Faire-part + onglets action ── */}
        <div>
          <p style={{color:'rgba(255,255,255,0.4)', fontSize:'0.6rem', letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:'10px'}}>
            Aperçu du Faire-Part
          </p>
          <FairePartCard/>

          {/* Onglets */}
          <div style={{display:'flex', gap:'6px', marginTop:'20px', marginBottom:'14px'}}>
            {[
              {k:'send',      l:'📧 Email'},
              {k:'whatsapp',  l:'💬 WhatsApp'},
              {k:'qr',        l:'📱 QR Codes'},
            ].map(t => (
              <button key={t.k} onClick={() => setTab(t.k)} style={{
                flex:1, padding:'8px 4px', borderRadius:'10px', cursor:'pointer',
                fontFamily:'inherit', fontSize:'0.68rem', letterSpacing:'0.1em',
                border: tab===t.k ? '1px solid #c9a84c' : '1px solid rgba(255,255,255,0.1)',
                background: tab===t.k ? 'rgba(201,168,76,0.15)' : 'rgba(0,0,0,0.2)',
                color: tab===t.k ? '#f0d080' : 'rgba(255,255,255,0.4)',
                transition:'all 0.15s',
              }}>{t.l}</button>
            ))}
          </div>

          {/* ── Tab Email ── */}
          {tab === 'send' && (
            <div style={{background:'linear-gradient(160deg,#1a4a2e,#0d2b1a)', borderRadius:'16px', padding:'20px', border:'1px solid rgba(201,168,76,0.2)'}}>
              <div style={{marginBottom:'14px'}}>
                <label style={{color:'#4caf7d', fontSize:'0.6rem', letterSpacing:'0.25em', textTransform:'uppercase', display:'block', marginBottom:'6px'}}>
                  Destinataire
                </label>
                <select value={sel} onChange={e => setSel(e.target.value)} style={{
                  width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(201,168,76,0.3)',
                  borderRadius:'10px', padding:'10px 12px', color:'white', fontSize:'0.82rem', outline:'none',
                }}>
                  <option value="all">📧 Tous avec email ({withEmail.length} invités)</option>
                  {guests.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.email ? '✓' : '✗'} {g.name}{g.email ? ` — ${g.email}` : ' (sans email)'}
                    </option>
                  ))}
                </select>
              </div>

              <button onClick={sendEmails} disabled={sending || withEmail.length === 0} style={{
                width:'100%', padding:'13px', borderRadius:'12px', border:'none',
                background: sending ? 'rgba(201,168,76,0.3)' : 'linear-gradient(135deg,#c9a84c,#f0d080)',
                color:'#1a4a2e', fontWeight:700, fontSize:'0.75rem', letterSpacing:'0.2em',
                textTransform:'uppercase', cursor: sending ? 'not-allowed' : 'pointer',
                fontFamily:'inherit', transition:'all 0.2s',
              }}>
                {sending ? '⏳ Envoi en cours…' : '🌺 Envoyer le Faire-Part'}
              </button>

              {withEmail.length === 0 && (
                <p style={{color:'#f39c12', fontSize:'0.72rem', textAlign:'center', marginTop:'8px'}}>
                  ⚠️ Aucun invité n'a d'email. Ajoutez les emails dans l'onglet Invités.
                </p>
              )}
            </div>
          )}

          {/* ── Tab WhatsApp ── */}
          {tab === 'whatsapp' && (
            <div style={{background:'linear-gradient(160deg,#1a4a2e,#0d2b1a)', borderRadius:'16px', padding:'20px', border:'1px solid rgba(37,211,102,0.3)'}}>
              <p style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', lineHeight:1.6, marginBottom:'16px'}}>
                Envoyer le faire-part par WhatsApp à chaque invité. Le message s'ouvre directement dans WhatsApp avec le texte pré-rempli.
              </p>
              <button onClick={openWhatsAppAll} disabled={withPhone.length === 0} style={{
                width:'100%', padding:'13px', borderRadius:'12px', border:'none',
                background: withPhone.length === 0 ? 'rgba(37,211,102,0.2)' : 'linear-gradient(135deg,#25d366,#128c7e)',
                color:'white', fontWeight:700, fontSize:'0.75rem', letterSpacing:'0.15em',
                textTransform:'uppercase', cursor: withPhone.length === 0 ? 'not-allowed' : 'pointer',
                fontFamily:'inherit', marginBottom:'12px',
              }}>
                💬 Envoyer à tous ({withPhone.length})
              </button>

              <div style={{maxHeight:'240px', overflowY:'auto'}}>
                {guests.filter(g => g.phone).map(g => (
                  <div key={g.id} style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'8px 10px', borderRadius:'10px', marginBottom:'6px',
                    background:'rgba(37,211,102,0.08)', border:'1px solid rgba(37,211,102,0.2)',
                  }}>
                    <div>
                      <div style={{color:'white', fontSize:'0.8rem', fontWeight:500}}>{g.name}</div>
                      <div style={{color:'rgba(255,255,255,0.4)', fontSize:'0.68rem'}}>{g.phone}</div>
                    </div>
                    <button onClick={() => openWhatsApp(g)} style={{
                      background:'#25d366', border:'none', borderRadius:'8px',
                      padding:'6px 12px', color:'white', fontSize:'0.68rem',
                      cursor:'pointer', fontFamily:'inherit', fontWeight:600,
                    }}>📲 Envoyer</button>
                  </div>
                ))}
                {withPhone.length === 0 && (
                  <p style={{color:'rgba(255,255,255,0.3)', fontSize:'0.75rem', textAlign:'center', fontStyle:'italic', padding:'16px'}}>
                    Aucun numéro de téléphone enregistré.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Tab QR ── */}
          {tab === 'qr' && (
            <div style={{background:'linear-gradient(160deg,#1a4a2e,#0d2b1a)', borderRadius:'16px', padding:'16px', border:'1px solid rgba(201,168,76,0.2)'}}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                     placeholder="🔍 Rechercher un invité…" autoComplete="off"
                     style={{width:'100%', marginBottom:'12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'white', fontSize:'0.75rem', outline:'none'}}/>
              <div style={{maxHeight:'320px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'8px'}}>
                {filteredGuests.map(g => {
                  const tbl = TABLES.find(t => t.id === g.tableId)
                  return (
                    <div key={g.id} style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'10px 12px', borderRadius:'12px',
                      background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
                    }}>
                      <div style={{overflow:'hidden', marginRight:'12px', flex:1}}>
                        <div style={{color:'white', fontSize:'0.82rem', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{g.name}</div>
                        <div style={{color:'rgba(255,255,255,0.4)', fontSize:'0.68rem'}}>{tbl ? `${tbl.flower} ${tbl.name}` : '⏳ Sans table'}</div>
                        <div style={{color:'rgba(255,255,255,0.2)', fontSize:'0.62rem', fontFamily:'monospace'}}>{g.id}</div>
                      </div>
                      <div style={{background:'white', borderRadius:'8px', padding:'6px', flexShrink:0}}>
                        <QRCodeDisplay text={`KP2026|${g.id}|T${g.tableId||0}|${encodeURIComponent(g.name)}`} size={52}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Colonne droite : Résultats + Guide Resend ── */}
        <div>
          {/* Guide configuration Resend */}
          <div style={{background:'rgba(201,168,76,0.08)', borderRadius:'16px', padding:'18px', border:'1px solid rgba(201,168,76,0.25)', marginBottom:'16px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
              <span style={{color:'#f0d080', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.1em'}}>📧 Configuration Email (Resend)</span>
              <button onClick={() => setShowGuide(g => !g)} style={{background:'none', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'6px', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'0.65rem', padding:'3px 8px'}}>
                {showGuide ? 'Masquer' : 'Voir guide'}
              </button>
            </div>
            <p style={{color:'rgba(255,255,255,0.5)', fontSize:'0.72rem', lineHeight:1.5, margin:0}}>
              Pour envoyer de vrais emails, ajoutez votre clé API Resend dans les variables d'environnement Vercel.
            </p>
            {showGuide && (
              <div style={{marginTop:'12px', display:'flex', flexDirection:'column', gap:'8px'}}>
                {[
                  {n:'1', text:'Créez un compte gratuit sur resend.com'},
                  {n:'2', text:'Créez une clé API dans votre dashboard Resend'},
                  {n:'3', text:'Dans Vercel → Settings → Environment Variables'},
                  {n:'4', text:'Ajoutez : RESEND_API_KEY = re_xxxxxxxxxxxx'},
                  {n:'5', text:'Redéployez → les emails seront envoyés réellement'},
                ].map(s => (
                  <div key={s.n} style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'0.72rem', color:'rgba(255,255,255,0.6)'}}>
                    <span style={{background:'rgba(201,168,76,0.2)', border:'1px solid rgba(201,168,76,0.4)', borderRadius:'50%', width:'22px', height:'22px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#c9a84c', fontWeight:700, fontSize:'0.65rem'}}>{s.n}</span>
                    {s.text}
                  </div>
                ))}
                <a href="https://resend.com" target="_blank" rel="noreferrer" style={{
                  display:'block', marginTop:'8px', padding:'9px', borderRadius:'10px', textAlign:'center',
                  background:'linear-gradient(135deg,#1a4a2e,#2d7a4f)', color:'white',
                  textDecoration:'none', fontSize:'0.7rem', letterSpacing:'0.15em',
                }}>🔗 Aller sur resend.com →</a>
              </div>
            )}
          </div>

          {/* Résultats d'envoi */}
          {results.length > 0 && (
            <div style={{background:'linear-gradient(160deg,#1a4a2e,#0d2b1a)', borderRadius:'16px', padding:'16px', border:'1px solid rgba(201,168,76,0.2)'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
                <span style={{color:'#4caf7d', fontSize:'0.62rem', letterSpacing:'0.25em', textTransform:'uppercase'}}>
                  Résultats d'envoi
                </span>
                <div style={{display:'flex', gap:'8px', fontSize:'0.65rem'}}>
                  <span style={{color:'#27ae60'}}>✓ {results.filter(r=>r.status==='sent'||r.status==='simulated').length} envoyés</span>
                  {results.filter(r=>r.status==='error').length > 0 && (
                    <span style={{color:'#e74c3c'}}>✗ {results.filter(r=>r.status==='error').length} erreurs</span>
                  )}
                </div>
              </div>
              <div style={{maxHeight:'300px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'6px'}}>
                {results.map(r => (
                  <div key={r.id} style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'8px 10px', borderRadius:'8px',
                    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{overflow:'hidden', flex:1, marginRight:'8px'}}>
                      <div style={{color:'rgba(255,255,255,0.85)', fontSize:'0.78rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{r.name}</div>
                      <div style={{color:'rgba(255,255,255,0.3)', fontSize:'0.65rem'}}>{r.email || 'sans email'}</div>
                    </div>
                    <StatusBadge status={r.status}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invités sans email */}
          {withoutEmail.length > 0 && (
            <div style={{background:'rgba(243,156,18,0.08)', borderRadius:'14px', padding:'16px', border:'1px solid rgba(243,156,18,0.25)', marginTop:'16px'}}>
              <p style={{color:'#f39c12', fontSize:'0.62rem', letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:'10px'}}>
                ⚠️ {withoutEmail.length} invité(s) sans email
              </p>
              <p style={{color:'rgba(255,255,255,0.45)', fontSize:'0.72rem', marginBottom:'10px', lineHeight:1.5}}>
                Ces invités ne recevront pas le faire-part par email. Utilisez WhatsApp ou ajoutez leurs emails dans l'onglet Invités.
              </p>
              <div style={{maxHeight:'160px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'5px'}}>
                {withoutEmail.map(g => (
                  <div key={g.id} style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'6px 10px', borderRadius:'8px',
                    background:'rgba(255,255,255,0.04)',
                  }}>
                    <span style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem'}}>{g.name}</span>
                    {g.phone ? (
                      <button onClick={() => openWhatsApp(g)} style={{
                        background:'#25d366', border:'none', borderRadius:'6px',
                        padding:'4px 10px', color:'white', fontSize:'0.62rem',
                        cursor:'pointer', fontFamily:'inherit',
                      }}>💬 WA</button>
                    ) : (
                      <span style={{color:'rgba(255,255,255,0.2)', fontSize:'0.65rem'}}>—</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Faire-Part CSS ── */
function FairePartCard() {
  return (
    <div style={{
      position:'relative', width:'100%', maxWidth:'340px',
      aspectRatio:'3/4',
      background:'linear-gradient(160deg,#fdf8f0,#fff9f2,#f8f4ec)',
      borderRadius:'14px', overflow:'hidden',
      boxShadow:'0 20px 60px rgba(0,0,0,0.2)',
      border:'1px solid rgba(201,168,76,0.25)',
      fontFamily:'"Josefin Sans",sans-serif',
    }}>
      <div style={{position:'absolute',inset:'8px',border:'1px solid rgba(201,168,76,0.35)',borderRadius:'8px',pointerEvents:'none',zIndex:5}}/>
      {/* Coins floraux */}
      <div style={{position:'absolute',top:0,left:0,fontSize:'3.2rem',lineHeight:1,transform:'rotate(-15deg) translate(-8px,-8px)',zIndex:2}}>🌺</div>
      <div style={{position:'absolute',top:'28px',left:'24px',fontSize:'1.6rem',transform:'rotate(10deg)',zIndex:2,opacity:0.8}}>🌸</div>
      <div style={{position:'absolute',top:'52px',left:'10px',fontSize:'1.3rem',transform:'rotate(-5deg)',zIndex:2,opacity:0.65}}>🌿</div>
      <div style={{position:'absolute',top:0,right:0,fontSize:'3rem',lineHeight:1,transform:'rotate(20deg) translate(8px,-6px)',zIndex:2}}>🌸</div>
      <div style={{position:'absolute',top:'28px',right:'26px',fontSize:'1.5rem',transform:'rotate(-10deg)',zIndex:2,opacity:0.8}}>🌺</div>
      <div style={{position:'absolute',bottom:0,left:0,fontSize:'3rem',lineHeight:1,transform:'rotate(15deg) translate(-6px,8px)',zIndex:2}}>🌷</div>
      <div style={{position:'absolute',bottom:'26px',left:'24px',fontSize:'1.5rem',transform:'rotate(-8deg)',zIndex:2,opacity:0.8}}>🌻</div>
      <div style={{position:'absolute',bottom:0,right:0,fontSize:'3.2rem',lineHeight:1,transform:'rotate(-20deg) translate(8px,10px)',zIndex:2}}>🌺</div>
      <div style={{position:'absolute',bottom:'26px',right:'26px',fontSize:'1.6rem',transform:'rotate(12deg)',zIndex:2,opacity:0.8}}>🌸</div>

      <div style={{position:'absolute',inset:0,zIndex:10,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',padding:'22px 20px 18px',textAlign:'center'}}>
        <div>
          <p style={{fontSize:'0.5rem',letterSpacing:'0.35em',textTransform:'uppercase',color:'#2d7a4f',margin:'0 0 4px'}}>✿ Save the Date ✿</p>
          <p style={{fontSize:'0.55rem',letterSpacing:'0.2em',color:'#c9a84c',fontWeight:600,margin:0}}>30 · 06 · 2026</p>
        </div>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'8px',justifyContent:'center'}}>
            <div style={{height:'1px',width:'24px',background:'linear-gradient(90deg,transparent,#c9a84c)'}}/>
            <span style={{color:'#c9a84c',fontSize:'0.55rem'}}>✦</span>
            <div style={{height:'1px',width:'24px',background:'linear-gradient(90deg,#c9a84c,transparent)'}}/>
          </div>
          <p style={{fontFamily:'"Playfair Display",serif',fontStyle:'italic',fontSize:'2.6rem',lineHeight:1.05,color:'#1a4a2e',margin:0}}>Katty</p>
          <p style={{fontFamily:'"Playfair Display",serif',fontStyle:'italic',fontSize:'1.1rem',color:'#2d7a4f',margin:'4px 0',opacity:0.8}}>&amp;</p>
          <p style={{fontFamily:'"Playfair Display",serif',fontStyle:'italic',fontSize:'2.6rem',lineHeight:1.05,color:'#1a4a2e',margin:0}}>Pascal</p>
          <div style={{display:'inline-block',marginTop:'10px',padding:'4px 14px',borderRadius:'20px',background:'rgba(26,74,46,0.07)',border:'1px solid rgba(201,168,76,0.45)'}}>
            <p style={{fontSize:'0.52rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#1a4a2e',margin:0}}>Balade Tropicale</p>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'6px'}}>
          <div style={{height:'1px',width:'50px',background:'linear-gradient(90deg,transparent,#c9a84c,transparent)',marginBottom:'2px'}}/>
          <p style={{fontSize:'0.52rem',color:'#1a4a2e',opacity:0.65,margin:0,letterSpacing:'0.1em',textTransform:'uppercase'}}>Vous invitent à leur grand jour</p>
          <p style={{fontSize:'0.55rem',color:'#2d7a4f',fontWeight:600,margin:0,letterSpacing:'0.06em'}}>Salle Jasmine · Garges-lès-Gonesse</p>
          <div style={{background:'white',padding:'6px',borderRadius:'8px',boxShadow:'0 3px 12px rgba(0,0,0,0.1)',border:'1px solid rgba(201,168,76,0.2)'}}>
            <QRCodeDisplay text="https://mariage.tasteandsee.fr/bienvenue" size={58}/>
          </div>
          <p style={{fontSize:'0.45rem',color:'#2d7a4f',opacity:0.55,margin:0,letterSpacing:'0.12em',textTransform:'uppercase'}}>Confirmez avant le 01.05.2026</p>
        </div>
      </div>
    </div>
  )
}
