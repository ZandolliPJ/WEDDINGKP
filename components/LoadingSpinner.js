// components/LoadingSpinner.js
// ─────────────────────────────────────────────────────
// Indicateur de chargement affiché pendant les requêtes
// ─────────────────────────────────────────────────────

export default function LoadingSpinner({ message = 'Chargement...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      {/* Cercle animé */}
      <div
        className="w-12 h-12 rounded-full border-2 border-gold/20 border-t-gold"
        style={{ animation: 'spin 1s linear infinite' }}
      />
      <p className="text-white/50 text-xs tracking-widest uppercase">{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
