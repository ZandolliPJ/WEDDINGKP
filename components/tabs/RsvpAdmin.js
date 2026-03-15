'use client'
import { useState, useEffect } from 'react'

export default function RsvpAdmin() {
  const [rsvps,   setRsvps]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/rsvp').then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setRsvps(d) }).finally(()=>setLoading(false))
  }, [])

  const oui = rsvps.filter(r=>r.presence==='oui')
  const non = rsvps.filter(r=>r.presence==='non')
  const totalPersonnes = oui.reduce((s,r)=>s+(parseInt(r.personnes)||1),0)

  return (
    <div className="p-6 md:p-10 fade-in">
      <h2 className="text-3xl text-gold-light italic playfair mb-1">Réponses RSVP</h2>
      <p className="text-green-light text-xs tracking-widest uppercase mb-8">Formulaires reçus depuis la page invités</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {n:rsvps.length,  l:'Réponses',   c:'#c9a84c'},
          {n:oui.length,    l:'Présents',   c:'#4caf7d'},
          {n:totalPersonnes,l:'Personnes',  c:'#e91e8c'},
        ].map(s=>(
          <div key={s.l} className="rounded-xl p-4 text-center" style={{background:'linear-gradient(135deg,#1a4a2e,#0d2b1a)',border:'1px solid rgba(201,168,76,0.25)'}}>
            <div className="text-3xl font-bold playfair" style={{color:s.c}}>{s.n}</div>
            <div className="text-white/50 text-xs uppercase tracking-wider mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      {loading ? <p className="text-white/40 text-center py-8">Chargement…</p> : (
        <div className="overflow-x-auto rounded-xl border border-gold/15">
          <table className="w-full text-sm">
            <thead><tr style={{background:'rgba(0,0,0,0.25)'}}>
              {['Prénom','Nom','Téléphone','Présence','Personnes','Menu','Message','Date'].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-gold text-xs tracking-widest uppercase border-b border-gold/20">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rsvps.length===0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-white/30 italic">Aucune réponse RSVP reçue pour l'instant.</td></tr>
              ) : rsvps.map((r,i)=>(
                <tr key={i} className="border-b border-white/5 hover:bg-white/3">
                  <td className="px-4 py-3 text-white">{r.prenom}</td>
                  <td className="px-4 py-3 text-white">{r.nom}</td>
                  <td className="px-4 py-3 text-white/60">{r.telephone||'—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs border ${r.presence==='oui'?'text-green-light bg-green-light/10 border-green-light/30':'text-red-400 bg-red-500/10 border-red-500/30'}`}>
                      {r.presence==='oui'?'✅ Oui':'❌ Non'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/70">{r.personnes}</td>
                  <td className="px-4 py-3 text-white/70">{r.menu||'standard'}</td>
                  <td className="px-4 py-3 text-white/50 text-xs max-w-xs truncate">{r.message||'—'}</td>
                  <td className="px-4 py-3 text-white/30 text-xs">{r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
