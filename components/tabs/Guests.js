// Guests.js — Gestion invités avec groupes, régimes, collisions
'use client'
import { useState } from 'react'
import { TABLES, GROUP_COLORS } from '../../lib/data'

const DIET_ICON = { standard:'🍽️', vegetarien:'🥗', vegan:'🌱', halal:'🌙', casher:'✡️', allergie:'⚠️' }
const BADGE = {
  confirmed: 'bg-green-light/20 text-green-light border-green-light/40',
  pending:   'bg-gold/20 text-gold-light border-gold/40',
  declined:  'bg-red-500/20 text-red-400 border-red-500/40',
}
const EMPTY = { name:'', email:'', phone:'', tableId:'', group:'autre', familyGroup:'', friendGroup:'', diet:'standard', dietNotes:'' }

export default function Guests({ guests, onGuestsChange }) {
  const [form,    setForm]    = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')
  const [editId,  setEditId]  = useState(null)
  const setF = (k,v) => setForm(f=>({...f,[k]:v}))

  const filtered = guests.filter(g => {
    const q = search.toLowerCase()
    const m = !q || g.name.toLowerCase().includes(q) ||
              (g.email||'').toLowerCase().includes(q) ||
              (g.familyGroup||'').toLowerCase().includes(q)
    const f = filter==='all' || g.group===filter || (filter==='noTable' && !g.tableId)
    return m && f
  })

  const [msg, setMsg] = useState(null) // { type: 'success'|'error', text }

  async function save() {
    if (!form.name.trim()) { setMsg({type:'error', text:'Le nom est requis.'}); return }
    setLoading(true)
    setMsg(null)
    try {
      const method = editId ? 'PUT' : 'POST'
      const body   = editId
        ? { id: editId, ...form, tableId: form.tableId ? parseInt(form.tableId) : null }
        : { ...form,             tableId: form.tableId ? parseInt(form.tableId) : null }

      const res = await fetch('/api/guests', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setMsg({ type:'error', text: data.error || `Erreur HTTP ${res.status}` })
        return
      }

      if (editId) onGuestsChange(guests.map(x => x.id === editId ? data : x))
      else        onGuestsChange([...guests, data])

      setMsg({ type:'success', text: editId ? `✅ ${data.name} modifié(e) !` : `✅ ${data.name} ajouté(e) !` })
      setForm(EMPTY)
      setEditId(null)
    } catch (e) {
      setMsg({ type:'error', text: `Erreur réseau : ${e.message}` })
    } finally {
      setLoading(false)
    }
  }

  function startEdit(g) {
    setForm({ name:g.name, email:g.email||'', phone:g.phone||'', tableId:g.tableId||'',
              group:g.group||'autre', familyGroup:g.familyGroup||'', friendGroup:g.friendGroup||'',
              diet:g.diet||'standard', dietNotes:g.dietNotes||'' })
    setEditId(g.id)
    window.scrollTo({top:0,behavior:'smooth'})
  }

  async function del(id) {
    if (!confirm('Supprimer ?')) return
    await fetch(`/api/guests?id=${id}`, { method:'DELETE' })
    onGuestsChange(guests.filter(g=>g.id!==id))
  }

  async function toggleStatus(id) {
    const g = guests.find(x=>x.id===id)
    const st = ['pending','confirmed','declined']
    const next = st[(st.indexOf(g.status)+1)%3]
    const res = await fetch('/api/guests',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status:next})})
    const updated = await res.json()
    onGuestsChange(guests.map(x=>x.id===id?updated:x))
  }

  const I = "w-full bg-white/5 border border-gold/25 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold"
  const S = "w-full bg-green-dark border border-gold/25 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold"

  return (
    <div className="p-6 md:p-10 fade-in">
      <h2 className="text-3xl text-gold-light italic playfair mb-1">Gestion des Invités</h2>
      <p className="text-green-light text-xs tracking-widest uppercase mb-6">{guests.length} invité(s) · Gestion collisions · Groupes</p>

      {/* FORMULAIRE */}
      <div className="rounded-2xl border border-gold/25 p-5 mb-8" style={{background:'linear-gradient(160deg,#1a4a2e,#0d2b1a)'}}>
        <p className="text-xs tracking-widest uppercase text-green-light mb-4">
          {editId ? '✏️ Modifier l\'invité' : '➕ Ajouter un invité'}
        </p>
        {/* autoComplete="new-password" force Chrome à ne pas proposer ses contacts */}
        <div autoComplete="new-password">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <div><label className="text-xs text-green-light uppercase tracking-wider block mb-1">Nom complet *</label>
            <input value={form.name} onChange={e=>setF('name',e.target.value)} placeholder="Marie Dupont"
              autoComplete="off" spellCheck="false" className={I}/></div>
          <div><label className="text-xs text-green-light uppercase tracking-wider block mb-1">Email</label>
            <input type="text" value={form.email} onChange={e=>setF('email',e.target.value)} placeholder="email@mail.com"
              autoComplete="off" spellCheck="false" className={I}/></div>
          <div><label className="text-xs text-green-light uppercase tracking-wider block mb-1">Téléphone</label>
            <input type="text" inputMode="tel" value={form.phone} onChange={e=>setF('phone',e.target.value)}
              placeholder="+33 6 00 00 00 00" autoComplete="off" spellCheck="false" className={I}/></div>
          <div><label className="text-xs text-green-light uppercase tracking-wider block mb-1">🌸 Table assignée</label>
            <select value={form.tableId} onChange={e=>setF('tableId',e.target.value)} className={S}>
              <option value="">— Placement IA —</option>
              {TABLES.map(t=><option key={t.id} value={t.id}>{t.flower} {t.name} ({
                guests.filter(g=>g.tableId===t.id && g.id!==editId).length}/{t.capacity})</option>)}
            </select></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div><label className="text-xs text-green-light uppercase tracking-wider block mb-1">👥 Groupe</label>
            <select value={form.group} onChange={e=>setF('group',e.target.value)} className={S}>
              {Object.entries(GROUP_COLORS).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select></div>
          <div><label className="text-xs text-green-light uppercase tracking-wider block mb-1">Sous-groupe famille</label>
            <input value={form.familyGroup} onChange={e=>setF('familyGroup',e.target.value)} placeholder="ex: Famille Dupont" className={I}/></div>
          <div><label className="text-xs text-green-light uppercase tracking-wider block mb-1">Groupe d'amis</label>
            <input value={form.friendGroup} onChange={e=>setF('friendGroup',e.target.value)} placeholder="ex: Amis lycée" className={I}/></div>
          <div><label className="text-xs text-green-light uppercase tracking-wider block mb-1">🥗 Régime</label>
            <select value={form.diet} onChange={e=>setF('diet',e.target.value)} className={S}>
              {Object.entries(DIET_ICON).map(([k,v])=><option key={k} value={k}>{v} {k.charAt(0).toUpperCase()+k.slice(1)}</option>)}
            </select></div>
        </div>

        </div>{/* fin autocomplete wrapper */}

        <div className="flex gap-3 flex-wrap items-center">
          <button onClick={save} disabled={loading}
                  className="px-6 py-2.5 rounded-lg text-xs tracking-widest uppercase font-bold text-green-dark disabled:opacity-50"
                  style={{background:'linear-gradient(135deg,#c9a84c,#f0d080)'}}>
            {loading ? '⏳ En cours…' : editId ? '💾 Enregistrer' : '+ Ajouter'}
          </button>
          {editId && (
            <button onClick={()=>{setEditId(null);setForm(EMPTY);setMsg(null)}}
                    className="px-6 py-2.5 rounded-lg text-xs tracking-widest uppercase border border-white/20 text-white/50 hover:text-white">
              Annuler
            </button>
          )}
          {msg && (
            <div className={`px-4 py-2 rounded-lg text-xs border flex items-center gap-2 ${
              msg.type === 'success'
                ? 'bg-green-light/15 border-green-light/40 text-green-light'
                : 'bg-red-500/15 border-red-500/40 text-red-400'
            }`}>
              {msg.text}
              <button onClick={()=>setMsg(null)} className="opacity-50 hover:opacity-100 ml-1">✕</button>
            </div>
          )}
        </div>
      </div>

      {/* FILTRES */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input value={search} onChange={e=>setSearch(e.target.value)}
               placeholder="🔍 Rechercher…"
               className="bg-white/5 border border-gold/20 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-gold w-52"/>
        {[
          {k:'all',l:'Tous'},
          ...Object.entries(GROUP_COLORS).map(([k,v])=>({k,l:`${v.icon} ${v.label}`})),
          {k:'noTable',l:'⏳ Sans table'},
        ].map(f=>(
          <button key={f.k} onClick={()=>setFilter(f.k)}
                  className={`px-3 py-1.5 rounded-full text-xs tracking-wider uppercase border transition-all ${
                    filter===f.k ? 'border-gold text-gold-light bg-gold/15' : 'border-white/15 text-white/40 hover:border-gold/40'
                  }`}>{f.l}</button>
        ))}
        <span className="ml-auto text-white/30 text-xs">{filtered.length} / {guests.length}</span>
      </div>

      {/* TABLEAU */}
      <div className="overflow-x-auto rounded-xl border border-gold/15">
        <table className="w-full text-sm">
          <thead>
            <tr style={{background:'rgba(0,0,0,0.25)'}}>
              {['Nom','Groupe','Table','Régime','Statut','Présence','Actions'].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-gold text-xs tracking-widest uppercase border-b border-gold/20">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length===0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-white/30 italic">Aucun invité trouvé.</td></tr>
            ) : filtered.map(g => {
              const tbl = TABLES.find(t=>t.id===g.tableId)
              const gc  = GROUP_COLORS[g.group||'autre']||GROUP_COLORS.autre
              return (
                <tr key={g.id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{g.name}</div>
                    <div className="text-white/30 text-xs">{g.id} {g.email && `· ${g.email}`}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs border" style={{background:gc.bg,borderColor:gc.border,color:gc.text}}>
                      {gc.icon} {gc.label}
                    </span>
                    {g.familyGroup && <div className="text-white/40 text-xs mt-0.5">{g.familyGroup}</div>}
                  </td>
                  <td className="px-4 py-3 text-white/70 text-sm">
                    {tbl ? `${tbl.flower} ${tbl.name}` : <span className="text-white/25 italic text-xs">Non placé</span>}
                  </td>
                  <td className="px-4 py-3">{DIET_ICON[g.diet||'standard']}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs cursor-pointer border hover:opacity-80 ${BADGE[g.status||'pending']}`}
                          onClick={()=>toggleStatus(g.id)}>
                      {g.status==='confirmed'?'Confirmé':g.status==='declined'?'Décliné':'En attente'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {g.present
                      ? <span className="text-green-light text-xs">✓ {g.arrivalTime}</span>
                      : <span className="text-white/25 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={()=>startEdit(g)} className="px-3 py-1.5 rounded text-xs text-gold bg-gold/10 border border-gold/25 hover:bg-gold/20 transition-colors">✏️</button>
                    <button onClick={()=>del(g.id)} className="px-3 py-1.5 rounded text-xs text-red-400 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 transition-colors">✕</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
