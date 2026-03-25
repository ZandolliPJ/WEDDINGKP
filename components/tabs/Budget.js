// Budget.js — Gestion budget mariage · Persistance Supabase
'use client'
import { useState, useEffect, useCallback } from 'react'

const CATS = [
  { id:'salle',        icon:'🏛️', label:'Salle & Lieu',          desc:'Location salle, décoration, mobilier',              pct:20, color:'#e74c3c', tips:'La salle représente souvent 20-25% du budget. Réservez 12-18 mois à l\'avance.' },
  { id:'traiteur',     icon:'🍽️', label:'Traiteur & Repas',      desc:'Menu, boissons, service, gâteau de mariage',        pct:35, color:'#f39c12', tips:'Le poste le plus important. Comptez 60-120€ par personne selon le standing.' },
  { id:'photo',        icon:'📸', label:'Photo & Vidéo',          desc:'Photographe, vidéaste, album, impressions',         pct:12, color:'#9b59b6', tips:'Ne lésinez pas sur ce poste ! Ces souvenirs durent toute la vie. Budget : 2 000-5 000€.' },
  { id:'tenue',        icon:'👗', label:'Tenues & Beauté',        desc:'Robe, costume, coiffure, maquillage, accessoires',  pct:8,  color:'#e91e8c', tips:'Robe : 800-3000€. Pensez aux retouches et accessoires dans le budget.' },
  { id:'fleurs',       icon:'🌸', label:'Fleurs & Déco',          desc:'Bouquets, centres de table, cérémonie',             pct:6,  color:'#27ae60', tips:'Les fleurs de saison coûtent 30-50% moins cher que les fleurs exotiques.' },
  { id:'musique',      icon:'🎵', label:'Musique & Animation',    desc:'DJ, groupe live, animation, sonorisation',          pct:5,  color:'#16a085', tips:'DJ : 800-2000€. Groupe live : 2000-5000€. Réservez 6 mois à l\'avance.' },
  { id:'faire_part',   icon:'✉️', label:'Faire-Part & Papeterie', desc:'Invitations, menus, plan de table, remerciements',  pct:2,  color:'#c9a84c', tips:'Le numérique permet d\'économiser 50-80% sur la papeterie.' },
  { id:'transport',    icon:'🚗', label:'Transport',              desc:'Voiture des mariés, navettes invités',              pct:3,  color:'#2980b9', tips:'Voiture avec chauffeur : 300-800€. Navettes : 15-25€/personne.' },
  { id:'lune_de_miel', icon:'✈️', label:'Lune de Miel',          desc:'Voyage, hôtel, activités post-mariage',             pct:7,  color:'#8e44ad', tips:'Réservez 6-12 mois à l\'avance pour les meilleurs tarifs.' },
  { id:'divers',       icon:'🎁', label:'Divers & Imprévus',     desc:'Alliances, cadeaux témoins, imprévus (10%)',        pct:2,  color:'#7f8c8d', tips:'Gardez toujours 10% du budget total pour les imprévus — règle d\'or !' },
]

const fmt = n => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n||0)
const pct  = (a,b) => b>0 ? Math.round(a/b*100) : 0
const hcol = (budgeted, spent) => {
  if (!budgeted) return '#666'
  const r = spent/budgeted
  if (r <= 0.8) return '#27ae60'
  if (r <= 1.0) return '#f39c12'
  return '#e74c3c'
}

export default function Budget() {
  const [totalBudget, setTotalBudget] = useState(15000)
  const [categories,  setCategories]  = useState([])    // {id, label, budgeted, icon, color}
  const [items,       setItems]       = useState([])    // {id, category_id, label, amount, paid, note}
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState('')    // message en cours
  const [error,       setError]       = useState(null)
  const [editing,     setEditing]     = useState(null)  // catId en édition
  const [addingTo,    setAddingTo]    = useState(null)  // catId pour ajouter item
  const [newItem,     setNewItem]     = useState({label:'',amount:'',note:''})
  const [view,        setView]        = useState('categories')
  const [guide,       setGuide]       = useState(true)
  const [activeTip,   setActiveTip]   = useState(null)
  const [editTotal,   setEditTotal]   = useState(false)
  const [confirmReset,setConfirmReset]= useState(false)
  const [toast,       setToast]       = useState(null)

  // ── Helpers ───────────────────────────────────────────
  const getCat  = (id) => categories.find(c => c.id === id) || CATS.find(c => c.id === id) || {}
  const catItems = (id) => items.filter(it => it.category_id === id)
  const catSpent = (id) => catItems(id).reduce((s,it) => s + parseFloat(it.amount||0), 0)
  const catBudget= (id) => parseFloat(getCat(id)?.budgeted || 0) || Math.round(totalBudget * (CATS.find(c=>c.id===id)?.pct||0) / 100)

  const totalSpent    = CATS.reduce((s,c) => s + catSpent(c.id), 0)
  const totalBudgeted = CATS.reduce((s,c) => s + catBudget(c.id), 0)
  const remaining     = totalBudget - totalSpent

  const toast$ = (msg, type='ok') => {
    setToast({msg,type})
    setTimeout(() => setToast(null), 3000)
  }

  // ── LOAD depuis Supabase ──────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/budget')
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setTotalBudget(data.totalBudget || 15000)
      setCategories(data.categories || [])
      setItems(data.items || [])
    } catch(e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Sauvegarder budget total ──────────────────────────
  async function saveTotalBudget(val) {
    setSaving('budget')
    try {
      await fetch('/api/budget', {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ totalBudget: val }),
      })
      setTotalBudget(val)
      toast$(`✅ Budget total mis à jour : ${fmt(val)}`)
    } catch(e) { toast$(e.message,'err') }
    finally { setSaving(''); setEditTotal(false) }
  }

  // ── Sauvegarder budget d'une catégorie ───────────────
  async function saveCategoryBudget(catId, budgeted) {
    setSaving(catId)
    const def = CATS.find(c=>c.id===catId)
    try {
      await fetch('/api/budget', {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          categoryId: catId,
          label:      def?.label || catId,
          budgeted:   parseFloat(budgeted) || 0,
        }),
      })
      setCategories(prev => {
        const exists = prev.find(c=>c.id===catId)
        if (exists) return prev.map(c => c.id===catId ? {...c, budgeted:parseFloat(budgeted)||0} : c)
        return [...prev, {id:catId, label:def?.label||catId, budgeted:parseFloat(budgeted)||0, icon:def?.icon||'', color:def?.color||'#c9a84c'}]
      })
      toast$(`✅ ${def?.label} → budget enregistré`)
    } catch(e) { toast$(e.message,'err') }
    finally { setSaving(''); setEditing(null) }
  }

  // ── Distribution automatique ──────────────────────────
  async function autoDistribute() {
    setSaving('auto')
    try {
      await Promise.all(CATS.map(async cat => {
        const budgeted = Math.round(totalBudget * cat.pct / 100)
        await fetch('/api/budget', {
          method:'PATCH', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ categoryId:cat.id, label:cat.label, budgeted }),
        })
      }))
      await load()
      toast$(`✅ Budget distribué en ${CATS.length} catégories`)
    } catch(e) { toast$(e.message,'err') }
    finally { setSaving('') }
  }

  // ── Ajouter une dépense ───────────────────────────────
  async function addItem(catId) {
    if (!newItem.label.trim()) return
    setSaving('item')
    const def = CATS.find(c=>c.id===catId)
    try {
      const res = await fetch('/api/budget', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          category_id:    catId,
          category_label: def?.label || catId,
          category_icon:  def?.icon  || '',
          color:          def?.color || '#c9a84c',
          budgeted:       catBudget(catId),
          label:          newItem.label.trim(),
          amount:         parseFloat(newItem.amount) || 0,
          note:           newItem.note.trim(),
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setItems(prev => [...prev, data])
      toast$(`✅ "${newItem.label}" ajouté — ${fmt(newItem.amount)}`)
      setNewItem({label:'',amount:'',note:''})
      setAddingTo(null)
    } catch(e) { toast$(e.message,'err') }
    finally { setSaving('') }
  }

  // ── Toggle payé ──────────────────────────────────────
  async function togglePaid(item) {
    const updated = { ...item, paid: !item.paid }
    setItems(prev => prev.map(it => it.id===item.id ? updated : it))
    try {
      await fetch('/api/budget', {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ itemId: item.id, paid: !item.paid }),
      })
    } catch(e) {
      setItems(prev => prev.map(it => it.id===item.id ? item : it))
      toast$(e.message,'err')
    }
  }

  // ── Supprimer un item ─────────────────────────────────
  async function deleteItem(itemId) {
    setItems(prev => prev.filter(it => it.id !== itemId))
    try {
      await fetch(`/api/budget?itemId=${itemId}`, { method:'DELETE' })
    } catch(e) {
      toast$(e.message,'err')
      await load()
    }
  }

  // ── Reset ─────────────────────────────────────────────
  async function resetAll() {
    setSaving('reset')
    try {
      // Supprimer tous les items
      await Promise.all(items.map(it => fetch(`/api/budget?itemId=${it.id}`,{method:'DELETE'})))
      // Remettre budget à 0
      await Promise.all(CATS.map(cat =>
        fetch('/api/budget',{method:'PATCH',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({categoryId:cat.id,label:cat.label,budgeted:0})})
      ))
      await saveTotalBudget(15000)
      await load()
      toast$('✅ Budget réinitialisé')
    } catch(e) { toast$(e.message,'err') }
    finally { setSaving(''); setConfirmReset(false) }
  }

  // ═══════════════════════════════════════════════════════
  // RENDU
  // ═══════════════════════════════════════════════════════
  const S = {fontFamily:'"Josefin Sans",sans-serif', padding:'20px 24px'}

  if (loading) return (
    <div style={{...S, textAlign:'center', paddingTop:'60px'}}>
      <div style={{fontSize:'2rem', marginBottom:'12px', animation:'spin 1s linear infinite', display:'inline-block'}}>⏳</div>
      <p style={{color:'rgba(255,255,255,0.4)', fontSize:'0.8rem', letterSpacing:'0.2em'}}>Chargement du budget depuis Supabase…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error) return (
    <div style={{...S, textAlign:'center', paddingTop:'40px'}}>
      <div style={{fontSize:'2.5rem', marginBottom:'12px'}}>⚠️</div>
      <p style={{color:'#f39c12', fontSize:'0.9rem', marginBottom:'8px'}}>Impossible de charger le budget</p>
      <p style={{color:'rgba(255,255,255,0.4)', fontSize:'0.75rem', marginBottom:'20px'}}>{error}</p>
      <div style={{background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:'14px', padding:'20px', maxWidth:'480px', margin:'0 auto', textAlign:'left'}}>
        <p style={{color:'#f0d080', fontSize:'0.75rem', fontWeight:700, marginBottom:'12px', letterSpacing:'0.15em'}}>
          📋 ÉTAPE REQUISE — Créer les tables dans Supabase
        </p>
        {[
          'Allez sur supabase.com → votre projet',
          'Cliquez SQL Editor → New Query',
          'Copiez-collez le contenu du fichier supabase-schema.sql',
          'Cliquez "Run" — les tables budget seront créées',
          'Revenez ici et rechargez la page',
        ].map((s,i) => (
          <div key={i} style={{display:'flex', gap:'10px', marginBottom:'8px', fontSize:'0.75rem', color:'rgba(255,255,255,0.6)'}}>
            <span style={{color:'#c9a84c', fontWeight:700, minWidth:'16px'}}>{i+1}.</span>
            {s}
          </div>
        ))}
      </div>
      <button onClick={load} style={{marginTop:'20px', padding:'10px 24px', borderRadius:'10px', background:'linear-gradient(135deg,#c9a84c,#f0d080)', border:'none', color:'#1a4a2e', cursor:'pointer', fontWeight:700, fontSize:'0.75rem', fontFamily:'inherit'}}>
        🔄 Réessayer
      </button>
    </div>
  )

  return (
    <div style={S}>

      {/* Toast */}
      {toast && (
        <div style={{position:'fixed',top:'72px',right:'16px',zIndex:9999,padding:'11px 18px',borderRadius:'12px',fontSize:'0.83rem',fontWeight:600,boxShadow:'0 8px 32px rgba(0,0,0,0.45)',background:toast.type==='err'?'#c0392b':'linear-gradient(135deg,#c9a84c,#f0d080)',color:toast.type==='err'?'white':'#1a4a2e',animation:'slideIn 0.2s ease'}}>
          {toast.msg}
        </div>
      )}

      {/* En-tête */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:'16px',marginBottom:'16px'}}>
        <div>
          <h2 style={{fontFamily:'"Playfair Display",serif',fontStyle:'italic',fontSize:'1.75rem',color:'#f0d080',margin:'0 0 4px'}}>💰 Budget Mariage</h2>
          <p style={{color:'#4caf7d',fontSize:'0.6rem',letterSpacing:'0.3em',textTransform:'uppercase',margin:0}}>
            Enregistré dans Supabase · Accessible partout · Katty &amp; Pascal
          </p>
        </div>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center'}}>
          {saving && <span style={{color:'rgba(255,255,255,0.3)',fontSize:'0.7rem',animation:'pulse 1s infinite'}}>⏳ Sauvegarde…</span>}
          {[
            {k:'categories',l:'📋 Catégories'},
            {k:'detail',    l:'📄 Dépenses'},
            {k:'recap',     l:'📊 Récap'},
          ].map(v => (
            <button key={v.k} onClick={()=>setView(v.k)} style={{padding:'7px 14px',borderRadius:'20px',fontSize:'0.68rem',letterSpacing:'0.12em',cursor:'pointer',fontFamily:'inherit',transition:'all 0.2s',border:view===v.k?'1px solid #c9a84c':'1px solid rgba(255,255,255,0.1)',background:view===v.k?'rgba(201,168,76,0.15)':'transparent',color:view===v.k?'#f0d080':'rgba(255,255,255,0.4)'}}>
              {v.l}
            </button>
          ))}
          <button onClick={()=>setConfirmReset(true)} style={{padding:'7px 12px',borderRadius:'20px',fontSize:'0.65rem',border:'1px solid rgba(231,76,60,0.3)',background:'rgba(231,76,60,0.08)',color:'#e74c3c',cursor:'pointer',fontFamily:'inherit'}}>🗑</button>
        </div>
      </div>

      {/* Guide débutant */}
      {guide && (
        <div style={{background:'linear-gradient(135deg,rgba(201,168,76,0.12),rgba(201,168,76,0.05))',border:'1px solid rgba(201,168,76,0.3)',borderRadius:'16px',padding:'18px 20px',marginBottom:'16px',position:'relative'}}>
          <button onClick={()=>setGuide(false)} style={{position:'absolute',top:'10px',right:'12px',background:'none',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer',fontSize:'1rem'}}>✕</button>
          <h3 style={{color:'#f0d080',fontSize:'0.82rem',fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',margin:'0 0 12px'}}>🎓 Par où commencer ?</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'12px'}}>
            {[
              {n:'1',icon:'💶',t:'Fixez votre budget total',d:'Saisissez le montant global disponible (famille + économies). Modifiez-le à tout moment.'},
              {n:'2',icon:'📊',t:'Distribution recommandée',d:'Cliquez le bouton pour répartir automatiquement selon les % habituels d\'un mariage.'},
              {n:'3',icon:'✏️',t:'Ajustez vos priorités',d:'Augmentez ce qui compte (photo, traiteur) et réduisez le reste selon vos goûts.'},
              {n:'4',icon:'💾',t:'Tout est sauvegardé',d:'Chaque modification est enregistrée dans Supabase. Accessible depuis n\'importe quel appareil.'},
            ].map(s=>(
              <div key={s.n} style={{display:'flex',gap:'10px',alignItems:'flex-start'}}>
                <div style={{background:'rgba(201,168,76,0.2)',border:'1px solid rgba(201,168,76,0.4)',borderRadius:'50%',width:'28px',height:'28px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'#c9a84c',fontWeight:700,fontSize:'0.72rem'}}>{s.n}</div>
                <div>
                  <div style={{color:'#f0d080',fontSize:'0.75rem',fontWeight:600,marginBottom:'2px'}}>{s.icon} {s.t}</div>
                  <div style={{color:'rgba(255,255,255,0.45)',fontSize:'0.68rem',lineHeight:1.45}}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget total */}
      <div style={{background:'linear-gradient(135deg,#1a4a2e,#0d2b1a)',borderRadius:'16px',padding:'18px 22px',marginBottom:'18px',border:'1px solid rgba(201,168,76,0.3)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px',marginBottom:'14px'}}>
          <div>
            <div style={{color:'rgba(255,255,255,0.35)',fontSize:'0.58rem',letterSpacing:'0.28em',textTransform:'uppercase',marginBottom:'4px'}}>Budget total du mariage</div>
            {editTotal ? (
              <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                <input type="number" defaultValue={totalBudget} autoFocus
                  onBlur={e=>saveTotalBudget(parseFloat(e.target.value)||0)}
                  onKeyDown={e=>e.key==='Enter'&&saveTotalBudget(parseFloat(e.target.value)||0)}
                  style={{background:'rgba(255,255,255,0.1)',border:'1px solid #c9a84c',borderRadius:'8px',padding:'7px 10px',color:'white',fontSize:'1.3rem',fontFamily:'"Playfair Display",serif',fontWeight:700,outline:'none',width:'180px'}}/>
                <span style={{color:'rgba(255,255,255,0.3)',fontSize:'0.7rem'}}>Entrée pour valider</span>
              </div>
            ) : (
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{fontFamily:'"Playfair Display",serif',fontSize:'1.9rem',fontWeight:700,color:'#f0d080'}}>{fmt(totalBudget)}</span>
                <button onClick={()=>setEditTotal(true)} style={{background:'rgba(201,168,76,0.12)',border:'1px solid rgba(201,168,76,0.25)',borderRadius:'8px',padding:'4px 9px',color:'#c9a84c',cursor:'pointer',fontSize:'0.62rem'}}>✏️ Modifier</button>
              </div>
            )}
          </div>
          <button onClick={autoDistribute} disabled={!!saving} style={{background:'rgba(76,175,125,0.15)',border:'1px solid rgba(76,175,125,0.35)',borderRadius:'12px',padding:'10px 16px',color:'#4caf7d',cursor:'pointer',fontSize:'0.7rem',letterSpacing:'0.12em',fontFamily:'inherit',fontWeight:600,opacity:saving?0.5:1}}>
            {saving==='auto'?'⏳ Distribution…':'✨ Distribution recommandée'}
          </button>
        </div>

        {/* Barres globales */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'12px'}}>
          {[
            {l:'Budgété',  v:totalBudgeted,        tot:totalBudget, c:'#c9a84c'},
            {l:'Dépensé',  v:totalSpent,            tot:totalBudget, c:remaining<0?'#e74c3c':'#4caf7d'},
            {l:'Restant',  v:Math.abs(remaining),   tot:totalBudget, c:remaining<0?'#e74c3c':'#4caf7d', p:remaining<0?'-':'+'},
          ].map(s=>(
            <div key={s.l} style={{textAlign:'center'}}>
              <div style={{fontSize:'0.56rem',letterSpacing:'0.22em',textTransform:'uppercase',color:'rgba(255,255,255,0.3)',marginBottom:'3px'}}>{s.l}</div>
              <div style={{fontSize:'1.1rem',fontFamily:'"Playfair Display",serif',fontWeight:700,color:s.c}}>{s.p||''}{fmt(s.v)}</div>
              <div style={{height:'4px',background:'rgba(255,255,255,0.07)',borderRadius:'2px',marginTop:'5px',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${Math.min(100,pct(s.v,s.tot))}%`,background:s.c,opacity:0.8,transition:'width 0.5s'}}/>
              </div>
            </div>
          ))}
        </div>

        <div style={{position:'relative',height:'10px',background:'rgba(255,255,255,0.07)',borderRadius:'5px',overflow:'hidden'}}>
          <div style={{position:'absolute',left:0,top:0,height:'100%',width:`${Math.min(100,pct(totalSpent,totalBudget))}%`,background:remaining<0?'#e74c3c':'linear-gradient(90deg,#4caf7d,#c9a84c)',transition:'width 0.5s'}}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:'4px'}}>
          <span style={{color:'rgba(255,255,255,0.25)',fontSize:'0.58rem'}}>■ {pct(totalSpent,totalBudget)}% dépensé</span>
          <span style={{color:'rgba(255,255,255,0.25)',fontSize:'0.58rem'}}>{100-pct(totalSpent,totalBudget)}% restant</span>
        </div>
      </div>

      {/* ══ VUE CATÉGORIES ══ */}
      {view==='categories' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'12px'}}>
          {CATS.map(cat=>{
            const spent   = catSpent(cat.id)
            const budget  = catBudget(cat.id)
            const over    = spent > budget && budget > 0
            const isEd    = editing === cat.id
            const suggested = Math.round(totalBudget * cat.pct / 100)
            const [tmpBudget, setTmpBudget] = [budget, (v)=>{}]

            return (
              <div key={cat.id} style={{background:'linear-gradient(160deg,#1a4a2e,#0d2b1a)',border:over?'1px solid rgba(231,76,60,0.4)':'1px solid rgba(255,255,255,0.07)',borderRadius:'16px',overflow:'hidden',boxShadow:over?'0 0 0 2px rgba(231,76,60,0.15)':'none'}}>
                <div style={{height:'3px',background:cat.color}}/>
                <div style={{padding:'14px 16px'}}>

                  {/* Header */}
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'10px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',flex:1}}>
                      <span style={{fontSize:'1.3rem'}}>{cat.icon}</span>
                      <div>
                        <div style={{color:'#f0d080',fontSize:'0.82rem',fontWeight:600}}>{cat.label}</div>
                        <div style={{color:'rgba(255,255,255,0.28)',fontSize:'0.6rem',marginTop:'1px'}}>{cat.desc}</div>
                      </div>
                    </div>
                    {over && <span style={{fontSize:'0.58rem',color:'#e74c3c',background:'rgba(231,76,60,0.12)',border:'1px solid rgba(231,76,60,0.3)',borderRadius:'8px',padding:'2px 7px',flexShrink:0}}>⚠️ Dépassé</span>}
                  </div>

                  {/* Edition */}
                  {isEd ? (
                    <EditCatForm catId={cat.id} current={budget} suggested={suggested} saving={saving===cat.id}
                      onSave={v=>saveCategoryBudget(cat.id,v)} onCancel={()=>setEditing(null)}/>
                  ) : (
                    <>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'7px',marginBottom:'9px'}}>
                        {[
                          {l:'Budget prévu',v:budget,c:'#c9a84c',dim:!categories.find(c=>c.id===cat.id)},
                          {l:'Dépensé',     v:spent, c:hcol(budget,spent)},
                        ].map(s=>(
                          <div key={s.l} style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'7px 9px',border:'1px solid rgba(255,255,255,0.05)'}}>
                            <div style={{color:'rgba(255,255,255,0.3)',fontSize:'0.56rem',letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:'2px'}}>{s.l}</div>
                            <div style={{color:s.dim?'rgba(255,255,255,0.22)':s.c,fontSize:'0.95rem',fontFamily:'"Playfair Display",serif',fontWeight:700}}>
                              {fmt(s.v)}{s.dim&&<span style={{fontSize:'0.52rem',color:'rgba(255,255,255,0.18)',marginLeft:'3px'}}>(suggéré)</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{height:'4px',background:'rgba(255,255,255,0.06)',borderRadius:'2px',marginBottom:'9px',overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${Math.min(100,pct(spent,budget||1))}%`,background:hcol(budget,spent),transition:'width 0.4s'}}/>
                      </div>
                      <div style={{display:'flex',gap:'6px'}}>
                        <button onClick={()=>setEditing(cat.id)} style={{flex:1,padding:'6px',borderRadius:'8px',border:'1px solid rgba(201,168,76,0.25)',background:'rgba(201,168,76,0.08)',color:'#f0d080',fontSize:'0.6rem',cursor:'pointer',fontFamily:'inherit'}}>✏️ Modifier budget</button>
                        <button onClick={()=>setActiveTip(activeTip===cat.id?null:cat.id)} style={{padding:'6px 10px',borderRadius:'8px',border:'1px solid rgba(76,175,125,0.25)',background:'rgba(76,175,125,0.08)',color:'#4caf7d',fontSize:'0.65rem',cursor:'pointer'}} title="Conseil expert">💡</button>
                      </div>
                    </>
                  )}

                  {activeTip===cat.id && !isEd && (
                    <div style={{marginTop:'9px',padding:'9px 11px',borderRadius:'10px',background:'rgba(76,175,125,0.08)',border:'1px solid rgba(76,175,125,0.2)'}}>
                      <div style={{color:'#4caf7d',fontSize:'0.62rem',fontWeight:700,marginBottom:'3px'}}>💡 Conseil expert</div>
                      <p style={{color:'rgba(255,255,255,0.55)',fontSize:'0.7rem',lineHeight:1.5,margin:0}}>{cat.tips}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ══ VUE DÉPENSES ══ */}
      {view==='detail' && (
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {CATS.map(cat=>{
            const citems   = catItems(cat.id)
            const cSpent   = catSpent(cat.id)
            const cBudget  = catBudget(cat.id)
            const isAdding = addingTo === cat.id
            const paidCount = citems.filter(it=>it.paid).length

            return (
              <div key={cat.id} style={{background:'linear-gradient(160deg,#1a4a2e,#0d2b1a)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'16px',overflow:'hidden'}}>
                {/* Header catégorie */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 14px',background:`linear-gradient(135deg,${cat.color}22,${cat.color}08)`,borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <span style={{fontSize:'1.1rem'}}>{cat.icon}</span>
                    <span style={{color:'#f0d080',fontSize:'0.82rem',fontWeight:600}}>{cat.label}</span>
                    <span style={{color:'rgba(255,255,255,0.3)',fontSize:'0.68rem'}}>{fmt(cSpent)} / {fmt(cBudget)}</span>
                    {citems.length > 0 && <span style={{color:'rgba(255,255,255,0.25)',fontSize:'0.6rem'}}>· {paidCount}/{citems.length} payé(s)</span>}
                  </div>
                  <button onClick={()=>setAddingTo(isAdding?null:cat.id)} style={{background:isAdding?'rgba(231,76,60,0.15)':'rgba(201,168,76,0.12)',border:`1px solid ${isAdding?'rgba(231,76,60,0.3)':'rgba(201,168,76,0.25)'}`,borderRadius:'8px',padding:'5px 11px',color:isAdding?'#e74c3c':'#c9a84c',cursor:'pointer',fontSize:'0.65rem',fontFamily:'inherit'}}>
                    {isAdding?'✕ Annuler':'+ Ajouter dépense'}
                  </button>
                </div>

                <div style={{padding:'11px 14px'}}>
                  {/* Formulaire ajout */}
                  {isAdding && (
                    <div style={{background:'rgba(201,168,76,0.07)',borderRadius:'12px',padding:'13px',marginBottom:'10px',border:'1px solid rgba(201,168,76,0.18)'}}>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'7px'}}>
                        <div>
                          <label style={{color:'#4caf7d',fontSize:'0.56rem',letterSpacing:'0.2em',textTransform:'uppercase',display:'block',marginBottom:'3px'}}>Désignation *</label>
                          <input value={newItem.label} onChange={e=>setNewItem(p=>({...p,label:e.target.value}))}
                            placeholder="ex: Acompte traiteur" autoFocus
                            style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(201,168,76,0.25)',borderRadius:'8px',padding:'7px 9px',color:'white',fontSize:'0.8rem',outline:'none'}}/>
                        </div>
                        <div>
                          <label style={{color:'#4caf7d',fontSize:'0.56rem',letterSpacing:'0.2em',textTransform:'uppercase',display:'block',marginBottom:'3px'}}>Montant (€) *</label>
                          <input type="number" value={newItem.amount} onChange={e=>setNewItem(p=>({...p,amount:e.target.value}))}
                            placeholder="0"
                            style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(201,168,76,0.25)',borderRadius:'8px',padding:'7px 9px',color:'white',fontSize:'0.8rem',outline:'none'}}/>
                        </div>
                      </div>
                      <div style={{marginBottom:'8px'}}>
                        <label style={{color:'#4caf7d',fontSize:'0.56rem',letterSpacing:'0.2em',textTransform:'uppercase',display:'block',marginBottom:'3px'}}>Note (optionnel)</label>
                        <input value={newItem.note} onChange={e=>setNewItem(p=>({...p,note:e.target.value}))}
                          placeholder="ex: Contrat signé, solde à régler en juin" onKeyDown={e=>e.key==='Enter'&&addItem(cat.id)}
                          style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'8px',padding:'7px 9px',color:'white',fontSize:'0.75rem',outline:'none'}}/>
                      </div>
                      <button onClick={()=>addItem(cat.id)} disabled={!newItem.label.trim()||saving==='item'} style={{background:'linear-gradient(135deg,#c9a84c,#f0d080)',border:'none',borderRadius:'8px',padding:'8px 18px',color:'#1a4a2e',cursor:'pointer',fontWeight:700,fontSize:'0.72rem',fontFamily:'inherit',opacity:!newItem.label.trim()?0.5:1}}>
                        {saving==='item'?'⏳ Enregistrement…':'💾 Enregistrer dans Supabase'}
                      </button>
                    </div>
                  )}

                  {/* Liste items */}
                  {citems.length===0 ? (
                    <p style={{color:'rgba(255,255,255,0.2)',fontSize:'0.7rem',fontStyle:'italic',padding:'6px 0'}}>
                      Aucune dépense — cliquez "+ Ajouter dépense" pour commencer
                    </p>
                  ) : citems.map(it=>(
                    <div key={it.id} style={{display:'flex',alignItems:'center',gap:'9px',padding:'7px 9px',borderRadius:'8px',marginBottom:'4px',background:it.paid?'rgba(39,174,96,0.07)':'rgba(255,255,255,0.03)',border:`1px solid ${it.paid?'rgba(39,174,96,0.18)':'rgba(255,255,255,0.05)'}`}}>
                      <input type="checkbox" checked={it.paid} onChange={()=>togglePaid(it)} style={{accentColor:'#27ae60',cursor:'pointer',width:'15px',height:'15px',flexShrink:0}}/>
                      <div style={{flex:1,overflow:'hidden'}}>
                        <div style={{color:it.paid?'rgba(255,255,255,0.35)':'rgba(255,255,255,0.85)',fontSize:'0.78rem',fontWeight:500,textDecoration:it.paid?'line-through':'none',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{it.label}</div>
                        {it.note&&<div style={{color:'rgba(255,255,255,0.22)',fontSize:'0.62rem'}}>{it.note}</div>}
                      </div>
                      <div style={{color:it.paid?'#27ae60':'#f0d080',fontSize:'0.88rem',fontFamily:'"Playfair Display",serif',fontWeight:700,flexShrink:0}}>{fmt(it.amount)}</div>
                      <button onClick={()=>deleteItem(it.id)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.18)',cursor:'pointer',fontSize:'0.75rem',padding:'0 3px',transition:'color 0.15s'}}
                        onMouseEnter={e=>e.target.style.color='#e74c3c'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.18)'}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ══ VUE RÉCAP ══ */}
      {view==='recap' && (
        <div>
          <div style={{background:'linear-gradient(160deg,#1a4a2e,#0d2b1a)',borderRadius:'16px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.07)',marginBottom:'16px'}}>
            <div style={{padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{color:'#f0d080',fontSize:'0.72rem',letterSpacing:'0.2em',textTransform:'uppercase',fontWeight:600}}>Récapitulatif par catégorie</span>
              <span style={{color:'rgba(255,255,255,0.3)',fontSize:'0.65rem'}}>Budget : {fmt(totalBudget)}</span>
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.78rem'}}>
                <thead>
                  <tr style={{background:'rgba(0,0,0,0.2)'}}>
                    {['Catégorie','Budget prévu','Dépensé','Restant','Avancement'].map(h=>(
                      <th key={h} style={{padding:'9px 13px',textAlign:'left',color:'rgba(255,255,255,0.35)',fontSize:'0.58rem',letterSpacing:'0.18em',textTransform:'uppercase',fontWeight:400,borderBottom:'1px solid rgba(255,255,255,0.07)'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CATS.map(cat=>{
                    const spent  = catSpent(cat.id)
                    const budget = catBudget(cat.id)
                    const rest   = budget - spent
                    const progress = pct(spent, budget)
                    const hc = hcol(budget,spent)
                    return (
                      <tr key={cat.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                        <td style={{padding:'9px 13px'}}><div style={{display:'flex',alignItems:'center',gap:'7px'}}><span>{cat.icon}</span><span style={{color:'rgba(255,255,255,0.8)',fontWeight:500}}>{cat.label}</span></div></td>
                        <td style={{padding:'9px 13px',color:'#c9a84c',fontFamily:'"Playfair Display",serif'}}>{fmt(budget)}</td>
                        <td style={{padding:'9px 13px',color:hc,fontFamily:'"Playfair Display",serif',fontWeight:700}}>{fmt(spent)}</td>
                        <td style={{padding:'9px 13px',color:rest<0?'#e74c3c':'#4caf7d',fontFamily:'"Playfair Display",serif'}}>{rest<0?'-':'+'}{fmt(Math.abs(rest))}</td>
                        <td style={{padding:'9px 13px',minWidth:'110px'}}>
                          <div style={{height:'5px',background:'rgba(255,255,255,0.07)',borderRadius:'3px',overflow:'hidden',marginBottom:'3px'}}>
                            <div style={{height:'100%',width:`${Math.min(100,progress)}%`,background:hc,transition:'width 0.5s'}}/>
                          </div>
                          <span style={{color:'rgba(255,255,255,0.3)',fontSize:'0.62rem'}}>{progress}%</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr style={{background:'rgba(201,168,76,0.07)',borderTop:'2px solid rgba(201,168,76,0.25)'}}>
                    <td style={{padding:'11px 13px',color:'#f0d080',fontWeight:700,fontSize:'0.8rem'}}>TOTAL</td>
                    <td style={{padding:'11px 13px',color:'#c9a84c',fontFamily:'"Playfair Display",serif',fontWeight:700}}>{fmt(totalBudgeted)}</td>
                    <td style={{padding:'11px 13px',color:totalSpent>totalBudget?'#e74c3c':'#4caf7d',fontFamily:'"Playfair Display",serif',fontWeight:700}}>{fmt(totalSpent)}</td>
                    <td style={{padding:'11px 13px',color:remaining<0?'#e74c3c':'#4caf7d',fontFamily:'"Playfair Display",serif',fontWeight:700}}>{remaining<0?'-':'+'}{fmt(Math.abs(remaining))}</td>
                    <td style={{padding:'11px 13px'}}>
                      <div style={{height:'7px',background:'rgba(255,255,255,0.07)',borderRadius:'4px',overflow:'hidden',marginBottom:'3px'}}>
                        <div style={{height:'100%',width:`${Math.min(100,pct(totalSpent,totalBudget))}%`,background:remaining<0?'#e74c3c':'linear-gradient(90deg,#4caf7d,#c9a84c)',transition:'width 0.5s'}}/>
                      </div>
                      <span style={{color:'rgba(255,255,255,0.35)',fontSize:'0.62rem'}}>{pct(totalSpent,totalBudget)}% consommé</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'10px'}}>
            {[
              {icon:'🛡️', title:'Règle des 10%',        text:'Gardez toujours 10% du budget pour les imprévus de dernière minute. C\'est la règle d\'or.', color:'#27ae60', bg:'rgba(39,174,96,0.12)',  border:'rgba(39,174,96,0.3)'},
              {icon:'🗓️', title:'Calendrier paiements', text:'Négociez des acomptes de 20-30% à la réservation. Solde à J-30. Évitez les paiements intégraux.', color:'#c9a84c', bg:'rgba(201,168,76,0.12)', border:'rgba(201,168,76,0.3)'},
              {icon:'📝', title:'Contrats signés',       text:'Exigez un contrat signé pour chaque prestataire. Vérifiez les clauses d\'annulation.', color:'#9b59b6', bg:'rgba(155,89,182,0.12)', border:'rgba(155,89,182,0.3)'},
              {icon:'💳', title:'Traçabilité',           text:'Payez par virement pour traçabilité. Conservez toutes les factures et confirmations.', color:'#2980b9', bg:'rgba(41,128,185,0.12)', border:'rgba(41,128,185,0.3)'},
            ].map(c=>(
              <div key={c.icon} style={{background:c.bg, borderRadius:'14px', padding:'16px', border:`1px solid ${c.border}`}}>
                <div style={{fontSize:'1.8rem', marginBottom:'8px', lineHeight:1}}>{c.icon}</div>
                <div style={{color:c.color, fontSize:'0.78rem', fontWeight:700, marginBottom:'5px', letterSpacing:'0.05em'}}>{c.title}</div>
                <p style={{color:'rgba(255,255,255,0.55)', fontSize:'0.7rem', lineHeight:1.5, margin:0}}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal reset */}
      {confirmReset && (
        <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.85)'}} onClick={()=>setConfirmReset(false)}>
          <div style={{background:'linear-gradient(160deg,#1a4a2e,#0d2b1a)',border:'1px solid rgba(231,76,60,0.4)',borderRadius:'16px',padding:'26px 30px',maxWidth:'340px',textAlign:'center'}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:'2rem',marginBottom:'10px'}}>⚠️</div>
            <h3 style={{color:'#f0d080',fontFamily:'"Playfair Display",serif',fontStyle:'italic',marginBottom:'7px'}}>Réinitialiser le budget ?</h3>
            <p style={{color:'rgba(255,255,255,0.45)',fontSize:'0.76rem',lineHeight:1.5,marginBottom:'18px'}}>Toutes les dépenses et budgets seront supprimés de Supabase. Action irréversible.</p>
            <div style={{display:'flex',gap:'9px'}}>
              <button onClick={()=>setConfirmReset(false)} style={{flex:1,padding:'9px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.18)',background:'transparent',color:'rgba(255,255,255,0.45)',cursor:'pointer',fontFamily:'inherit'}}>Annuler</button>
              <button onClick={resetAll} disabled={!!saving} style={{flex:1,padding:'9px',borderRadius:'10px',border:'none',background:'#e74c3c',color:'white',cursor:'pointer',fontFamily:'inherit',fontWeight:700}}>Tout effacer</button>
            </div>
          </div>
        </div>
      )}

      {!guide && (
        <button onClick={()=>setGuide(true)} style={{position:'fixed',bottom:'20px',right:'20px',zIndex:100,background:'linear-gradient(135deg,#1a4a2e,#2d7a4f)',border:'1px solid rgba(76,175,125,0.4)',borderRadius:'50px',padding:'9px 16px',color:'#4caf7d',cursor:'pointer',fontSize:'0.68rem',letterSpacing:'0.12em',fontFamily:'inherit',boxShadow:'0 4px 20px rgba(0,0,0,0.4)'}}>
          🎓 Guide
        </button>
      )}

      <style>{`
        @keyframes slideIn { from{transform:translateX(20px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}

// ── Formulaire édition budget catégorie ──────────────
function EditCatForm({ catId, current, suggested, saving, onSave, onCancel }) {
  const [val, setVal] = useState(current || suggested)
  return (
    <div style={{background:'rgba(201,168,76,0.07)',borderRadius:'12px',padding:'12px',border:'1px solid rgba(201,168,76,0.2)'}}>
      <label style={{color:'#4caf7d',fontSize:'0.56rem',letterSpacing:'0.2em',textTransform:'uppercase',display:'block',marginBottom:'5px'}}>Montant budgété (€)</label>
      <input type="number" value={val} onChange={e=>setVal(e.target.value)} autoFocus
             onKeyDown={e=>e.key==='Enter'&&onSave(val)}
             style={{width:'100%',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(201,168,76,0.35)',borderRadius:'8px',padding:'8px 10px',color:'white',fontSize:'1rem',outline:'none',marginBottom:'6px'}}/>
      <div style={{color:'rgba(255,255,255,0.22)',fontSize:'0.6rem',marginBottom:'8px'}}>
        💡 Suggéré : {new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(suggested)}
      </div>
      <div style={{display:'flex',gap:'7px'}}>
        <button onClick={()=>onSave(val)} disabled={saving} style={{flex:1,padding:'7px',borderRadius:'8px',background:'linear-gradient(135deg,#c9a84c,#f0d080)',border:'none',color:'#1a4a2e',cursor:'pointer',fontWeight:700,fontSize:'0.7rem',fontFamily:'inherit',opacity:saving?0.6:1}}>
          {saving?'⏳ Sauvegarde…':'💾 Enregistrer'}
        </button>
        <button onClick={onCancel} style={{padding:'7px 12px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.15)',background:'transparent',color:'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:'0.7rem',fontFamily:'inherit'}}>✕</button>
      </div>
    </div>
  )
}
