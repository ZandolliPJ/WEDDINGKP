// components/Header.js

'use client'

export default function Header({ onLogout }) {
  return (
    <header
      className="sticky top-0 z-50 px-6 md:px-10 py-4
                 flex items-center justify-between
                 border-b-2 border-gold shadow-2xl"
      style={{ background: 'linear-gradient(135deg, #0d2b1a 0%, #1a4a2e 40%, #0d2b1a 100%)' }}
    >
      {/* Logo */}
      <div>
        <h1 className="italic text-2xl md:text-3xl tracking-wide text-gold-light"
            style={{ fontFamily: '"Playfair Display", serif' }}>
          Katty &amp; Pascal
        </h1>
        <p className="text-green-light text-xs tracking-widest uppercase mt-0.5">
          Balade Tropicale — Espace Admin
        </p>
      </div>

      {/* Centre */}
      <div className="hidden md:flex items-center gap-3 text-gold opacity-50 text-sm tracking-widest">
        ✿ ✦ ✿
      </div>

      {/* Droite */}
      <div className="flex items-center gap-3">
        <a href="/bienvenue" target="_blank"
           className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs tracking-widest uppercase border border-gold/40 text-gold-light hover:bg-gold/15 transition-all">
          🌺 Page invités
        </a>
        {onLogout && (
          <button onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs tracking-widest uppercase border border-white/20 text-white/50 hover:border-red-400/50 hover:text-red-400 transition-all">
            🚪 <span className="hidden md:inline">Déconnexion</span>
          </button>
        )}
      </div>
    </header>
  )
}
