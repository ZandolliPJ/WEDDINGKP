// Export.js — PDF Coordinateur + PDF Traiteur + CSV Google Sheets
// Génération sans librairie externe (HTML print + CSV natif)
'use client'
import { useState } from 'react'
import { TABLES, GROUP_COLORS } from '../../lib/data'

const WEDDING = { date: '30 Juin 2026', lieu: 'Salle Jasmine, Garges-lès-Gonesse' }

export default function Export({ guests }) {
  const [loading, setLoading] = useState('')

  // ── Helpers ───────────────────────────────────────
  const confirmed = guests.filter(g => g.status === 'confirmed' || g.present)
  const declined = guests.filter(g => g.status === 'declined')
  const pending = guests.filter(g => g.status === 'pending' && !g.present)
  const present = guests.filter(g => g.present)
  const guestsAt = (tid) => guests.filter(g => g.tableId && parseInt(g.tableId) === parseInt(tid))
  const tableOf = (g) => TABLES.find(t => t.id === g.tableId)

  // ── Export CSV Google Sheets ──────────────────────
  function exportCSV() {
    setLoading('csv')
    const BOM = '\uFEFF'
    const headers = [
      'ID', 'Prénom / Nom', 'Email', 'Téléphone',
      'Groupe', 'Table', 'Statut RSVP', 'Présent le jour J',
      'Heure arrivée', 'Régime alimentaire'
    ]
    const rows = confirmed.map(g => {
      const tbl = tableOf(g)
      return [
        g.id,
        g.name,
        g.email || '',
        g.phone || '',
        GROUP_COLORS[g.group || 'autre']?.label || 'Autre',
        tbl ? `${tbl.name}` : 'Non placé',
        g.status === 'confirmed' ? 'Confirmé' : g.status === 'declined' ? 'Décliné' : 'En attente',
        g.present ? 'OUI ✓' : 'NON',
        g.arrivalTime || '',
        g.diet ? g.diet.charAt(0).toUpperCase() + g.diet.slice(1) : 'Standard',
      ]
    })

    // Ajouter ligne vide + stats résumé
    rows.push([])
    rows.push(['--- RÉSUMÉ ---', '', '', '', '', '', '', '', '', ''])
    rows.push(['Total invités', guests.length, '', '', '', '', '', '', '', ''])
    rows.push(['Confirmés', confirmed.length, '', '', '', '', '', '', '', ''])
    rows.push(['Déclinés', declined.length, '', '', '', '', '', '', '', ''])
    rows.push(['En attente', pending.length, '', '', '', '', '', '', '', ''])
    rows.push(['Présents (jour J)', present.length, '', '', '', '', '', '', '', ''])
    rows.push([])
    rows.push(['--- PAR TABLE ---', '', '', '', '', '', '', '', '', ''])
    TABLES.forEach(t => {
      const tg = guestsAt(t.id)
      rows.push([`${t.flower} ${t.name}`, `${tg.length} / ${t.capacity} places`, '', '', '', '', '', '', '', ''])
      tg.forEach(g => rows.push(['', g.name, g.email || '', '', GROUP_COLORS[g.group || 'autre']?.label || '', '', g.status, g.present ? 'OUI' : 'NON', g.arrivalTime || '', g.diet || 'standard']))
    })

    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invites-katty-pascal-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
    setLoading('')
  }

  // ── Génération HTML → impression PDF ─────────────
  function printDoc(type) {
    setLoading(type)
    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) { setLoading(''); return }

    const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

    let bodyHTML = ''

    // ════════════════════════════════
    // PDF COORDINATEUR
    // ════════════════════════════════
    if (type === 'coordinateur') {
      const rows = guests.map((g, i) => {
        const tbl = tableOf(g)
        const gc = GROUP_COLORS[g.group || 'autre'] || GROUP_COLORS.autre
        const statusColor = g.status === 'confirmed' ? '#27ae60' : g.status === 'declined' ? '#e74c3c' : '#f39c12'
        return `<tr style="background:${i % 2 === 0 ? '#f9fffe' : 'white'}">
          <td>${i + 1}</td>
          <td><strong>${g.name}</strong><br><span style="color:#888;font-size:10px">${g.id}</span></td>
          <td><span style="background:${gc.bg || '#eee'};color:${gc.text || '#333'};padding:2px 6px;border-radius:10px;font-size:10px">${gc.icon || ''} ${gc.label || ''}</span></td>
          <td>${tbl ? `${tbl.flower} <strong>${tbl.name}</strong>` : '<em style="color:#ccc">Non placé</em>'}</td>
          <td style="color:${statusColor};font-weight:600">${g.status === 'confirmed' ? '✓ Confirmé' : g.status === 'declined' ? '✗ Décliné' : '⏳ Attente'}</td>
          <td style="color:${g.present ? '#27ae60' : '#ccc'};font-weight:600">${g.present ? `✓ ${g.arrivalTime || ''}` : '-'}</td>
          <td style="font-size:10px">${g.diet || 'standard'}</td>
        </tr>`
      }).join('')

      const tableRows = TABLES.map(t => {
        const tg = guestsAt(t.id)
        const pct = Math.round(tg.length / t.capacity * 100)
        const names = tg.map(g => `<span style="display:inline-block;margin:1px 3px;padding:1px 5px;background:#e8f5e9;border-radius:8px;font-size:10px">${g.name}${g.present ? ' ✓' : ''}</span>`).join('')
        return `<tr>
          <td>${t.flower} <strong>${t.name}</strong></td>
          <td style="text-align:center">
            <span style="font-weight:700;color:${tg.length >= t.capacity ? '#e74c3c' : '#27ae60'}">${tg.length}</span>
            <span style="color:#888"> / ${t.capacity}</span>
            <div style="margin-top:3px;height:6px;background:#eee;border-radius:3px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:${tg.length >= t.capacity ? '#e74c3c' : '#27ae60'};border-radius:3px"></div>
            </div>
          </td>
          <td style="font-size:11px">${names || '<em style="color:#ccc">Vide</em>'}</td>
        </tr>`
      }).join('')

      bodyHTML = `
        <!-- PAGE 1 : Liste complète -->
        <div class="page">
          <div class="header">
            <div class="header-left">
              <div class="title">🌺 Katty &amp; Pascal</div>
              <div class="subtitle">LISTE COMPLÈTE DES INVITÉS — DOCUMENT COORDINATEUR</div>
              <div class="meta">${WEDDING.date} · ${WEDDING.lieu}</div>
            </div>
            <div class="header-right">
              <div class="stat-box">
                <div class="stat-num">${guests.length}</div>
                <div class="stat-lbl">Total</div>
              </div>
              <div class="stat-box" style="border-color:#27ae60;color:#27ae60">
                <div class="stat-num">${confirmed.length}</div>
                <div class="stat-lbl">Confirmés</div>
              </div>
              <div class="stat-box" style="border-color:#e74c3c;color:#e74c3c">
                <div class="stat-num">${declined.length}</div>
                <div class="stat-lbl">Déclinés</div>
              </div>
              <div class="stat-box" style="border-color:#9b59b6;color:#9b59b6">
                <div class="stat-num">${present.length}</div>
                <div class="stat-lbl">Présents</div>
              </div>
            </div>
          </div>

          <table class="main-table">
            <thead>
              <tr>
                <th style="width:30px">#</th>
                <th>Nom complet</th>
                <th>Groupe</th>
                <th>Table</th>
                <th>RSVP</th>
                <th>Présence</th>
                <th>Régime</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="footer">Imprimé le ${today} à ${now} · Katty &amp; Pascal · Balade Tropicale 2026</div>
        </div>

        <!-- PAGE 2 : Plan de tables -->
        <div class="page-break"></div>
        <div class="page">
          <div class="header">
            <div class="header-left">
              <div class="title">🌺 Katty &amp; Pascal</div>
              <div class="subtitle">RÉPARTITION PAR TABLE — DOCUMENT COORDINATEUR</div>
              <div class="meta">${WEDDING.date} · ${WEDDING.lieu}</div>
            </div>
          </div>

          <table class="main-table">
            <thead>
              <tr>
                <th style="width:140px">Table</th>
                <th style="width:100px">Places</th>
                <th>Invités assignés</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
          <div class="footer">Imprimé le ${today} à ${now} · Katty &amp; Pascal · Balade Tropicale 2026</div>
        </div>`
    }

    // ════════════════════════════════
    // PDF TRAITEUR
    // ════════════════════════════════
    else if (type === 'traiteur') {
      // Régimes globaux
      const diets = {}
      confirmed.forEach(g => { const d = g.diet || 'standard'; diets[d] = (diets[d] || 0) + 1 })
      const dietRows = Object.entries(diets).sort(([, a], [, b]) => b - a).map(([d, n]) => {
        const icons = { standard: '🍽️', vegetarien: '🥗', vegan: '🌱', halal: '🌙', casher: '✡️', allergie: '⚠️' }
        return `<tr>
          <td>${icons[d] || '🍽️'} ${d.charAt(0).toUpperCase() + d.slice(1)}</td>
          <td style="text-align:center;font-size:20px;font-weight:700;color:#1a4a2e">${n}</td>
          <td style="color:#666">couvert${n > 1 ? 's' : ''}</td>
        </tr>`
      }).join('')

      // Par table
      const tableRows = TABLES.map(t => {
        const tg = guestsAt(t.id).filter(g => g.status === 'confirmed' || g.present)
        if (tg.length === 0) return ''
        const tDiets = {}
        tg.forEach(g => { const d = g.diet || 'standard'; tDiets[d] = (tDiets[d] || 0) + 1 })
        const dietSummary = Object.entries(tDiets).map(([d, n]) => `${d} (${n})`).join(' · ')
        const names = tg.map(g => `<div style="padding:2px 0;border-bottom:1px solid #f0f0f0">${g.name} — <em style="color:#666">${g.diet || 'standard'}</em></div>`).join('')
        return `<tr>
          <td>${t.flower} <strong>${t.name}</strong></td>
          <td style="text-align:center;font-weight:700;color:#1a4a2e">${tg.length}</td>
          <td style="font-size:11px;color:#555">${dietSummary}</td>
          <td style="font-size:11px">${names}</td>
        </tr>`
      }).filter(Boolean).join('')

      bodyHTML = `
        <div class="page">
          <div class="header">
            <div class="header-left">
              <div class="title">🦞 Katty &amp; Pascal</div>
              <div class="subtitle">RÉCAPITULATIF TRAITEUR — RÉGIMES ALIMENTAIRES</div>
              <div class="meta">${WEDDING.date} · ${WEDDING.lieu}</div>
            </div>
            <div class="header-right">
              <div class="stat-box">
                <div class="stat-num">${confirmed.length}</div>
                <div class="stat-lbl">Couverts</div>
              </div>
            </div>
          </div>

          <h3 style="color:#1a4a2e;margin:20px 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:2px">
            📊 Résumé global des régimes
          </h3>
          <table class="main-table" style="max-width:400px">
            <thead><tr><th>Régime</th><th>Quantité</th><th></th></tr></thead>
            <tbody>${dietRows}</tbody>
          </table>

          <h3 style="color:#1a4a2e;margin:30px 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:2px">
            🌸 Détail par table (invités confirmés)
          </h3>
          <table class="main-table">
            <thead><tr><th>Table</th><th>Couverts</th><th>Régimes</th><th>Noms</th></tr></thead>
            <tbody>${tableRows}</tbody>
          </table>

          <div style="margin-top:24px;padding:12px 16px;background:#fff9ed;border:1px solid #c9a84c;border-radius:8px;font-size:11px;color:#7d4e00">
            <strong>⚠️ Allergies à noter :</strong>
            ${guests.filter(g => g.diet === 'allergie').length === 0
          ? 'Aucune allergie déclarée.'
          : guests.filter(g => g.diet === 'allergie').map(g => `${g.name}${g.dietNotes ? ` (${g.dietNotes})` : ''}`).join(', ')
        }
          </div>

          <div class="footer">Imprimé le ${today} à ${now} · Katty &amp; Pascal · Balade Tropicale 2026</div>
        </div>`
    }

    // ── Styles communs ──────────────────────────────
    const style = `
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size:11px; color:#222; background:white; }
      .page { padding:16mm 15mm; min-height:297mm; position:relative; }
      .page-break { page-break-after:always; }
      .header { display:flex; justify-content:space-between; align-items:flex-start; padding:14px 18px; background:linear-gradient(135deg,#1a4a2e,#0d2b1a); border-radius:10px; margin-bottom:18px; color:white; }
      .header-left .title { font-size:20px; font-weight:800; letter-spacing:-0.5px; }
      .header-left .subtitle { font-size:8px; letter-spacing:3px; text-transform:uppercase; color:rgba(255,255,255,0.6); margin-top:3px; }
      .header-left .meta { font-size:9px; color:#c9a84c; margin-top:5px; }
      .header-right { display:flex; gap:8px; }
      .stat-box { border:1px solid #c9a84c; border-radius:8px; padding:6px 12px; text-align:center; min-width:52px; color:#c9a84c; }
      .stat-num { font-size:22px; font-weight:800; line-height:1; }
      .stat-lbl { font-size:7px; text-transform:uppercase; letter-spacing:1px; margin-top:2px; opacity:0.8; }
      .main-table { width:100%; border-collapse:collapse; }
      .main-table th { background:#1a4a2e; color:white; padding:7px 8px; text-align:left; font-size:9px; text-transform:uppercase; letter-spacing:1px; }
      .main-table td { padding:5px 8px; border-bottom:1px solid #f0f0f0; vertical-align:middle; }
      .footer { position:absolute; bottom:10mm; left:15mm; right:15mm; text-align:center; font-size:8px; color:#aaa; border-top:1px solid #f0f0f0; padding-top:6px; }
      @media print {
        .page-break { page-break-after:always; }
        @page { size:A4; margin:0; }
      }
    `

    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Mariage Katty &amp; Pascal — ${type}</title><style>${style}</style></head><body>${bodyHTML}</body></html>`)
    win.document.close()

    // Lancer l'impression après chargement
    win.onload = () => {
      setTimeout(() => { win.print(); setLoading('') }, 400)
    }
  }

  // ── Render ────────────────────────────────────────
  const EXPORTS = [
    {
      id: 'coordinateur',
      icon: '📋',
      title: 'PDF Coordinateur',
      desc: 'Liste complète des invités + répartition par table. Format A4, prêt à imprimer.',
      color: '#1a4a2e',
      action: () => printDoc('coordinateur'),
    },
    {
      id: 'traiteur',
      icon: '🦞',
      title: 'PDF Traiteur',
      desc: 'Récapitulatif des régimes alimentaires par table. Couverts confirmés uniquement.',
      color: '#f4845f',
      action: () => printDoc('traiteur'),
    },
    {
      id: 'csv',
      icon: '📊',
      title: 'Export Google Sheets',
      desc: 'Fichier CSV : présents / absents + toutes les infos. À importer dans Google Sheets.',
      color: '#1565C0',
      action: exportCSV,
    },
  ]

  return (
    <div className="p-6 md:p-10 fade-in" style={{ fontFamily: '"Josefin Sans",sans-serif' }}>
      <h2 className="text-3xl text-gold-light italic playfair mb-1">Exports & Documents</h2>
      <p className="text-green-light text-xs tracking-widest uppercase mb-8">
        PDF Coordinateur · PDF Traiteur · Google Sheets
      </p>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { n: guests.length, l: 'Invités total', c: '#c9a84c' },
          { n: confirmed.length, l: 'Confirmés', c: '#27ae60' },
          { n: present.length, l: 'Présents jour J', c: '#4caf7d' },
          { n: declined.length, l: 'Déclinés', c: '#e74c3c' },
        ].map(s => (
          <div key={s.l} className="rounded-xl p-4 text-center" style={{ background: 'linear-gradient(135deg,#1a4a2e,#0d2b1a)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <div className="text-3xl font-bold playfair" style={{ color: s.c }}>{s.n}</div>
            <div className="text-white/40 text-xs uppercase tracking-wider mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Boutons export */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {EXPORTS.map(e => (
          <div key={e.id} className="rounded-2xl overflow-hidden shadow-lg"
            style={{ background: 'linear-gradient(160deg,#1a4a2e,#0d2b1a)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <div className="p-5">
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{e.icon}</div>
              <h3 className="text-gold-light italic text-lg playfair mb-2">{e.title}</h3>
              <p className="text-white/50 text-xs leading-relaxed mb-5">{e.desc}</p>
              <button
                onClick={e.action}
                disabled={loading === e.id}
                style={{
                  width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                  background: loading === e.id ? 'rgba(201,168,76,0.3)' : `linear-gradient(135deg,${e.color},${e.color}cc)`,
                  color: 'white', fontFamily: '"Josefin Sans",sans-serif',
                  fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.2em',
                  textTransform: 'uppercase', cursor: loading === e.id ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}>
                {loading === e.id ? '⏳ Génération…' : '⬇️ Télécharger'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Guide Google Sheets */}
      <div className="rounded-xl p-5" style={{ background: 'rgba(21,101,192,0.1)', border: '1px solid rgba(21,101,192,0.3)' }}>
        <p className="text-gold text-xs tracking-widest uppercase mb-3 font-bold">💡 Comment importer dans Google Sheets</p>
        <ol className="space-y-2" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', paddingLeft: '16px' }}>
          <li>1️⃣  Cliquez <strong style={{ color: '#fff' }}>"Export Google Sheets"</strong> ci-dessus → un fichier <code style={{ color: '#74c69d' }}>.csv</code> se télécharge</li>
          <li>2️⃣  Allez sur <strong style={{ color: '#fff' }}>sheets.google.com</strong> → créez une nouvelle feuille</li>
          <li>3️⃣  Menu <strong style={{ color: '#fff' }}>Fichier → Importer</strong> → choisissez votre fichier CSV</li>
          <li>4️⃣  Séparateur : <strong style={{ color: '#fff' }}>Virgule</strong> → cliquez <strong style={{ color: '#fff' }}>"Importer les données"</strong></li>
          <li>5️⃣  ✅ Votre liste est prête avec présents / absents, tables et régimes !</li>
        </ol>
      </div>

      {/* Aperçu par table */}
      <div className="mt-8">
        <h3 className="text-gold-light italic text-lg playfair mb-4">Aperçu — Invités par table</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TABLES.map(t => {
            const tg = guestsAt(t.id)
            if (tg.length === 0) return null
            return (
              <div key={t.id} className="rounded-xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between px-4 py-2.5"
                  style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-gold-light text-sm italic playfair">{t.flower} {t.name}</span>
                  <span className="text-white/40 text-xs">{tg.length}/{t.capacity} places</span>
                </div>
                <div className="px-4 py-2">
                  {tg.map(g => (
                    <div key={g.id} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-white/80 text-xs">{g.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white/30 text-xs">{g.diet || 'standard'}</span>
                        {g.present
                          ? <span className="text-green-light text-xs">✓ {g.arrivalTime}</span>
                          : <span className={`text-xs ${g.status === 'confirmed' ? 'text-gold' : 'text-white/30'}`}>
                            {g.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                          </span>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
