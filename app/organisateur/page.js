'use client'
import { useState, useEffect, useRef } from 'react'

const TABLES = {
  1:'Hibiscus', 2:'Frangipanier', 3:'Balisier', 4:'Bouganvillée',
  5:'Lantana',  6:'Alamanda',    7:'Anthurium', 8:'Heliconias',
  9:'Oiseau du Paradis', 10:'Cactus', 11:"Cœur d'Amour",
  12:'Alpinia Rose', 13:'Orchidée', 14:'Pivoine Tropicale', 15:'Rose de Porcelaine',
}
const TABLE_ICONS = {
  1:'🌺',2:'🌸',3:'🌷',4:'💜',5:'🌼',6:'🌻',7:'❤️',
  8:'🦜',9:'🐦',10:'🌵',11:'💛',12:'🌸',13:'🌸',14:'🌷',15:'🌹',
}
const STATUS = {
  confirmed: { label:'Confirmé',   color:'#22c55e', bg:'rgba(34,197,94,0.15)',   icon:'✅' },
  pending:   { label:'En attente', color:'#eab308', bg:'rgba(234,179,8,0.15)',   icon:'⏳' },
  declined:  { label:'Décliné',    color:'#ef4444', bg:'rgba(239,68,68,0.15)',   icon:'❌' },
}

export default function OrganisateurPage() {
  const [guests,      setGuests]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [filterStatus,setFilterStatus]= useState('all')
  const [filterTable, setFilterTable] = useState('all')
  const [filterGroup, setFilterGroup] = useState('all')
  const [sortBy,      setSortBy]      = useState('name')
  const [editing,     setEditing]     = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [toast,       setToast]       = useState(null)
  const searchRef = useRef(null)

  useEffect(() => {
    fetch('/api/guests')
      .then(r => r.json())
      .then(data => { setGuests(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
    searchRef.current?.focus()
  }, [])

  const showToast = (msg, type='ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Recherche + filtres ──────────────────────────────
  const filtered = guests
    .filter(g => {
      const q = search.toLowerCase().trim()
      const matchSearch = !q ||
        g.name?.toLowerCase().includes(q) ||
        TABLES[g.tableId]?.toLowerCase().includes(q) ||
        g.phone?.includes(q) ||
        g.id?.toLowerCase().includes(q)
      const matchStatus = filterStatus === 'all' || g.status === filterStatus
      const matchTable  = filterTable  === 'all' || String(g.tableId) === filterTable
      const matchGroup  = filterGroup  === 'all' || g.group === filterGroup
      return matchSearch && matchStatus && matchTable && matchGroup
    })
    .sort((a, b) => {
      if (sortBy === 'name')   return (a.name||'').localeCompare(b.name||'')
      if (sortBy === 'table')  return (a.tableId||0) - (b.tableId||0)
      if (sortBy === 'status') return (a.status||'').localeCompare(b.status||'')
      return 0
    })

  const resetFilters = () => {
    setSearch(''); setFilterStatus('all')
    setFilterTable('all'); setFilterGroup('all')
    searchRef.current?.focus()
  }

  const hasFilters = search || filterStatus !== 'all' || filterTable !== 'all' || filterGroup !== 'all'

  // ── Stats rapides ─────────────────────────────────────
  const stats = {
    total:     guests.length,
    confirmed: guests.filter(g => g.status === 'confirmed').length,
    pending:   guests.filter(g => g.status === 'pending').length,
    declined:  guests.filter(g => g.status === 'declined').length,
  }

  // ── Sauvegarde modification ───────────────────────────
  async function saveEdit() {
    setSaving(true)
    try {
      const res = await fetch('/api/guests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id:      editing.id,
          name:    editing.name,
          phone:   editing.phone,
          tableId: editing.tableId,
          status:  editing.status,
          group:   editing.group,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setGuests(guests.map(g => g.id === data.id ? data : g))
      setEditing(null)
      showToast(`✅ ${data.name} mis à jour`)
    } catch(e) {
      showToast(`❌ ${e.message}`, 'err')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ minHeight:'100vh', backgroundColor:'#1a4a2e', backgroundImage:'var(--bg-mesh)', backgroundAttachment:'fixed', fontFamily:'"Josefin Sans",sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ background:'rgba(0,0,0,0.4)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(201,168,76,0.3)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <div>
          <div style={{ fontFamily:'"Playfair Display",serif', fontStyle:'italic', fontSize:'1.2rem', color:'#e8c97a' }}>Katty &amp; Pascal</div>
          <div style={{ fontSize:'0.58rem', letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)' }}>Espace Organisateur</div>
        </div>
        <button onClick={() => fetch('/api/auth',{method:'DELETE'}).then(()=>window.location.href='/admin/login')}
          style={{ padding:'7px 14px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.6)', fontSize:'0.65rem', cursor:'pointer', letterSpacing:'0.1em', textTransform:'uppercase' }}>
          Déconnexion
        </button>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position:'fixed', bottom:'24px', right:'24px', zIndex:100, padding:'12px 20px', borderRadius:'12px', background: toast.type==='err' ? 'rgba(239,68,68,0.92)' : 'rgba(34,197,94,0.92)', color:'white', fontSize:'0.82rem', fontWeight:600, boxShadow:'0 8px 24px rgba(0,0,0,0.3)', backdropFilter:'blur(8px)' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'28px 16px' }}>

        {/* ── Titre + stats ── */}
        <div style={{ marginBottom:'24px' }}>
          <h1 style={{ fontFamily:'"Playfair Display",serif', fontStyle:'italic', fontSize:'1.8rem', color:'#e8c97a', marginBottom:'16px' }}>
            🔍 Recherche Invités
          </h1>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:'10px' }}>
            {[
              { n:stats.total,     l:'Total',       c:'#e8c97a' },
              { n:stats.confirmed, l:'Confirmés',   c:'#22c55e' },
              { n:stats.pending,   l:'En attente',  c:'#eab308' },
              { n:stats.declined,  l:'Déclinés',    c:'#ef4444' },
            ].map(s => (
              <div key={s.l} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:'12px', padding:'12px', textAlign:'center' }}>
                <div style={{ fontFamily:'"Playfair Display",serif', fontSize:'1.6rem', color:s.c, fontWeight:700 }}>{s.n}</div>
                <div style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.6rem', letterSpacing:'0.15em', textTransform:'uppercase', marginTop:'2px' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Barre de recherche principale ── */}
        <div style={{ position:'relative', marginBottom:'12px' }}>
          <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'1.1rem', pointerEvents:'none' }}>🔍</span>
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, table, téléphone ou ID..."
            style={{ width:'100%', padding:'14px 44px', borderRadius:'14px', border:'2px solid rgba(201,168,76,0.35)', background:'rgba(255,255,255,0.09)', color:'white', fontSize:'1rem', outline:'none', boxSizing:'border-box', fontFamily:'inherit', transition:'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor='#c9a84c'}
            onBlur={e => e.target.style.borderColor='rgba(201,168,76,0.35)'}
          />
          {search && (
            <button onClick={() => { setSearch(''); searchRef.current?.focus() }}
              style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:'24px', height:'24px', color:'white', cursor:'pointer', fontSize:'0.85rem', display:'flex', alignItems:'center', justifyContent:'center' }}>
              ✕
            </button>
          )}
        </div>

        {/* ── Filtres avancés ── */}
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'16px', alignItems:'center' }}>

          {/* Filtre statut */}
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ padding:'9px 12px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'white', fontSize:'0.78rem', outline:'none', cursor:'pointer', fontFamily:'inherit' }}>
            <option value="all" style={{background:'#1a4a2e'}}>📋 Tous les statuts</option>
            <option value="confirmed" style={{background:'#1a4a2e'}}>✅ Confirmés</option>
            <option value="pending"   style={{background:'#1a4a2e'}}>⏳ En attente</option>
            <option value="declined"  style={{background:'#1a4a2e'}}>❌ Déclinés</option>
          </select>

          {/* Filtre table */}
          <select value={filterTable} onChange={e => setFilterTable(e.target.value)}
            style={{ padding:'9px 12px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'white', fontSize:'0.78rem', outline:'none', cursor:'pointer', fontFamily:'inherit' }}>
            <option value="all" style={{background:'#1a4a2e'}}>🌸 Toutes les tables</option>
            {Object.entries(TABLES).map(([id,name]) => (
              <option key={id} value={id} style={{background:'#1a4a2e'}}>{TABLE_ICONS[id]} {name}</option>
            ))}
          </select>

          {/* Filtre groupe */}
          <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
            style={{ padding:'9px 12px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'white', fontSize:'0.78rem', outline:'none', cursor:'pointer', fontFamily:'inherit' }}>
            <option value="all"     style={{background:'#1a4a2e'}}>👥 Tous les groupes</option>
            <option value="famille" style={{background:'#1a4a2e'}}>👨‍👩‍👧 Famille</option>
            <option value="amis"    style={{background:'#1a4a2e'}}>👫 Amis</option>
            <option value="collegue"style={{background:'#1a4a2e'}}>💼 Collègue</option>
            <option value="autre"   style={{background:'#1a4a2e'}}>🌺 Autre</option>
          </select>

          {/* Tri */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding:'9px 12px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'white', fontSize:'0.78rem', outline:'none', cursor:'pointer', fontFamily:'inherit' }}>
            <option value="name"   style={{background:'#1a4a2e'}}>🔤 Trier par nom</option>
            <option value="table"  style={{background:'#1a4a2e'}}>🌸 Trier par table</option>
            <option value="status" style={{background:'#1a4a2e'}}>📋 Trier par statut</option>
          </select>

          {/* Reset */}
          {hasFilters && (
            <button onClick={resetFilters}
              style={{ padding:'9px 14px', borderRadius:'10px', border:'1px solid rgba(239,68,68,0.4)', background:'rgba(239,68,68,0.12)', color:'#ef4444', fontSize:'0.75rem', cursor:'pointer', fontWeight:600, letterSpacing:'0.05em' }}>
              ✕ Réinitialiser
            </button>
          )}
        </div>

        {/* ── Résultats ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
          <span style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase' }}>
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
            {hasFilters && ` sur ${guests.length}`}
          </span>
          {search && (
            <span style={{ color:'#c9a84c', fontSize:'0.72rem' }}>
              Résultats pour "<strong>{search}</strong>"
            </span>
          )}
        </div>

        {/* ── Liste invités ── */}
        {loading ? (
          <div style={{ textAlign:'center', color:'rgba(255,255,255,0.4)', padding:'64px', fontSize:'1.5rem' }}>⏳</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'64px 20px', background:'rgba(255,255,255,0.04)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize:'3rem', marginBottom:'12px' }}>🔍</div>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.9rem', fontStyle:'italic' }}>
              Aucun invité trouvé
              {search && ` pour "${search}"`}
            </p>
            <button onClick={resetFilters}
              style={{ marginTop:'16px', padding:'10px 20px', borderRadius:'10px', border:'1px solid rgba(201,168,76,0.4)', background:'rgba(201,168,76,0.12)', color:'#e8c97a', fontSize:'0.75rem', cursor:'pointer' }}>
              Effacer les filtres
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {filtered.map(g => {
              const sc  = STATUS[g.status] || STATUS.pending
              const tbl = TABLES[g.tableId]
              const ico = TABLE_ICONS[g.tableId] || '🌸'
              return (
                <div key={g.id}
                  style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'12px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap', transition:'background 0.15s', cursor:'default' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.09)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}>

                  {/* Avatar */}
                  <div style={{ width:'38px', height:'38px', borderRadius:'50%', background:'linear-gradient(135deg,#1a4a2e,#2d6a4f)', display:'flex', alignItems:'center', justifyContent:'center', color:'#e8c97a', fontWeight:700, fontSize:'1rem', flexShrink:0, border:'1px solid rgba(201,168,76,0.3)' }}>
                    {g.name?.[0]?.toUpperCase() || '?'}
                  </div>

                  {/* Nom + ID */}
                  <div style={{ flex:1, minWidth:'140px' }}>
                    <div style={{ color:'white', fontWeight:600, fontSize:'0.88rem', lineHeight:1.2 }}>{g.name}</div>
                    <div style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.62rem', marginTop:'2px', fontFamily:'monospace' }}>{g.id}</div>
                  </div>

                  {/* Téléphone */}
                  <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.75rem', minWidth:'120px', flexShrink:0 }}>
                    {g.phone ? `📱 ${g.phone}` : '—'}
                  </div>

                  {/* Table */}
                  <div style={{ color:'#c9a84c', fontSize:'0.75rem', minWidth:'110px', flexShrink:0 }}>
                    {tbl ? `${ico} ${tbl}` : <span style={{color:'rgba(255,255,255,0.25)'}}>Non placé</span>}
                  </div>

                  {/* Statut */}
                  <div style={{ padding:'3px 10px', borderRadius:'20px', background:sc.bg, color:sc.color, fontSize:'0.62rem', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', border:`1px solid ${sc.color}35`, flexShrink:0 }}>
                    {sc.icon} {sc.label}
                  </div>

                  {/* Présence */}
                  {g.present && (
                    <div style={{ padding:'3px 8px', borderRadius:'20px', background:'rgba(34,197,94,0.15)', color:'#22c55e', fontSize:'0.6rem', fontWeight:600, border:'1px solid rgba(34,197,94,0.3)', flexShrink:0 }}>
                      ✓ Présent
                    </div>
                  )}

                  {/* Bouton modifier */}
                  <button onClick={() => setEditing({...g})}
                    style={{ padding:'7px 14px', borderRadius:'8px', border:'1px solid rgba(201,168,76,0.35)', background:'rgba(201,168,76,0.10)', color:'#e8c97a', fontSize:'0.65rem', cursor:'pointer', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap', flexShrink:0, transition:'all 0.15s' }}
                    onMouseEnter={e => { e.target.style.background='rgba(201,168,76,0.22)'; e.target.style.borderColor='#c9a84c' }}
                    onMouseLeave={e => { e.target.style.background='rgba(201,168,76,0.10)'; e.target.style.borderColor='rgba(201,168,76,0.35)' }}>
                    ✏️ Modifier
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Modal édition ── */}
      {editing && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.78)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
          onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div style={{ background:'linear-gradient(160deg,#1a4a2e,#0d2b1a)', border:'1px solid rgba(201,168,76,0.4)', borderRadius:'20px', padding:'28px', width:'100%', maxWidth:'460px', boxShadow:'0 24px 80px rgba(0,0,0,0.6)' }}>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h3 style={{ fontFamily:'"Playfair Display",serif', fontStyle:'italic', color:'#e8c97a', fontSize:'1.2rem' }}>
                ✏️ Modifier l'invité
              </h3>
              <button onClick={() => setEditing(null)}
                style={{ background:'rgba(255,255,255,0.08)', border:'none', borderRadius:'50%', width:'28px', height:'28px', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:'1rem' }}>✕</button>
            </div>

            {/* Nom */}
            <div style={{ marginBottom:'14px' }}>
              <label style={{ display:'block', color:'rgba(255,255,255,0.55)', fontSize:'0.62rem', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:'6px' }}>Nom complet</label>
              <input type="text" value={editing.name || ''}
                onChange={e => setEditing({...editing, name:e.target.value})}
                style={{ width:'100%', padding:'10px 13px', borderRadius:'10px', border:'2px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.07)', color:'white', fontSize:'0.9rem', outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
                onFocus={e => e.target.style.borderColor='#c9a84c'}
                onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.12)'}
              />
            </div>

            {/* Téléphone */}
            <div style={{ marginBottom:'14px' }}>
              <label style={{ display:'block', color:'rgba(255,255,255,0.55)', fontSize:'0.62rem', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:'6px' }}>Téléphone</label>
              <input type="tel" value={editing.phone || ''}
                onChange={e => setEditing({...editing, phone:e.target.value})}
                placeholder="+33 6 00 00 00 00"
                style={{ width:'100%', padding:'10px 13px', borderRadius:'10px', border:'2px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.07)', color:'white', fontSize:'0.9rem', outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
                onFocus={e => e.target.style.borderColor='#c9a84c'}
                onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.12)'}
              />
            </div>

            {/* Table */}
            <div style={{ marginBottom:'14px' }}>
              <label style={{ display:'block', color:'rgba(255,255,255,0.55)', fontSize:'0.62rem', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:'6px' }}>Table assignée</label>
              <select value={editing.tableId || ''} onChange={e => setEditing({...editing, tableId:parseInt(e.target.value)||null})}
                style={{ width:'100%', padding:'10px 13px', borderRadius:'10px', border:'2px solid rgba(255,255,255,0.12)', background:'#1a4a2e', color:'white', fontSize:'0.88rem', outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}>
                <option value="" style={{background:'#1a4a2e'}}>— Non assigné —</option>
                {Object.entries(TABLES).map(([id,name]) => (
                  <option key={id} value={id} style={{background:'#1a4a2e'}}>{TABLE_ICONS[id]} {name}</option>
                ))}
              </select>
            </div>

            {/* Statut */}
            <div style={{ marginBottom:'20px' }}>
              <label style={{ display:'block', color:'rgba(255,255,255,0.55)', fontSize:'0.62rem', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:'6px' }}>Statut</label>
              <div style={{ display:'flex', gap:'8px' }}>
                {Object.entries(STATUS).map(([val,s]) => (
                  <button key={val} onClick={() => setEditing({...editing, status:val})}
                    style={{ flex:1, padding:'9px 6px', borderRadius:'8px', border:`2px solid ${editing.status===val ? s.color : 'rgba(255,255,255,0.10)'}`, background:editing.status===val ? `${s.color}20` : 'rgba(255,255,255,0.04)', color:editing.status===val ? s.color : 'rgba(255,255,255,0.45)', fontSize:'0.68rem', cursor:'pointer', fontWeight:editing.status===val?700:400, transition:'all 0.2s', fontFamily:'inherit' }}>
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Boutons */}
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setEditing(null)}
                style={{ flex:1, padding:'11px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.55)', fontSize:'0.75rem', cursor:'pointer', fontFamily:'inherit' }}>
                Annuler
              </button>
              <button onClick={saveEdit} disabled={saving}
                style={{ flex:2, padding:'11px', borderRadius:'10px', border:'none', background:saving?'rgba(201,168,76,0.4)':'linear-gradient(135deg,#c9a84c,#f0d080)', color:'#1a4a2e', fontSize:'0.75rem', fontWeight:700, cursor:saving?'not-allowed':'pointer', letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:'inherit' }}>
                {saving ? '⏳ Sauvegarde...' : '💾 Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
