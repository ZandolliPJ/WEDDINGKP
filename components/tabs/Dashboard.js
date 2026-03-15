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

  return (
    <div className="p-6 md:p-10 fade-in">
      <h2 className="text-3xl text-gold-light italic playfair mb-1">Tableau de Bord</h2>
      <p className="text-green-light text-xs tracking-widest uppercase mb-8">Vue d'ensemble — Balade Tropicale · 30 Juin 2026</p>

      {/* Stats principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { n:total,     l:'Invités',    color:'#c9a84c' },
          { n:confirmed, l:'Confirmés',  color:'#4caf7d' },
          { n:pending,   l:'En attente', color:'#f39c12' },
          { n:declined,  l:'Déclinés',   color:'#e74c3c' },
          { n:present,   l:'Présents',   color:'#9b59b6' },
          { n:noTable,   l:'Sans table', color: noTable>0?'#e74c3c':'#4caf7d' },
        ].map(s=>(
          <div key={s.l} className="relative overflow-hidden rounded-xl p-4 text-center gold-bar"
               style={{background:'linear-gradient(135deg,#1a4a2e,#0d2b1a)',border:'1px solid rgba(201,168,76,0.3)'}}>
            <div className="text-3xl font-bold playfair" style={{color:s.color}}>{s.n}</div>
            <div className="text-white/50 text-xs tracking-wider uppercase mt-1">{s.l}</div>
            {s.l!=='Sans table' && total>0 && (
              <div className="mt-2 h-1 bg-white/10 rounded">
                <div className="h-full rounded transition-all" style={{width:`${(s.n/total*100)}%`,background:s.color}}/>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Répartition par groupe */}
      <div className="mb-8">
        <h3 className="text-gold-light italic text-xl playfair mb-4">Répartition par groupe</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {groupStats.map(g=>(
            <div key={g.key} className="rounded-xl p-4 text-center"
                 style={{background:g.bg,border:`1px solid ${g.border}`}}>
              <div className="text-2xl mb-1">{g.icon}</div>
              <div className="font-bold text-xl playfair" style={{color:g.text}}>{g.count}</div>
              <div className="text-xs tracking-wider uppercase mt-0.5" style={{color:g.text,opacity:0.8}}>{g.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tables overview */}
      <h3 className="text-gold-light italic text-xl playfair mb-4">État des tables</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        {TABLES.map(t=>{
          const count = guests.filter(g=>g.tableId===t.id).length
          const pct   = Math.round(count/t.capacity*100)
          return (
            <div key={t.id} className="relative overflow-hidden rounded-xl p-3 text-center gold-bar"
                 style={{background:'linear-gradient(135deg,#1a4a2e,#0d2b1a)',border:'1px solid rgba(201,168,76,0.25)'}}>
              <div className="text-xl mb-1">{t.flower}</div>
              <div className="italic text-gold-light text-xs playfair leading-tight">{t.name}</div>
              <div className="text-white font-bold playfair mt-1">{count}<span className="text-white/30 text-xs">/{t.capacity}</span></div>
              <div className="mt-2 h-1 bg-white/10 rounded overflow-hidden">
                <div className="h-full transition-all" style={{
                  width:`${pct}%`,
                  background: pct===100?'linear-gradient(90deg,#c9a84c,#f0d080)':'linear-gradient(90deg,#4caf7d,#c9a84c)'
                }}/>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
