// components/StatCard.js
// ─────────────────────────────────────────────────────
// Carte de statistique pour le Dashboard
// Affiche un grand chiffre + label + barre de progression
// ─────────────────────────────────────────────────────

export default function StatCard({ number, label, progress, icon }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-6 text-center border border-gold/40 gold-bar"
      style={{ background: 'linear-gradient(135deg, #1a4a2e, #0d2b1a)' }}
    >
      {/* Icône optionnelle */}
      {icon && <div className="text-2xl mb-1">{icon}</div>}

      {/* Chiffre principal */}
      <span
        className="block text-4xl text-gold-light"
        style={{ fontFamily: '"Playfair Display", serif' }}
      >
        {number}
      </span>

      {/* Label */}
      <div className="text-white/60 text-xs tracking-widest uppercase mt-1">
        {label}
      </div>

      {/* Barre de progression (facultative) */}
      {progress !== undefined && (
        <div className="bg-white/10 rounded-full h-1.5 overflow-hidden mt-3">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(progress, 100)}%`,
              background: 'linear-gradient(90deg, #4caf7d, #c9a84c)'
            }}
          />
        </div>
      )}
    </div>
  )
}
