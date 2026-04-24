/** @type {import('tailwindcss').Config} */
// ═══════════════════════════════════════════════════════
// Tailwind Config — Palette Tropicale Officielle
// Katty & Pascal · Balade Tropicale 2026
// Cohérence architecturale : même palette partout
// ═══════════════════════════════════════════════════════
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Verts — Nature & Lieux ──
        'green-dark':    '#1a4a2e',
        'green-mid':     '#2d7a4f',
        'green-light':   '#22C55E',   // ← Tropical vert
        'green-emerald': '#0d2b1a',

        // ── Or — Luxe & Décoration ──
        'gold':          '#c9a84c',
        'gold-light':    '#f0d080',

        // ── Jaune — Soleil & Titres tables ──
        'yellow-trop':   '#EAB308',   // ← Soleil tropical

        // ── Orange — Action & Cocktails ──
        'orange-trop':   '#F97316',   // ← Couleur d'action principale

        // ── Rouge — Passion & Hover ──
        'red-trop':      '#EF4444',   // ← Hover dynamique

        // ── Neutres ──
        'white-trop':    '#fafcf8',
        'cream':         '#f5f0e8',
      },

      fontFamily: {
        // Polices de projet — toujours les mêmes
        playfair:  ['"Playfair Display"', 'serif'],
        josefin:   ['"Josefin Sans"',     'sans-serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
      },

      backgroundImage: {
        // Tropical Mesh — applicable avec bg-tropical-mesh
        'tropical-mesh': `
          radial-gradient(ellipse 80% 60% at 10% 20%,  rgba(34,197,94,0.18)  0%, transparent 60%),
          radial-gradient(ellipse 60% 70% at 90% 10%,  rgba(234,179,8,0.12)  0%, transparent 55%),
          radial-gradient(ellipse 50% 80% at 80% 80%,  rgba(249,115,22,0.10) 0%, transparent 50%),
          radial-gradient(ellipse 70% 50% at 20% 80%,  rgba(239,68,68,0.08)  0%, transparent 55%),
          radial-gradient(ellipse 90% 40% at 50% 50%,  rgba(26,74,46,0.95)   0%, transparent 80%)
        `,
      },

      backdropBlur: {
        xs:  '4px',
        sm:  '8px',
        md:  '16px',
        lg:  '20px',
        xl:  '28px',
      },

      boxShadow: {
        'glass':  '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.10)',
        'gold':   '0 4px 24px rgba(201,168,76,0.3)',
        'deep':   '0 20px 60px rgba(0,0,0,0.5)',
        'orange': '0 4px 20px rgba(249,115,22,0.35)',
      },

      animation: {
        'fade-in':      'fadeIn 0.4s ease-out',
        'fade-in-up':   'fadeInUp 0.5s ease-out',
        'float':        'float 3s ease-in-out infinite',
        'pulse-gold':   'pulseGold 2s infinite',
        'slide-in':     'slideIn 0.25s ease-out',
        'tropical':     'tropicalPulse 3s ease-in-out infinite',
      },

      keyframes: {
        fadeIn:    { from:{ opacity:0, transform:'translateY(14px)' }, to:{ opacity:1, transform:'none' } },
        fadeInUp:  { from:{ opacity:0, transform:'translateY(24px)' }, to:{ opacity:1, transform:'translateY(0)' } },
        float:     { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-8px)' } },
        pulseGold: { '0%,100%':{ boxShadow:'0 0 0 0 rgba(201,168,76,0.4)' }, '50%':{ boxShadow:'0 0 0 10px rgba(201,168,76,0)' } },
        slideIn:   { from:{ transform:'translateX(20px)', opacity:0 }, to:{ transform:'translateX(0)', opacity:1 } },
        tropicalPulse: { '0%,100%':{ opacity:0.7 }, '50%':{ opacity:1 } },
      },
    },
  },
  plugins: [],
}
