'use client'
import { useState, useEffect, useRef } from 'react'
import { WEDDING, TIMELINE, MENU, HOTELS, TABLES } from '../../lib/data'

/* ── helpers ── */
const Section = ({ id, children, bg = 'transparent' }) => (
  <section id={id} style={{ background: bg }}>
    {children}
  </section>
)

const SectionTitle = ({ emoji, title, sub, dark = false }) => (
  <div style={{ textAlign: "center", marginBottom: "clamp(32px,6vw,56px)", padding: "0 16px" }}>
    <div className="text-4xl mb-3">{emoji}</div>
    <h2 style={{ fontFamily: '"Playfair Display",serif', fontStyle: 'italic', fontSize: 'clamp(1.8rem,5vw,2.8rem)', marginBottom: '8px', color: dark ? '#fff' : '#1a4a2e' }}>{title}</h2>
    <p className={`text-xs tracking-widest uppercase ${dark ? 'text-white/50' : 'text-green-mid'}`}>{sub}</p>
    <div className={`mt-4 tracking-widest opacity-30 ${dark ? 'text-gold-light' : 'text-gold'}`}>✿ ✦ ✿</div>
  </div>
)

/* ── Compte à rebours ── */
function Countdown({ dateISO }) {
  const [t, setT] = useState({ j: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    const calc = () => {
      const diff = new Date(dateISO) - new Date()
      if (diff <= 0) return setT({ j: 0, h: 0, m: 0, s: 0 })
      setT({
        j: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [dateISO])
  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginTop: "24px" }}>
      {[{ v: t.j, l: 'Jours' }, { v: t.h, l: 'Heures' }, { v: t.m, l: 'Min' }, { v: t.s, l: 'Sec' }].map(x => (
        <div key={x.l} style={{
          textAlign: "center", padding: "12px 16px", borderRadius: "14px", minWidth: "64px",
          background: "rgba(255,255,255,0.75)",
          border: "1px solid rgba(201,168,76,0.5)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}>
          <div style={{ color: "#1a4a2e", fontSize: "clamp(1.4rem,4vw,1.8rem)", fontWeight: 700, fontFamily: '"Playfair Display",serif', lineHeight: 1 }}>{String(x.v).padStart(2, '0')}</div>
          <div style={{ color: "#c9a84c", fontSize: "0.58rem", letterSpacing: "0.25em", textTransform: "uppercase", marginTop: "4px", fontWeight: 600 }}>{x.l}</div>
        </div>
      ))}
    </div>
  )
}

/* ── NAV ── */
const NAV_LINKS = [
  { id: 'accueil', label: 'Accueil' },
  { id: 'histoire', label: 'Notre Histoire' },
  { id: 'programme', label: 'Programme' },
  { id: 'menu', label: 'Menu' },
  { id: 'acces', label: 'Accès' },
  { id: 'tables', label: 'Tables' },
  { id: 'livredor', label: 'Livre d\'or' },
]
const NAV_CONFIRM = { href: '/confirmation', label: '✅ Confirmation' }

export default function Bienvenue() {
  const [menuOpen, setMenuOpen] = useState(false)




  return (
    <div style={{ fontFamily: '"Josefin Sans",sans-serif', minHeight: '100vh' }}>

      {/* ══ NAV STICKY ══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-10 py-3"
        style={{ background: 'rgba(0,0,0,0.30)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <span className="italic text-gold-light text-lg playfair">Katty &amp; Pascal</span>
        <div className="hidden md:flex gap-1 items-center">
          {NAV_LINKS.map(n => (
            <a key={n.id} href={`#${n.id}`}
              className="px-3 py-1.5 text-xs tracking-widest uppercase text-white/60 hover:text-gold-light transition-colors rounded-full hover:bg-white/8">
              {n.label}
            </a>
          ))}
          {/* Bouton Confirmation — lien externe accentué */}
          <a href={NAV_CONFIRM.href}
            style={{
              marginLeft: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg,#F97316,#EAB308)',
              color: 'white',
              textDecoration: 'none',
              boxShadow: '0 3px 12px rgba(249,115,22,0.4)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(249,115,22,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(249,115,22,0.4)' }}>
            {NAV_CONFIRM.label}
          </a>
        </div>
        <div className="flex gap-2 items-center">

          <button className="md:hidden text-white/60 text-xl ml-1" onClick={() => setMenuOpen(m => !m)}>☰</button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 pt-14"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}>
          <div className="flex flex-col items-center gap-4 pt-8">
            {NAV_LINKS.map(n => (
              <a key={n.id} href={`#${n.id}`} onClick={() => setMenuOpen(false)}
                className="text-white/80 text-lg tracking-widest uppercase">{n.label}</a>
            ))}
            {/* Confirmation — lien externe dans le menu mobile */}
            <a href={NAV_CONFIRM.href} onClick={() => setMenuOpen(false)}
              style={{
                padding: '12px 28px', borderRadius: '14px',
                background: 'linear-gradient(135deg,#F97316,#EAB308)',
                color: 'white', textDecoration: 'none',
                fontSize: '0.85rem', fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                marginTop: '8px', boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
              }}>
              ✅ Confirmation
            </a>
          </div>
        </div>
      )}

      {/* ══ HERO — Image aquarelle tropicale ══ */}
      <div id="accueil" style={{
        position: "relative", minHeight: "100svh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "#f5f0e8",
        isolation: "isolate",
      }}>

        {/* Image aquarelle fond — fleurs haut et bas */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('/hero-tropical.png')",
          backgroundSize: "cover",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "scroll",
        }} />

        {/* Overlay central opaque — masque tout texte résiduel de l'image */}
        <div style={{
          position: "absolute",
          top: "22%", bottom: "18%", left: 0, right: 0,
          background: 'rgba(251,252,247,0.10)',
        }} />

        {/* Overlay global très léger pour homogénéité */}
        <div style={{
          position: "absolute", inset: 0,
          background: 'rgba(251,252,247,0.15)',
          pointerEvents: 'none',
        }} />

        {/* Contenu hero */}
        <div style={{ position: "relative", textAlign: "center", padding: "clamp(16px,4vw,24px)", paddingTop: "clamp(200px,38vw,320px)", zIndex: 3, width: "100%" }}>
          <p style={{ color: '#c9a84c', fontSize: '0.65rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '16px', fontFamily: '"Josefin Sans",sans-serif' }}></p>

          {/* ── Cartes de navigation tropicales — 2 rangées × 3 ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', width: '100%', maxWidth: '480px', margin: '40px auto 0' }}>
            {[

            ].map(item => (
              <a key={item.href} href={item.href}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '14px 8px', borderRadius: '16px', fontWeight: 700,
                  fontSize: '0.72rem', textDecoration: 'none',
                  background: item.bg, color: item.text,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  letterSpacing: '0.03em',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)' }}>
                <span style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", color: "rgba(26,74,46,0.5)", fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", zIndex: 3, animation: "bounce 1.5s ease-in-out infinite" }}>↓ découvrir</div>

        <style>{`
          @keyframes floatLeaf {
            from { transform: translateY(0px) rotate(0deg); }
            to   { transform: translateY(-18px) rotate(8deg); }
          }
        `}</style>
      </div>

      {/* ══ TEXTE D'ACCUEIL ══ */}
      <div style={{ background: 'transparent' }}>
        <div style={{ padding: 'clamp(40px,8vw,64px) clamp(20px,5vw,32px)', textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>

          {/* Ligne déco */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div style={{ height: '1px', width: '40px', background: 'linear-gradient(90deg, transparent, #c9a84c)' }} />
            <span style={{ color: '#c9a84c', fontSize: '0.9rem' }}>🌺</span>
            <div style={{ height: '1px', width: '40px', background: 'linear-gradient(90deg, #c9a84c, transparent)' }} />
          </div>

          {/* Surtitre */}
          <p style={{ color: '#2d7a4f', fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '12px', fontFamily: '"Josefin Sans", sans-serif' }}>
            Chers amis, chère famille
          </p>

          {/* Titre principal */}
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontSize: 'clamp(1.5rem, 5vw, 2rem)', color: '#1a4a2e', marginBottom: '20px', lineHeight: 1.35 }}>
            Bienvenue dans notre parenthèse tropicale !
          </h2>

          {/* Corps du texte */}
          <div style={{ color: '#2d5a3d', fontSize: 'clamp(0.88rem,2.5vw,0.95rem)', lineHeight: 1.8, fontFamily: '"Josefin Sans", sans-serif', fontWeight: 300 }}>
            <p style={{ marginBottom: '16px' }}>
              Nous sommes impatients de vous retrouver pour célébrer notre union sous le signe de l'évasion et de la douceur.
            </p>
            <p style={{ marginBottom: '16px' }}>
              Ce site est votre carnet de voyage pour notre grand jour&nbsp;: vous y trouverez l'itinéraire de notre{' '}
              <em style={{ fontStyle: 'italic', color: '#1a4a2e', fontWeight: 400 }}>"balade tropicale"</em>,
              les escales prévues et toutes les infos pratiques.
            </p>
            <p>
              Préparez vos plus belles tenues légères, nous avons hâte de nous dire{' '}
              <strong style={{ color: '#1a4a2e', fontWeight: 600 }}>"Oui"</strong> sous le soleil avec vous&nbsp;!
            </p>
          </div>

          {/* Séparateur + signature */}
          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#c9a84c', letterSpacing: '0.6em', fontSize: '0.85rem', opacity: 0.7 }}>✿ ✦ ✿</span>
            <p style={{ color: '#2d5a3d', fontSize: '0.85rem', fontStyle: 'italic', fontFamily: '"Playfair Display", serif', marginTop: '8px' }}>
              Avec tout notre amour,
            </p>
            <p style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontSize: '1.5rem', color: '#c9a84c', fontWeight: 700 }}>
              Katty &amp; Pascal
            </p>
          </div>

        </div>
      </div>

      {/* ══ NOTRE HISTOIRE ══ */}
      <Section id="histoire" bg="transparent">
        <div style={{ padding: "clamp(48px,8vw,80px) clamp(16px,5vw,64px)", maxWidth: "960px", margin: "0 auto" }}>
          <SectionTitle emoji="💑" title="Notre Histoire" sub="De la rencontre aux fiançailles" dark />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: "16px", marginBottom: "32px" }}>
            {[
              { year: '2019', icon: '☕', title: 'La rencontre', text: "Un regard, un sourire lors d'un anniversaire. Tout a commencé là, simplement, naturellement." },
              { year: '2024', icon: '🌍', title: 'L\'aventure', text: 'Citoyens du ciel de passage — Nous sommes des voyageurs, des fous rires, une complicité qui grandit chaque jour. Deux âmes en balade.' },
              { year: '2025', icon: '💍', title: 'Les fiançailles', text: "Nos regards se sont croisés, nos chemins se sont mêlés mais le temps a décidé du moment où nos cœurs se sont trouvés, maintenant enlacés nous avons pris la décision de faire un bout de chemin ensemble." },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: "clamp(16px,4vw,24px)", borderRadius: "16px", background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.25)' }}>
                {/* Icône décorative */}
                <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,rgba(201,168,76,0.12),rgba(76,175,125,0.12))' }}>
                  <span style={{ fontSize: '3.5rem', opacity: 0.6 }}>{s.icon}</span>
                </div>
                <div className="text-gold text-xs tracking-widest uppercase mb-1">{s.year}</div>
                <h3 className="text-white italic text-lg playfair mb-2">{s.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center p-8 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <p className="text-white/80 italic text-xl leading-relaxed playfair max-w-2xl mx-auto">
              "Chaque amour a sa propre couleur.<br />Le nôtre est tropical — vif, chaleureux et plein de vie."
            </p>
            <div className="text-gold mt-3 text-xs tracking-widest uppercase">— Katty &amp; Pascal</div>
          </div>
        </div>
      </Section>

      {/* ══ PROGRAMME ══ */}
      <Section id="programme" bg="transparent">
        <div style={{ padding: "clamp(48px,8vw,80px) clamp(16px,5vw,40px)", maxWidth: "720px", margin: "0 auto" }}>
          <SectionTitle emoji="📅" title="Programme du 30 Juin" sub="Horaires & lieux de la journée" />
          <div className="relative">
            {/* Ligne verticale */}
            <div style={{ position: "absolute", left: "28px", top: 0, bottom: 0, width: "2px" }}
              style={{ background: 'linear-gradient(180deg,#c9a84c,#4caf7d,#e91e8c,#f39c12,#9b59b6)' }} />
            <div className="space-y-8">
              {TIMELINE.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  {/* Icône */}
                  <div style={{ position: "relative", zIndex: 10, width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                    style={{ background: `${step.color}25`, border: `2px solid ${step.color}`, minWidth: '4rem' }}>
                    {step.icon}
                  </div>
                  {/* Contenu */}
                  <div style={{ flex: 1, borderRadius: "16px", padding: "clamp(12px,3vw,20px)" }}
                    style={{ background: 'rgba(13,43,26,0.65)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', border: `1px solid ${step.color}40` }}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xl font-bold playfair" style={{ color: step.color }}>{step.heure}</span>
                      <h3 className="text-green-dark italic text-lg playfair">{step.titre}</h3>
                    </div>
                    <p className="text-green-dark/80 text-sm font-medium">{step.lieu}</p>
                    <p className="text-green-dark/50 text-xs mt-1">{step.desc}</p>
                    {step.lieu.includes('Mairie') && (
                      <a href={WEDDING.ceremonieCivile.maps} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-green-mid hover:text-gold transition-colors">
                        📍 Voir sur Google Maps →
                      </a>
                    )}
                    {step.lieu.includes('Jasmine') && (
                      <a href={WEDDING.vinHonneur.maps} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-green-mid hover:text-gold transition-colors">
                        📍 Voir sur Google Maps →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ══ MENU ══ */}
      <Section id="menu" bg="transparent">
        <div style={{ padding: "clamp(48px,8vw,80px) clamp(16px,5vw,48px)", maxWidth: "840px", margin: "0 auto" }}>
          <SectionTitle emoji="🍽️" title="Menu Balade Tropicale" sub="Vin d'honneur — Salle Jasmine — 30 Juin 2026" dark />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "12px" }}>
            {/* Cocktail */}
            <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🥂</span>
                <h3 className="text-gold-light italic text-xl playfair">Cocktail d'accueil</h3>
              </div>
              <ul className="space-y-2">
                {MENU.cocktail.map((m, i) => (
                  <li key={i} className="text-white/80 text-sm flex items-center gap-2">
                    <span className="text-gold text-xs">✦</span>{m}
                  </li>
                ))}
              </ul>
            </div>

            {/* Buffet froid */}
            <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(76,175,125,0.3)' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🥗</span>
                <h3 className="text-green-light italic text-xl playfair">Buffet Froid</h3>
              </div>
              <ul className="space-y-2">
                {MENU.froide.map((m, i) => (
                  <li key={i} className="text-white/80 text-sm flex items-center gap-2">
                    <span className="text-green-light text-xs">✦</span>{m}
                  </li>
                ))}
              </ul>
            </div>

            {/* Buffet chaud */}
            <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(233,30,140,0.3)' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🍲</span>
                <h3 className="text-trop-pink italic text-xl playfair">Buffet Chaud</h3>
              </div>
              <ul className="space-y-2">
                {MENU.chaude.map((m, i) => (
                  <li key={i} className="text-white/80 text-sm flex items-center gap-2">
                    <span className="text-trop-pink text-xs">✦</span>{m}
                  </li>
                ))}
              </ul>
            </div>

            {/* Boissons */}
            <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(243,156,18,0.3)' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🥤</span>
                <h3 className="text-trop-yellow italic text-xl playfair">Boissons Soft</h3>
              </div>
              <ul className="space-y-2">
                {MENU.boissons.map((m, i) => (
                  <li key={i} className="text-white/80 text-sm flex items-center gap-2">
                    <span className="text-trop-yellow text-xs">✦</span>{m}
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-white/40 text-xs italic">* Service sous forme de buffet</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ══ PLAN D'ACCÈS ══ */}
      <Section id="acces" bg="transparent">
        <div style={{ padding: "clamp(48px,8vw,80px) clamp(16px,5vw,64px)", maxWidth: "960px", margin: "0 auto" }}>
          <SectionTitle emoji="🗺️" title="Plan d'Accès" sub="Salle Jasmine · 8 rue des Gaillards · Garges-lès-Gonesse" dark />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,400px),1fr))", gap: "20px" }}>

            {/* Carte / Photo salle */}
            <div>
              <div className="rounded-2xl overflow-hidden mb-4" style={{ border: '1px solid rgba(201,168,76,0.3)' }}>
                {/* Google Maps iframe — méthode sans clé API (place search) */}
                <iframe
                  src="https://maps.google.com/maps?q=8+rue+des+Gaillards+95140+Garges-les-Gonesse&output=embed&z=16"
                  width="100%" height="280"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Salle Jasmine — 8 rue des Gaillards, Garges-lès-Gonesse"
                />
              </div>
              <a href="https://maps.google.com/?q=8+rue+des+Gaillards+95140+Garges-les-Gonesse"
                target="_blank" rel="noreferrer"
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", borderRadius: "14px", background: "linear-gradient(135deg,#c9a84c,#f0d080)", color: "#1a4a2e", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", marginTop: "4px" }}>
                📍 Ouvrir dans Google Maps
              </a>
            </div>

            {/* Infos transport */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <h3 className="text-gold-light italic text-xl playfair mb-4">Comment venir ?</h3>
              {[
                { icon: '🚗', title: 'En voiture', desc: "A1 direction Roissy, sortie Garges-lès-Gonesse. Parking gratuit sur place (200 places)." },
                { icon: '🚇', title: 'RER D', desc: "Station Garges-Sarcelles. Puis 10 min à pied ou taxi depuis la gare." },
                { icon: '🚌', title: 'Bus', desc: "Ligne 250 arrêt Gaillards. Ligne 269 arrêt Mairie de Garges." },
                { icon: '🚕', title: 'Taxi / VTC', desc: "G7, Uber disponibles dans toute la région. Comptez 30 min depuis Paris." },
                { icon: '✈️', title: 'Depuis CDG', desc: "15 minutes en voiture depuis l'aéroport Charles de Gaulle." },
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", gap: "14px", padding: "14px 16px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span className="text-2xl flex-shrink-0">{t.icon}</span>
                  <div>
                    <div className="text-white font-medium text-sm">{t.title}</div>
                    <div className="text-white/50 text-xs mt-0.5 leading-relaxed">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2ème lieu : Mairie */}
          <div style={{ marginTop: "20px", padding: "clamp(16px,4vw,24px)", borderRadius: "16px", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)" }}>
            <div className="flex items-start gap-4">
              <span className="text-3xl">⚖️</span>
              <div>
                <h4 className="text-gold-light italic text-lg playfair">Cérémonie Civile — 14h00</h4>
                <p className="text-white/80 text-sm mt-1">{WEDDING.ceremonieCivile.lieu} — {WEDDING.ceremonieCivile.adresse}</p>
                <a href={WEDDING.ceremonieCivile.maps} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-xs tracking-widest uppercase text-gold hover:text-gold-light transition-colors">
                  📍 Voir sur Maps →
                </a>
              </div>
            </div>
          </div>

          {/* Hôtels */}
          <div className="mt-8">
            <h3 className="text-gold-light italic text-xl playfair mb-4">🏨 Hôtels à proximité</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: "10px" }}>
              {HOTELS.map((h, i) => (
                <a key={i} href={h.maps} target="_blank" rel="noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl transition-all hover:-translate-y-0.5 group"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div>
                    <div className="text-white text-sm group-hover:text-gold-light transition-colors">{h.name}</div>
                    <div className="text-yellow-400 text-xs mt-0.5">{h.stars}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-light text-xs">{h.dist}</div>
                    <div className="text-white/30 text-xs">Maps →</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ══ PLAN DE TABLES ══ */}
      <section id="tables" style={{ background: 'transparent' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: 'clamp(40px,8vw,80px) clamp(16px,4vw,24px)' }}>

          {/* Titre */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>🌸</div>
            <h2 style={{ fontFamily: '"Playfair Display",serif', fontStyle: 'italic', fontSize: 'clamp(1.8rem,4vw,2.6rem)', color: '#f0d080', marginBottom: '8px' }}>
              Plan de Tables
            </h2>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#4caf7d', marginBottom: '16px' }}>
              14 Tables · Fleurs des Antilles · Piste de danse au centre
            </p>
            <div style={{ color: '#c9a84c', letterSpacing: '0.6em', opacity: 0.6 }}>✿ ✦ ✿</div>
          </div>

          {/* ── Photo de la salle & piste de danse ── */}


          {/* Plan SVG de la salle */}
          <SallePlan />

          {/* Légende tables — dynamique avec compteur */}
          <LegendeTables />

          {/* Note bas */}
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', marginTop: '28px', letterSpacing: '0.15em' }}>
            ✦ Le plan nominatif sera affiché à l'entrée de la salle le jour J ✦
          </p>
        </div>
      </section>

      {/* ══ LIVRE D'OR ══ */}
      <LivreOr />

      {/* ══ FOOTER ══ */}
      <footer style={{
        padding: 'clamp(40px,6vw,56px) 20px',
        textAlign: 'center',
        background: '#0d2b1a',
        borderTop: '1px solid rgba(201,168,76,0.2)',
      }}>
        <h3 style={{ fontFamily: '"Playfair Display",serif', fontStyle: 'italic', fontSize: '1.6rem', color: '#f0d080', margin: '0 0 8px', textAlign: 'center' }}>
          Katty &amp; Pascal
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', margin: '0 0 16px', textAlign: 'center' }}>
          Balade Tropicale · 30 Juin 2026 · Salle Jasmine · Garges-lès-Gonesse
        </p>
        <div style={{ color: 'rgba(201,168,76,0.3)', letterSpacing: '0.8em', marginBottom: '24px', textAlign: 'center' }}>✿ ✦ ✿ ✦ ✿</div>

        {/* Compteur — J-x avant le mariage */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '14px' }}>
            ⏳ Compte à rebours — 30 Juin 2026
          </p>
          <Countdown dateISO={WEDDING.dateISO} />
        </div>

        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', margin: 0, textAlign: 'center' }}>Avec tout notre amour 🌺</p>
      </footer>
    </div>
  )
}

/* ── Schéma de salle ── */
// ══════════════════════════════════════════════
// LÉGENDE TABLES — Dynamique avec compteur invités
// ══════════════════════════════════════════════
function LegendeTables() {
  const [guests, setGuests] = useState([])

  useEffect(() => {
    fetch('/api/public-tables')
      .then(r => r.ok ? r.json() : [])
      .then(data => Array.isArray(data) ? setGuests(data) : [])
      .catch(() => { })
  }, [])

  const TABLE_COLORS = {
    1: '#e74c3c', 2: '#e91e8c', 3: '#c0392b', 4: '#9b59b6', 5: '#f39c12',
    6: '#f1c40f', 7: '#e74c3c', 8: '#27ae60', 9: '#16a085', 10: '#2ecc71',
    11: '#c9a84c', 12: '#1abc9c', 13: '#e91e8c', 14: '#e67e22',
  }

  const totalCapacity = TABLES.reduce((s, t) => s + t.capacity, 0)
  const totalPlaced = guests.filter(g => g.tableId).length

  return (
    <div style={{ marginTop: '40px' }}>

      {/* Barre globale */}
      <div style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px 20px', border: '1px solid rgba(201,168,76,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            Remplissage global — {TABLES.length} tables
          </span>
          <span style={{ color: '#f0d080', fontSize: '0.75rem', fontWeight: 700 }}>
            {totalPlaced} / {totalCapacity} places
          </span>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '4px',
            width: totalCapacity ? `${Math.round(totalPlaced / totalCapacity * 100)}%` : '0%',
            background: 'linear-gradient(90deg,#4caf7d,#c9a84c)',
            transition: 'width 0.5s',
          }} />
        </div>
      </div>

      {/* Grille 14 tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '10px' }}>
        {TABLES.map(t => {
          const count = guests.filter(g => g.tableId === t.id).length
          const pct = Math.round(count / t.capacity * 100)
          const isFull = count >= t.capacity
          const col = TABLE_COLORS[t.id] || '#c9a84c'

          return (
            <div key={t.id} style={{
              background: `linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))`,
              border: isFull ? `1px solid ${col}80` : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '14px 10px 10px',
              textAlign: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default',
              position: 'relative',
              overflow: 'hidden',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${col}30` }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {/* Bande couleur en haut */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: col, opacity: 0.7, borderRadius: '14px 14px 0 0' }} />

              {/* Badge COMPLET */}
              {isFull && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', background: col, color: '#fff', fontSize: '0.48rem', fontWeight: 700, padding: '2px 5px', borderRadius: '6px', letterSpacing: '0.1em' }}>
                  COMPLET
                </div>
              )}

              {/* Emoji */}
              <div style={{ fontSize: '1.8rem', marginBottom: '6px', lineHeight: 1 }}>{t.flower}</div>

              {/* Nom */}
              <div style={{ color: '#f0d080', fontSize: '0.72rem', fontWeight: 600, lineHeight: 1.3, marginBottom: '4px' }}>
                {t.name}
              </div>

              {/* Compteur */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginBottom: '7px' }}>
                <span style={{ color: col, fontSize: '0.9rem', fontWeight: 700, fontFamily: '"Playfair Display",serif' }}>{count}</span>
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.68rem' }}>/ {t.capacity}</span>
              </div>

              {/* Barre mini */}
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '3px',
                  width: `${pct}%`,
                  background: isFull ? `linear-gradient(90deg,${col},${col}cc)` : col,
                  transition: 'width 0.5s',
                  opacity: 0.85,
                }} />
              </div>

              {/* Chaises mini */}
              <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', marginTop: '7px', flexWrap: 'wrap' }}>
                {Array.from({ length: t.capacity }).map((_, i) => (
                  <div key={i} style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: i < count ? col : 'rgba(255,255,255,0.1)',
                    border: i < count ? `1px solid ${col}` : '1px solid rgba(255,255,255,0.15)',
                    transition: 'background 0.3s',
                  }} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SallePlan() {
  const [hovered, setHovered] = useState(null)
  const [selected, setSelected] = useState(null)
  const [guests, setGuests] = useState([])

  useEffect(() => {
    fetch('/api/public-tables')
      .then(r => r.ok ? r.json() : [])
      .then(data => Array.isArray(data) ? setGuests(data) : [])
      .catch(() => { })
  }, [])

  const guestsAt = (tableId) => guests.filter(g => g.tableId === tableId)
  const selTable = selected ? TABLES.find(t => t.id === selected) : null
  const selGuests = selected ? guestsAt(selected) : []

  const COLORS = {
    1: '#e74c3c', 2: '#e91e8c', 3: '#e74c3c', 4: '#9b59b6', 5: '#f39c12',
    6: '#f1c40f', 7: '#e74c3c', 8: '#27ae60', 9: '#16a085', 10: '#2ecc71',
    11: '#f39c12', 12: '#27ae60', 13: '#e91e8c', 14: '#f0d080'
  }

  // Positions SVG des 14 tables dans une salle 800×560
  // Piste de danse centrale ~200×160 centrée à (400,280)
  const TABLE_POS = [
    // Haut (rangée 1) — T1 à T5
    { id: 1, x: 100, y: 80 },
    { id: 2, x: 230, y: 80 },
    { id: 3, x: 400, y: 65 },
    { id: 4, x: 570, y: 80 },
    { id: 5, x: 700, y: 80 },
    // Milieu gauche — T6, T7
    { id: 6, x: 90, y: 220 },
    { id: 7, x: 90, y: 340 },
    // Milieu droit — T8, T9
    { id: 8, x: 710, y: 220 },
    { id: 9, x: 710, y: 340 },
    // Bas (rangée 3) — T10 à T13
    { id: 10, x: 100, y: 470 },
    { id: 11, x: 230, y: 480 },
    { id: 12, x: 400, y: 490 },
    { id: 13, x: 570, y: 480 },
    { id: 14, x: 700, y: 470 },
  ]

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '820px', margin: '0 auto' }}>

      {/* ── Popup invités (clic sur une table) ── */}
      {selected && selTable && (
        <div style={{
          position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(160deg,#1a4a2e,#0d2b1a)',
          border: `2px solid ${COLORS[selected] || '#c9a84c'}`,
          borderRadius: '16px', padding: '16px 22px', zIndex: 20,
          minWidth: '260px', maxWidth: '340px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        }}>
          {/* Header popup */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>{selTable.flower}</span>
              <div>
                <div style={{ fontFamily: '"Playfair Display",serif', fontStyle: 'italic', color: '#f0d080', fontSize: '1rem' }}>
                  Table {selTable.name}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.58rem', letterSpacing: '0.2em' }}>
                  {selGuests.length} / {selTable.capacity} places
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
          </div>
          {/* Barre progression */}
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginBottom: '12px' }}>
            <div style={{
              height: '100%', borderRadius: '2px', transition: 'width 0.4s',
              width: `${Math.round(selGuests.length / selTable.capacity * 100)}%`,
              background: `linear-gradient(90deg,${COLORS[selected] || '#c9a84c'},${COLORS[selected] || '#c9a84c'}aa)`
            }} />
          </div>
          {/* Liste invités */}
          {selGuests.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', fontStyle: 'italic', textAlign: 'center', padding: '8px 0' }}>
              Aucun invité assigné pour l'instant
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
              {selGuests.map((g, i) => (
                <div key={g.id} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '5px 8px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <span style={{ fontSize: '0.85rem' }}>
                    {g.group === 'mariee' ? '👰' : g.group === 'marie' ? '🤵' : g.group === 'famille' ? '👨‍👩‍👧' : g.group === 'amis' ? '👫' : g.group === 'collegue' ? '💼' : '🌺'}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', flex: 1 }}>{g.name}</span>
                  {g.present && (
                    <span style={{ fontSize: '0.6rem', color: '#4caf7d', background: 'rgba(76,175,125,0.15)', border: '1px solid rgba(76,175,125,0.3)', borderRadius: '10px', padding: '1px 6px' }}>✓ Présent</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Flèche bas */}
          <div style={{ textAlign: 'center', marginTop: '10px', color: `${COLORS[selected] || '#c9a84c'}`, fontSize: '0.6rem', letterSpacing: '0.2em', opacity: 0.6 }}>
            ▼
          </div>
        </div>
      )}

      {/* Tooltip survol (sans clic) */}
      {hovered && !selected && (() => {
        const hovT = TABLES.find(t => t.id === hovered)
        return hovT ? (
          <div style={{
            position: 'absolute', top: '-42px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.80)', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '10px', padding: '6px 16px', zIndex: 10,
            pointerEvents: 'none', whiteSpace: 'nowrap',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
          }}>
            <span style={{ color: '#f0d080', fontFamily: '"Playfair Display",serif', fontStyle: 'italic', fontSize: '0.9rem' }}>
              {hovT.flower} Table {hovT.name}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem', marginLeft: '8px' }}>
              · {guestsAt(hovT.id).length}/{hovT.capacity} invités · Cliquer pour voir
            </span>
          </div>
        ) : null
      })()}

      <svg
        viewBox="0 0 800 560"
        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '20px', border: '2px solid rgba(201,168,76,0.35)' }}
      >
        {/* Fond salle */}
        <defs>
          <radialGradient id="hallBg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#1e5c35" />
            <stop offset="100%" stopColor="#0a1f12" />
          </radialGradient>
          <radialGradient id="danceGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <pattern id="parquet" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
            <rect width="40" height="40" fill="#c9a84c" opacity="0.04" />
            <rect width="20" height="20" fill="#c9a84c" opacity="0.04" />
          </pattern>
        </defs>

        {/* Salle */}
        <rect x="10" y="10" width="780" height="540" rx="18" fill="url(#hallBg)" stroke="rgba(201,168,76,0.3)" strokeWidth="2" />

        {/* Murs déco */}
        <rect x="10" y="10" width="780" height="540" rx="18" fill="url(#parquet)" />

        {/* Entrée */}
        <rect x="340" y="8" width="120" height="18" rx="4" fill="#0a1f12" stroke="rgba(201,168,76,0.5)" strokeWidth="1.5" />
        <text x="400" y="21" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="Josefin Sans,sans-serif" letterSpacing="3">ENTRÉE</text>

        {/* Scène DJ */}
        <rect x="290" y="532" width="220" height="20" rx="6" fill="#0a1f12" stroke="rgba(201,168,76,0.5)" strokeWidth="1.5" />
        <text x="400" y="546" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="Josefin Sans,sans-serif" letterSpacing="3">🎤 DJ / SCÈNE</text>

        {/* ═══ PISTE DE DANSE CENTRALE ═══ */}
        <rect x="240" y="190" width="320" height="180" rx="16" fill="url(#danceGlow)" />
        <rect x="240" y="190" width="320" height="180" rx="16"
          fill="none" stroke="#c9a84c" strokeWidth="2" strokeDasharray="8 4" opacity="0.6" />
        {/* Carrelage piste */}
        {[0, 1, 2, 3].map(col => [0, 1, 2].map(row => (
          <rect key={`${col}-${row}`}
            x={248 + col * 78} y={198 + row * 58} width="72" height="52" rx="4"
            fill="rgba(201,168,76,0.06)" stroke="rgba(201,168,76,0.12)" strokeWidth="1" />
        )))}
        {/* Notes de musique */}
        <text x="370" y="268" textAnchor="middle" fill="rgba(201,168,76,0.5)" fontSize="28">♪</text>
        <text x="410" y="285" textAnchor="middle" fill="rgba(201,168,76,0.35)" fontSize="20">♫</text>
        <text x="430" y="260" textAnchor="middle" fill="rgba(201,168,76,0.3)" fontSize="16">♩</text>
        <text x="400" y="310" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9"
          fontFamily="Josefin Sans,sans-serif" letterSpacing="4">PISTE DE DANSE</text>

        {/* ═══ TABLES ═══ */}
        {TABLE_POS.map(pos => {
          const t = TABLES.find(x => x.id === pos.id)
          if (!t) return null
          const col = COLORS[pos.id] || '#c9a84c'
          const isHov = hovered === pos.id
          const r = 42 // rayon table

          return (
            <g key={pos.id}
              onMouseEnter={() => setHovered(pos.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(selected === pos.id ? null : pos.id)}
              style={{ cursor: 'pointer', transition: 'transform 0.15s', transform: (isHov || selected === pos.id) ? `translate(${pos.x}px,${pos.y}px) scale(1.1) translate(-${pos.x}px,-${pos.y}px)` : 'none' }}
            >
              {/* Ombre */}
              <circle cx={pos.x} cy={pos.y + 4} r={r} fill="rgba(0,0,0,0.3)" filter="url(#glow)" />
              {/* Nappe — mise en valeur si sélectionnée */}
              {selected === pos.id && <circle cx={pos.x} cy={pos.y} r={r + 8} fill="none" stroke={col} strokeWidth="2" strokeDasharray="5 3" opacity="0.8" />}
              <circle cx={pos.x} cy={pos.y} r={r} fill={selected === pos.id ? `${col}40` : `${col}22`} stroke={col} strokeWidth={selected === pos.id ? 4 : isHov ? 3 : 1.5} opacity={1} />
              {/* Cercle intérieur */}
              <circle cx={pos.x} cy={pos.y} r={r - 10} fill={`${col}18`} stroke={`${col}`} strokeWidth="0.8" opacity="0.5" />
              {/* Chaises autour — 8 par table */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                const rad = (angle * Math.PI) / 180
                const cx2 = pos.x + (r + 10) * Math.cos(rad)
                const cy2 = pos.y + (r + 10) * Math.sin(rad)
                return <circle key={i} cx={cx2} cy={cy2} r="5" fill={`${col}60`} stroke={col} strokeWidth="1" />
              })}
              {/* Emoji fleur */}
              <text x={pos.x} y={pos.y - 8} textAnchor="middle" fontSize="16" dominantBaseline="middle">{t.flower}</text>
              {/* Nom — étiquettes optimisées pour le SVG */}
              {(() => {
                // Étiquettes fixes optimisées pour chaque table (max ~10 px de large)
                const LABELS = {
                  1: ['Hibiscus', null],
                  2: ['Frangipa-', 'nier'],
                  3: ['Balisier', null],
                  4: ['Bougan-', 'villée'],
                  5: ['Lantana', null],
                  6: ['Alamanda', null],
                  7: ['Anthurium', null],
                  8: ['Heliconias', null],
                  9: ['Oiseau du', 'Paradis'],
                  10: ['Cactus', null],
                  11: ["Cœur", "d'Amour"],
                  12: ['Palmier &', 'Bambou'],
                  13: ['Orchidée', null],
                  14: ['Pivoine', 'Tropicale'],
                }
                const [l1, l2] = LABELS[t.id] || [t.name, null]
                if (!l2) {
                  return (
                    <text x={pos.x} y={pos.y + 13} textAnchor="middle" fill="white" fontSize="8"
                      fontFamily="Josefin Sans,sans-serif" letterSpacing="0.3" opacity="0.92">
                      {l1}
                    </text>
                  )
                }
                return (
                  <text textAnchor="middle" fill="white" fontSize="7.5"
                    fontFamily="Josefin Sans,sans-serif" letterSpacing="0.2" opacity="0.92">
                    <tspan x={pos.x} y={pos.y + 7}>{l1}</tspan>
                    <tspan x={pos.x} dy="11">{l2}</tspan>
                  </text>
                )
              })()}
            </g>
          )
        })}

        {/* Coins décoratifs floraux */}
        <text x="35" y="55" fontSize="22" opacity="0.3">🌺</text>
        <text x="740" y="55" fontSize="22" opacity="0.3">🌸</text>
        <text x="35" y="525" fontSize="22" opacity="0.3">🌿</text>
        <text x="740" y="525" fontSize="22" opacity="0.3">🌻</text>

        {/* Légende capacité */}
        <rect x="22" y="490" width="130" height="30" rx="6" fill="rgba(0,0,0,0.3)" />
        <circle cx="38" cy="505" r="6" fill="rgba(201,168,76,0.3)" stroke="#c9a84c" strokeWidth="1" />
        <circle cx="38" cy="505" r="3" fill="rgba(201,168,76,0.5)" />
        <text x="50" y="509" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Josefin Sans,sans-serif" letterSpacing="1">Table ronde · 8 pl. max</text>
      </svg>
    </div>
  )
}

// ══════════════════════════════════════════════════
// LIVRE D'OR — Section complète avec formulaire
// ══════════════════════════════════════════════════
function LivreOr() {
  const [nom, setNom] = useState('')
  const [msg, setMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [preview, setPreview] = useState(false)
  const [errors, setErrors] = useState({})
  const [messages, setMessages] = useState([])
  const [loadingMsgs, setLoadingMsgs] = useState(true)
  const [apiError, setApiError] = useState(null)

  // ── Charger depuis Supabase au montage ────────────
  useEffect(() => {
    fetch('/api/livredor')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data)
        else setApiError('Impossible de charger les messages.')
      })
      .catch(() => setApiError('Connexion impossible.'))
      .finally(() => setLoadingMsgs(false))
  }, [])

  // ── Validation ────────────────────────────────────
  function validate() {
    const e = {}
    if (!nom.trim()) {
      e.nom = 'Votre prénom / nom est requis.'
    } else if (nom.trim().length < 3) {
      e.nom = 'Minimum 3 caractères alphanumériques requis.'
    }
    if (!msg.trim()) {
      e.msg = 'Votre message est requis.'
    } else if (msg.trim().length < 3) {
      e.msg = 'Minimum 3 caractères alphanumériques requis.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handlePreview(e) {
    e.preventDefault()
    if (validate()) setPreview(true)
  }

  async function confirmSend() {
    setSending(true)
    try {
      const res = await fetch('/api/livredor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auteur: nom.trim(), message: msg.trim() }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setMessages(prev => [data, ...prev])
      setSent(true)
      setPreview(false)
    } catch (e) {
      setErrors({ submit: e.message })
      setPreview(false)
    } finally { setSending(false) }
  }

  function reset() {
    setNom(''); setMsg(''); setSent(false); setPreview(false); setErrors({})
  }

  return (
    <section id="livredor" style={{ background: 'transparent' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '80px 24px' }}>

        {/* Titre */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📖</div>
          <h2 style={{ fontFamily: '"Playfair Display",serif', fontStyle: 'italic', fontSize: 'clamp(1.8rem,4vw,2.6rem)', color: '#1a4a2e', marginBottom: '8px' }}>
            Livre d'or
          </h2>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#4caf7d', marginBottom: '16px' }}>
            Laissez-nous un message d'amour
          </p>
          <div className="max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.9)', fontFamily: '"Playfair Display",serif', fontStyle: 'italic', fontSize: '0.95rem', lineHeight: 1.7, padding: '20px', background: 'rgba(13,43,26,0.55)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: '16px', border: '1px solid rgba(201,168,76,0.3)' }}>
            "Nous vous invitons à nous transmettre tout votre amour et votre bonne humeur en signant notre livre d'or,
            alors n'hésitez pas à nous laisser un message ! Mille fois merci de nous mettre du baume au cœur."
            <div style={{ marginTop: '8px', color: 'var(--gold-light)', fontWeight: 700 }}>— Pascal &amp; Katty 💕</div>
          </div>
        </div>

        {/* Formulaire */}
        <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '20px', padding: '32px', marginBottom: '40px', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', border: '1px solid rgba(201,168,76,0.25)' }}>
          {sent ? (
            /* ── Confirmation ── */
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '14px' }}>💚</div>
              <h3 style={{ fontFamily: '"Playfair Display",serif', fontStyle: 'italic', fontSize: '1.35rem', color: '#1a4a2e', marginBottom: '8px' }}>
                Merci pour votre message !
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.65, marginBottom: '24px' }}>
                Votre message a été enregistré dans notre livre d'or pour toujours. 🌺<br />
                Katty &amp; Pascal vous remercient du fond du cœur.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={reset}
                  style={{ padding: '11px 20px', borderRadius: '12px', border: '2px solid #e5e7eb', background: 'white', color: '#6b7280', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
                  ✍️ Autre message
                </button>
                <a href="#accueil"
                  style={{ padding: '11px 20px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#1a4a2e,#2d7a4f)', color: 'white', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  🌺 Retour au début
                </a>
              </div>
            </div>
          ) : (
            /* ── Formulaire de saisie + envoi direct ── */
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#4caf7d', marginBottom: '20px' }}>
                ✍️ Votre message
              </p>

              {/* Nom */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '6px' }}>
                  Votre prénom / nom *
                </label>
                <input
                  value={nom}
                  onChange={e => { setNom(e.target.value); setErrors(p => ({ ...p, nom: null })) }}
                  placeholder="Marie Dupont"
                  autoComplete="off"
                  style={{ width: '100%', border: `2px solid ${errors.nom ? '#e74c3c' : '#e5e7eb'}`, borderRadius: '12px', padding: '12px 16px', fontSize: '0.9rem', color: '#1a4a2e', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#c9a84c'}
                  onBlur={e => e.target.style.borderColor = errors.nom ? '#e74c3c' : '#e5e7eb'}
                />
                {errors.nom
                  ? <p style={{ color: '#e74c3c', fontSize: '0.7rem', marginTop: '3px' }}>⚠️ {errors.nom}</p>
                  : <p style={{ color: '#9ca3af', fontSize: '0.65rem', marginTop: '3px' }}>Minimum 3 caractères</p>
                }
              </div>

              {/* Message */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '6px' }}>
                  Votre message 💌 *
                </label>
                <textarea
                  value={msg}
                  onChange={e => { setMsg(e.target.value); setErrors(p => ({ ...p, msg: null })) }}
                  rows={4}
                  placeholder="Félicitations à Pascal et Katty ! Que votre amour soit aussi chaud que le soleil des Antilles…"
                  style={{ width: '100%', border: `2px solid ${errors.msg ? '#e74c3c' : '#e5e7eb'}`, borderRadius: '12px', padding: '12px 16px', fontSize: '0.9rem', color: '#1a4a2e', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = '#c9a84c'}
                  onBlur={e => e.target.style.borderColor = errors.msg ? '#e74c3c' : '#e5e7eb'}
                />
                {errors.msg
                  ? <p style={{ color: '#e74c3c', fontSize: '0.7rem', marginTop: '3px' }}>⚠️ {errors.msg}</p>
                  : <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                    <p style={{ color: '#9ca3af', fontSize: '0.65rem' }}>Minimum 3 caractères · Relisez avant d'envoyer</p>
                    <p style={{ color: msg.length > 10 ? '#4caf7d' : '#9ca3af', fontSize: '0.65rem' }}>{msg.length} car.</p>
                  </div>
                }
              </div>

              {errors.submit && <p style={{ color: '#e74c3c', fontSize: '0.75rem', marginBottom: '12px' }}>❌ {errors.submit}</p>}

              {/* Bouton signer */}
              <button
                type="button"
                disabled={sending}
                onClick={async () => {
                  const e = {}
                  if (!nom.trim() || nom.trim().length < 3) e.nom = 'Minimum 3 caractères requis.'
                  if (!msg.trim() || msg.trim().length < 3) e.msg = 'Minimum 3 caractères requis.'
                  if (Object.keys(e).length > 0) { setErrors(e); return }
                  setSending(true)
                  try {
                    const res = await fetch('/api/livredor', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ auteur: nom.trim(), message: msg.trim() }),
                    })
                    const data = await res.json()
                    if (data.error) throw new Error(data.error)
                    setMessages(prev => [data, ...prev])
                    setSent(true)
                  } catch (err) {
                    setErrors({ submit: err.message })
                  } finally { setSending(false) }
                }}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: sending ? 'rgba(26,74,46,0.5)' : 'linear-gradient(135deg,#1a4a2e,#2d7a4f)', color: 'white', fontFamily: '"Josefin Sans",sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: sending ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                {sending ? '⏳ Envoi en cours…' : '💌 Signer le livre d\'or'}
              </button>
            </div>
          )}
        </div>

        {/* Messages depuis Supabase */}
        <div>
          {loadingMsgs ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', padding: '20px' }}>⏳ Chargement des messages…</p>
          ) : apiError ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', fontStyle: 'italic', padding: '20px' }}>
              🌺 Les messages apparaîtront ici après la cérémonie.
            </p>
          ) : (
            <>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#4caf7d', marginBottom: '20px', textAlign: 'center' }}>
                {messages.length} message{messages.length > 1 ? 's' : ''} d'amour 💚
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {messages.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.82rem', fontStyle: 'italic', padding: '24px' }}>
                    Soyez le premier à signer notre livre d'or ! 🌺
                  </p>
                ) : messages.map(m => (
                  <div key={m.id} style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '16px', padding: '18px 22px', border: '1px solid rgba(76,175,125,0.25)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '10px', right: '14px', fontSize: '1.3rem', opacity: 0.12 }}>🌺</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#1a4a2e,#2d7a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.9rem', fontWeight: 700, flexShrink: 0 }}>
                          {m.auteur?.[0]?.toUpperCase() || '🌺'}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a4a2e' }}>{m.auteur}</span>
                      </div>
                      <span style={{ fontSize: '0.68rem', color: '#9ca3af', flexShrink: 0, marginLeft: '8px' }}>
                        {new Date(m.created_at || m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <p style={{ color: '#374151', fontSize: '0.88rem', lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>"{m.message}"</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
