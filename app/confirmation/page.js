'use client'
import { useState, useEffect } from 'react'

const TABLES = {
  1:'Hibiscus',          2:'Frangipanier',    3:'Balisier',         4:'Bouganvillée',
  5:'Lantana',           6:'Alamanda',        7:'Anthurium',        8:'Heliconias',
  9:'Oiseau du Paradis', 10:'Cactus',        11:"Cœur d'Amour",
  12:'Alpinia Rose',     13:'Orchidée',       14:'Pivoine Tropicale', 15:'Rose de Porcelaine',
}
const TABLE_ICONS = {
  1:'🌺', 2:'🌸', 3:'🌷', 4:'💜', 5:'🌼', 6:'🌻', 7:'❤️',
  8:'🦜', 9:'🐦', 10:'🌵', 11:'💛', 12:'🌸', 13:'🌸', 14:'🌷', 15:'🌹',
}

const PAGE_PASSWORD = 'balade2026'

export default function ConfirmationPage() {
  const [step,        setStep]       = useState('search')
  const [query,       setQuery]      = useState('')
  const [results,     setResults]    = useState([])
  const [selected,    setSelected]   = useState(null)
  const [presence,    setPresence]   = useState(null)
  const [phone,       setPhone]      = useState('')
  const [loading,     setLoading]    = useState(false)
  const [error,       setError]      = useState('')
  const [showPwdForm, setShowPwdForm]= useState(false)
  const [pwd,         setPwd]        = useState('')
  const [pwdError,    setPwdError]   = useState('')
  const [showPwd,     setShowPwd]    = useState(false)

  useEffect(() => {
    // Ne pas rediriger automatiquement — l'invité doit toujours voir la page confirmation
  }, [])

  async function search() {
    setError('')
    if (!query.trim())           { setError('Veuillez saisir votre prénom et nom.'); return }
    if (query.trim().length < 3) { setError('Minimum 3 caractères requis.');        return }
    setLoading(true)
    try {
      const res  = await fetch(`/api/confirmation?q=${encodeURIComponent(query.trim())}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (!data.length) { setError("Aucun invité trouvé. Vérifiez l'orthographe."); return }
      setResults(data); setStep('found')
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function confirm() {
    if (!presence) { setError('Veuillez cocher votre réponse.'); return }
    if (!phone.trim()) { setError('Veuillez saisir votre numéro de portable.'); return }
    if (phone.trim().length < 3) { setError('Numéro de portable invalide (minimum 3 caractères).'); return }
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/confirmation', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ guestId:selected.id, presence, guestName:selected.name, phone:phone.trim() }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setStep('done')
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  function checkPassword() {
    setPwdError('')
    if (!pwd.trim()) { setPwdError('Veuillez saisir le mot de passe.'); return }
    if (pwd.trim().toLowerCase() === PAGE_PASSWORD) {
      sessionStorage.setItem('kp_bienvenue_ok', '1')
      window.location.href = '/bienvenue'
    } else {
      setPwdError('Mot de passe incorrect. Réessayez.')
      setPwd('')
    }
  }

  // Bloc mot de passe — réutilisé dans search & done
  const PwdBlock = () => (
    <div className="mt-6 pt-5 border-t border-white/15">
      {!showPwdForm ? (
        <button type="button" onClick={() => setShowPwdForm(true)}
          className="w-full py-3 rounded-xl text-sm tracking-widest uppercase
                     bg-white/10 border border-white/20 text-white/70
                     hover:bg-white/20 hover:border-white/40 hover:text-white
                     transition-all duration-200 cursor-pointer">
          🔑 Accéder à la page du mariage
        </button>
      ) : (
        <div className="fade-up">
          <p className="text-center text-white/55 text-xs tracking-widest uppercase mb-3">
            🔒 Saisissez le mot de passe
          </p>
          <div className="relative mb-2">
            <input
              type={showPwd ? 'text' : 'password'}
              value={pwd}
              onChange={e => { setPwd(e.target.value); setPwdError('') }}
              onKeyDown={e => e.key === 'Enter' && checkPassword()}
              placeholder="Mot de passe…"
              autoFocus
              className={`confirmation-input pr-12 ${pwdError ? 'error' : ''}`}
              style={{letterSpacing: showPwd ? 'normal' : '3px'}}
            />
            <button type="button" onClick={() => setShowPwd(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-white/50 hover:text-white/80 text-lg
                         bg-transparent border-none cursor-pointer transition-colors">
              {showPwd ? '🙈' : '👁️'}
            </button>
          </div>
          {pwdError && (
            <p className="text-red-300 text-xs mb-3 flex items-center gap-1">⚠️ {pwdError}</p>
          )}
          <div className="flex gap-2 mt-3">
            <button type="button"
              onClick={() => { setShowPwdForm(false); setPwd(''); setPwdError('') }}
              className="flex-1 py-3 rounded-xl border border-white/18
                         bg-transparent text-white/40 text-xs tracking-wider
                         hover:text-white/70 hover:border-white/35 transition-all cursor-pointer">
              Annuler
            </button>
            <button type="button" onClick={checkPassword}
              className="btn-password flex-[2] flex items-center justify-center">
              🌺 Accéder au mariage
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-svh flex flex-col items-center justify-center
                    p-4 md:p-8">

      {/* Carte principale — glassmorphism */}
      <div className="glass-card fade-up w-full max-w-lg p-8 md:p-12"
           style={{position:'relative'}}>

        {/* ── Bouton Quitter — retour étape recherche ── */}
        <button
          type="button"
          onClick={() => { setStep('search'); setQuery(''); setResults([]); setSelected(null); setPresence(null); setPhone(''); setError(''); setShowPwdForm(false); setPwd(''); setPwdError('') }}
          title="Recommencer"
          style={{
            position:   'absolute',
            top:        '16px',
            right:      '16px',
            width:      '36px',
            height:     '36px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border:     '1px solid rgba(255,255,255,0.25)',
            color:      'rgba(255,255,255,0.7)',
            fontSize:   '1.1rem',
            cursor:     'pointer',
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            minHeight:  'unset',
            lineHeight: 1,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.35)'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.6)'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
          }}>
          ✕
        </button>

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3 leading-none">🌺</div>
          <h1 className="playfair text-4xl md:text-5xl text-white mb-2"
              style={{textShadow:'0 2px 12px rgba(0,0,0,0.5)'}}>
            Katty &amp; Pascal
          </h1>
          <p className="josefin text-xs tracking-[0.38em] uppercase text-white/60">
            Confirmation de présence · 30 Juin 2026
          </p>
          <div className="mx-auto mt-4 w-14 h-0.5 bg-gradient-to-r
                          from-transparent via-yellow-400 to-transparent"/>
        </div>

        {/* ══ ÉTAPE 1 — Recherche ══ */}
        {step === 'search' && (
          <div className="fade-up">
            {/* Citation */}
            <div className="glass-dark p-5 mb-6 border-l-4 border-yellow-400">
              <p className="playfair italic text-white/90 text-sm leading-relaxed">
                "Nous sommes impatients de vous accueillir pour notre Balade Tropicale.
                Merci de confirmer votre présence en saisissant votre prénom et nom."
              </p>
              <p className="text-yellow-400 text-xs font-bold mt-3 tracking-wider">
                — Katty &amp; Pascal 💕
              </p>
            </div>

            <label className="block text-white/70 text-xs tracking-[0.26em]
                              uppercase mb-2">
              Votre prénom et nom complet *
            </label>
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="ex : Marie Dupont"
              autoComplete="name"
              className={`confirmation-input mb-2 ${error ? 'error' : ''}`}
            />
            {error && (
              <p className="text-red-300 text-xs mb-3 flex items-center gap-1">
                ⚠️ {error}
              </p>
            )}
            <p className="text-white/35 text-xs mb-5">
              Minimum 3 caractères · Votre nom doit figurer sur la liste des invités
            </p>

            <button type="button" onClick={search} disabled={loading}
              className="btn-confirm flex items-center justify-center gap-2
                         disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? '⏳ Recherche…' : '🔍 Rechercher mon nom'}
            </button>

            <PwdBlock />
          </div>
        )}

        {/* ══ ÉTAPE 2 — Résultats ══ */}
        {step === 'found' && (
          <div className="fade-up">
            <p className="text-white/60 text-xs tracking-[0.25em] uppercase mb-4">
              {results.length} invité(s) trouvé(s) — Sélectionnez votre nom :
            </p>
            <div className="flex flex-col gap-3 mb-5">
              {results.map(g => (
                <button key={g.id} type="button"
                  onClick={() => { setSelected(g); setStep('choice'); setPresence(null) }}
                  className="glass-dark p-4 text-left cursor-pointer
                             hover:bg-yellow-400/20 hover:border-yellow-400/60
                             transition-all duration-200 hover:-translate-y-0.5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className="font-bold text-white text-base">{g.name}</span>
                    {g.table_id && (
                      <span className="bg-yellow-400/25 border border-yellow-400/50
                                       rounded-full px-3 py-1 text-yellow-400
                                       text-xs font-semibold tracking-wide">
                        {TABLE_ICONS[g.table_id]} Table {TABLES[g.table_id]}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button type="button"
              onClick={() => { setStep('search'); setResults([]); setError('') }}
              className="text-white/40 text-xs underline bg-transparent
                         border-none cursor-pointer hover:text-white/70 transition-colors">
              ← Nouvelle recherche
            </button>
          </div>
        )}

        {/* ══ ÉTAPE 3 — Choix présence ══ */}
        {step === 'choice' && selected && (
          <div className="fade-up">
            {/* Invité identifié */}
            <div className="rounded-xl p-4 mb-6 border-2
                            bg-yellow-400/15 border-yellow-400/50">
              <p className="text-yellow-400 text-xs tracking-[0.22em] uppercase mb-1">
                ✓ Invité(e) identifié(e)
              </p>
              <p className="playfair italic text-white text-xl font-bold">
                {selected.name}
              </p>
              {selected.table_id && (
                <p className="text-white/60 text-sm mt-1">
                  {TABLE_ICONS[selected.table_id]} Table assignée :{' '}
                  <strong className="text-white">{TABLES[selected.table_id]}</strong>
                </p>
              )}
            </div>

            <p className="playfair italic text-white text-lg leading-relaxed mb-5">
              Serez-vous présent(e) à notre Balade Tropicale le{' '}
              <strong className="text-yellow-400">30 Juin 2026</strong> ?
            </p>

            <div className="flex flex-col gap-3 mb-5">
              {[
                { v:'oui', label:'Oui, je confirme ma présence !', emoji:'✅',
                  active:'bg-green-500/25 border-green-400', inactive:'bg-white/8 border-white/18' },
                { v:'non', label:'Non, je ne pourrai pas venir.',   emoji:'❌',
                  active:'bg-red-500/25 border-red-400',   inactive:'bg-white/8 border-white/18' },
              ].map(opt => (
                <label key={opt.v}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer
                              border-2 transition-all duration-200
                              ${presence === opt.v ? opt.active : opt.inactive}`}>
                  <input type="checkbox" checked={presence === opt.v}
                    onChange={() => { setPresence(opt.v); setError('') }}
                    className="w-5 h-5 cursor-pointer flex-shrink-0"
                    style={{accentColor: opt.v==='oui' ? '#22C55E' : '#EF4444'}}/>
                  <span className="text-white font-medium text-sm">
                    {opt.emoji} {opt.label}
                  </span>
                </label>
              ))}
            </div>

            {error && (
              <p className="text-red-300 text-xs mb-3">⚠️ {error}</p>
            )}

            {/* ── Champ téléphone obligatoire ── */}
            <div className="mb-5">
              <label className="block text-white/70 text-xs tracking-[0.22em]
                                uppercase mb-2">
                📱 Votre numéro de portable *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && confirm()}
                placeholder="ex : +33 6 12 34 56 78"
                autoComplete="tel"
                className={`confirmation-input ${error && !phone.trim() ? 'error' : ''}`}
              />
              <p className="text-white/35 text-xs mt-1">
                Obligatoire · Minimum 3 caractères · Pour vous envoyer nos remerciements
              </p>
            </div>

            <button type="button" onClick={confirm}
              disabled={loading || !presence}
              className={`btn-confirm flex items-center justify-center
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${presence === 'oui'
                            ? '!bg-gradient-to-br !from-green-500 !to-yellow-400'
                            : presence === 'non'
                              ? '!bg-gradient-to-br !from-red-500 !to-orange-500'
                              : '!bg-white/15 !shadow-none'
                          }`}>
              {loading ? '⏳ Enregistrement…' : '💌 Valider ma réponse'}
            </button>

            <button type="button"
              onClick={() => { setStep('found'); setPresence(null) }}
              className="block mx-auto mt-3 text-white/38 text-xs
                         underline bg-transparent border-none cursor-pointer
                         hover:text-white/60 transition-colors">
              ← Retour
            </button>
          </div>
        )}

        {/* ══ ÉTAPE 4 — Résultat ══ */}
        {step === 'done' && (
          <div className="fade-up text-center">
            <div className="text-6xl mb-5 leading-none">
              {presence === 'oui' ? '🎉' : '💌'}
            </div>

            {presence === 'oui' ? (
              <>
                <h2 className="playfair italic text-white text-2xl md:text-3xl mb-3"
                    style={{textShadow:'0 2px 10px rgba(0,0,0,0.4)'}}>
                  Nous serons heureux de votre présence !
                </h2>
                <p className="text-white/80 text-sm leading-relaxed mb-5">
                  Votre présence a été confirmée avec joie. 🌺<br/>
                  Katty &amp; Pascal vous attendent pour une{' '}
                  <strong className="text-yellow-400">Balade Tropicale</strong> inoubliable !
                </p>

                {/* Table */}
                {selected?.table_id && (
                  <div className="glass-dark p-4 mb-4 text-left border-l-4 border-yellow-400">
                    <p className="text-white/50 text-xs tracking-widest uppercase mb-1">
                      Votre table assignée
                    </p>
                    <p className="text-white text-lg font-bold">
                      {TABLE_ICONS[selected.table_id]}&nbsp;
                      <span className="text-yellow-400">{TABLES[selected.table_id]}</span>
                    </p>
                  </div>
                )}

                {/* Programme */}
                <div className="glass-dark p-4 mb-5 text-left">
                  <p className="text-white/45 text-xs tracking-[0.28em] uppercase mb-3">
                    Programme du 30 Juin 2026
                  </p>
                  {[
                    {h:'14h00',e:'⚖️',t:'Cérémonie Civile', l:'Mairie de Grigny',c:'#c9a84c'},
                    {h:'17h30',e:'💍',t:'Cérémonie Laïque', l:'Salle Jasmine',   c:'#e91e8c'},
                    {h:'19h00',e:'🥂',t:"Vin d'Honneur",    l:'Salle Jasmine',   c:'#22C55E'},
                    {h:'19h30',e:'🍽️',t:'Dîner de Gala',   l:'Salle Jasmine',   c:'#F97316'},
                    {h:'21h00',e:'🎶',t:'Soirée Dansante',  l:'Salle Jasmine',   c:'#9b59b6'},
                  ].map((ev,i) => (
                    <div key={i} className={`flex items-center gap-2 py-2
                                            ${i<4?'border-b border-white/8':''}`}>
                      <span className="text-lg flex-shrink-0">{ev.e}</span>
                      <span className="text-xs font-bold w-12 flex-shrink-0"
                            style={{color:ev.c}}>{ev.h}</span>
                      <span className="text-white text-sm font-semibold flex-1">{ev.t}</span>
                      <span className="text-white/35 text-xs flex-shrink-0 hidden sm:block">{ev.l}</span>
                    </div>
                  ))}
                </div>

                <PwdBlock />
              </>
            ) : (
              <>
                <h2 className="playfair italic text-white text-2xl mb-3">
                  Merci de nous avoir informés.
                </h2>
                <p className="text-white/80 text-sm leading-relaxed mb-5">
                  Nous comprenons que vous ne pourrez pas être présent(e).<br/>
                  Katty &amp; Pascal vous remercient chaleureusement. 💕
                </p>
                <div className="glass-dark p-5">
                  <p className="playfair italic text-white/75 text-base leading-relaxed">
                    "L'amour que vous nous portez compte infiniment, même à distance.
                    Vous serez dans nos cœurs en ce jour béni."
                  </p>
                  <p className="text-yellow-400 font-bold text-sm mt-3">
                    — Katty &amp; Pascal
                  </p>
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* Footer */}
      <p className="text-white/30 text-xs tracking-[0.25em] uppercase mt-5 text-center">
        Katty &amp; Pascal · Balade Tropicale · 30 Juin 2026
      </p>
    </div>
  )
}
