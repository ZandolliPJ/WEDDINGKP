'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'kmilvqsi'

function fmtSize(n) {
  if (!n) return '—'
  if (n > 1024 * 1024 * 1024) return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`
  if (n > 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${Math.round(n / 1024)} KB`
}
function fmtDur(s) {
  if (!s) return '—'
  const m = Math.floor(s / 60), sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}
function thumbUrl(pid, t = 2) {
  return `https://res.cloudinary.com/${CLOUD}/video/upload/so_${t},w_400,h_250,c_fill,q_auto,f_auto/${pid}.jpg`
}
function videoUrl(pid) {
  return `https://res.cloudinary.com/${CLOUD}/video/upload/vc_auto,q_auto,w_720/${pid}.mp4`
}

// ── Zone Upload Vidéo ────────────────────────────────────
function UploadZone({ onUploaded }) {
  const [files, setFiles] = useState([])
  const [progress, setProgress] = useState({})
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(accepted => {
    setFiles(prev => [...prev, ...accepted.map(f =>
      Object.assign(f, { preview: URL.createObjectURL(f) })
    )])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv'] },
    multiple: true,
    maxSize: 500 * 1024 * 1024,
  })

  const uploadAll = async () => {
    setUploading(true)
    for (const file of files) {
      try {
        setProgress(p => ({ ...p, [file.name]: 10 }))

        // Signature
        const sigRes = await fetch('/api/photos/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder: 'mariage/videos', resource_type: 'video' }),
        })
        const sig = await sigRes.json()
        setProgress(p => ({ ...p, [file.name]: 30 }))

        // Upload Cloudinary
        const fd = new FormData()
        fd.append('file', file)
        fd.append('api_key', sig.api_key)
        fd.append('timestamp', sig.timestamp)
        fd.append('signature', sig.signature)
        fd.append('folder', 'mariage/videos')

        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = e => {
          if (e.lengthComputable) {
            const pct = Math.round(30 + (e.loaded / e.total) * 60)
            setProgress(p => ({ ...p, [file.name]: pct }))
          }
        }

        const upData = await new Promise((res, rej) => {
          xhr.onload = () => res(JSON.parse(xhr.responseText))
          xhr.onerror = rej
          xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD}/video/upload`)
          xhr.send(fd)
        })

        setProgress(p => ({ ...p, [file.name]: 90 }))

        // Sauvegarder en base
        await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            public_id: upData.public_id,
            url: upData.secure_url,
            name: file.name.replace(/\.[^.]+$/, ''),
            size: upData.bytes,
            format: upData.format,
            duration: upData.duration,
            width: upData.width,
            height: upData.height,
            thumbnail: thumbUrl(upData.public_id),
          }),
        })
        setProgress(p => ({ ...p, [file.name]: 100 }))
      } catch (e) {
        setProgress(p => ({ ...p, [file.name]: -1 }))
      }
    }
    setTimeout(() => {
      setFiles([]); setProgress({}); setUploading(false)
      onUploaded && onUploaded()
    }, 1500)
  }

  return (
    <div>
      <div {...getRootProps()} style={{
        border: `2px dashed ${isDragActive ? '#22c55e' : 'rgba(201,168,76,0.4)'}`,
        borderRadius: '16px', padding: '40px', textAlign: 'center',
        background: isDragActive ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
        cursor: 'pointer', transition: 'all 0.2s',
      }}>
        <input {...getInputProps()} />
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
          {isDragActive ? '🎯' : '🎬'}
        </div>
        <p style={{ color: isDragActive ? '#22c55e' : 'rgba(255,255,255,0.65)', fontSize: '0.95rem', marginBottom: '6px' }}>
          {isDragActive ? 'Déposez vos vidéos ici !' : 'Glissez vos vidéos ou cliquez pour sélectionner'}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>
          MP4, MOV, AVI, WebM · Max 500 MB · Multiple
        </p>
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {files.map(f => (
              <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 14px' }}>
                <span style={{ fontSize: '1.2rem' }}>🎬</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>{f.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem' }}>{fmtSize(f.size)}</div>
                  {progress[f.name] > 0 && progress[f.name] < 100 && (
                    <div style={{ marginTop: '6px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                      <div style={{ height: '100%', borderRadius: '2px', background: '#22c55e', width: `${progress[f.name]}%`, transition: 'width 0.3s' }} />
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '1rem' }}>
                  {progress[f.name] === 100 ? '✅' : progress[f.name] === -1 ? '❌' : progress[f.name] > 0 ? `${progress[f.name]}%` : '⏳'}
                </span>
                {!uploading && (
                  <button onClick={() => setFiles(files.filter(x => x.name !== f.name))}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                )}
              </div>
            ))}
          </div>
          <button onClick={uploadAll} disabled={uploading}
            style={{ width: '100%', padding: '13px', borderRadius: '12px', border: 'none', background: uploading ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg,#c9a84c,#f0d080)', color: '#1a4a2e', fontWeight: 700, fontSize: '0.8rem', cursor: uploading ? 'not-allowed' : 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {uploading ? '⏳ Téléversement...' : `🎬 Uploader ${files.length} vidéo${files.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Lecteur vidéo modal ──────────────────────────────────
function VideoPlayer({ video, onClose, onPrev, onNext }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.96)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      {/* Fermer */}
      <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '24px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '50%', width: '44px', height: '44px', color: 'white', fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>✕</button>

      {/* Navigation */}
      <button onClick={(e) => { e.stopPropagation(); onPrev() }} style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '50%', width: '48px', height: '48px', color: 'white', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
      <button onClick={(e) => { e.stopPropagation(); onNext() }} style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '50%', width: '48px', height: '48px', color: 'white', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>

      {/* Vidéo */}
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '900px' }}>
        <video controls autoPlay preload="auto"
          poster={video.thumbnail}
          style={{
            width: '100%', borderRadius: '14px', maxHeight: '80vh', background: '#000',
            aspectRatio: '16/9',
            width: '100%',
          }}>
          <source src={videoUrl(video.public_id)} type="video/mp4" />
        </video>

        {/* Infos */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ color: '#e8c97a', fontFamily: '"Playfair Display",serif', fontStyle: 'italic', fontSize: '1.2rem' }}>{video.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', marginTop: '4px' }}>
              {video.format?.toUpperCase()} · {fmtSize(video.size)} · {fmtDur(video.duration)} · {video.width}×{video.height}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href={video.url} download target="_blank" rel="noreferrer"
              style={{ padding: '9px 16px', borderRadius: '9px', border: '1px solid rgba(201,168,76,0.4)', background: 'rgba(201,168,76,0.12)', color: '#e8c97a', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.08em' }}>
              ⬇️ Télécharger
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page principale ──────────────────────────────────────
export default function VideosPage() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('grid')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('created_at')
  const [trash, setTrash] = useState(false)
  const [favOnly, setFavOnly] = useState(false)
  const [player, setPlayer] = useState(null)
  const [showUp, setShowUp] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState(null)
  const [tab, setTab] = useState('galerie')

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams({
      sort, order: 'desc',
      trash: trash.toString(),
      fav: favOnly.toString(),
      ...(search && { q: search }),
    })
    const res = await fetch(`/api/videos?${params}`)
    const data = await res.json()
    setVideos(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [search, sort, trash, favOnly])

  const toggleFav = async (v) => {
    await fetch('/api/videos', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: v.id, favorite: !v.favorite })
    })
    load()
  }

  const moveToTrash = async (id) => {
    await fetch(`/api/videos?id=${id}`, { method: 'DELETE' })
    showToast('Vidéo déplacée dans la corbeille')
    load()
  }

  const restore = async (id) => {
    await fetch('/api/videos', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, deleted: false })
    })
    showToast('Vidéo restaurée ✅'); load()
  }

  const deletePermanent = async (id) => {
    if (!confirm('Supprimer définitivement cette vidéo ?')) return
    await fetch(`/api/videos?id=${id}&permanent=true`, { method: 'DELETE' })
    showToast('Vidéo supprimée définitivement'); load()
  }

  const saveEdit = async () => {
    await fetch('/api/videos', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editing.id, name: editing.name, caption: editing.caption })
    })
    setEditing(null); showToast('✅ Vidéo modifiée'); load()
  }

  // Stats
  const totalSize = videos.reduce((s, v) => s + (v.size || 0), 0)
  const totalDur = videos.reduce((s, v) => s + (v.duration || 0), 0)

  const S = {
    card: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '14px' },
    btn: { padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit' },
    btnAct: { padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.6)', background: 'rgba(201,168,76,0.18)', color: '#e8c97a', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit' },
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a4a2e', backgroundImage: 'var(--bg-mesh)', backgroundAttachment: 'fixed', fontFamily: '"Josefin Sans",sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(201,168,76,0.3)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/admin/dashboard" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.75rem' }}>← Admin</a>
          <div style={{ fontFamily: '"Playfair Display",serif', fontStyle: 'italic', fontSize: '1.3rem', color: '#e8c97a' }}>🎬 Gestionnaire Vidéos</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowUp(s => !s)}
            style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#c9a84c,#f0d080)', color: '#1a4a2e', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            🎬 Uploader
          </button>
          <button onClick={() => fetch('/api/auth', { method: 'DELETE' }).then(() => window.location.href = '/admin/login')} style={S.btn}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 200, padding: '12px 20px', borderRadius: '12px', background: toast.type === 'err' ? 'rgba(239,68,68,0.92)' : 'rgba(34,197,94,0.92)', color: 'white', fontSize: '0.82rem', fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px' }}>

        {/* ── Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Stats dashboard */}
          <div style={{ ...S.card, padding: '16px' }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>Tableau de bord</div>
            {[
              { l: 'Vidéos', v: videos.length, c: '#e8c97a' },
              { l: 'Stockage', v: fmtSize(totalSize), c: '#22c55e' },
              { l: 'Durée totale', v: fmtDur(totalDur), c: '#c9a84c' },
              { l: 'Favoris', v: videos.filter(v => v.favorite).length, c: '#f0d080' },
            ].map(s => (
              <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>{s.l}</span>
                <span style={{ color: s.c, fontSize: '0.72rem', fontWeight: 700 }}>{s.v}</span>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ ...S.card, padding: '14px' }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '10px' }}>Navigation</div>
            {[
              { id: 'galerie', icon: '🎬', label: 'Toutes les vidéos' },
              { id: 'favoris', icon: '⭐', label: 'Favoris' },
              { id: 'corbeille', icon: '🗑️', label: 'Corbeille' },
            ].map(item => (
              <button key={item.id} onClick={() => {
                setTab(item.id)
                setTrash(item.id === 'corbeille')
                setFavOnly(item.id === 'favoris')
              }}
                style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: '8px', border: 'none', background: tab === item.id ? 'rgba(201,168,76,0.18)' : 'transparent', color: tab === item.id ? '#e8c97a' : 'rgba(255,255,255,0.6)', fontSize: '0.78rem', cursor: 'pointer', marginBottom: '2px', fontFamily: 'inherit' }}>
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          {/* Lien vers photos */}
          <a href="/admin/photos" style={{ ...S.card, padding: '12px 14px', display: 'block', textDecoration: 'none', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#e8c97a'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
            📸 Gestionnaire Photos
          </a>
        </div>

        {/* ── Contenu principal ── */}
        <div>

          {/* Zone Upload */}
          {showUp && (
            <div style={{ ...S.card, padding: '24px', marginBottom: '16px', border: '1px solid rgba(201,168,76,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ color: '#e8c97a', fontSize: '0.85rem', fontWeight: 600 }}>🎬 Téléverser des vidéos</span>
                <button onClick={() => setShowUp(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
              </div>
              <UploadZone onUploaded={() => { setShowUp(false); load(); showToast('✅ Vidéos uploadées !') }} />
            </div>
          )}

          {/* Barre outils */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Rechercher une vidéo..."
                style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: '12px', border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>✕</button>}
            </div>

            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: '0.78rem', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              <option value="created_at" style={{ background: '#1a4a2e' }}>📅 Date</option>
              <option value="name" style={{ background: '#1a4a2e' }}>🔤 Nom</option>
              <option value="size" style={{ background: '#1a4a2e' }}>📦 Taille</option>
              <option value="duration" style={{ background: '#1a4a2e' }}>⏱️ Durée</option>
            </select>

            <button onClick={() => setView('grid')} style={view === 'grid' ? S.btnAct : S.btn}>⊞</button>
            <button onClick={() => setView('list')} style={view === 'list' ? S.btnAct : S.btn}>☰</button>

            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
              {videos.length} vidéo{videos.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Contenu */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.4)', fontSize: '2.5rem' }}>⏳</div>
          ) : videos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', ...S.card }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{trash ? '🗑️' : favOnly ? '⭐' : '🎬'}</div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', fontStyle: 'italic' }}>
                {trash ? 'Corbeille vide' : favOnly ? 'Aucun favori' : 'Aucune vidéo — uploadez-en !'}
              </p>
              {!trash && !favOnly && (
                <button onClick={() => setShowUp(true)}
                  style={{ marginTop: '16px', padding: '11px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#c9a84c,#f0d080)', color: '#1a4a2e', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                  🎬 Uploader une vidéo
                </button>
              )}
            </div>
          ) : view === 'grid' ? (
            /* ── Vue Grille ── */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '14px' }}>
              {videos.map(v => (
                <div key={v.id} style={{ ...S.card, overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>

                  {/* Miniature cliquable */}
                  <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setPlayer(v)}>
                    <img src={v.thumbnail || thumbUrl(v.public_id)}
                      alt={v.name}
                      style={{ width: '100%', height: '180px', objectFit: 'contain', background: '#0d2b1a', display: 'block', background: '#0d2b1a' }}
                      onError={e => e.target.style.display = 'none'} />
                    {/* Overlay play */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
                        <span style={{ fontSize: '1.4rem', marginLeft: '4px' }}>▶</span>
                      </div>
                    </div>
                    {/* Durée */}
                    {v.duration > 0 && (
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.75)', color: 'white', fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '6px', fontFamily: 'monospace' }}>
                        {fmtDur(v.duration)}
                      </div>
                    )}
                    {/* Favori badge */}
                    {v.favorite && (
                      <div style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '1rem' }}>⭐</div>
                    )}
                  </div>

                  {/* Infos + actions */}
                  <div style={{ padding: '12px' }}>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
                      {v.name}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', marginBottom: '10px' }}>
                      {v.format?.toUpperCase()} · {fmtSize(v.size)} · {fmtDur(v.duration)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button onClick={() => setPlayer(v)}
                        style={{ padding: '6px 12px', borderRadius: '7px', border: 'none', background: 'linear-gradient(135deg,#c9a84c,#f0d080)', color: '#1a4a2e', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer' }}>
                        ▶ Lire
                      </button>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => toggleFav(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', opacity: v.favorite ? 1 : 0.4 }}>⭐</button>
                        <button onClick={() => setEditing({ ...v })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', opacity: 0.6 }}>✏️</button>
                        <a href={v.url} download target="_blank" rel="noreferrer" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', opacity: 0.6, textDecoration: 'none' }}>⬇️</a>
                        {trash ? (
                          <>
                            <button onClick={() => restore(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', opacity: 0.6 }}>♻️</button>
                            <button onClick={() => deletePermanent(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', opacity: 0.6 }}>💥</button>
                          </>
                        ) : (
                          <button onClick={() => moveToTrash(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', opacity: 0.6 }}>🗑️</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── Vue Liste ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {videos.map(v => (
                <div key={v.id} style={{ ...S.card, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }} onClick={() => setPlayer(v)}>
                    <img src={v.thumbnail || thumbUrl(v.public_id)} alt={v.name}
                      style={{ width: '120px', height: '72px', objectFit: 'cover', borderRadius: '8px', display: 'block', background: '#0d2b1a' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>▶</span>
                    </div>
                    {v.duration > 0 && (
                      <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.8)', color: 'white', fontSize: '0.6rem', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace' }}>
                        {fmtDur(v.duration)}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem', marginTop: '3px' }}>
                      {v.format?.toUpperCase()} · {fmtSize(v.size)} · {fmtDur(v.duration)} · {v.width}×{v.height}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => setPlayer(v)} style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#c9a84c,#f0d080)', color: '#1a4a2e', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer' }}>▶ Lire</button>
                    <button onClick={() => toggleFav(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: v.favorite ? 1 : 0.35 }}>⭐</button>
                    <button onClick={() => setEditing({ ...v })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5 }}>✏️</button>
                    <a href={v.url} download target="_blank" rel="noreferrer" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5, textDecoration: 'none' }}>⬇️</a>
                    {trash ? (
                      <>
                        <button onClick={() => restore(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5 }}>♻️</button>
                        <button onClick={() => deletePermanent(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5 }}>💥</button>
                      </>
                    ) : (
                      <button onClick={() => moveToTrash(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5 }}>🗑️</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Lecteur vidéo ── */}
      {player && (
        <VideoPlayer
          video={player}
          onClose={() => setPlayer(null)}
          onPrev={() => { const i = videos.findIndex(v => v.id === player.id); setPlayer(videos[(i - 1 + videos.length) % videos.length]) }}
          onNext={() => { const i = videos.findIndex(v => v.id === player.id); setPlayer(videos[(i + 1) % videos.length]) }}
        />
      )}

      {/* ── Modal édition ── */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div style={{ background: 'linear-gradient(160deg,#1a4a2e,#0d2b1a)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: '"Playfair Display",serif', fontStyle: 'italic', color: '#e8c97a', fontSize: '1.2rem', margin: 0 }}>✏️ Modifier</h3>
              <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            {[
              { label: 'Nom', key: 'name' },
              { label: 'Légende', key: 'caption' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>{f.label}</label>
                <input value={editing[f.key] || ''} onChange={e => setEditing({ ...editing, [f.key]: e.target.value })}
                  style={{ width: '100%', padding: '10px 13px', borderRadius: '9px', border: '2px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = '#c9a84c'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setEditing(null)} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>Annuler</button>
              <button onClick={saveEdit} style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#c9a84c,#f0d080)', color: '#1a4a2e', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>💾 Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
