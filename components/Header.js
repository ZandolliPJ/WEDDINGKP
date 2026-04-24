// Header.js — Glassmorphism · Tropical · Cohérence architecturale
'use client'

export default function Header({ onLogout }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      padding: 'clamp(10px,2vw,16px) clamp(16px,4vw,40px)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      /* Glassmorphism tropical */
      background: 'rgba(0,0,0,0.25)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(201,168,76,0.3)',
      boxShadow: '0 4px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(234,179,8,0.08)',
    }}>

      {/* Logo */}
      <div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'clamp(1.3rem,3vw,1.8rem)',
          color: 'var(--gold-light)',
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}>
          Katty &amp; Pascal
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.6rem',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: 'var(--green-light)',
          marginTop: '3px',
          opacity: 0.8,
        }}>
          Balade Tropicale — Espace Admin
        </p>
      </div>

      {/* Déco centrale */}
      <div style={{
        color: 'var(--gold)',
        opacity: 0.4,
        fontSize: '0.85rem',
        letterSpacing: '0.6em',
        display: 'none',
      }} className="md:block">
        ✿ ✦ ✿
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <a href="/bienvenue" target="_blank" style={{
          display: 'none',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: '50px',
          fontSize: '0.65rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          border: '1px solid rgba(201,168,76,0.35)',
          color: 'var(--gold-light)',
          textDecoration: 'none',
          background: 'rgba(201,168,76,0.08)',
          transition: 'all 0.2s',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
        }} className="md:flex"
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,168,76,0.08)'}>
          🌺 Page invités
        </a>

        {onLogout && (
          <button onClick={onLogout} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '50px',
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.45)',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; e.currentTarget.style.color = '#EF4444' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}>
            🚪 <span>Déconnexion</span>
          </button>
        )}
      </div>
    </header>
  )
}
