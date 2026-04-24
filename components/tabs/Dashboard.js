// Dashboard.js — Couleurs sémantiques tropicales
'use client'
import { TABLES, GROUP_COLORS } from '../../lib/data'

export default function Dashboard({ guests }) {
  const total     = guests.length
  const confirmed = guests.filter(g=>g.status==='confirmed').length
  const pending   = guests.filter(g=>g.status==='pending').length
  const declined  = guests.filter(g=>g.status==='declined').length
  const present   = guests.filter(g=>g.present).length
  const noTable   = guests.filter(g=>!g.tableId).length

  const groupStats = Object.entries(GROUP_COLORS).map(([k,v])=>({
    ...v, key:k,
    count: guests.filter(g=>(g.group||'autre')===k).length,
  })).filter(g=>g.count>0)

  // Couleurs sémantiques tropicales
  const STATS = [
    { n:total,     l:'Invités',    c:'#EAB308', icon:'👥' },  // Jaune — soleil
    { n:confirmed, l:'Confirmés',  c:'#22C55E', icon:'✅' },  // Vert  — nature
    { n:pending,   l:'En attente', c:'#F97316', icon:'⏳' },  // Orange — action
    { n:declined,  l:'Déclinés',   c:'#EF4444', icon:'✕'  },  // Rouge — alerte
    { n:present,   l:'Présents',   c:'#c9a84c', icon:'🌺' },  // Or — luxe
    { n:noTable,   l:'Sans table', c: noTable>0?'#EF4444':'#22C55E', icon:'🪑' },
  ]

  return (
    <div className="p-6 md:p-10 fade-in">

      {/* En-tête */}
      <h2 className="italic text-3xl mb-1"
          style={{fontFamily:'var(--font-display)', color:'var(--gold-light)'}}>
        Tableau de Bord
      </h2>
      <p style={{
        color:'var(--green-light)', fontSize:'0.6rem',
        letterSpacing:'0.35em', textTransform:'uppercase', marginBottom:'32px',
      }}>
        Vue d'ensemble — Balade Tropicale · 30 Juin 2026
      </p>

      {/* ── Stats principales ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {STATS.map((s,i)=>(
          <div key={s.l}
               className={`relative overflow-hidden rounded-xl p-4 text-center gold-bar service-card stagger-${i+1} fade-in`}>
            <div style={{fontSize:'1.4rem', marginBottom:'4px'}}>{s.icon}</div>
            <div className="text-3xl font-bold"
                 style={{fontFamily:'var(--font-display)', color:s.c}}>{s.n}</div>
            <div style={{color:'rgba(255,255,255,0.45)', fontSize:'0.58rem',
                         letterSpacing:'0.2em', textTransform:'uppercase', marginTop:'4px'}}>
              {s.l}
            </div>
            {s.l!=='Sans table' && total>0 && (
              <div style={{
                marginTop:'8px', height:'3px',
                background:'rgba(255,255,255,0.08)', borderRadius:'2px', overflow:'hidden'
              }}>
                <div style={{
                  height:'100%', borderRadius:'2px', transition:'width 0.6s ease',
                  width:`${Math.round(s.n/total*100)}%`, background:s.c, opacity:0.85,
                }}/>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Répartition par groupe ── */}
      {groupStats.length > 0 && (
        <div className="mb-10">
          <h3 className="italic text-xl mb-4"
              style={{fontFamily:'var(--font-display)', color:'var(--gold-light)'}}>
            Répartition par groupe
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {groupStats.map((g,i)=>(
              <div key={g.key}
                   className={`rounded-xl p-4 text-center fade-in stagger-${i+1}`}
                   style={{
                     background:  g.bg,
                     border:      `1px solid ${g.border}`,
                     backdropFilter: 'blur(12px)',
                   }}>
                <div style={{fontSize:'1.5rem', marginBottom:'4px'}}>{g.icon}</div>
                <div className="text-2xl font-bold"
                     style={{fontFamily:'var(--font-display)', color:g.text}}>{g.count}</div>
                <div style={{
                  fontSize:'0.58rem', letterSpacing:'0.18em',
                  textTransform:'uppercase', color:g.text, opacity:0.8, marginTop:'2px'
                }}>{g.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── État des tables ──
          Titres en JAUNE #EAB308 — soleil tropical */}
      <h3 className="italic text-xl mb-4"
          style={{fontFamily:'var(--font-display)', color:'var(--gold-light)'}}>
        État des tables
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        {TABLES.map((t,i)=>{
          const count = guests.filter(g=>g.tableId===t.id).length
          const pct   = Math.round(count/t.capacity*100)
          const full  = count >= t.capacity
          return (
            <div key={t.id}
                 className={`relative overflow-hidden rounded-xl p-3 text-center gold-bar fade-in stagger-${(i%6)+1}`}
                 style={{
                   background: 'rgba(13,43,26,0.75)',
                   backdropFilter: 'blur(12px)',
                   border: full
                     ? '1px solid rgba(234,179,8,0.5)'
                     : '1px solid rgba(201,168,76,0.2)',
                 }}>
              <div style={{fontSize:'1.2rem', marginBottom:'3px'}}>{t.flower}</div>
              {/* Titre table — Jaune #EAB308 = soleil */}
              <div className="italic text-xs leading-tight"
                   style={{
                     fontFamily:'var(--font-display)',
                     color: full ? 'var(--yellow-trop)' : 'var(--gold-light)',
                     fontWeight: full ? 700 : 400,
                   }}>
                {t.name}
              </div>
              <div className="font-bold mt-1"
                   style={{fontFamily:'var(--font-display)', color:'white', fontSize:'1.1rem'}}>
                {count}
                <span style={{color:'rgba(255,255,255,0.25)', fontSize:'0.75rem'}}>/{t.capacity}</span>
              </div>
              <div style={{
                marginTop:'6px', height:'3px',
                background:'rgba(255,255,255,0.07)', borderRadius:'2px', overflow:'hidden',
              }}>
                <div style={{
                  height:'100%', transition:'width 0.5s',
                  width:`${pct}%`,
                  background: full
                    ? 'linear-gradient(90deg,var(--yellow-trop),var(--gold-light))'
                    : 'linear-gradient(90deg,var(--green-light),var(--gold))',
                }}/>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
