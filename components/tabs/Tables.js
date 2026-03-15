// Tables.js — Plan de salle drag & drop + QR codes
'use client'
import { useState, useRef } from 'react'
import { TABLES, GROUP_COLORS } from '../../lib/data'
import QRCodeDisplay from '../QRCodeDisplay'

export default function Tables({ guests, onGuestsChange }) {
  const [activeTable, setActiveTable] = useState(null)
  const [qrModal, setQrModal]         = useState(null)
  const [dragGuest, setDragGuest]     = useState(null)
  const [dragOver, setDragOver]       = useState(null)
  const [toast, setToast]             = useState(null)

  const showToast = (msg, type='success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  // ─── Helpers ──────────────────────────────────────
  const guestsAt = (tableId) => guests.filter(g => g.tableId === tableId)
  const unassigned = guests.filter(g => !g.tableId)

  // ─── Drag & Drop ─────────────────────────────────
  async function handleDrop(targetTableId) {
    if (!dragGuest) return
    setDragOver(null)

    const guest = guests.find(g => g.id === dragGuest)
    if (!guest) return

    // Vérif capacité
    const tbl = TABLES.find(t => t.id === targetTableId)
    const current = guestsAt(targetTableId)
    if (current.length >= tbl.capacity && guest.tableId !== targetTableId) {
      showToast(`⚠️ Table ${tbl.name} est complète (${tbl.capacity} places)`, 'error')
      setDragGuest(null)
      return
    }

    // Vérif collision — déjà à cette table
    if (guest.tableId === targetTableId) {
      setDragGuest(null)
      return
    }

    // Mettre à jour
    try {
      const res = await fetch('/api/guests', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: guest.id, tableId: targetTableId }),
      })
      const updated = await res.json()
      onGuestsChange(guests.map(g => g.id === updated.id ? updated : g))
      showToast(`✅ ${guest.name} → Table ${tbl.name}`)
    } catch {
      showToast('Erreur lors du déplacement', 'error')
    }
    setDragGuest(null)
  }

  async function removeFromTable(guestId) {
    try {
      const res = await fetch('/api/guests', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: guestId, tableId: null }),
      })
      const updated = await res.json()
      onGuestsChange(guests.map(g => g.id === updated.id ? updated : g))
    } catch {}
  }

  const G = ({ guest }) => {
    const gc = GROUP_COLORS[guest.group || 'autre'] || GROUP_COLORS.autre
    return (
      <div
        draggable
        onDragStart={() => setDragGuest(guest.id)}
        onDragEnd={() => setDragGuest(null)}
        className="flex items-center justify-between p-2 rounded-lg mb-1 cursor-grab active:cursor-grabbing select-none text-xs transition-all hover:scale-[1.01]"
        style={{ background: gc.bg, border: `1px solid ${gc.border}` }}
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span>{gc.icon}</span>
          <span className="truncate text-white/90">{guest.name}</span>
        </div>
        <button onClick={() => removeFromTable(guest.id)}
                className="text-white/30 hover:text-red-400 ml-1 flex-shrink-0 text-sm">✕</button>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 fade-in">
      <h2 className="text-3xl text-gold-light italic playfair mb-1">Plan de Tables</h2>
      <p className="text-green-light text-xs tracking-widest uppercase mb-6">Drag & Drop · 14 tables · Piste de danse au centre</p>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl text-sm shadow-2xl transition-all ${
          toast.type==='error' ? 'bg-red-600 text-white' : 'text-green-dark'
        }`} style={toast.type!=='error'?{background:'linear-gradient(135deg,#c9a84c,#f0d080)'}:{}}>
          {toast.msg}
        </div>
      )}

      {/* Non assignés */}
      <div className="mb-6 rounded-2xl p-4" style={{background:'rgba(0,0,0,0.2)',border:'1px solid rgba(255,255,255,0.1)'}}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/60 text-xs tracking-widest uppercase">
            🪑 Non assignés ({unassigned.length})
          </p>
          <p className="text-white/30 text-xs">Glisser vers une table →</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {unassigned.length === 0 ? (
            <p className="text-white/20 text-xs italic">Tous les invités sont placés ✓</p>
          ) : unassigned.map(g => {
            const gc = GROUP_COLORS[g.group || 'autre'] || GROUP_COLORS.autre
            return (
              <div key={g.id} draggable
                   onDragStart={() => setDragGuest(g.id)}
                   onDragEnd={() => setDragGuest(null)}
                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-grab select-none"
                   style={{background: gc.bg, border: `1px solid ${gc.border}`, color: gc.text}}>
                {gc.icon} {g.name}
              </div>
            )
          })}
        </div>
      </div>

      {/* Grille des tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {TABLES.map(t => {
          const tGuests = guestsAt(t.id)
          const pct = Math.round(tGuests.length / t.capacity * 100)
          const isFull = tGuests.length >= t.capacity
          const isOver = dragOver === t.id

          return (
            <div key={t.id}
                 onDragOver={e => { e.preventDefault(); setDragOver(t.id) }}
                 onDragLeave={() => setDragOver(null)}
                 onDrop={() => handleDrop(t.id)}
                 className="rounded-2xl overflow-hidden transition-all"
                 style={{
                   border: isOver ? '2px dashed #c9a84c' : isFull ? '1px solid rgba(201,168,76,0.5)' : '1px solid rgba(255,255,255,0.1)',
                   background: isOver ? 'rgba(201,168,76,0.08)' : 'linear-gradient(160deg,#1a4a2e,#0d2b1a)',
                   transform: isOver ? 'scale(1.01)' : 'scale(1)',
                 }}>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3"
                   style={{background:'linear-gradient(135deg,rgba(45,122,79,0.5),rgba(26,74,46,0.3)',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                <div>
                  <span className="text-gold-light italic playfair text-sm">{t.flower} {t.name}</span>
                  <div className="text-white/30 text-xs">{t.theme}</div>
                </div>
                <div className="text-right">
                  <span className="text-gold font-bold playfair">{tGuests.length}</span>
                  <span className="text-white/30 text-xs">/{t.capacity}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="h-1 bg-white/5">
                <div className="h-full transition-all" style={{
                  width:`${pct}%`,
                  background: isFull ? 'linear-gradient(90deg,#c9a84c,#f0d080)' : 'linear-gradient(90deg,#4caf7d,#c9a84c)'
                }}/>
              </div>

              {/* Invités */}
              <div className="p-3 min-h-[80px]">
                {tGuests.length === 0 ? (
                  <p className="text-white/20 text-xs italic text-center pt-3">Glissez des invités ici</p>
                ) : tGuests.map(g => <G key={g.id} guest={g} />)}
              </div>

              {/* Actions */}
              <div className="px-3 pb-3 flex gap-2">
                <button onClick={() => setQrModal(t)}
                        className="flex-1 py-1.5 text-xs tracking-widest uppercase rounded-lg transition-all hover:bg-gold/20"
                        style={{background:'rgba(201,168,76,0.1)',border:'1px solid rgba(201,168,76,0.3)',color:'#f0d080'}}>
                  📱 QR Code
                </button>
                <button onClick={() => setActiveTable(activeTable===t.id ? null : t.id)}
                        className="px-3 py-1.5 text-xs rounded-lg text-white/40 hover:text-white/70 transition-all"
                        style={{border:'1px solid rgba(255,255,255,0.1)'}}>
                  {activeTable===t.id ? '▲' : '▼'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
             style={{background:'rgba(0,0,0,0.85)'}} onClick={() => setQrModal(null)}>
          <div className="rounded-2xl p-8 text-center max-w-sm w-full mx-4"
               style={{background:'linear-gradient(160deg,#1a4a2e,#0d2b1a)',border:'1px solid rgba(201,168,76,0.5)'}}
               onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-2">{qrModal.flower}</div>
            <h3 className="text-gold-light italic text-xl playfair mb-1">Table {qrModal.name}</h3>
            <p className="text-white/40 text-xs mb-4">{qrModal.theme}</p>
            <div className="bg-white p-4 rounded-xl inline-block">
              <QRCodeDisplay
                text={`WEDDING-TABLE-${qrModal.id}-${qrModal.name}`}
                size={180}
              />
            </div>
            <p className="text-white/40 text-xs mt-3">Scanner à l'entrée pour check-in</p>
            <button onClick={() => setQrModal(null)}
                    className="mt-4 px-6 py-2 rounded-lg text-white/50 border border-white/20 hover:text-white text-sm transition-colors">
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
