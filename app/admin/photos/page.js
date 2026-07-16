'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'

// ── Constantes ────────────────────────────────────────────
const CLOUD  = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'kmilvqsi'
const VIEWS  = ['grid', 'list']
const SORTS  = [
  { v:'created_at', l:'Date' }, { v:'name', l:'Nom' },
  { v:'size', l:'Taille' }, { v:'format', l:'Format' },
]
const FORMATS = ['jpg','jpeg','png','webp','avif','gif']
const ROLES = {
  admin:        { upload:true,  update:true,  delete:true  },
  organisateur: { upload:true,  update:true,  delete:false },
  lecteur:      { upload:false, update:false, delete:false },
}

function imgUrl(pid, w=400, h=300) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/w_${w},h_${h},c_fill,q_auto,f_auto/${pid}`
}

// ── Composant Upload ──────────────────────────────────────
function UploadZone({ folder, onUploaded }) {
  const [files,    setFiles]    = useState([])
  const [progress, setProgress] = useState({})
  const [uploading,setUploading]= useState(false)

  const compress = async (file, maxW=1920) => {
    return new Promise(res => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width)
        const w = Math.round(img.width  * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        canvas.toBlob(blob => res(new File([blob], file.name, {type:'image/jpeg'})),
          'image/jpeg', 0.85)
        URL.revokeObjectURL(url)
      }
      img.src = url
    })
  }

  const onDrop = useCallback(accepted => {
    const previews = accepted.map(f => Object.assign(f, { preview: URL.createObjectURL(f) }))
    setFiles(prev => [...prev, ...previews])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': FORMATS.map(f => `.${f}`) },
    multiple: true, maxSize: 20 * 1024 * 1024,
  })

  const uploadAll = async () => {
    setUploading(true)
    const uploaded = []
    for (const file of files) {
      try {
        setProgress(p => ({ ...p, [file.name]: 10 }))
        const compressed = await compress(file)
        setProgress(p => ({ ...p, [file.name]: 30 }))

        // Signature sécurisée
        const sigRes = await fetch('/api/photos/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder: folder || 'mariage' }),
        })
        const sig = await sigRes.json()
        setProgress(p => ({ ...p, [file.name]: 50 }))

        // Upload Cloudinary
        const fd = new FormData()
        fd.append('file', compressed)
        fd.append('api_key',   sig.api_key)
        fd.append('timestamp', sig.timestamp)
        fd.append('signature', sig.signature)
        fd.append('folder',    sig.folder)

        const upRes = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
          { method: 'POST', body: fd }
        )
        const data = await upRes.json()
        setProgress(p => ({ ...p, [file.name]: 80 }))

        // Sauvegarder en base
        await fetch('/api/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            public_id: data.public_id, url: data.secure_url,
            name: file.name.replace(/\.[^.]+$/, ''),
            size: data.bytes, format: data.format,
            width: data.width, height: data.height,
            folder_id: folder || null,
          }),
        })
        setProgress(p => ({ ...p, [file.name]: 100 }))
        uploaded.push(data)
      } catch(e) {
        setProgress(p => ({ ...p, [file.name]: -1 }))
      }
    }
    setTimeout(() => {
      setFiles([]); setProgress({}); setUploading(false)
      onUploaded && onUploaded(uploaded)
    }, 1200)
  }

  return (
    <div>
      <div {...getRootProps()} style={{
        border: `2px dashed ${isDragActive ? '#22c55e' : 'rgba(201,168,76,0.4)'}`,
        borderRadius: '16px', padding: '32px', textAlign: 'center',
        background: isDragActive ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
        cursor: 'pointer', transition: 'all 0.2s', marginBottom: '16px',
      }}>
        <input {...getInputProps()} />
        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
          {isDragActive ? '🎯' : '📸'}
        </div>
        <p style={{ color: isDragActive ? '#22c55e' : 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
          {isDragActive ? 'Déposez ici !' : 'Glissez vos photos ou cliquez pour sélectionner'}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', marginTop: '4px' }}>
          JPG, PNG, WebP, AVIF · Max 20 MB · Multiple
        </p>
      </div>

      {files.length > 0 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: '10px', marginBottom: '16px' }}>
            {files.map(f => (
              <div key={f.name} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img src={f.preview} alt={f.name}
                  style={{ width: '100%', height: '90px', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {progress[f.name] === 100 ? (
                    <span style={{ color: '#22c55e', fontSize: '1.5rem' }}>✓</span>
                  ) : progress[f.name] === -1 ? (
                    <span style={{ color: '#ef4444', fontSize: '1.2rem' }}>✕</span>
                  ) : progress[f.name] > 0 ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>{progress[f.name]}%</div>
                      <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginTop: '4px' }}>
                        <div style={{ height: '100%', borderRadius: '2px', background: '#22c55e', width: `${progress[f.name]}%`, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setFiles(files.filter(x => x.name !== f.name))}
                      style={{ background: 'rgba(239,68,68,0.8)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                  )}
                </div>
                <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.7)', fontSize: '0.6rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.name}
                </div>
              </div>
            ))}
          </div>
          <button onClick={uploadAll} disabled={uploading}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: uploading ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg,#c9a84c,#f0d080)', color: '#1a4a2e', fontWeight: 700, fontSize: '0.8rem', cursor: uploading ? 'not-allowed' : 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {uploading ? '⏳ Téléversement en cours...' : `📤 Uploader ${files.length} photo${files.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Page principale ───────────────────────────────────────
export default function PhotosPage() {
  const [photos,   setPhotos]   = useState([])
  const [folders,  setFolders]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [view,     setView]     = useState('grid')
  const [search,   setSearch]   = useState('')
  const [sort,     setSort]     = useState('created_at')
  const [sortDir,  setSortDir]  = useState('desc')
  const [folder,   setFolder]   = useState(null)
  const [tag,      setTag]      = useState(null)
  const [trash,    setTrash]    = useState(false)
  const [favOnly,  setFavOnly]  = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [editing,  setEditing]  = useState(null)
  const [showUp,   setShowUp]   = useState(false)
  const [newFolder,setNewFolder]= useState('')
  const [toast,    setToast]    = useState(null)
  const [tab,      setTab]      = useState('galerie')

  const showToast = (msg, type='ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams({
      sort, order: sortDir, trash: trash.toString(),
      favorites: favOnly.toString(),
      ...(folder && { folder }),
      ...(tag    && { tag }),
      ...(search && { q: search }),
    })
    const [ph, fo] = await Promise.all([
      fetch(`/api/photos?${params}`).then(r => r.json()),
      fetch('/api/folders').then(r => r.json()),
    ])
    setPhotos(Array.isArray(ph) ? ph : [])
    setFolders(Array.isArray(fo) ? fo : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [search, sort, sortDir, folder, tag, trash, favOnly])

  const toggleFav = async (photo) => {
    await fetch('/api/photos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: photo.id, favorite: !photo.favorite }),
    })
    load()
  }

  const moveToTrash = async (id) => {
    await fetch(`/api/photos?id=${id}`, { method: 'DELETE' })
    showToast('Photo déplacée dans la corbeille')
    load()
  }

  const restore = async (id) => {
    await fetch('/api/photos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, deleted: false }),
    })
    showToast('Photo restaurée ✅')
    load()
  }

  const deletePermanent = async (id) => {
    if (!confirm('Supprimer définitivement ?')) return
    await fetch(`/api/photos?id=${id}&permanent=true`, { method: 'DELETE' })
    showToast('Photo supprimée définitivement')
    load()
  }

  const createFolder = async () => {
    if (!newFolder.trim()) return
    await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newFolder.trim() }),
    })
    setNewFolder(''); load()
  }

  const saveEdit = async () => {
    await fetch('/api/photos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editing.id, name: editing.name, caption: editing.caption, tags: editing.tags }),
    })
    setEditing(null); showToast('✅ Photo modifiée'); load()
  }

  // Tous les tags uniques
  const allTags = [...new Set(photos.flatMap(p => p.tags || []))]

  // Stats
  const totalSize = photos.reduce((s, p) => s + (p.size || 0), 0)
  const fmtSize = n => n > 1024*1024 ? `${(n/1024/1024).toFixed(1)} MB` : `${Math.round(n/1024)} KB`

  const S = { // Styles communs
    card:   { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:'12px', padding:'12px' },
    btn:    { padding:'7px 14px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.75)', fontSize:'0.72rem', cursor:'pointer', fontFamily:'inherit' },
    btnAct: { padding:'7px 14px', borderRadius:'8px', border:'1px solid rgba(201,168,76,0.6)', background:'rgba(201,168,76,0.18)', color:'#e8c97a', fontSize:'0.72rem', cursor:'pointer', fontFamily:'inherit' },
  }

  return (
    <div style={{ minHeight:'100vh', backgroundColor:'#1a4a2e', backgroundImage:'var(--bg-mesh)', backgroundAttachment:'fixed', fontFamily:'"Josefin Sans",sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ background:'rgba(0,0,0,0.4)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(201,168,76,0.3)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <a href="/admin/dashboard" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none', fontSize:'0.75rem' }}>← Admin</a>
          <div style={{ fontFamily:'"Playfair Display",serif', fontStyle:'italic', fontSize:'1.3rem', color:'#e8c97a' }}>📸 Gestionnaire Photos</div>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <button onClick={() => setShowUp(s => !s)} style={{ padding:'8px 16px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#c9a84c,#f0d080)', color:'#1a4a2e', fontSize:'0.72rem', fontWeight:700, cursor:'pointer', letterSpacing:'0.1em', textTransform:'uppercase' }}>
            📤 Uploader
          </button>
          <button onClick={() => fetch('/api/auth',{method:'DELETE'}).then(()=>window.location.href='/admin/login')}
            style={{ ...S.btn }}>Déconnexion</button>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position:'fixed', bottom:'24px', right:'24px', zIndex:200, padding:'12px 20px', borderRadius:'12px', background: toast.type==='err' ? 'rgba(239,68,68,0.92)' : 'rgba(34,197,94,0.92)', color:'white', fontSize:'0.82rem', fontWeight:600, boxShadow:'0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'24px 16px', display:'grid', gridTemplateColumns:'220px 1fr', gap:'20px' }}>

        {/* ── Sidebar ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>

          {/* Stats */}
          <div style={{ ...S.card }}>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.6rem', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:'10px' }}>Stockage</div>
            {[
              { l:'Photos', v: photos.length },
              { l:'Taille', v: fmtSize(totalSize) },
              { l:'Favoris', v: photos.filter(p=>p.favorite).length },
              { l:'Corbeille', v: '—' },
            ].map(s => (
              <div key={s.l} style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.75rem' }}>{s.l}</span>
                <span style={{ color:'#e8c97a', fontSize:'0.75rem', fontWeight:600 }}>{s.v}</span>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ ...S.card }}>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.6rem', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:'10px' }}>Navigation</div>
            {[
              { id:'galerie',  icon:'🖼️', label:'Galerie' },
              { id:'favoris',  icon:'⭐', label:'Favoris' },
              { id:'corbeille',icon:'🗑️', label:'Corbeille' },
              { id:'audit',    icon:'📋', label:'Historique' },
            ].map(item => (
              <button key={item.id} onClick={() => {
                setTab(item.id)
                setTrash(item.id === 'corbeille')
                setFavOnly(item.id === 'favoris')
                setFolder(null); setTag(null)
              }}
                style={{ width:'100%', textAlign:'left', padding:'8px 10px', borderRadius:'8px', border:'none', background: tab===item.id ? 'rgba(201,168,76,0.18)' : 'transparent', color: tab===item.id ? '#e8c97a' : 'rgba(255,255,255,0.6)', fontSize:'0.78rem', cursor:'pointer', marginBottom:'2px', fontFamily:'inherit' }}>
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          {/* Dossiers */}
          <div style={{ ...S.card }}>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.6rem', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:'10px' }}>Dossiers</div>
            <button onClick={() => setFolder(null)}
              style={{ width:'100%', textAlign:'left', padding:'7px 10px', borderRadius:'8px', border:'none', background: !folder ? 'rgba(201,168,76,0.15)' : 'transparent', color: !folder ? '#e8c97a' : 'rgba(255,255,255,0.55)', fontSize:'0.75rem', cursor:'pointer', marginBottom:'4px', fontFamily:'inherit' }}>
              📂 Tous les dossiers
            </button>
            {folders.map(f => (
              <button key={f.id} onClick={() => setFolder(f.id)}
                style={{ width:'100%', textAlign:'left', padding:'7px 10px', borderRadius:'8px', border:'none', background: folder===f.id ? 'rgba(201,168,76,0.15)' : 'transparent', color: folder===f.id ? '#e8c97a' : 'rgba(255,255,255,0.55)', fontSize:'0.75rem', cursor:'pointer', marginBottom:'2px', fontFamily:'inherit' }}>
                📁 {f.name}
              </button>
            ))}
            <div style={{ display:'flex', gap:'6px', marginTop:'8px' }}>
              <input value={newFolder} onChange={e=>setNewFolder(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&createFolder()}
                placeholder="Nouveau dossier..."
                style={{ flex:1, padding:'6px 8px', borderRadius:'7px', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.07)', color:'white', fontSize:'0.7rem', outline:'none', fontFamily:'inherit' }} />
              <button onClick={createFolder}
                style={{ padding:'6px 10px', borderRadius:'7px', border:'none', background:'rgba(201,168,76,0.25)', color:'#e8c97a', cursor:'pointer', fontSize:'0.85rem' }}>+</button>
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div style={{ ...S.card }}>
              <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.6rem', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:'10px' }}>Tags</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                {allTags.map(t => (
                  <button key={t} onClick={() => setTag(tag===t ? null : t)}
                    style={{ padding:'3px 10px', borderRadius:'20px', border:`1px solid ${tag===t ? '#c9a84c' : 'rgba(255,255,255,0.2)'}`, background: tag===t ? 'rgba(201,168,76,0.2)' : 'transparent', color: tag===t ? '#e8c97a' : 'rgba(255,255,255,0.55)', fontSize:'0.65rem', cursor:'pointer', fontFamily:'inherit' }}>
                    🏷️ {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Contenu principal ── */}
        <div>

          {/* Zone Upload */}
          {showUp && (
            <div style={{ ...S.card, marginBottom:'16px', border:'1px solid rgba(201,168,76,0.3)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                <span style={{ color:'#e8c97a', fontSize:'0.8rem', fontWeight:600 }}>📤 Téléverser des photos</span>
                <button onClick={()=>setShowUp(false)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'1rem' }}>✕</button>
              </div>
              <UploadZone folder={folder} onUploaded={() => { setShowUp(false); load(); showToast('✅ Photos uploadées !') }} />
            </div>
          )}

          {/* Barre outils */}
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center', marginBottom:'16px' }}>
            {/* Recherche */}
            <div style={{ position:'relative', flex:1, minWidth:'200px' }}>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="🔍 Rechercher..."
                style={{ width:'100%', padding:'9px 14px 9px 36px', borderRadius:'10px', border:'1px solid rgba(201,168,76,0.3)', background:'rgba(255,255,255,0.08)', color:'white', fontSize:'0.85rem', outline:'none', boxSizing:'border-box', fontFamily:'inherit' }} />
              <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'0.9rem' }}>🔍</span>
              {search && <button onClick={()=>setSearch('')} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer' }}>✕</button>}
            </div>

            {/* Tri */}
            <select value={sort} onChange={e=>setSort(e.target.value)}
              style={{ padding:'9px 12px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'white', fontSize:'0.78rem', outline:'none', cursor:'pointer', fontFamily:'inherit' }}>
              {SORTS.map(s => <option key={s.v} value={s.v} style={{background:'#1a4a2e'}}>{s.l}</option>)}
            </select>

            <button onClick={()=>setSortDir(d=>d==='asc'?'desc':'asc')} style={{ ...S.btn }}>
              {sortDir==='asc'?'↑':'↓'}
            </button>

            {/* Vue */}
            {VIEWS.map(v => (
              <button key={v} onClick={()=>setView(v)}
                style={view===v ? S.btnAct : S.btn}>
                {v==='grid' ? '⊞' : '☰'}
              </button>
            ))}

            <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.7rem' }}>
              {photos.length} photo{photos.length>1?'s':''}
            </span>
          </div>

          {/* Grille/Liste photos */}
          {loading ? (
            <div style={{ textAlign:'center', padding:'64px', color:'rgba(255,255,255,0.4)', fontSize:'2rem' }}>⏳</div>
          ) : photos.length === 0 ? (
            <div style={{ textAlign:'center', padding:'64px', ...S.card }}>
              <div style={{ fontSize:'3rem', marginBottom:'12px' }}>{trash?'🗑️':favOnly?'⭐':'📷'}</div>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.9rem', fontStyle:'italic' }}>
                {trash ? 'Corbeille vide' : favOnly ? 'Aucun favori' : 'Aucune photo — uploadez-en !'}
              </p>
            </div>
          ) : view === 'grid' ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'12px' }}>
              {photos.map(p => (
                <div key={p.id}
                  style={{ ...S.card, padding:0, overflow:'hidden', cursor:'pointer', transition:'transform 0.2s, box-shadow 0.2s', position:'relative',
                    border: selected.has(p.id) ? '2px solid #c9a84c' : '1px solid rgba(255,255,255,0.10)' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.4)'}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}>

                  {/* Image */}
                  <div style={{ position:'relative' }} onClick={() => setLightbox(p)}>
                    <img src={imgUrl(p.public_id)} alt={p.name}
                      style={{ width:'100%', height:'160px', objectFit:'cover', display:'block' }}
                      loading="lazy" />
                    {/* Overlay actions */}
                    <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0)', transition:'background 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', opacity:0 }}
                      className="photo-overlay"
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,0,0,0.5)';e.currentTarget.style.opacity='1'}}
                      onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,0,0,0)';e.currentTarget.style.opacity='0'}}>
                      <button onClick={(e)=>{e.stopPropagation();setLightbox(p)}}
                        style={{ padding:'6px 10px', borderRadius:'8px', border:'none', background:'rgba(255,255,255,0.2)', color:'white', cursor:'pointer', fontSize:'1rem' }}>🔍</button>
                    </div>
                  </div>

                  {/* Infos */}
                  <div style={{ padding:'10px' }}>
                    <div style={{ color:'white', fontSize:'0.75rem', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'6px' }}>
                      {p.name}
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.62rem' }}>
                        {p.format?.toUpperCase()} · {fmtSize(p.size||0)}
                      </span>
                      <div style={{ display:'flex', gap:'4px' }}>
                        {/* Favori */}
                        <button onClick={()=>toggleFav(p)}
                          style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.85rem', opacity: p.favorite ? 1 : 0.4 }}>
                          ⭐
                        </button>
                        {/* Modifier */}
                        <button onClick={()=>setEditing({...p, tags:(p.tags||[]).join(',')})}
                          style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.85rem', opacity:0.6 }}>
                          ✏️
                        </button>
                        {/* Télécharger */}
                        <a href={p.url} download target="_blank" rel="noreferrer"
                          style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.85rem', opacity:0.6, textDecoration:'none' }}>
                          ⬇️
                        </a>
                        {/* Corbeille/Restaurer */}
                        {trash ? (
                          <>
                            <button onClick={()=>restore(p.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.85rem', opacity:0.6 }}>♻️</button>
                            <button onClick={()=>deletePermanent(p.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.85rem', opacity:0.6 }}>💥</button>
                          </>
                        ) : (
                          <button onClick={()=>moveToTrash(p.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.85rem', opacity:0.6 }}>🗑️</button>
                        )}
                      </div>
                    </div>
                    {/* Tags */}
                    {p.tags?.length > 0 && (
                      <div style={{ display:'flex', gap:'4px', flexWrap:'wrap', marginTop:'6px' }}>
                        {p.tags.map(t => (
                          <span key={t} style={{ padding:'2px 6px', borderRadius:'10px', background:'rgba(201,168,76,0.15)', color:'#c9a84c', fontSize:'0.58rem' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Vue liste */
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {photos.map(p => (
                <div key={p.id} style={{ ...S.card, display:'flex', alignItems:'center', gap:'14px' }}>
                  <img src={imgUrl(p.public_id, 80, 60)} alt={p.name}
                    style={{ width:'80px', height:'56px', objectFit:'cover', borderRadius:'8px', flexShrink:0, cursor:'pointer' }}
                    onClick={() => setLightbox(p)} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:'white', fontWeight:600, fontSize:'0.85rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                    <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.68rem', marginTop:'2px' }}>
                      {p.format?.toUpperCase()} · {fmtSize(p.size||0)} · {p.width}×{p.height}
                    </div>
                    {p.tags?.length > 0 && (
                      <div style={{ display:'flex', gap:'4px', marginTop:'4px' }}>
                        {p.tags.map(t => <span key={t} style={{ padding:'1px 6px', borderRadius:'10px', background:'rgba(201,168,76,0.15)', color:'#c9a84c', fontSize:'0.58rem' }}>{t}</span>)}
                      </div>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                    <button onClick={()=>toggleFav(p)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1rem', opacity: p.favorite ? 1 : 0.35 }}>⭐</button>
                    <button onClick={()=>setEditing({...p, tags:(p.tags||[]).join(',')})} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1rem', opacity:0.5 }}>✏️</button>
                    <a href={p.url} download target="_blank" rel="noreferrer" style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1rem', opacity:0.5, textDecoration:'none' }}>⬇️</a>
                    {trash ? (
                      <>
                        <button onClick={()=>restore(p.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1rem', opacity:0.5 }}>♻️</button>
                        <button onClick={()=>deletePermanent(p.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1rem', opacity:0.5 }}>💥</button>
                      </>
                    ) : (
                      <button onClick={()=>moveToTrash(p.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1rem', opacity:0.5 }}>🗑️</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div onClick={()=>setLightbox(null)} style={{ position:'fixed', inset:0, zIndex:999, background:'rgba(0,0,0,0.94)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', cursor:'zoom-out' }}>
          <button onClick={()=>setLightbox(null)} style={{ position:'absolute', top:'20px', right:'24px', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:'50%', width:'44px', height:'44px', color:'white', fontSize:'1.3rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>

          {/* Navigation */}
          <button onClick={(e)=>{e.stopPropagation();const i=photos.findIndex(p=>p.id===lightbox.id);setLightbox(photos[(i-1+photos.length)%photos.length])}}
            style={{ position:'absolute', left:'20px', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:'50%', width:'44px', height:'44px', color:'white', fontSize:'1.3rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
          <button onClick={(e)=>{e.stopPropagation();const i=photos.findIndex(p=>p.id===lightbox.id);setLightbox(photos[(i+1)%photos.length])}}
            style={{ position:'absolute', right:'80px', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:'50%', width:'44px', height:'44px', color:'white', fontSize:'1.3rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>

          <img src={lightbox.url} alt={lightbox.name}
            style={{ maxWidth:'88vw', maxHeight:'88vh', objectFit:'contain', borderRadius:'12px', boxShadow:'0 24px 80px rgba(0,0,0,0.8)', cursor:'default' }}
            onClick={e=>e.stopPropagation()} />

          <div style={{ position:'absolute', bottom:'24px', left:'50%', transform:'translateX(-50%)', textAlign:'center' }}>
            <div style={{ color:'#e8c97a', fontSize:'0.85rem', letterSpacing:'0.2em', textTransform:'uppercase' }}>{lightbox.name}</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.68rem', marginTop:'4px' }}>
              {lightbox.format?.toUpperCase()} · {fmtSize(lightbox.size||0)} · {lightbox.width}×{lightbox.height}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal édition ── */}
      {editing && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.78)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
          onClick={e=>e.target===e.currentTarget&&setEditing(null)}>
          <div style={{ background:'linear-gradient(160deg,#1a4a2e,#0d2b1a)', border:'1px solid rgba(201,168,76,0.4)', borderRadius:'20px', padding:'28px', width:'100%', maxWidth:'420px', boxShadow:'0 24px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h3 style={{ fontFamily:'"Playfair Display",serif', fontStyle:'italic', color:'#e8c97a', fontSize:'1.2rem', margin:0 }}>✏️ Modifier la photo</h3>
              <button onClick={()=>setEditing(null)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'1.2rem' }}>✕</button>
            </div>

            <img src={imgUrl(editing.public_id,400,200)} alt={editing.name}
              style={{ width:'100%', height:'160px', objectFit:'cover', borderRadius:'10px', marginBottom:'16px' }} />

            {[
              { label:'Nom', key:'name', placeholder:'Nom de la photo' },
              { label:'Légende', key:'caption', placeholder:'Description...' },
              { label:'Tags (séparés par virgule)', key:'tags', placeholder:'mariage, cérémonie, famille...' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:'14px' }}>
                <label style={{ display:'block', color:'rgba(255,255,255,0.55)', fontSize:'0.62rem', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:'5px' }}>{f.label}</label>
                <input value={editing[f.key]||''} onChange={e=>setEditing({...editing,[f.key]:e.target.value})}
                  placeholder={f.placeholder}
                  style={{ width:'100%', padding:'9px 13px', borderRadius:'9px', border:'2px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.07)', color:'white', fontSize:'0.88rem', outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
                  onFocus={e=>e.target.style.borderColor='#c9a84c'}
                  onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.12)'} />
              </div>
            ))}

            <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
              <button onClick={()=>setEditing(null)} style={{ flex:1, padding:'11px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.55)', fontSize:'0.75rem', cursor:'pointer', fontFamily:'inherit' }}>Annuler</button>
              <button onClick={saveEdit} style={{ flex:2, padding:'11px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#c9a84c,#f0d080)', color:'#1a4a2e', fontSize:'0.75rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>💾 Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
