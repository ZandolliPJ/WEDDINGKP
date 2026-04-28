// app/admin/login/page.js
// ─────────────────────────────────────────────────
// Page de connexion admin — Design tropical luxe
// ─────────────────────────────────────────────────

'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Composant interne qui utilise useSearchParams — doit être dans <Suspense>
function LoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [blocked, setBlocked] = useState(false)
  const [blockTime, setBlockTime] = useState(0)
  const [showPwd, setShowPwd] = useState(false)
  const inputRef = useRef(null)
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    // Vérifier si déjà connecté
    fetch('/api/auth').then(r => r.json()).then(d => {
      if (d.authenticated) router.replace('/admin')
    })
    inputRef.current?.focus()
  }, [])

  // Compte à rebours blocage
  useEffect(() => {
    if (blockTime <= 0) return
    const t = setTimeout(() => {
      setBlockTime(b => b - 1)
      if (blockTime === 1) setBlocked(false)
    }, 1000)
    return () => clearTimeout(t)
  }, [blockTime])

  async function handleSubmit(e) {
    e.preventDefault()
    if (blocked || loading || !password) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()

      if (data.success) {
        // Succès — redirection
        const redirect = params.get('redirect') || '/admin'
        router.push(redirect)
        router.refresh()
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        setPassword('')

        if (newAttempts >= 5) {
          setBlocked(true)
          setBlockTime(30)
          setError('Trop de tentatives. Attendez 30 secondes.')
        } else {
          setError(`Mot de passe incorrect. (${newAttempts}/5 tentatives)`)
        }
      }
    } catch {
      setError('Erreur de connexion. Réessayez.')
    } finally {
      setLoading(false)
      if (!blocked) inputRef.current?.focus()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ fontFamily: 'var(--font-body)' }}>

      {/* Tropical Mesh Overlay — renforce le fond du body */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 60% 50% at 15% 25%, rgba(34,197,94,0.12)  0%, transparent 55%),
          radial-gradient(ellipse 50% 60% at 85% 15%, rgba(234,179,8,0.08)  0%, transparent 50%),
          radial-gradient(ellipse 40% 70% at 75% 75%, rgba(249,115,22,0.07) 0%, transparent 45%),
          radial-gradient(ellipse 60% 40% at 25% 75%, rgba(239,68,68,0.06)  0%, transparent 50%),
          rgba(13,43,26,0.85)
        `,
      }} />

      {/* Particules décoratives */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['🌺', '🌸', '🌿', '✦', '🌺', '🌸', '✿', '🌷'].map((f, i) => (
          <span key={i} className="absolute text-lg opacity-10"
            style={{
              left: `${10 + i * 12}%`,
              top: `${5 + (i % 3) * 30}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.3}s`,
            }}>
            {f}
          </span>
        ))}
      </div>

      {/* Carte de connexion */}
      <div className="relative z-10 w-full max-w-md mx-4">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3 drop-shadow-2xl">🌺</div>
          <h1 className="italic text-4xl text-white mb-1 drop-shadow-lg"
            style={{ fontFamily: '"Playfair Display", serif' }}>
            Katty &amp; Pascal
          </h1>
          <p className="text-green-light text-xs tracking-widest uppercase">
            Balade Tropicale — Espace Admin
          </p>
        </div>

        {/* Formulaire */}
        <div className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: 'linear-gradient(160deg, rgba(26,74,46,0.95), rgba(13,43,26,0.98))',
            border: '1px solid rgba(201,168,76,0.4)',
            backdropFilter: 'blur(20px)',
          }}>

          <div className="text-center mb-6">
            <h2 className="text-gold-light italic text-xl mb-1"
              style={{ fontFamily: '"Playfair Display", serif' }}>
              Espace Administrateur
            </h2>
            <p className="text-white/40 text-xs tracking-widest uppercase">
              Accès réservé aux organisateurs
            </p>
          </div>

          {/* Séparateur */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gold/20" />
            <span className="text-gold/40 text-xs">🔐</span>
            <div className="flex-1 h-px bg-gold/20" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="text-xs tracking-widest uppercase text-green-light block mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={blocked || loading}
                  className="w-full pr-12 pl-4 py-3.5 rounded-xl text-white text-sm focus:outline-none transition-all disabled:opacity-40"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${error ? '#e74c3c60' : 'rgba(201,168,76,0.3)'}`,
                    fontFamily: showPwd ? '"Josefin Sans", sans-serif' : 'monospace',
                    letterSpacing: showPwd ? 'normal' : '4px',
                  }}
                  onFocus={e => e.target.style.borderColor = '#c9a84c'}
                  onBlur={e => e.target.style.borderColor = error ? '#e74c3c60' : 'rgba(201,168,76,0.3)'}
                />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-lg p-1">
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="mb-4 p-3 rounded-lg text-xs text-red-400 flex items-center gap-2"
                style={{ background: 'rgba(231,76,60,0.12)', border: '1px solid rgba(231,76,60,0.3)' }}>
                <span>⚠️</span>
                <span>{error}</span>
                {blocked && (
                  <span className="ml-auto font-bold text-red-300">{blockTime}s</span>
                )}
              </div>
            )}

            {/* Bouton */}
            <button type="submit"
              disabled={blocked || loading || !password}
              className="w-full py-4 rounded-xl text-sm tracking-widest uppercase font-bold text-green-dark transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #f0d080)' }}>
              {loading ? '⏳ Vérification...' :
                blocked ? `🔒 Bloqué (${blockTime}s)` :
                  '🌺 Accéder au Planner'}
            </button>
          </form>

          {/* Lien vers page invités */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-white/30 text-xs mb-2">Vous êtes un(e) invité(e) ?</p>
            <a href="/bienvenue"
              className="text-green-light text-xs tracking-widest uppercase hover:text-gold-light transition-colors">
              → Accéder à la page invités
            </a>
          </div>
        </div>

        {/* Sécurité info */}
        <p className="text-center text-white/20 text-xs mt-4">
          🔒 Connexion sécurisée · Espace Admin · Balade Tropicale
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          from { transform: translateY(0px) rotate(0deg); }
          to   { transform: translateY(-15px) rotate(5deg); }
        }
      `}</style>
    </div>
  )
}

// Page par défaut — enveloppe LoginForm dans Suspense (requis par Next.js 14)
export default function AdminLogin() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0d2b1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#c9a84c', fontFamily: 'serif', fontSize: '1.2rem', fontStyle: 'italic' }}>
          🌺 Chargement...
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
