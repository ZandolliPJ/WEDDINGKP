// Tables.js — Plan de table UX repensé
// Workflow : cliquer invité → cliquer table → assigné ✓
// Drag & Drop aussi disponible
'use client'
import { useState, useCallback, useRef } from 'react'
import { TABLES, GROUP_COLORS } from '../../lib/data'
import QRCodeDisplay from '../QRCodeDisplay'

const MAX = 8

const COL = {
  1:'#e74c3c',2:'#e91e8c',3:'#c0392b',4:'#9b59b6',5:'#f39c12',
  6:'#f1c40f',7:'#e74c3c',8:'#27ae60',9:'#16a085',10:'#2ecc71',
  11:'#c9a84c',12:'#1abc9c',13:'#e91e8c',14:'#e67e22',15:'#f48fb1',
}

const SVG_POS = [
  {id:1,x:90,y:78},{id:2,x:210,y:78},{id:3,x:330,y:65},
  {id:4,x:450,y:78},{id:5,x:570,y:78},
  {id:6,x:68,y:218},{id:7,x:68,y:328},
  {id:8,x:592,y:218},{id:9,x:592,y:328},
  {id:10,x:90,y:458},{id:11,x:195,y:468},{id:12,x:300,y:473},
  {id:13,x:405,y:473},{id:14,x:510,y:468},{id:15,x:615,y:458},
]

const gAt = (guests, tid) =>
  guests.filter(g => g.tableId && parseInt(g.tableId) === parseInt(tid))

export default function Tables({ guests, onGuestsChange }) {
  // ── Mode : 'select' (cliquer pour assigner) ou 'drag' ──
  const [picked,     setPicked]     = useState(null)   // invité sélectionné en attente d'une table
  const [drag,       setDrag]       = useState(null)   // drag HTML5
  const [over,       setOver]       = useState(null)
  const [selTable,   setSelTable]   = useState(null)   // table sélectionnée pour voir ses invités
  const [qr,         setQr]         = useState(null)
  const [toast,      setToast]      = useState(null)
  const [search,     setSearch]     = useState('')
  const [grpFilter,  setGrpFilter]  = useState('all')
  const [saving,     setSaving]     = useState(false)
  const ghostRef = useRef(null)

  const unassigned = guests.filter(g => !g.tableId || parseInt(g.tableId) === 0)
  const placed     = guests.filter(g =>  g.tableId && parseInt(g.tableId) > 0)

  const filtered = unassigned.filter(g => {
    const q = search.toLowerCase()
    return (!q || g.name.toLowerCase().includes(q)) &&
           (grpFilter === 'all' || g.group === grpFilter)
  })

  const toast$ = (msg, type='ok') => {
    setToast({msg, type})
    setTimeout(() => setToast(null), 2800)
  }

  // ── API ──────────────────────────────────────────────
  async function move(guestId, tableId) {
    setSaving(true)
    try {
      const res = await fetch('/api/guests', {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id: guestId, tableId: tableId || null }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const updated = await res.json()
      onGuestsChange(guests.map(g => g.id === updated.id ? updated : g))
      return updated
    } catch(e) {
      toast$(e.message || 'Erreur réseau', 'err')
      return null
    } finally { setSaving(false) }
  }

  // ── Clic sur une table (mode sélection) ─────────────
  async function clickTable(tableId) {
    // Si un invité est sélectionné → l'assigner à cette table
    if (picked) {
      const g = guests.find(x => x.id === picked)
      if (!g) { setPicked(null); return }

      const count = gAt(guests, tableId).length
      if (count >= MAX) {
        const tbl = TABLES.find(t => t.id === tableId)
        toast$(`⚠️ Table ${tbl?.name} complète (max ${MAX})`, 'err')
        return
      }
      const u = await move(picked, tableId)
      if (u) {
        const tbl = TABLES.find(t => t.id === tableId)
        toast$(`✓ ${u.name} → ${tbl?.flower} ${tbl?.name}`)
      }
      setPicked(null)
      return
    }
    // Sinon → sélectionner/désélectionner la table
    setSelTable(prev => prev === tableId ? null : tableId)
  }

  // ── Drag HTML5 ───────────────────────────────────────
  function dragStart(e, guestId) {
    setDrag(guestId)
    setPicked(null)
    e.dataTransfer.effectAllowed = 'move'
    const ghost = document.createElement('div')
    ghost.style.cssText = 'position:fixed;top:-200px;opacity:0;'
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    ghostRef.current = ghost
  }

  function dragEnd() {
    setDrag(null); setOver(null)
    if (ghostRef.current) { ghostRef.current.remove(); ghostRef.current = null }
  }

  async function dropOn(targetTable) {
    if (!drag) return
    setOver(null)
    const g = guests.find(x => x.id === drag)
    if (!g) return dragEnd()

    if (targetTable === 'pool') {
      if (g.tableId) {
        const u = await move(drag, null)
        if (u) toast$(`↩ ${u.name} retiré de sa table`)
      }
    } else {
      if (parseInt(g.tableId) === parseInt(targetTable)) return dragEnd()
      const count = gAt(guests, targetTable).length
      if (count >= MAX) {
        const tbl = TABLES.find(t => t.id === targetTable)
        toast$(`⚠️ Table ${tbl?.name} complète`, 'err')
        return dragEnd()
      }
      const u = await move(drag, targetTable)
      const tbl = TABLES.find(t => t.id === targetTable)
      if (u) toast$(`✓ ${u.name} → ${tbl?.flower} ${tbl?.name}`)
    }
    dragEnd()
  }

  // ── Chip invité ──────────────────────────────────────
  const Chip = ({ g, inPool }) => {
    const gc = GROUP_COLORS[g.group||'autre']||GROUP_COLORS.autre
    const isPicked  = picked === g.id
    const isDragging = drag  === g.id

    return (
      <div
        draggable
        onDragStart={e => dragStart(e, g.id)}
        onDragEnd={dragEnd}
        onClick={e => {
          e.stopPropagation()
          if (!inPool) return
          // Toggle sélection
          setPicked(prev => prev === g.id ? null : g.id)
          setSelTable(null)
        }}
        title={inPool ? (isPicked ? 'Cliquez une table pour placer cet invité' : 'Cliquez pour sélectionner, puis cliquez une table') : g.name}
        style={{
          display:'flex', alignItems:'center', gap:'6px',
          padding:'5px 10px',
          borderRadius: inPool ? '20px' : '8px',
          marginBottom: inPool ? 0 : '3px',
          background: isPicked
            ? 'linear-gradient(135deg,#c9a84c,#f0d080)'
            : gc.bg,
          border: isPicked
            ? '2px solid #c9a84c'
            : `1px solid ${isPicked ? '#c9a84c' : gc.border}`,
          color: isPicked ? '#1a4a2e' : '#fff',
          cursor: inPool ? 'pointer' : 'grab',
          userSelect:'none',
          fontWeight: isPicked ? 700 : 500,
          fontSize:'0.78rem',
          minHeight:'34px',
          opacity: isDragging ? 0.3 : 1,
          transform: isPicked ? 'scale(1.05)' : 'scale(1)',
          transition:'all 0.15s',
          boxShadow: isPicked ? '0 4px 16px rgba(201,168,76,0.5)' : 'none',
        }}
      >
        <span style={{fontSize:'0.9rem'}}>{isPicked ? '📌' : gc.icon}</span>
        <span style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
          {g.name}
        </span>
        {g.present && <span style={{fontSize:'0.6rem', color: isPicked ? '#1a4a2e' : '#4caf7d', fontWeight:700}}>✓</span>}
        {!inPool && (
          <button
            onClick={e => { e.stopPropagation(); move(g.id, null) }}
            style={{
              background:'none', border:'none', cursor:'pointer',
              color:'rgba(255,255,255,0.35)', fontSize:'0.8rem',
              padding:'0 2px', lineHeight:1, transition:'color 0.15s',
            }}
            onMouseEnter={e => e.target.style.color='#e74c3c'}
            onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.35)'}
            title="Retirer de la table"
          >✕</button>
        )}
      </div>
    )
  }

  // ── Plan salle SVG avec zones de drop ────────────────
  const SalleMap = () => {
    return (
      <div style={{position:'relative'}}>
        {/* Instruction contextuelle */}
        {picked && (
          <div style={{
            position:'absolute', top:'8px', left:'50%', transform:'translateX(-50%)',
            zIndex:10, background:'linear-gradient(135deg,#c9a84c,#f0d080)',
            color:'#1a4a2e', padding:'8px 20px', borderRadius:'20px',
            fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.1em',
            boxShadow:'0 4px 20px rgba(201,168,76,0.5)',
            whiteSpace:'nowrap', pointerEvents:'none',
            animation:'pulse 1.2s ease-in-out infinite',
          }}>
            👆 Cliquez une table pour placer {guests.find(g=>g.id===picked)?.name}
          </div>
        )}

        <svg
          viewBox="0 0 680 560"
          style={{
            width:'100%', height:'auto', display:'block',
            borderRadius:'16px',
            border: picked
              ? '2px solid #c9a84c'
              : '1px solid rgba(201,168,76,0.2)',
            transition:'border 0.2s',
          }}
        >
          <defs>
            <radialGradient id="bg" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#1e5c35"/>
              <stop offset="100%" stopColor="#0a1f12"/>
            </radialGradient>
          </defs>
          <rect width="680" height="560" fill="url(#bg)"/>

          {/* Entrée */}
          <rect x="290" y="2" width="100" height="16" rx="4" fill="#0a1f12" stroke="rgba(201,168,76,0.4)" strokeWidth="1"/>
          <text x="340" y="14" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Josefin Sans,sans-serif" letterSpacing="3">ENTRÉE</text>

          {/* Scène */}
          <rect x="250" y="542" width="180" height="16" rx="4" fill="#0a1f12" stroke="rgba(201,168,76,0.4)" strokeWidth="1"/>
          <text x="340" y="554" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Josefin Sans,sans-serif" letterSpacing="2">🎤 DJ / SCÈNE</text>

          {/* Piste de danse */}
          <rect x="200" y="178" width="280" height="196" rx="14" fill="rgba(201,168,76,0.04)" stroke="#c9a84c" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.6"/>
          <text x="340" y="270" textAnchor="middle" fill="rgba(201,168,76,0.4)" fontSize="22">♪</text>
          <text x="340" y="308" textAnchor="middle" fill="rgba(255,255,255,0.18)" fontSize="7"
                fontFamily="Josefin Sans,sans-serif" letterSpacing="4">PISTE DE DANSE</text>

          {/* Tables */}
          {SVG_POS.map(pos => {
            const tbl    = TABLES.find(t => t.id === pos.id)
            const tg     = gAt(guests, pos.id)
            const count  = tg.length
            const col    = COL[pos.id]||'#c9a84c'
            const isSel  = selTable === pos.id
            const isFull = count >= MAX
            const isTarget = picked && !isFull  // cette table est une cible valide
            const R = 36

            return (
              <g
                key={pos.id}
                style={{cursor: picked ? (isFull ? 'not-allowed' : 'pointer') : 'pointer'}}
                onClick={() => clickTable(pos.id)}
                onDragOver={e => { e.preventDefault(); setOver(pos.id) }}
                onDragLeave={() => setOver(null)}
                onDrop={e => { e.preventDefault(); dropOn(pos.id) }}
              >
                {/* Halo "cible disponible" quand un invité est sélectionné */}
                {isTarget && (
                  <circle cx={pos.x} cy={pos.y} r={R+14}
                          fill="rgba(201,168,76,0.08)"
                          stroke="#c9a84c" strokeWidth="1.5"
                          strokeDasharray="4 3" opacity="0.8"/>
                )}
                {/* Halo dragover */}
                {over === pos.id && (
                  <circle cx={pos.x} cy={pos.y} r={R+14}
                          fill={`${col}20`} stroke={col} strokeWidth="2" opacity="0.9"/>
                )}
                {/* Ombre */}
                <circle cx={pos.x} cy={pos.y+3} r={R} fill="rgba(0,0,0,0.22)"/>
                {/* Halo sélection */}
                {isSel && <circle cx={pos.x} cy={pos.y} r={R+9} fill="none" stroke={col} strokeWidth="2" strokeDasharray="5 3" opacity="0.7"/>}
                {/* Nappe */}
                <circle cx={pos.x} cy={pos.y} r={R}
                        fill={over===pos.id ? `${col}50` : isSel ? `${col}40` : `${col}22`}
                        stroke={col}
                        strokeWidth={over===pos.id ? 3 : isSel ? 3.5 : isTarget ? 2 : 1.5}
                        opacity={1}/>
                {/* Chaises */}
                {[0,45,90,135,180,225,270,315].map((angle,i) => {
                  const rad = angle * Math.PI / 180
                  return (
                    <circle key={i}
                      cx={pos.x+(R+10)*Math.cos(rad)}
                      cy={pos.y+(R+10)*Math.sin(rad)}
                      r="4.5"
                      fill={i < count ? `${col}cc` : `${col}25`}
                      stroke={col} strokeWidth="0.8"/>
                  )
                })}
                {/* Fleur */}
                <text x={pos.x} y={pos.y-8} textAnchor="middle" fontSize="14" dominantBaseline="middle">{tbl?.flower}</text>
                {/* Nom table */}
                {(() => {
                  const LABELS = {
                    1:['Hibiscus',null], 2:['Frangipa-','nier'], 3:['Balisier',null],
                    4:['Bougan-','villée'], 5:['Lantana',null], 6:['Alamanda',null],
                    7:['Anthurium',null], 8:['Heliconias',null], 9:['Oiseau du','Paradis'],
                    10:['Cactus',null], 11:["Cœur","d'Amour"], 12:['Alpinia','Rose'],
                    13:['Orchidée',null], 14:['Pivoine','Trop.'], 15:['Rose de','Porcel.'],
                  }
                  const [l1,l2] = LABELS[tbl?.id]||[tbl?.name,null]
                  return l2 ? (
                    <text textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="6.5"
                          fontFamily="Josefin Sans,sans-serif">
                      <tspan x={pos.x} y={pos.y+4}>{l1}</tspan>
                      <tspan x={pos.x} dy="9">{l2}</tspan>
                    </text>
                  ) : (
                    <text x={pos.x} y={pos.y+6} textAnchor="middle" fill="rgba(255,255,255,0.85)"
                          fontSize="6.5" fontFamily="Josefin Sans,sans-serif">{l1}</text>
                  )
                })()}
                {/* Compteur */}
                <text x={pos.x} y={pos.y+22} textAnchor="middle" fill="white" fontSize="8"
                      fontFamily="Josefin Sans,sans-serif" fontWeight={isFull?'700':'400'}>
                  {count}/{MAX}
                </text>
                {/* Badge COMPLET */}
                {isFull && (
                  <>
                    <circle cx={pos.x+28} cy={pos.y-26} r="9" fill="#c9a84c"/>
                    <text x={pos.x+28} y={pos.y-22} textAnchor="middle" fill="#1a4a2e" fontSize="10" fontWeight="bold">✓</text>
                  </>
                )}
                {/* Croix "table pleine" si invité sélectionné */}
                {picked && isFull && (
                  <text x={pos.x} y={pos.y-32} textAnchor="middle" fill="#e74c3c" fontSize="14" opacity="0.8">✗</text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  // ── Détail table sélectionnée ─────────────────────────
  const TableDetail = () => {
    if (!selTable) return null
    const tbl = TABLES.find(t => t.id === selTable)
    const tg  = gAt(guests, selTable)
    const col = COL[selTable]||'#c9a84c'
    return (
      <div style={{
        background:`${col}18`, borderRadius:'14px',
        padding:'14px 16px', border:`1px solid ${col}40`,
        marginTop:'12px',
      }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
          <span style={{fontFamily:'"Playfair Display",serif', fontStyle:'italic', color:'#f0d080', fontSize:'1rem'}}>
            {tbl?.flower} Table {tbl?.name}
          </span>
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <span style={{color:'rgba(255,255,255,0.4)', fontSize:'0.72rem'}}>{tg.length}/{MAX}</span>
            <button onClick={() => setSelTable(null)} style={{
              background:'rgba(255,255,255,0.08)', border:'none', borderRadius:'50%',
              width:'22px', height:'22px', cursor:'pointer', color:'rgba(255,255,255,0.5)',
              fontSize:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center',
            }}>✕</button>
          </div>
        </div>
        {tg.length === 0 ? (
          <p style={{color:'rgba(255,255,255,0.25)', fontSize:'0.75rem', fontStyle:'italic'}}>
            Aucun invité assigné — sélectionnez un invité en bas puis cliquez cette table
          </p>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'3px'}}>
            {tg.map(g => <Chip key={g.id} g={g} inPool={false}/>)}
          </div>
        )}
        <button onClick={() => setQr(tbl)} style={{
          marginTop:'10px', width:'100%', padding:'7px', borderRadius:'8px',
          border:`1px solid ${col}40`, background:`${col}12`, color:'#f0d080',
          fontSize:'0.6rem', letterSpacing:'0.15em', cursor:'pointer',
          textTransform:'uppercase', fontFamily:'inherit',
        }}>📱 QR Code table</button>
      </div>
    )
  }

  const totalPlaced = placed.length
  const fullTables  = TABLES.filter(t => gAt(guests, t.id).length >= MAX).length

  return (
    <div style={{fontFamily:'"Josefin Sans",sans-serif', userSelect:'none'}}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position:'fixed', top:'72px', right:'16px', zIndex:9999,
          padding:'11px 18px', borderRadius:'12px', fontSize:'0.83rem', fontWeight:600,
          boxShadow:'0 8px 32px rgba(0,0,0,0.45)',
          background: toast.type==='err' ? '#c0392b' : 'linear-gradient(135deg,#c9a84c,#f0d080)',
          color: toast.type==='err' ? 'white' : '#1a4a2e',
          animation:'slideIn 0.2s ease',
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{padding:'20px 24px'}}>

        {/* ── En-tête ── */}
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'16px', marginBottom:'16px'}}>
          <div>
            <h2 style={{fontFamily:'"Playfair Display",serif', fontStyle:'italic', fontSize:'1.75rem', color:'#f0d080', margin:0}}>
              Plan de Tables
            </h2>
            <p style={{color:'#4caf7d', fontSize:'0.6rem', letterSpacing:'0.3em', textTransform:'uppercase', marginTop:'3px'}}>
              {TABLES.length} tables · Max {MAX} · Cliquer ou Glisser pour placer
            </p>
          </div>
          <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
            {[
              {n:totalPlaced,       tot:guests.length,  l:'Placés',   c:'#4caf7d'},
              {n:unassigned.length, tot:guests.length,  l:'À placer', c:'#f39c12'},
              {n:fullTables,        tot:TABLES.length,  l:'Tables ✓', c:'#c9a84c'},
            ].map(s => (
              <div key={s.l} style={{
                background:'rgba(0,0,0,0.25)', borderRadius:'10px',
                padding:'9px 14px', textAlign:'center',
                border:'1px solid rgba(255,255,255,0.07)', minWidth:'80px',
              }}>
                <div style={{fontSize:'1.3rem', fontFamily:'"Playfair Display",serif', color:s.c, fontWeight:700, lineHeight:1}}>
                  {s.n}<span style={{fontSize:'0.7rem', color:'rgba(255,255,255,0.22)'}}>/{s.tot}</span>
                </div>
                <div style={{fontSize:'0.56rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginTop:'2px'}}>
                  {s.l}
                </div>
              </div>
            ))}
            {saving && <span style={{color:'rgba(255,255,255,0.35)', fontSize:'0.7rem', alignSelf:'center'}}>⏳</span>}
          </div>
        </div>

        {/* ── Guide d'utilisation ── */}
        <div style={{
          display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'16px',
          padding:'10px 14px', borderRadius:'12px',
          background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)',
        }}>
          {[
            {icon:'1️⃣', text:'Cliquez un invité non assigné (il devient doré)'},
            {icon:'2️⃣', text:'Les tables disponibles s\'illuminent'},
            {icon:'3️⃣', text:'Cliquez la table souhaitée → assigné !'},
            {icon:'↔️', text:'Ou glissez directement un invité sur une table'},
          ].map((step,i) => (
            <div key={i} style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'0.72rem', color:'rgba(255,255,255,0.6)'}}>
              <span>{step.icon}</span>
              <span>{step.text}</span>
              {i < 3 && <span style={{color:'rgba(255,255,255,0.2)', marginLeft:'4px'}}>→</span>}
            </div>
          ))}
        </div>

        {/* ── Contenu principal : Plan SVG + détail table ── */}
        <div style={{display:'grid', gridTemplateColumns:'1fr', gap:'0', marginBottom:'16px'}}>
          <SalleMap/>
          <TableDetail/>
        </div>

        {/* ── Pool invités non assignés ── */}
        <div
          onDragOver={e => { e.preventDefault(); setOver('pool') }}
          onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(null) }}
          onDrop={e => { e.preventDefault(); dropOn('pool') }}
          style={{
            borderRadius:'16px',
            border: over==='pool'
              ? '2px dashed #f39c12'
              : picked
              ? '1px solid rgba(201,168,76,0.4)'
              : '1px solid rgba(255,255,255,0.1)',
            background: over==='pool'
              ? 'rgba(243,156,18,0.1)'
              : 'rgba(0,0,0,0.2)',
            padding:'16px',
            transition:'all 0.15s',
          }}
        >
          {/* Header pool */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px', flexWrap:'wrap', gap:'8px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <span style={{color:'rgba(255,255,255,0.5)', fontSize:'0.62rem', letterSpacing:'0.22em', textTransform:'uppercase'}}>
                🪑 Non assignés
              </span>
              <span style={{
                background: unassigned.length > 0 ? '#f39c1230' : '#4caf7d30',
                border: `1px solid ${unassigned.length > 0 ? '#f39c1260' : '#4caf7d60'}`,
                borderRadius:'20px', padding:'1px 8px', fontSize:'0.68rem',
                color: unassigned.length > 0 ? '#f39c12' : '#4caf7d',
                fontWeight:700,
              }}>
                {unassigned.length === 0 ? '✓ Tous placés !' : unassigned.length}
              </span>
              {picked && (
                <span style={{
                  background:'rgba(201,168,76,0.2)', border:'1px solid #c9a84c',
                  borderRadius:'20px', padding:'2px 10px', fontSize:'0.68rem', color:'#f0d080',
                  fontWeight:700,
                }}>
                  📌 {guests.find(g=>g.id===picked)?.name} — cliquez une table
                </span>
              )}
            </div>
            <div style={{display:'flex', gap:'7px', flexWrap:'wrap'}}>
              {picked && (
                <button onClick={() => setPicked(null)} style={{
                  padding:'5px 10px', borderRadius:'8px', cursor:'pointer',
                  background:'rgba(231,76,60,0.2)', border:'1px solid rgba(231,76,60,0.4)',
                  color:'#e74c3c', fontSize:'0.68rem', fontFamily:'inherit',
                }}>✕ Annuler</button>
              )}
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Rechercher…" autoComplete="off"
                style={{
                  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                  borderRadius:'8px', padding:'5px 9px', color:'white',
                  fontSize:'0.72rem', outline:'none', width:'140px',
                }}
              />
              <select value={grpFilter} onChange={e => setGrpFilter(e.target.value)} style={{
                background:'#1a4a2e', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:'8px', padding:'5px 7px', color:'rgba(255,255,255,0.6)',
                fontSize:'0.68rem', outline:'none',
              }}>
                <option value="all">Tous</option>
                <option value="mariee">👰 Mariée</option>
                <option value="marie">🤵 Marié</option>
                <option value="famille">👨‍👩‍👧 Famille</option>
                <option value="amis">👫 Amis</option>
                <option value="collegue">💼 Collègue</option>
                <option value="autre">🌺 Autre</option>
              </select>
            </div>
          </div>

          {/* Liste invités non assignés */}
          {unassigned.length === 0 ? (
            <div style={{textAlign:'center', padding:'20px', color:'#4caf7d', fontSize:'0.8rem'}}>
              🎉 Tous les invités sont placés !
            </div>
          ) : filtered.length === 0 ? (
            <p style={{color:'rgba(255,255,255,0.2)', fontSize:'0.72rem', fontStyle:'italic', textAlign:'center', padding:'12px'}}>
              Aucun résultat
            </p>
          ) : (
            <div style={{display:'flex', flexWrap:'wrap', gap:'7px'}}>
              {filtered.map(g => <Chip key={g.id} g={g} inPool={true}/>)}
            </div>
          )}

          {over === 'pool' && (
            <div style={{textAlign:'center', color:'#f39c12', fontSize:'0.72rem', marginTop:'8px', opacity:0.8}}>
              ⬇ Déposer ici pour retirer de la table
            </div>
          )}
        </div>

        {/* ── Vue liste de toutes les tables (accordéon) ── */}
        <div style={{marginTop:'24px'}}>
          <p style={{color:'rgba(255,255,255,0.3)', fontSize:'0.6rem', letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:'12px'}}>
            Vue liste — toutes les tables
          </p>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'10px'}}>
            {TABLES.map(tbl => {
              const tg     = gAt(guests, tbl.id)
              const count  = tg.length
              const isFull = count >= MAX
              const isOver = over === tbl.id
              const col    = COL[tbl.id]||'#c9a84c'
              const isSel  = selTable === tbl.id
              const isTarget = picked && !isFull
              return (
                <div
                  key={tbl.id}
                  onDragOver={e => { e.preventDefault(); setOver(tbl.id) }}
                  onDragLeave={() => setOver(null)}
                  onDrop={e => { e.preventDefault(); dropOn(tbl.id) }}
                  onClick={() => clickTable(tbl.id)}
                  style={{
                    borderRadius:'14px', overflow:'hidden', cursor:'pointer',
                    border: isOver ? `2px solid ${col}` : isTarget ? `2px solid ${col}80` : isSel ? `2px solid ${col}60` : '1px solid rgba(255,255,255,0.08)',
                    background: isOver ? `${col}20` : isTarget ? `${col}10` : 'linear-gradient(160deg,#1a4a2e,#0d2b1a)',
                    transform: isOver ? 'scale(1.02)' : isTarget ? 'scale(1.005)' : 'scale(1)',
                    transition:'all 0.12s',
                    boxShadow: isTarget ? `0 4px 16px ${col}30` : 'none',
                  }}
                >
                  <div style={{height:'3px', background:col, opacity:isFull?1:0.5}}/>
                  <div style={{padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                      <span style={{fontSize:'1.2rem'}}>{tbl.flower}</span>
                      <span style={{color:'#f0d080', fontSize:'0.82rem', fontFamily:'"Playfair Display",serif', fontStyle:'italic'}}>{tbl.name}</span>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <span style={{color:isFull?'#c9a84c':'#f0d080', fontWeight:700, fontSize:'1rem', fontFamily:'"Playfair Display",serif'}}>{count}</span>
                      <span style={{color:'rgba(255,255,255,0.25)', fontSize:'0.72rem'}}>/{MAX}</span>
                      {isFull && <div style={{fontSize:'0.5rem', color:'#c9a84c', letterSpacing:'0.1em'}}>COMPLET</div>}
                    </div>
                  </div>
                  <div style={{height:'3px', background:'rgba(255,255,255,0.06)'}}>
                    <div style={{height:'100%', width:`${Math.round(count/MAX*100)}%`, background:col, opacity:0.7, transition:'width 0.4s'}}/>
                  </div>
                  {tg.length > 0 && (
                    <div style={{padding:'8px 12px 10px'}}>
                      {tg.map(g => (
                        <div key={g.id} style={{
                          display:'flex', justifyContent:'space-between', alignItems:'center',
                          padding:'3px 0', borderBottom:'1px solid rgba(255,255,255,0.04)',
                          fontSize:'0.76rem',
                        }}>
                          <span style={{color:'rgba(255,255,255,0.8)'}}>{g.name}</span>
                          <button onClick={e=>{e.stopPropagation();move(g.id,null)}} style={{
                            background:'none', border:'none', cursor:'pointer',
                            color:'rgba(255,255,255,0.2)', fontSize:'0.75rem', padding:'0 2px',
                          }}
                          onMouseEnter={e=>e.target.style.color='#e74c3c'}
                          onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.2)'}
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {isOver && !isFull && (
                    <div style={{textAlign:'center', color:col, fontSize:'0.68rem', padding:'6px', opacity:0.8}}>⬇ Déposer ici</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── QR Modal ── */}
      {qr && (
        <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.88)'}}
             onClick={() => setQr(null)}>
          <div style={{background:'linear-gradient(160deg,#1a4a2e,#0d2b1a)',border:'1px solid rgba(201,168,76,0.5)',borderRadius:'20px',padding:'32px',maxWidth:'340px',width:'90%',textAlign:'center'}}
               onClick={e => e.stopPropagation()}>
            <div style={{fontSize:'2.2rem',marginBottom:'8px'}}>{qr.flower}</div>
            <h3 style={{fontFamily:'"Playfair Display",serif',fontStyle:'italic',color:'#f0d080',fontSize:'1.2rem',marginBottom:'3px'}}>Table {qr.name}</h3>
            <p style={{color:'rgba(255,255,255,0.3)',fontSize:'0.65rem',marginBottom:'18px'}}>{qr.theme}</p>
            <div style={{background:'white',padding:'14px',borderRadius:'10px',display:'inline-block'}}>
              <QRCodeDisplay text={`WEDDING-TABLE-${qr.id}-${qr.name}`} size={170}/>
            </div>
            <p style={{color:'rgba(255,255,255,0.3)',fontSize:'0.62rem',marginTop:'12px'}}>Scanner à l'entrée pour check-in</p>
            <button onClick={() => setQr(null)} style={{marginTop:'14px',padding:'9px 26px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.2)',background:'transparent',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:'0.7rem',letterSpacing:'0.2em',textTransform:'uppercase',fontFamily:'inherit'}}>Fermer</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes pulse {
          0%,100% { transform: translateX(-50%) scale(1); }
          50%      { transform: translateX(-50%) scale(1.03); }
        }
        [draggable]:active { cursor: grabbing; }
      `}</style>
    </div>
  )
}
