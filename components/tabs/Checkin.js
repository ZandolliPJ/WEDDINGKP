'use client'
import { useState } from 'react'
import { TABLES } from '../../lib/data'

export default function Checkin({ guests, onGuestsChange }) {
  const [code, setCode]     = useState('')
  const [result, setResult] = useState(null)

  const present = guests.filter(g=>g.present).sort((a,b)=>(b.arrivalTime||'').localeCompare(a.arrivalTime||''))

  async function doCheckin(guest) {
    if (!guest) return setResult({ ok:false, msg:'Invité non trouvé.' })
    if (guest.present) return setResult({ ok:false, msg:`${guest.name} est déjà enregistré(e) à ${guest.arrivalTime}.` })
    const now = new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
    try {
      const res = await fetch('/api/checkin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:guest.id})})
      const updated = await res.json()
      onGuestsChange(guests.map(g=>g.id===updated.id?updated:g))
      const tbl = TABLES.find(t=>t.id===updated.tableId)
      setResult({ ok:true, name:updated.name, table:tbl, time:now })
    } catch { setResult({ ok:false, msg:'Erreur serveur.' }) }
    setCode('')
  }

  function search() {
    const q = code.trim().toUpperCase()
    const g = guests.find(x => x.id===q || x.name.toUpperCase().includes(q))
    doCheckin(g)
  }

  return (
    <div className="p-6 md:p-10 fade-in">
      <h2 className="text-3xl text-gold-light italic playfair mb-1">Check-in Invités</h2>
      <p className="text-green-light text-xs tracking-widest uppercase mb-8">Enregistrement le jour J — 30 Juin 2026</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Scanner */}
        <div className="rounded-2xl border border-gold/25 p-6 text-center" style={{background:'linear-gradient(160deg,#1a4a2e,#0d2b1a)'}}>
          <div className="text-5xl mb-3 float">📷</div>
          <h3 className="text-gold-light italic text-xl playfair mb-6">Borne de scan</h3>

          <div className="flex gap-2 mb-4">
            <input value={code} onChange={e=>setCode(e.target.value)}
                   onKeyDown={e=>e.key==='Enter'&&search()}
                   placeholder="Scanner QR ou saisir nom / ID…"
                   className="flex-1 bg-white/5 border border-gold/25 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold"/>
            <button onClick={search}
                    className="px-5 py-3 rounded-lg font-bold text-green-dark text-sm"
                    style={{background:'linear-gradient(135deg,#c9a84c,#f0d080)'}}>
              ✓
            </button>
          </div>

          {/* Sélection directe */}
          <select onChange={e=>e.target.value&&doCheckin(guests.find(g=>g.id===e.target.value))}
                  className="w-full bg-green-dark border border-gold/25 rounded-lg px-3 py-2.5 text-white text-sm mb-4">
            <option value="">— Sélectionner un invité —</option>
            {guests.filter(g=>!g.present).map(g=>(
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          {/* Résultat */}
          {result && (
            result.ok ? (
              <div className="p-4 rounded-xl mt-2" style={{background:'rgba(76,175,125,0.15)',border:'1px solid rgba(76,175,125,0.4)'}}>
                <div className="text-3xl mb-1">🌺</div>
                <div className="text-green-light font-bold">Bienvenue !</div>
                <div className="text-white italic text-xl playfair mt-1">{result.name}</div>
                {result.table && <div className="text-gold text-sm mt-1">{result.table.flower} Table {result.table.name}</div>}
                <div className="text-white/50 text-xs mt-1">Arrivée : {result.time}</div>
              </div>
            ) : (
              <div className="p-4 rounded-xl mt-2" style={{background:'rgba(231,76,60,0.15)',border:'1px solid rgba(231,76,60,0.4)'}}>
                <div className="text-red-400">⚠️ {result.msg}</div>
              </div>
            )
          )}
        </div>

        {/* Stats */}
        <div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              {n:present.length, l:'Arrivés',  c:'#4caf7d'},
              {n:guests.filter(g=>!g.present&&g.status!=='declined').length, l:'Attendus', c:'#f39c12'},
              {n:guests.filter(g=>g.status==='declined').length, l:'Déclinés', c:'#e74c3c'},
            ].map(s=>(
              <div key={s.l} className="rounded-xl p-4 text-center" style={{background:'linear-gradient(135deg,#1a4a2e,#0d2b1a)',border:'1px solid rgba(201,168,76,0.2)'}}>
                <div className="text-2xl font-bold playfair" style={{color:s.c}}>{s.n}</div>
                <div className="text-white/50 text-xs uppercase tracking-wider mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl overflow-hidden border border-gold/15">
            <div className="px-4 py-2 text-xs tracking-widest uppercase text-gold" style={{background:'rgba(0,0,0,0.2)'}}>
              Présences enregistrées ({present.length})
            </div>
            <table className="w-full text-sm">
              <thead><tr style={{background:'rgba(0,0,0,0.15)'}}>
                {['Nom','Table','Arrivée'].map(h=>(
                  <th key={h} className="text-left px-3 py-2 text-white/40 text-xs">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {present.length===0 ? (
                  <tr><td colSpan={3} className="text-center py-8 text-white/25 italic">Aucune présence enregistrée</td></tr>
                ) : present.map(g=>{
                  const tbl = TABLES.find(t=>t.id===g.tableId)
                  return (
                    <tr key={g.id} className="border-b border-white/5">
                      <td className="px-3 py-2 text-white">{g.name}</td>
                      <td className="px-3 py-2 text-white/60 text-xs">{tbl?`${tbl.flower} ${tbl.name}`:'—'}</td>
                      <td className="px-3 py-2 text-green-light text-xs">{g.arrivalTime}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
