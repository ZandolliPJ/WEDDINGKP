// Tables.js — Plan de table interactif style mariages.net
// Drag & Drop invités · Vue salle SVG · Limite 8 personnes
'use client'
import { useState, useCallback } from 'react'
import { TABLES, GROUP_COLORS } from '../../lib/data'
import QRCodeDisplay from '../QRCodeDisplay'

const MAX_PER_TABLE = 8

const TABLE_COLORS = {
  1:'#e74c3c',2:'#e91e8c',3:'#e74c3c',4:'#9b59b6',
  5:'#f39c12',6:'#f1c40f',7:'#c0392b',8:'#27ae60',
  9:'#16a085',10:'#2ecc71',11:'#c9a84c',12:'#1abc9c',
  13:'#e91e8c',14:'#e67e22',
}

const TABLE_SVG_POS = [
  {id:1,x:90,y:80},{id:2,x:210,y:80},{id:3,x:330,y:65},
  {id:4,x:450,y:80},{id:5,x:570,y:80},
  {id:6,x:70,y:220},{id:7,x:70,y:330},
  {id:8,x:590,y:220},{id:9,x:590,y:330},
  {id:10,x:90,y:460},{id:11,x:210,y:470},{id:12,x:330,y:475},
  {id:13,x:450,y:470},{id:14,x:570,y:460},
]

export default function Tables({ guests, onGuestsChange }) {
  const [dragGuest,     setDragGuest]     = useState(null)
  const [dragOver,      setDragOver]      = useState(null)
  const [dragFromTable, setDragFromTable] = useState(null)
  const [toast,         setToast]         = useState(null)
  const [search,        setSearch]        = useState('')
  const [filterGroup,   setFilterGroup]   = useState('all')
  const [selectedTable, setSelectedTable] = useState(null)
  const [qrModal,       setQrModal]       = useState(null)
  const [view,          setView]          = useState('split')

  const guestsAt   = useCallback((tid) => guests.filter(g => g.tableId === tid), [guests])
  const unassigned = guests.filter(g => !g.tableId)

  const showToast = (msg, type='success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const filteredUnassigned = unassigned.filter(g => {
    const q = search.toLowerCase()
    return (!q || g.name.toLowerCase().includes(q)) &&
           (filterGroup === 'all' || g.group === filterGroup)
  })

  function onDragStart(guestId, fromTableId) {
    setDragGuest(guestId)
    setDragFromTable(fromTableId)
  }
  function onDragEnd() {
    setDragGuest(null); setDragOver(null); setDragFromTable(null)
  }

  async function dropOnTable(targetTableId) {
    if (!dragGuest) return
    setDragOver(null)
    const guest = guests.find(g => g.id === dragGuest)
    if (!guest || guest.tableId === targetTableId) { onDragEnd(); return }
    const tbl = TABLES.find(t => t.id === targetTableId)
    const count = guestsAt(targetTableId).length
    if (count >= MAX_PER_TABLE) {
      showToast(`⚠️ Table ${tbl.name} complète (max ${MAX_PER_TABLE})`, 'error')
      onDragEnd(); return
    }
    try {
      const res = await fetch('/api/guests', {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id: guest.id, tableId: targetTableId }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      onGuestsChange(guests.map(g => g.id === updated.id ? updated : g))
      showToast(`✅ ${guest.name} → ${tbl.flower} ${tbl.name}`)
    } catch { showToast('Erreur lors du déplacement', 'error') }
    onDragEnd()
  }

  async function dropOnUnassigned() {
    if (!dragGuest || !dragFromTable) { onDragEnd(); return }
    try {
      const res = await fetch('/api/guests', {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id: dragGuest, tableId: null }),
      })
      const updated = await res.json()
      onGuestsChange(guests.map(g => g.id === updated.id ? updated : g))
      showToast(`↩️ ${updated.name} retiré de la table`)
    } catch { showToast('Erreur', 'error') }
    onDragEnd()
  }

  async function removeGuest(guestId) {
    try {
      const res = await fetch('/api/guests', {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id: guestId, tableId: null }),
      })
      const updated = await res.json()
      onGuestsChange(guests.map(g => g.id === updated.id ? updated : g))
    } catch {}
  }

  // ── Chip invité ──
  const GuestChip = ({ guest, compact=false }) => {
    const gc = GROUP_COLORS[guest.group||'autre']||GROUP_COLORS.autre
    return (
      <div draggable
           onDragStart={() => onDragStart(guest.id, guest.tableId)}
           onDragEnd={onDragEnd}
           style={{
             display:'flex',alignItems:'center',gap:'5px',
             padding: compact?'3px 7px':'5px 9px',
             borderRadius:'8px', marginBottom: compact?'2px':'3px',
             background:gc.bg, border:`1px solid ${gc.border}`,
             cursor:'grab', userSelect:'none', fontSize:'0.76rem',
             opacity: dragGuest===guest.id?0.4:1,
             transition:'opacity 0.1s',
           }}>
        <span style={{fontSize:'0.85rem'}}>{gc.icon}</span>
        <span style={{color:'#fff',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{guest.name}</span>
        {guest.present && <span style={{fontSize:'0.6rem',color:'#4caf7d'}}>✓</span>}
        {guest.tableId && (
          <button onClick={e=>{e.stopPropagation();removeGuest(guest.id)}}
                  style={{background:'none',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer',fontSize:'0.75rem',padding:'0 2px'}}>✕</button>
        )}
      </div>
    )
  }

  // ── Carte table ──
  const TableCard = ({ table }) => {
    const tg = guestsAt(table.id)
    const count = tg.length
    const isFull = count >= MAX_PER_TABLE
    const isOver = dragOver === table.id
    const isSel  = selectedTable === table.id
    const col = TABLE_COLORS[table.id]||'#c9a84c'
    const pct = Math.round(count/MAX_PER_TABLE*100)

    return (
      <div onDragOver={e=>{e.preventDefault();setDragOver(table.id)}}
           onDragLeave={()=>setDragOver(null)}
           onDrop={()=>dropOnTable(table.id)}
           onClick={()=>setSelectedTable(isSel?null:table.id)}
           style={{
             borderRadius:'14px',overflow:'hidden',cursor:'pointer',marginBottom:'10px',
             border: isOver?`2px dashed ${col}`:isSel?`2px solid ${col}`:'1px solid rgba(255,255,255,0.08)',
             background: isOver?`${col}18`:isSel?`${col}10`:'linear-gradient(160deg,#1a4a2e,#0d2b1a)',
             transform: isOver?'scale(1.01)':'scale(1)',
             transition:'all 0.15s',
             boxShadow: isSel?`0 0 0 2px ${col}40`:'none',
           }}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:`linear-gradient(135deg,${col}30,${col}08)`,borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <span style={{fontSize:'1.3rem'}}>{table.flower}</span>
            <div>
              <div style={{color:'#f0d080',fontSize:'0.85rem',fontFamily:'"Playfair Display",serif',fontStyle:'italic'}}>{table.name}</div>
              <div style={{color:'rgba(255,255,255,0.25)',fontSize:'0.58rem',letterSpacing:'0.12em'}}>{table.theme}</div>
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <span style={{color:isFull?'#c9a84c':'#f0d080',fontWeight:700,fontSize:'1rem',fontFamily:'"Playfair Display",serif'}}>{count}</span>
            <span style={{color:'rgba(255,255,255,0.3)',fontSize:'0.75rem'}}>/{MAX_PER_TABLE}</span>
            {isFull&&<div style={{fontSize:'0.52rem',color:'#c9a84c',letterSpacing:'0.1em'}}>COMPLET ✓</div>}
          </div>
        </div>
        {/* Progress */}
        <div style={{height:'3px',background:'rgba(255,255,255,0.05)'}}>
          <div style={{height:'100%',width:`${pct}%`,background:isFull?'linear-gradient(90deg,#c9a84c,#f0d080)':`${col}cc`,transition:'width 0.4s'}}/>
        </div>
        {/* Invités */}
        <div style={{padding:'10px 12px',minHeight:'48px'}}>
          {count===0?(
            <p style={{color:'rgba(255,255,255,0.18)',fontSize:'0.7rem',fontStyle:'italic',textAlign:'center',padding:'8px 0'}}>
              {isOver?'⬇️ Déposer ici':'Glissez des invités ici'}
            </p>
          ):tg.map(g=><GuestChip key={g.id} guest={g} compact/>)}
          {isOver&&count>0&&!isFull&&(
            <div style={{textAlign:'center',color:col,fontSize:'0.68rem',padding:'4px',opacity:0.7}}>⬇️ Déposer ici</div>
          )}
        </div>
        {/* QR */}
        <div style={{padding:'0 12px 10px'}}>
          <button onClick={e=>{e.stopPropagation();setQrModal(table)}} style={{width:'100%',padding:'6px',borderRadius:'8px',border:`1px solid ${col}40`,background:`${col}12`,color:'#f0d080',fontSize:'0.6rem',letterSpacing:'0.15em',cursor:'pointer',textTransform:'uppercase',fontFamily:'inherit'}}>
            📱 QR Code Table
          </button>
        </div>
      </div>
    )
  }

  // ── Plan SVG salle ──
  const SalleView = () => (
    <svg viewBox="0 0 680 560" style={{width:'100%',height:'auto',borderRadius:'16px',border:'1px solid rgba(201,168,76,0.25)',display:'block'}}>
      <defs>
        <radialGradient id="sg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#1e5c35"/>
          <stop offset="100%" stopColor="#0a1f12"/>
        </radialGradient>
      </defs>
      <rect width="680" height="560" fill="url(#sg)"/>
      <rect x="290" y="2" width="100" height="16" rx="4" fill="#0a1f12" stroke="rgba(201,168,76,0.4)" strokeWidth="1"/>
      <text x="340" y="14" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Josefin Sans,sans-serif" letterSpacing="3">ENTRÉE</text>
      <rect x="250" y="542" width="180" height="16" rx="4" fill="#0a1f12" stroke="rgba(201,168,76,0.4)" strokeWidth="1"/>
      <text x="340" y="554" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Josefin Sans,sans-serif" letterSpacing="2">🎤 DJ / SCÈNE</text>
      {/* Piste de danse */}
      <rect x="200" y="175" width="280" height="200" rx="14" fill="rgba(201,168,76,0.04)" stroke="#c9a84c" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.6"/>
      {[0,1,2,3].map(c=>[0,1,2].map(r=>(
        <rect key={`${c}-${r}`} x={208+c*68} y={183+r*64} width="62" height="56" rx="4" fill="rgba(201,168,76,0.03)" stroke="rgba(201,168,76,0.08)" strokeWidth="0.5"/>
      )))}
      <text x="340" y="272" textAnchor="middle" fill="rgba(201,168,76,0.5)" fontSize="22">♪</text>
      <text x="368" y="287" textAnchor="middle" fill="rgba(201,168,76,0.35)" fontSize="15">♫</text>
      <text x="340" y="304" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="Josefin Sans,sans-serif" letterSpacing="4">PISTE DE DANSE</text>
      {/* Tables */}
      {TABLE_SVG_POS.map(pos => {
        const tbl   = TABLES.find(t=>t.id===pos.id)
        const count = guestsAt(pos.id).length
        const col   = TABLE_COLORS[pos.id]||'#c9a84c'
        const isFull= count>=MAX_PER_TABLE
        const isSel = selectedTable===pos.id
        const R     = 36
        return (
          <g key={pos.id} style={{cursor:'pointer'}} onClick={()=>setSelectedTable(isSel?null:pos.id)}>
            <circle cx={pos.x} cy={pos.y+3} r={R} fill="rgba(0,0,0,0.25)"/>
            <circle cx={pos.x} cy={pos.y} r={R} fill={`${col}28`} stroke={col} strokeWidth={isSel?3:1.5} opacity={isSel?1:0.85}/>
            {[0,45,90,135,180,225,270,315].map((angle,i)=>{
              const rad=angle*Math.PI/180
              return <circle key={i} cx={pos.x+(R+9)*Math.cos(rad)} cy={pos.y+(R+9)*Math.sin(rad)} r="4"
                             fill={i<count?`${col}90`:`${col}25`} stroke={col} strokeWidth="0.8"/>
            })}
            <text x={pos.x} y={pos.y-5} textAnchor="middle" fontSize="15" dominantBaseline="middle">{tbl?.flower}</text>
            <text x={pos.x} y={pos.y+12} textAnchor="middle" fill="white" fontSize="8" fontFamily="Josefin Sans,sans-serif">{count}/{MAX_PER_TABLE}</text>
            {isFull&&<>
              <circle cx={pos.x+28} cy={pos.y-28} r="8" fill="#c9a84c"/>
              <text x={pos.x+28} y={pos.y-24} textAnchor="middle" fill="#1a4a2e" fontSize="9" fontWeight="bold">✓</text>
            </>}
          </g>
        )
      })}
      {/* Légende */}
      <rect x="15" y="480" width="120" height="28" rx="5" fill="rgba(0,0,0,0.4)"/>
      <circle cx="28" cy="494" r="6" fill="rgba(201,168,76,0.25)" stroke="#c9a84c" strokeWidth="1"/>
      <circle cx="28" cy="494" r="3" fill="rgba(201,168,76,0.6)"/>
      <text x="40" y="498" fill="rgba(255,255,255,0.35)" fontSize="7.5" fontFamily="Josefin Sans,sans-serif">Place occupée</text>
      <circle cx="90" cy="494" r="3" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8"/>
      <text x="98" y="498" fill="rgba(255,255,255,0.3)" fontSize="7.5" fontFamily="Josefin Sans,sans-serif">Libre</text>
    </svg>
  )

  const totalPlaced = guests.filter(g=>g.tableId).length

  return (
    <div className="fade-in" style={{fontFamily:'"Josefin Sans",sans-serif'}}>

      {/* Toast */}
      {toast&&(
        <div style={{position:'fixed',top:'80px',right:'20px',zIndex:999,padding:'12px 20px',borderRadius:'12px',fontSize:'0.85rem',boxShadow:'0 8px 30px rgba(0,0,0,0.4)',background:toast.type==='error'?'#c0392b':'linear-gradient(135deg,#c9a84c,#f0d080)',color:toast.type==='error'?'white':'#1a4a2e',fontWeight:600}}>
          {toast.msg}
        </div>
      )}

      <div style={{padding:'24px 32px'}}>

        {/* En-tête */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:'16px',marginBottom:'20px'}}>
          <div>
            <h2 style={{fontFamily:'"Playfair Display",serif',fontStyle:'italic',fontSize:'1.8rem',color:'#f0d080',marginBottom:'4px'}}>Plan de Tables</h2>
            <p style={{color:'#4caf7d',fontSize:'0.6rem',letterSpacing:'0.3em',textTransform:'uppercase'}}>
              Drag & Drop · {TABLES.length} tables · Max {MAX_PER_TABLE} pers. · Piste de danse au centre
            </p>
          </div>
          {/* Stats */}
          <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
            {[
              {label:'Placés',val:totalPlaced,tot:guests.length,col:'#4caf7d'},
              {label:'Sans table',val:unassigned.length,tot:guests.length,col:'#f39c12'},
              {label:'Tables pleines',val:TABLES.filter(t=>guestsAt(t.id).length>=MAX_PER_TABLE).length,tot:TABLES.length,col:'#c9a84c'},
            ].map(s=>(
              <div key={s.label} style={{background:'rgba(0,0,0,0.25)',borderRadius:'10px',padding:'10px 14px',textAlign:'center',border:'1px solid rgba(255,255,255,0.07)',minWidth:'88px'}}>
                <div style={{fontSize:'1.35rem',fontFamily:'"Playfair Display",serif',color:s.col}}>
                  {s.val}<span style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.25)'}}>/{s.tot}</span>
                </div>
                <div style={{fontSize:'0.56rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'rgba(255,255,255,0.35)',marginTop:'2px'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sélecteur de vue */}
        <div style={{display:'flex',gap:'8px',marginBottom:'18px'}}>
          {[{k:'split',l:'⚡ Vue complète'},{k:'salle',l:'🗺️ Plan salle'},{k:'listes',l:'📋 Toutes les tables'}].map(v=>(
            <button key={v.k} onClick={()=>setView(v.k)} style={{padding:'7px 16px',borderRadius:'20px',fontSize:'0.68rem',letterSpacing:'0.12em',cursor:'pointer',fontFamily:'inherit',border:view===v.k?'1px solid #c9a84c':'1px solid rgba(255,255,255,0.1)',background:view===v.k?'rgba(201,168,76,0.15)':'transparent',color:view===v.k?'#f0d080':'rgba(255,255,255,0.4)',transition:'all 0.2s'}}>
              {v.l}
            </button>
          ))}
        </div>

        {/* ═══ VUE SPLIT ═══ */}
        {view==='split'&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:'20px',alignItems:'start'}}>
            {/* Gauche */}
            <div>
              <p style={{color:'rgba(255,255,255,0.25)',fontSize:'0.58rem',letterSpacing:'0.3em',textTransform:'uppercase',marginBottom:'8px'}}>
                Plan de la salle — cliquer une table pour la sélectionner
              </p>
              <div style={{marginBottom:'16px'}}><SalleView/></div>

              {/* Non assignés */}
              <div onDragOver={e=>{e.preventDefault();setDragOver('unassigned')}}
                   onDragLeave={()=>setDragOver(null)}
                   onDrop={dropOnUnassigned}
                   style={{borderRadius:'14px',padding:'16px',border:dragOver==='unassigned'?'2px dashed #f39c12':'1px solid rgba(255,255,255,0.1)',background:dragOver==='unassigned'?'rgba(243,156,18,0.1)':'rgba(0,0,0,0.2)',transition:'all 0.15s'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px',flexWrap:'wrap',gap:'8px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <span style={{color:'rgba(255,255,255,0.45)',fontSize:'0.62rem',letterSpacing:'0.22em',textTransform:'uppercase'}}>🪑 Non assignés</span>
                    <span style={{background:'#f39c1230',border:'1px solid #f39c1260',borderRadius:'20px',padding:'1px 8px',fontSize:'0.68rem',color:'#f39c12'}}>{unassigned.length}</span>
                  </div>
                  <div style={{display:'flex',gap:'7px'}}>
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher…" autoComplete="off"
                           style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',padding:'5px 9px',color:'white',fontSize:'0.72rem',outline:'none',width:'140px'}}/>
                    <select value={filterGroup} onChange={e=>setFilterGroup(e.target.value)}
                            style={{background:'#1a4a2e',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',padding:'5px 7px',color:'rgba(255,255,255,0.6)',fontSize:'0.68rem',outline:'none'}}>
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
                {filteredUnassigned.length===0?(
                  <p style={{color:'rgba(255,255,255,0.2)',fontSize:'0.72rem',fontStyle:'italic',textAlign:'center',padding:'14px'}}>
                    {unassigned.length===0?'✓ Tous les invités sont placés !':'Aucun résultat'}
                  </p>
                ):(
                  <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                    {filteredUnassigned.map(g=>{
                      const gc=GROUP_COLORS[g.group||'autre']||GROUP_COLORS.autre
                      return (
                        <div key={g.id} draggable onDragStart={()=>onDragStart(g.id,null)} onDragEnd={onDragEnd}
                             style={{display:'flex',alignItems:'center',gap:'5px',padding:'5px 10px',borderRadius:'20px',background:gc.bg,border:`1px solid ${gc.border}`,color:gc.text,fontSize:'0.73rem',cursor:'grab',userSelect:'none',opacity:dragGuest===g.id?0.4:1}}>
                          {gc.icon} {g.name}
                        </div>
                      )
                    })}
                  </div>
                )}
                {dragOver==='unassigned'&&(
                  <div style={{textAlign:'center',color:'#f39c12',fontSize:'0.72rem',marginTop:'8px',opacity:0.8}}>⬇️ Déposer pour retirer de la table</div>
                )}
              </div>
            </div>

            {/* Droite : tables */}
            <div style={{maxHeight:'85vh',overflowY:'auto',paddingRight:'2px'}}>
              <p style={{color:'rgba(255,255,255,0.25)',fontSize:'0.58rem',letterSpacing:'0.25em',textTransform:'uppercase',marginBottom:'10px'}}>
                {selectedTable?`✦ Table ${TABLES.find(t=>t.id===selectedTable)?.name} sélectionnée`:'Toutes les tables'}
              </p>
              {selectedTable&&(()=>{const t=TABLES.find(x=>x.id===selectedTable);return t?<TableCard key={t.id} table={t}/>:null})()}
              {TABLES.filter(t=>t.id!==selectedTable).map(t=><TableCard key={t.id} table={t}/>)}
            </div>
          </div>
        )}

        {/* ═══ VUE SALLE ═══ */}
        {view==='salle'&&(
          <div>
            <SalleView/>
            <p style={{textAlign:'center',color:'rgba(255,255,255,0.25)',fontSize:'0.68rem',marginTop:'10px'}}>
              Cliquer une table · Les chaises colorées = places occupées
            </p>
            {selectedTable&&(()=>{
              const t=TABLES.find(x=>x.id===selectedTable)
              const tg=guestsAt(selectedTable)
              const col=TABLE_COLORS[selectedTable]||'#c9a84c'
              return t?(
                <div style={{marginTop:'16px',background:`${col}15`,borderRadius:'14px',padding:'18px',border:`1px solid ${col}40`}}>
                  <h3 style={{color:'#f0d080',fontFamily:'"Playfair Display",serif',fontStyle:'italic',marginBottom:'10px',fontSize:'1.1rem'}}>
                    {t.flower} Table {t.name} — {tg.length}/{MAX_PER_TABLE} places
                  </h3>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                    {tg.map(g=><GuestChip key={g.id} guest={g}/>)}
                    {tg.length===0&&<p style={{color:'rgba(255,255,255,0.3)',fontSize:'0.8rem',fontStyle:'italic'}}>Aucun invité assigné</p>}
                  </div>
                </div>
              ):null
            })()}
          </div>
        )}

        {/* ═══ VUE LISTES ═══ */}
        {view==='listes'&&(
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'12px'}}>
            {TABLES.map(t=><TableCard key={t.id} table={t}/>)}
          </div>
        )}

      </div>

      {/* QR Modal */}
      {qrModal&&(
        <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.88)'}}
             onClick={()=>setQrModal(null)}>
          <div style={{background:'linear-gradient(160deg,#1a4a2e,#0d2b1a)',border:'1px solid rgba(201,168,76,0.5)',borderRadius:'20px',padding:'36px',maxWidth:'360px',width:'90%',textAlign:'center'}}
               onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:'2.5rem',marginBottom:'8px'}}>{qrModal.flower}</div>
            <h3 style={{fontFamily:'"Playfair Display",serif',fontStyle:'italic',color:'#f0d080',fontSize:'1.3rem',marginBottom:'4px'}}>Table {qrModal.name}</h3>
            <p style={{color:'rgba(255,255,255,0.3)',fontSize:'0.68rem',marginBottom:'20px',letterSpacing:'0.15em'}}>{qrModal.theme}</p>
            <div style={{background:'white',padding:'16px',borderRadius:'12px',display:'inline-block',boxShadow:'0 8px 24px rgba(0,0,0,0.3)'}}>
              <QRCodeDisplay text={`WEDDING-TABLE-${qrModal.id}-${qrModal.name}`} size={180}/>
            </div>
            <p style={{color:'rgba(255,255,255,0.3)',fontSize:'0.65rem',marginTop:'12px'}}>Scanner à l'entrée pour check-in</p>
            <button onClick={()=>setQrModal(null)} style={{marginTop:'14px',padding:'9px 26px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.2)',background:'transparent',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:'0.72rem',letterSpacing:'0.2em',textTransform:'uppercase',fontFamily:'inherit'}}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
