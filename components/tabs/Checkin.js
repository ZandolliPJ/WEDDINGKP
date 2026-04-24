'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { TABLES } from '../../lib/data'

export default function Checkin({ guests, onGuestsChange }) {
  const [code,       setCode]      = useState('')
  const [result,     setResult]    = useState(null)
  const [camActive,  setCamActive] = useState(false)
  const [camError,   setCamError]  = useState('')
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const timerRef  = useRef(null)
  const lastScan  = useRef('')

  const present = guests.filter(g=>g.present)
    .sort((a,b)=>(b.arrivalTime||'').localeCompare(a.arrivalTime||''))

  // ── Check-in ──────────────────────────────────────────
  async function doCheckin(guest) {
    if (!guest) return setResult({ ok:false, msg:'Invité non trouvé.' })
    if (guest.present) return setResult({ ok:false, msg:`${guest.name} est déjà enregistré(e) à ${guest.arrivalTime}.` })
    const now = new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
    try {
      const res = await fetch('/api/checkin',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({guestId:guest.id})
      })
      const updated = await res.json()
      onGuestsChange(guests.map(g=>g.id===updated.id?updated:g))
      const tbl = TABLES.find(t=>t.id===updated.tableId)
      setResult({ ok:true, name:updated.name, table:tbl, time:now })
    } catch { setResult({ ok:false, msg:'Erreur serveur.' }) }
    setCode('')
  }

  // ── Décode le contenu scanné ──────────────────────────
  function decode(raw) {
    if (!raw || raw === lastScan.current) return
    lastScan.current = raw
    setTimeout(() => { lastScan.current = '' }, 3000)

    let g = null
    if (raw.startsWith('KP2026|')) {
      g = guests.find(x => x.id === raw.split('|')[1])
    } else if (raw.includes('id=')) {
      const id = raw.split('id=')[1]?.split('&')[0]
      g = guests.find(x => x.id === id)
    } else {
      const q = raw.toUpperCase()
      g = guests.find(x => x.id===q || x.id===raw || x.name.toUpperCase().includes(q))
    }
    doCheckin(g)
  }

  // ── Recherche manuelle ────────────────────────────────
  function search() {
    const raw = code.trim()
    if (!raw) { setResult({ ok:false, msg:'Veuillez saisir un nom ou scanner un QR code.' }); return }
    decode(raw)
  }

  // ── Webcam — démarrer ─────────────────────────────────
  async function startCam() {
    setCamError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width:  { ideal: 1280, min: 640 },
          height: { ideal: 720,  min: 480 },
          frameRate: { ideal: 30 },
        }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCamActive(true)
      scanLoop()
    } catch(e) {
      // Retry avec contraintes minimales
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        streamRef.current = stream
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
        setCamActive(true)
        scanLoop()
      } catch(e2) {
        setCamError(`Caméra indisponible : ${e2.message}`)
      }
    }
  }

  // ── Webcam — arrêter ──────────────────────────────────
  function stopCam() {
    clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach(t=>t.stop())
    streamRef.current = null
    setCamActive(false)
  }

  // ── Boucle de scan ────────────────────────────────────
  function scanLoop() {
    timerRef.current = setInterval(async () => {
      const video  = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2) return

      const vw = video.videoWidth  || 640
      const vh = video.videoHeight || 480
      const ctx = canvas.getContext('2d', { willReadFrequently: true })

      // Scan 1 — image complète
      canvas.width = vw; canvas.height = vh
      ctx.drawImage(video, 0, 0, vw, vh)
      if (await tryScan(ctx, canvas)) return

      // Scan 2 — zoom x2 sur la zone centrale (meilleur pour QR petits)
      canvas.width = vw; canvas.height = vh
      const zx = vw * 0.25, zy = vh * 0.25, zw = vw * 0.5, zh = vh * 0.5
      ctx.drawImage(video, zx, zy, zw, zh, 0, 0, vw, vh)
      await tryScan(ctx, canvas)

    }, 300)
  }

  async function tryScan(ctx, canvas) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // BarcodeDetector natif (Chrome/Edge)
    if ('BarcodeDetector' in window) {
      try {
        const bd    = new window.BarcodeDetector({ formats: ['qr_code'] })
        const codes = await bd.detect(videoRef.current)
        if (codes.length > 0) { decode(codes[0].rawValue); return true }
      } catch(_) {}
    }

    // Fallback jsqr
    try {
      const jsQR = (await import('jsqr')).default
      const qr   = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      })
      if (qr) { decode(qr.data); return true }
    } catch(_) {}

    return false
  }

  useEffect(() => () => stopCam(), [])

  // ═════════════════════════════════════════════════════
  return (
    <div className="p-6 md:p-10 fade-in">
      <h2 className="text-3xl italic playfair mb-1" style={{color:'#f0d080'}}>Check-in Invités</h2>
      <p className="text-xs tracking-widest uppercase mb-8" style={{color:'#4caf7d'}}>
        Enregistrement le jour J — 30 Juin 2026
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Borne de scan ── */}
        <div className="rounded-2xl p-6 text-center"
             style={{background:'linear-gradient(160deg,#1a4a2e,#0d2b1a)',
                     border:'1px solid rgba(201,168,76,0.25)'}}>

          {/* Titre + bouton caméra */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
            <h3 className="italic playfair" style={{color:'#f0d080',fontSize:'1.2rem'}}>
              📷 Borne de scan
            </h3>
            <button onClick={camActive ? stopCam : startCam}
              style={{
                padding:'8px 16px', borderRadius:'10px', border:'none',
                cursor:'pointer', fontSize:'0.72rem', fontWeight:700,
                letterSpacing:'0.1em', textTransform:'uppercase',
                background: camActive
                  ? 'rgba(231,76,60,0.8)'
                  : 'linear-gradient(135deg,#22C55E,#16a34a)',
                color:'white',
                transition:'all 0.2s',
              }}>
              {camActive ? '⏹ Arrêter cam' : '📸 Activer webcam'}
            </button>
          </div>

          {/* Flux vidéo */}
          {camActive && (
            <div style={{position:'relative',marginBottom:'14px',borderRadius:'12px',overflow:'hidden',
                         border:'2px solid rgba(34,197,94,0.6)',boxShadow:'0 0 20px rgba(34,197,94,0.3)'}}>
              <video ref={videoRef} autoPlay playsInline muted
                style={{width:'100%',display:'block',borderRadius:'10px'}}/>
              {/* Viseur */}
              <div style={{
                position:'absolute', top:'50%', left:'50%',
                transform:'translate(-50%,-50%)',
                width:'160px', height:'160px',
                border:'2px solid rgba(34,197,94,0.8)',
                borderRadius:'12px',
                boxShadow:'0 0 0 2000px rgba(0,0,0,0.35)',
                pointerEvents:'none',
              }}>
                {/* Coins */}
                {[
                  {top:0,left:0,borderTop:'3px solid #22C55E',borderLeft:'3px solid #22C55E'},
                  {top:0,right:0,borderTop:'3px solid #22C55E',borderRight:'3px solid #22C55E'},
                  {bottom:0,left:0,borderBottom:'3px solid #22C55E',borderLeft:'3px solid #22C55E'},
                  {bottom:0,right:0,borderBottom:'3px solid #22C55E',borderRight:'3px solid #22C55E'},
                ].map((s,i)=>(
                  <div key={i} style={{position:'absolute',width:'18px',height:'18px',borderRadius:'2px',...s}}/>
                ))}
              </div>
              <div style={{
                position:'absolute',bottom:'8px',left:0,right:0,
                textAlign:'center',color:'rgba(255,255,255,0.85)',
                fontSize:'0.65rem',letterSpacing:'0.15em',textTransform:'uppercase',
                background:'rgba(0,0,0,0.4)',padding:'4px',
              }}>
                📱 Approchez le QR code à 15-20cm · Bien éclairé
              </div>
            </div>
          )}

          {/* Canvas caché pour jsqr */}
          <canvas ref={canvasRef} style={{display:'none'}}/>

          {/* Erreur caméra */}
          {camError && (
            <div style={{
              marginBottom:'12px',padding:'10px',borderRadius:'8px',
              background:'rgba(231,76,60,0.15)',border:'1px solid rgba(231,76,60,0.4)',
              color:'#FCA5A5',fontSize:'0.75rem',
            }}>
              ⚠️ {camError}
            </div>
          )}

          {/* Saisie manuelle */}
          <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
            <input value={code}
                   onChange={e=>{setCode(e.target.value); setResult(null)}}
                   onKeyDown={e=>e.key==='Enter'&&search()}
                   placeholder="Ou saisir nom / ID invité…"
                   style={{
                     flex:1, padding:'12px 16px', borderRadius:'10px',
                     background:'rgba(255,255,255,0.08)',
                     border:'1px solid rgba(201,168,76,0.5)',
                     color:'white', fontSize:'0.9rem', outline:'none',
                   }}
                   onFocus={e=>e.target.style.borderColor='#EAB308'}
                   onBlur={e=>e.target.style.borderColor='rgba(201,168,76,0.5)'}
            />
            <button onClick={search} style={{
              background:'linear-gradient(135deg,#c9a84c,#f0d080)',
              borderRadius:'10px', padding:'12px 20px',
              border:'none', fontWeight:700, fontSize:'1rem',
              cursor:'pointer', color:'#1a4a2e', flexShrink:0,
            }}>✓</button>
          </div>

          {/* Sélection liste */}
          <select onChange={e=>e.target.value&&doCheckin(guests.find(g=>g.id===e.target.value))}
                  className="w-full rounded-lg px-3 py-3 text-sm mb-4 cursor-pointer"
                  style={{background:'#1a4a2e',color:'white',
                          border:'1px solid rgba(201,168,76,0.4)',outline:'none'}}>
            <option value="" style={{background:'#1a4a2e',color:'white'}}>— Sélectionner un invité —</option>
            {guests.filter(g=>!g.present).map(g=>(
              <option key={g.id} value={g.id} style={{background:'#1a4a2e',color:'white'}}>{g.name}</option>
            ))}
          </select>

          {/* Résultat */}
          {result && (
            result.ok ? (
              <div style={{padding:'16px',borderRadius:'12px',
                           background:'rgba(76,175,125,0.15)',
                           border:'1px solid rgba(76,175,125,0.4)'}}>
                <div style={{fontSize:'2.5rem',marginBottom:'6px'}}>🌺</div>
                <div style={{color:'#4caf7d',fontWeight:700,fontSize:'1rem'}}>Bienvenue !</div>
                <div className="italic playfair" style={{color:'white',fontSize:'1.2rem',marginTop:'4px'}}>
                  {result.name}
                </div>
                {result.table && (
                  <div style={{color:'#c9a84c',fontSize:'0.85rem',marginTop:'4px'}}>
                    {result.table.flower} Table {result.table.name}
                  </div>
                )}
                <div style={{color:'rgba(255,255,255,0.45)',fontSize:'0.75rem',marginTop:'4px'}}>
                  Arrivée : {result.time}
                </div>
              </div>
            ) : (
              <div style={{padding:'12px',borderRadius:'10px',
                           background:'rgba(231,76,60,0.15)',
                           border:'1px solid rgba(231,76,60,0.4)',
                           color:'#FCA5A5',fontSize:'0.82rem'}}>
                ⚠️ {result.msg}
              </div>
            )
          )}
        </div>

        {/* ── Stats + Tableau ── */}
        <div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              {n:present.length, l:'Arrivés',  c:'#4caf7d'},
              {n:guests.filter(g=>!g.present&&g.status!=='declined').length, l:'Attendus', c:'#f39c12'},
              {n:guests.filter(g=>g.status==='declined').length, l:'Déclinés', c:'#e74c3c'},
            ].map(s=>(
              <div key={s.l} className="rounded-xl p-4 text-center"
                   style={{background:'linear-gradient(135deg,#1a4a2e,#0d2b1a)',
                           border:'1px solid rgba(201,168,76,0.2)'}}>
                <div className="text-2xl font-bold playfair" style={{color:s.c}}>{s.n}</div>
                <div style={{color:'rgba(255,255,255,0.5)',fontSize:'0.62rem',
                             textTransform:'uppercase',letterSpacing:'0.15em',marginTop:'2px'}}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl overflow-hidden" style={{border:'1px solid rgba(201,168,76,0.15)'}}>
            <div className="px-4 py-2 text-xs tracking-widest uppercase"
                 style={{color:'#c9a84c',background:'rgba(0,0,0,0.2)'}}>
              Présences enregistrées ({present.length})
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{background:'rgba(0,0,0,0.15)'}}>
                  {['Nom','Table','Arrivée'].map(h=>(
                    <th key={h} className="text-left px-3 py-2 text-xs"
                        style={{color:'rgba(255,255,255,0.4)'}}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {present.length===0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 italic"
                        style={{color:'rgba(255,255,255,0.25)'}}>
                      Aucune présence enregistrée
                    </td>
                  </tr>
                ) : present.map(g=>{
                  const tbl = TABLES.find(t=>t.id===g.tableId)
                  return (
                    <tr key={g.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                      <td className="px-3 py-2" style={{color:'white'}}>{g.name}</td>
                      <td className="px-3 py-2 text-xs" style={{color:'rgba(255,255,255,0.6)'}}>
                        {tbl?`${tbl.flower} ${tbl.name}`:'—'}
                      </td>
                      <td className="px-3 py-2 text-xs" style={{color:'#4caf7d'}}>
                        {g.arrivalTime}
                      </td>
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
