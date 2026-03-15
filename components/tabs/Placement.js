// components/tabs/Placement.js
// Placement automatique intelligent en 1 clic

'use client'
import { useState } from 'react'
import { TABLES } from '../../lib/data'

const DIET_ICON  = { standard: '🍽️', vegetarien: '🥗', vegan: '🌱', halal: '🌙', casher: '✡️', allergie: '⚠️' }
const SIDE_COLOR = { marie: 'text-blue-300', mariee: 'text-pink-300', commun: 'text-green-light', autre: 'text-white/50' }
const SIDE_ICON  = { marie: '💍', mariee: '👰', commun: '🤝', autre: '🌺' }

export default function Placement({ guests, onGuestsChange }) {
  const [preview,  setPreview]  = useState(null)   // résultat de la prévisualisation
  const [loading,  setLoading]  = useState(false)
  const [applying, setApplying] = useState(false)
  const [applied,  setApplied]  = useState(false)

  const unplaced  = guests.filter(g => !g.tableId && g.status !== 'declined').length
  const declined  = guests.filter(g => g.status === 'declined').length
  const total     = guests.filter(g => g.status !== 'declined').length

  // ── Prévisualiser le placement ────────────────────
  async function runPreview() {
    setLoading(true)
    setApplied(false)
    try {
      const res = await fetch('/api/placement', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'preview' }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPreview(data)
    } catch (err) {
      alert('Erreur : ' + err.message)
    } finally { setLoading(false) }
  }

  // ── Appliquer le placement (sauvegarder) ──────────
  async function applyPlacement() {
    if (!confirm('Appliquer ce plan de table ? Les invités sans table assignée seront placés automatiquement.')) return
    setApplying(true)
    try {
      const res = await fetch('/api/placement', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'apply' }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPreview(data)
      setApplied(true)
      // Recharger les invités
      const r2 = await fetch('/api/guests')
      const guests2 = await r2.json()
      onGuestsChange(guests2)
    } catch (err) {
      alert('Erreur : ' + err.message)
    } finally { setApplying(false) }
  }

  // ── Réinitialiser tous les placements ─────────────
  async function resetAll() {
    if (!confirm('Retirer tous les placements automatiques ? Les placements manuels seront conservés.')) return
    // Mettre table_id à null pour tous les invités non placés manuellement
    setLoading(true)
    try {
      for (const g of guests.filter(g => g.tableId)) {
        await fetch('/api/guests', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: g.id, tableId: null }),
        })
      }
      const r2 = await fetch('/api/guests')
      const guests2 = await r2.json()
      onGuestsChange(guests2)
      setPreview(null)
      setApplied(false)
    } catch (err) {
      alert('Erreur : ' + err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="p-6 md:p-10 fade-in">

      <h2 className="text-3xl text-gold-light italic mb-1" style={{ fontFamily: '"Playfair Display", serif' }}>
        Placement Automatique
      </h2>
      <p className="text-green-light text-xs tracking-widest uppercase mb-8">
        Algorithme intelligent — Familles · Amis · Régimes
      </p>

      {/* PANNEAU DE CONTRÔLE */}
      <div className="rounded-2xl border border-gold/30 p-6 mb-8" style={{ background: 'linear-gradient(160deg,#1a4a2e,#0d2b1a)' }}>

        {/* Statistiques actuelles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { n: total,    l: 'Invités à placer', icon: '👥' },
            { n: unplaced, l: 'Sans table',        icon: '⏳', warn: unplaced > 0 },
            { n: declined, l: 'Déclinés',          icon: '❌' },
            { n: TABLES.length, l: 'Tables disponibles', icon: '🌸' },
          ].map(s => (
            <div key={s.l} className="relative overflow-hidden rounded-xl p-4 text-center border border-gold/25 gold-bar"
                 style={{ background: 'rgba(0,0,0,0.2)' }}>
              <div className="text-xl mb-1">{s.icon}</div>
              <div className={`text-2xl font-bold ${s.warn ? 'text-trop-yellow' : 'text-gold-light'}`}
                   style={{ fontFamily: '"Playfair Display", serif' }}>{s.n}</div>
              <div className="text-white/50 text-xs tracking-wider uppercase mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Règles du placement */}
        <div className="rounded-xl border border-gold/15 p-4 mb-6" style={{ background: 'rgba(0,0,0,0.15)' }}>
          <p className="text-gold text-xs tracking-widest uppercase mb-3">⚙️ Règles du placement</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-white/70">
            <div className="flex gap-2 items-start">
              <span className="text-base">👨‍👩‍👧</span>
              <div>
                <div className="text-white font-medium mb-0.5">Priorité 1 — Familles</div>
                Côté marié en premier, puis côté mariée. Chaque groupe familial reste ensemble.
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-base">👫</span>
              <div>
                <div className="text-white font-medium mb-0.5">Priorité 2 — Amis</div>
                Les groupes d'amis sont placés ensemble sur la même table.
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-base">🥗</span>
              <div>
                <div className="text-white font-medium mb-0.5">Priorité 3 — Régimes</div>
                Halal, casher, vegan regroupés pour faciliter le service traiteur.
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-wrap gap-3">
          <button onClick={runPreview} disabled={loading || applying}
            className="flex-1 py-3 rounded-xl text-sm tracking-widest uppercase font-bold text-green-dark transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold/30 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#c9a84c,#f0d080)' }}>
            {loading ? '🔄 Calcul en cours...' : '🔮 Prévisualiser le placement'}
          </button>

          {preview && !applied && (
            <button onClick={applyPlacement} disabled={applying}
              className="flex-1 py-3 rounded-xl text-sm tracking-widest uppercase font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-light/30 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#2d7a4f,#4caf7d)' }}>
              {applying ? '💾 Sauvegarde...' : '✅ Appliquer ce plan de table'}
            </button>
          )}

          {applied && (
            <div className="flex-1 py-3 rounded-xl text-sm tracking-widest uppercase font-bold text-center text-green-light border border-green-light/40 bg-green-light/10">
              ✓ Plan appliqué avec succès !
            </div>
          )}

          <button onClick={resetAll} disabled={loading}
            className="px-6 py-3 rounded-xl text-xs tracking-widest uppercase text-white/50 border border-white/20 hover:border-red-400/50 hover:text-red-400 transition-all">
            🔄 Réinitialiser
          </button>
        </div>
      </div>

      {/* PRÉVISUALISATION DU PLAN */}
      {preview && (
        <>
          {/* Statistiques du plan */}
          <div className="rounded-xl border border-green-light/30 bg-green-light/5 p-4 mb-6 flex flex-wrap gap-6 items-center">
            <div className="text-green-light text-sm font-medium">
              {applied ? '✅ Plan appliqué' : '👁️ Prévisualisation'}
            </div>
            <div className="text-xs text-white/60">
              <strong className="text-white">{preview.stats?.placed}</strong> invités placés
            </div>
            <div className="text-xs text-white/60">
              <strong className="text-white">{preview.stats?.familyGroups}</strong> groupes familiaux
            </div>
            <div className="text-xs text-white/60">
              <strong className="text-white">{preview.stats?.friendGroups}</strong> groupes d'amis
            </div>
            {preview.stats?.unplaced > 0 && (
              <div className="text-xs text-trop-yellow">
                ⚠️ <strong>{preview.stats.unplaced}</strong> invité(s) sans table (tables pleines)
              </div>
            )}
          </div>

          {/* Grille des tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {preview.tables?.map(t => {
              const tableInfo = TABLES.find(x => x.id === t.tableId)
              const pct = Math.round(t.filled / t.capacity * 100)

              // Grouper par famille et amis pour affichage
              const famGroups = {}
              const friendGroups = {}
              t.guests.forEach(g => {
                if (g.familyGroup) {
                  if (!famGroups[g.familyGroup]) famGroups[g.familyGroup] = []
                  famGroups[g.familyGroup].push(g)
                }
                if (g.friendGroup && !g.familyGroup) {
                  if (!friendGroups[g.friendGroup]) friendGroups[g.friendGroup] = []
                  friendGroups[g.friendGroup].push(g)
                }
              })
              const ungrouped = t.guests.filter(g => !g.familyGroup && !g.friendGroup)

              return (
                <div key={t.tableId} className={`rounded-2xl overflow-hidden border transition-all ${
                  t.filled === 0 ? 'border-white/10 opacity-50' :
                  t.filled >= t.capacity ? 'border-gold/60' : 'border-gold/25'
                }`} style={{ background: 'linear-gradient(160deg,#1a4a2e,#0d2b1a)' }}>

                  {/* En-tête */}
                  <div className="px-4 py-3 flex items-center justify-between border-b border-gold/20"
                       style={{ background: 'linear-gradient(135deg,#2d7a4f,#1a4a2e)' }}>
                    <div>
                      <div className="italic text-gold-light" style={{ fontFamily: '"Playfair Display", serif' }}>
                        {tableInfo?.flower} {t.tableName}
                      </div>
                      <div className="text-white/40 text-xs">{tableInfo?.theme}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gold font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>
                        {t.filled}<span className="text-white/30 text-sm">/{t.capacity}</span>
                      </div>
                      <div className={`text-xs ${t.available === 0 ? 'text-gold' : 'text-white/40'}`}>
                        {t.available === 0 ? '● Complet' : `${t.available} libre(s)`}
                      </div>
                    </div>
                  </div>

                  {/* Barre remplissage */}
                  <div className="bg-white/5 h-1">
                    <div className="h-full transition-all duration-700 rounded"
                         style={{ width: `${pct}%`, background: pct === 100 ? 'linear-gradient(90deg,#c9a84c,#f0d080)' : 'linear-gradient(90deg,#4caf7d,#c9a84c)' }} />
                  </div>

                  {/* Contenu */}
                  <div className="p-4 space-y-2">
                    {t.filled === 0 ? (
                      <p className="text-white/25 text-xs italic text-center py-2">Table vide</p>
                    ) : (
                      <>
                        {/* Groupes familiaux */}
                        {Object.entries(famGroups).map(([name, members]) => (
                          <div key={name} className="rounded-lg p-2 border border-gold/15 bg-gold/5">
                            <div className="text-gold-light text-xs font-medium mb-1">👨‍👩‍👧 {name}</div>
                            {members.map(g => (
                              <div key={g.id} className="flex items-center justify-between py-0.5">
                                <span className={`text-xs ${SIDE_COLOR[g.familySide] || 'text-white/70'}`}>
                                  {SIDE_ICON[g.familySide]} {g.name}
                                </span>
                                <span className="text-xs">{DIET_ICON[g.diet] || '🍽️'}</span>
                              </div>
                            ))}
                          </div>
                        ))}

                        {/* Groupes d'amis */}
                        {Object.entries(friendGroups).map(([name, members]) => (
                          <div key={name} className="rounded-lg p-2 border border-green-light/15 bg-green-light/5">
                            <div className="text-green-light text-xs font-medium mb-1">👫 {name}</div>
                            {members.map(g => (
                              <div key={g.id} className="flex items-center justify-between py-0.5">
                                <span className="text-xs text-white/70">{g.name}</span>
                                <span className="text-xs">{DIET_ICON[g.diet] || '🍽️'}</span>
                              </div>
                            ))}
                          </div>
                        ))}

                        {/* Non groupés */}
                        {ungrouped.map(g => (
                          <div key={g.id} className="flex items-center justify-between py-0.5 border-b border-white/5">
                            <span className={`text-xs ${SIDE_COLOR[g.familySide] || 'text-white/60'}`}>
                              {SIDE_ICON[g.familySide]} {g.name}
                            </span>
                            <span className="text-xs">{DIET_ICON[g.diet] || '🍽️'}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

    </div>
  )
}
