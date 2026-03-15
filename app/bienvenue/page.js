'use client'
import { useState, useEffect, useRef } from 'react'
import { WEDDING, TIMELINE, MENU, HOTELS, TABLES } from '../../lib/data'

/* ── helpers ── */
const Section = ({ id, children, bg='#fafcf8' }) => (
  <section id={id} style={{ background: bg }}>
    {children}
  </section>
)

const SectionTitle = ({ emoji, title, sub, dark=false }) => (
  <div className="text-center mb-12 px-4">
    <div className="text-4xl mb-3">{emoji}</div>
    <h2 className={`text-4xl italic mb-2 playfair ${dark?'text-white':'text-green-dark'}`}>{title}</h2>
    <p className={`text-xs tracking-widest uppercase ${dark?'text-white/50':'text-green-mid'}`}>{sub}</p>
    <div className={`mt-4 tracking-widest opacity-30 ${dark?'text-gold-light':'text-gold'}`}>✿ ✦ ✿</div>
  </div>
)

/* ── Compte à rebours ── */
function Countdown({ dateISO }) {
  const [t, setT] = useState({ j:0,h:0,m:0,s:0 })
  useEffect(() => {
    const calc = () => {
      const diff = new Date(dateISO) - new Date()
      if (diff<=0) return setT({j:0,h:0,m:0,s:0})
      setT({
        j: Math.floor(diff/86400000),
        h: Math.floor((diff%86400000)/3600000),
        m: Math.floor((diff%3600000)/60000),
        s: Math.floor((diff%60000)/1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [dateISO])
  return (
    <div className="flex gap-3 justify-center flex-wrap mt-8">
      {[{v:t.j,l:'Jours'},{v:t.h,l:'Heures'},{v:t.m,l:'Min'},{v:t.s,l:'Sec'}].map(x=>(
        <div key={x.l} className="text-center px-4 py-3 rounded-xl min-w-[68px]"
             style={{background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.25)',backdropFilter:'blur(8px)'}}>
          <div className="text-white text-2xl font-bold playfair">{String(x.v).padStart(2,'0')}</div>
          <div className="text-white/60 text-xs tracking-widest uppercase mt-0.5">{x.l}</div>
        </div>
      ))}
    </div>
  )
}

/* ── NAV ── */
const NAV_LINKS = [
  { id:'accueil',   label:'Accueil'    },
  { id:'histoire',  label:'Notre Histoire' },
  { id:'programme', label:'Programme'  },
  { id:'menu',      label:'Menu'       },
  { id:'dresscode', label:'Dress Code' },
  { id:'acces',     label:'Accès'      },
  { id:'tables',    label:'Tables'     },
  { id:'rsvp',      label:'RSVP'       },
]

export default function Bienvenue() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [rsvp, setRsvp] = useState({ nom:'',prenom:'',telephone:'',presence:'oui',personnes:'1',menu:'standard',message:'' })
  const [rsvpSent, setRsvpSent] = useState(false)
  const [rsvpLoad, setRsvpLoad] = useState(false)
  const setR = (k,v) => setRsvp(r=>({...r,[k]:v}))

  async function submitRsvp(e) {
    e.preventDefault()
    if (!rsvp.nom || !rsvp.prenom) { alert('Merci de renseigner votre nom et prénom.'); return }
    setRsvpLoad(true)
    try {
      await fetch('/api/rsvp', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(rsvp),
      })
    } catch(e) {}
    await new Promise(r=>setTimeout(r,900))
    setRsvpSent(true)
    setRsvpLoad(false)
  }

  const IC = "w-full bg-white border border-green-mid/25 rounded-xl px-4 py-3 text-green-dark text-sm focus:outline-none focus:border-gold transition-all"
  const SC = "w-full bg-white border border-green-mid/25 rounded-xl px-4 py-3 text-green-dark text-sm focus:outline-none focus:border-gold"

  return (
    <div style={{fontFamily:'"Josefin Sans",sans-serif', minHeight:'100vh'}}>

      {/* ══ NAV STICKY ══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-10 py-3"
           style={{background:'rgba(13,43,26,0.96)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(201,168,76,0.3)'}}>
        <span className="italic text-gold-light text-lg playfair">Katty &amp; Pascal</span>
        <div className="hidden md:flex gap-1">
          {NAV_LINKS.map(n=>(
            <a key={n.id} href={`#${n.id}`}
               className="px-3 py-1.5 text-xs tracking-widest uppercase text-white/60 hover:text-gold-light transition-colors rounded-full hover:bg-white/8">
              {n.label}
            </a>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <a href="#rsvp"
             className="px-4 py-1.5 text-xs tracking-widest uppercase font-bold text-green-dark rounded-full"
             style={{background:'linear-gradient(135deg,#c9a84c,#f0d080)'}}>
            ✉️ RSVP
          </a>
          <button className="md:hidden text-white/60 text-xl ml-1" onClick={()=>setMenuOpen(m=>!m)}>☰</button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 pt-14"
             style={{background:'rgba(13,43,26,0.98)'}}>
          <div className="flex flex-col items-center gap-4 pt-8">
            {NAV_LINKS.map(n=>(
              <a key={n.id} href={`#${n.id}`} onClick={()=>setMenuOpen(false)}
                 className="text-white/80 text-lg tracking-widest uppercase">{n.label}</a>
            ))}
          </div>
        </div>
      )}

      {/* ══ HERO — fond CSS pur, zéro image avec texte ══ */}
      <div id="accueil" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Fond dégradé tropical profond */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #071a0e 0%, #0d2b1a 30%, #1a4a2e 60%, #0d2b1a 100%)'
        }}/>

        {/* Fleurs déco COINS — emojis géants, aucun texte */}
        {/* Coin haut-gauche */}
        <div className="absolute top-0 left-0 pointer-events-none select-none" style={{zIndex:1}}>
          <div style={{fontSize:'9rem',lineHeight:1,transform:'rotate(-20deg) translate(-20px,-20px)',opacity:0.55,filter:'blur(1px)'}}>🌺</div>
          <div style={{fontSize:'5rem',lineHeight:1,transform:'rotate(10deg) translate(30px,-40px)',opacity:0.45}}>🌸</div>
          <div style={{fontSize:'4rem',lineHeight:1,transform:'rotate(-5deg) translate(10px,-10px)',opacity:0.4}}>🌿</div>
          <div style={{fontSize:'6rem',lineHeight:1,transform:'rotate(15deg) translate(-10px,-20px)',opacity:0.35}}>🌻</div>
        </div>

        {/* Coin haut-droit */}
        <div className="absolute top-0 right-0 pointer-events-none select-none text-right" style={{zIndex:1}}>
          <div style={{fontSize:'8rem',lineHeight:1,transform:'rotate(15deg) translate(20px,-20px)',opacity:0.5,filter:'blur(1px)'}}>🌸</div>
          <div style={{fontSize:'4.5rem',lineHeight:1,transform:'rotate(-10deg) translate(-20px,-30px)',opacity:0.4}}>🌺</div>
          <div style={{fontSize:'3.5rem',lineHeight:1,transform:'rotate(5deg) translate(5px,-5px)',opacity:0.35}}>🌷</div>
        </div>

        {/* Coin bas-gauche */}
        <div className="absolute bottom-0 left-0 pointer-events-none select-none" style={{zIndex:1}}>
          <div style={{fontSize:'7rem',lineHeight:1,transform:'rotate(20deg) translate(-15px,20px)',opacity:0.5,filter:'blur(1px)'}}>🌷</div>
          <div style={{fontSize:'4rem',lineHeight:1,transform:'rotate(-8deg) translate(25px,10px)',opacity:0.4}}>🌻</div>
          <div style={{fontSize:'3.5rem',lineHeight:1,transform:'translate(5px,5px)',opacity:0.35}}>🍃</div>
        </div>

        {/* Coin bas-droit */}
        <div className="absolute bottom-0 right-0 pointer-events-none select-none text-right" style={{zIndex:1}}>
          <div style={{fontSize:'9rem',lineHeight:1,transform:'rotate(-15deg) translate(20px,20px)',opacity:0.55,filter:'blur(1px)'}}>🌺</div>
          <div style={{fontSize:'5rem',lineHeight:1,transform:'rotate(10deg) translate(-20px,15px)',opacity:0.45}}>🌸</div>
          <div style={{fontSize:'3.5rem',lineHeight:1,transform:'rotate(-5deg) translate(-5px,5px)',opacity:0.35}}>🌿</div>
        </div>

        {/* Halo lumineux central décoratif */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(201,168,76,0.06) 0%, transparent 70%)',
          zIndex: 1,
        }}/>

        <div className="relative text-center px-6 pt-20" style={{zIndex:3}}>
          <p className="text-gold-light text-xs tracking-widest uppercase mb-4 opacity-80">✿ Save the Date ✿</p>
          <h1 className="text-white drop-shadow-2xl leading-tight playfair italic"
              style={{fontSize:'clamp(3.5rem,11vw,8rem)'}}>
            Katty
          </h1>
          <div className="text-white/80 text-4xl italic playfair my-1">&amp;</div>
          <h1 className="text-white drop-shadow-2xl leading-tight playfair italic"
              style={{fontSize:'clamp(3.5rem,11vw,8rem)'}}>
            Pascal
          </h1>

          <div className="inline-block px-6 py-2 rounded-full mt-6 mb-2"
               style={{background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.4)',backdropFilter:'blur(8px)'}}>
            <span className="text-gold-light text-sm tracking-widest uppercase">{WEDDING.date}</span>
          </div>
          <p className="text-white/70 text-xs tracking-widest uppercase">Salle Jasmine · Garges-lès-Gonesse</p>

          <Countdown dateISO={WEDDING.dateISO} />

          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <a href="#programme"
               className="px-8 py-3.5 rounded-full text-sm tracking-widest uppercase font-bold text-green-dark hover:-translate-y-1 transition-all hover:shadow-xl"
               style={{background:'linear-gradient(135deg,#c9a84c,#f0d080)'}}>
              🌺 Le programme
            </a>
            <a href="#rsvp"
               className="px-8 py-3.5 rounded-full text-sm tracking-widest uppercase border border-white/60 text-white hover:bg-white/20 transition-all">
              ✉️ Je confirme
            </a>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-widest uppercase animate-bounce" style={{zIndex:3}}>↓ découvrir</div>
      </div>

      {/* ══ TEXTE D'ACCUEIL ══ */}
      <div style={{ background: '#fafcf8' }}>
        <div className="py-16 px-6 text-center max-w-2xl mx-auto">

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
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: '#1a4a2e', marginBottom: '24px', lineHeight: 1.3 }}>
            Bienvenue dans notre parenthèse tropicale !
          </h2>

          {/* Corps du texte */}
          <div style={{ color: '#2d5a3d', fontSize: '0.95rem', lineHeight: 1.85, fontFamily: '"Josefin Sans", sans-serif', fontWeight: 300 }}>
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
      <Section id="histoire" bg="linear-gradient(135deg,#1a4a2e,#0d2b1a)">
        <div className="py-20 px-6 md:px-16 max-w-5xl mx-auto">
          <SectionTitle emoji="💑" title="Notre Histoire" sub="De la rencontre aux fiançailles" dark />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { year:'2019', icon:'☕', title:'La rencontre', text:"Un regard, un sourire lors d'une belle soirée. Tout a commencé là, simplement, naturellement." },
              { year:'2022', icon:'🌍', title:'L\'aventure', text:'Des voyages, des fous rires, une complicité qui grandit chaque jour. Deux âmes en balade.' },
              { year:'2024', icon:'💍', title:'Les fiançailles', text:"Sur une plage au coucher du soleil, Pascal a posé la question. La réponse était oui, mille fois oui !" },
            ].map((s,i)=>(
              <div key={i} className="text-center p-6 rounded-2xl transition-all hover:-translate-y-1"
                   style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(201,168,76,0.25)'}}>
                {/* Photo placeholder — remplacez par vos vraies photos */}
                <div className="w-full aspect-video rounded-xl mb-4 flex items-center justify-center text-5xl relative overflow-hidden"
                     style={{background:'linear-gradient(135deg,rgba(201,168,76,0.1),rgba(76,175,125,0.1))'}}>
                  <span className="opacity-40 text-6xl">{s.icon}</span>
                  <div className="absolute inset-0 flex items-end p-2">
                    <span className="text-white/30 text-xs">📷 Ajoutez votre photo ici</span>
                  </div>
                </div>
                <div className="text-gold text-xs tracking-widest uppercase mb-1">{s.year}</div>
                <h3 className="text-white italic text-lg playfair mb-2">{s.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center p-8 rounded-2xl"
               style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(201,168,76,0.2)'}}>
            <p className="text-white/80 italic text-xl leading-relaxed playfair max-w-2xl mx-auto">
              "Chaque amour a sa propre couleur.<br/>Le nôtre est tropical — vif, chaleureux et plein de vie."
            </p>
            <div className="text-gold mt-3 text-xs tracking-widest uppercase">— Katty &amp; Pascal</div>
          </div>
        </div>
      </Section>

      {/* ══ PROGRAMME ══ */}
      <Section id="programme" bg="#fafcf8">
        <div className="py-20 px-6 md:px-16 max-w-3xl mx-auto">
          <SectionTitle emoji="📅" title="Programme du 30 Juin" sub="Horaires & lieux de la journée" />
          <div className="relative">
            {/* Ligne verticale */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 md:left-1/2"
                 style={{background:'linear-gradient(180deg,#c9a84c,#4caf7d,#e91e8c,#f39c12,#9b59b6)'}}/>
            <div className="space-y-8">
              {TIMELINE.map((step,i)=>(
                <div key={i} className={`flex gap-4 items-start ${i%2===1?'md:flex-row-reverse':''}`}>
                  {/* Icône */}
                  <div className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-2xl flex-shrink-0 shadow-lg"
                       style={{background:`${step.color}25`,border:`2px solid ${step.color}`,minWidth:'4rem'}}>
                    {step.icon}
                  </div>
                  {/* Contenu */}
                  <div className="flex-1 rounded-2xl p-5 hover:-translate-y-0.5 transition-all"
                       style={{background:'white',boxShadow:'0 4px 20px rgba(0,0,0,0.06)',border:`1px solid ${step.color}30`}}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xl font-bold playfair" style={{color:step.color}}>{step.heure}</span>
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
      <Section id="menu" bg="linear-gradient(135deg,#1a4a2e,#0d2b1a)">
        <div className="py-20 px-6 md:px-16 max-w-4xl mx-auto">
          <SectionTitle emoji="🍽️" title="Menu Balade Tropicale" sub="Vin d'honneur — Salle Jasmine — 30 Juin 2026" dark />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cocktail */}
            <div className="rounded-2xl p-6" style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(201,168,76,0.3)'}}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🥂</span>
                <h3 className="text-gold-light italic text-xl playfair">Cocktail d'accueil</h3>
              </div>
              <ul className="space-y-2">
                {MENU.cocktail.map((m,i)=>(
                  <li key={i} className="text-white/80 text-sm flex items-center gap-2">
                    <span className="text-gold text-xs">✦</span>{m}
                  </li>
                ))}
              </ul>
            </div>

            {/* Buffet froid */}
            <div className="rounded-2xl p-6" style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(76,175,125,0.3)'}}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🥗</span>
                <h3 className="text-green-light italic text-xl playfair">Buffet Froid</h3>
              </div>
              <ul className="space-y-2">
                {MENU.froide.map((m,i)=>(
                  <li key={i} className="text-white/80 text-sm flex items-center gap-2">
                    <span className="text-green-light text-xs">✦</span>{m}
                  </li>
                ))}
              </ul>
            </div>

            {/* Buffet chaud */}
            <div className="rounded-2xl p-6" style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(233,30,140,0.3)'}}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🍲</span>
                <h3 className="text-trop-pink italic text-xl playfair">Buffet Chaud</h3>
              </div>
              <ul className="space-y-2">
                {MENU.chaude.map((m,i)=>(
                  <li key={i} className="text-white/80 text-sm flex items-center gap-2">
                    <span className="text-trop-pink text-xs">✦</span>{m}
                  </li>
                ))}
              </ul>
            </div>

            {/* Boissons */}
            <div className="rounded-2xl p-6" style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(243,156,18,0.3)'}}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🥤</span>
                <h3 className="text-trop-yellow italic text-xl playfair">Boissons Soft</h3>
              </div>
              <ul className="space-y-2">
                {MENU.boissons.map((m,i)=>(
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

      {/* ══ DRESS CODE ══ */}
      <Section id="dresscode" bg="#fafcf8">
        <div className="py-20 px-6 md:px-16 max-w-4xl mx-auto">
          <SectionTitle emoji="👗" title="Dress Code" sub="Balade Tropicale · 30 Juin 2026" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Femmes */}
            <div className="rounded-2xl overflow-hidden shadow-lg" style={{border:'1px solid #e91e8c30'}}>
              <div className="p-6 text-center" style={{background:'linear-gradient(135deg,#e91e8c15,#f39c1210)'}}>
                <div className="text-5xl mb-3">👗</div>
                <h3 className="text-green-dark italic text-2xl playfair">Pour les Femmes</h3>
                <p className="text-green-mid text-xs tracking-widest uppercase mt-1">Thème Balade Tropicale</p>
              </div>
              {/* Photo dress code femmes */}
              <div className="relative overflow-hidden" style={{aspectRatio:'4/3'}}>
                <img
                  src="/dresscode-femmes.jpg"
                  alt="Dress code femmes — Balade Tropicale"
                  className="w-full h-full object-cover object-top"
                  style={{transition:'transform 0.4s'}}
                  onMouseEnter={e=>e.currentTarget.style.transform='scale(1.03)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
                />
                <div className="absolute inset-0" style={{background:'linear-gradient(to top, rgba(233,30,140,0.15) 0%, transparent 50%)'}}/>
              </div>
              <div className="p-5 bg-white">
                <div className="flex flex-wrap gap-2 mb-4">
                  {['#e91e8c','#c0392b','#f39c12','#27ae60','#9b59b6','#ff7675'].map(c=>(
                    <div key={c} className="w-8 h-8 rounded-full border-2 border-white shadow"
                         title={c} style={{background:c}} />
                  ))}
                </div>
                <p className="text-green-dark/70 text-xs leading-relaxed">
                  Robes légères, imprimés floraux, tenues colorées tropicales. 
                  Évitez le blanc et le noir. Bijoux dorés ou nacrés appréciés. 🌺
                </p>
              </div>
            </div>

            {/* Hommes */}
            <div className="rounded-2xl overflow-hidden shadow-lg" style={{border:'1px solid #c9a84c30'}}>
              <div className="p-6 text-center" style={{background:'linear-gradient(135deg,#d4a57415,#c9a84c10)'}}>
                <div className="text-5xl mb-3">👔</div>
                <h3 className="text-green-dark italic text-2xl playfair">Pour les Hommes</h3>
                <p className="text-green-mid text-xs tracking-widest uppercase mt-1">Tons Beige & Couleurs Chaudes</p>
              </div>
              {/* Photo dress code hommes — costumes beige */}
              <div className="relative overflow-hidden" style={{aspectRatio:'4/3'}}>
                <img
                  src="/dresscode-hommes.jpg"
                  alt="Dress code hommes — Costume beige"
                  className="w-full h-full object-cover object-top"
                  style={{transition:'transform 0.4s'}}
                  onMouseEnter={e=>e.currentTarget.style.transform='scale(1.03)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
                />
                <div className="absolute inset-0" style={{background:'linear-gradient(to top, rgba(201,168,76,0.15) 0%, transparent 50%)'}}/>
              </div>
              <div className="p-5 bg-white">
                <div className="flex flex-wrap gap-2 mb-4">
                  {['#f5f0e8','#d4a574','#c8a882','#8b6914','#f39c12','#1a4a2e'].map(c=>(
                    <div key={c} className="w-8 h-8 rounded-full border-2 border-gray-200 shadow"
                         style={{background:c}} />
                  ))}
                </div>
                <p className="text-green-dark/70 text-xs leading-relaxed">
                  Costume ou pantalon beige / lin, chemise légère. 
                  Cravate ou pochette en couleur tropicale bienvenue. 🌴
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-5 rounded-xl text-center"
               style={{background:'#fff9ed',border:'1px solid #c9a84c40'}}>
            <p className="text-green-dark text-sm">
              🌟 <strong>Conseil :</strong> Le blanc et le noir sont réservés aux mariés. Plus c'est coloré et tropical, plus c'est festif !
            </p>
          </div>
        </div>
      </Section>

      {/* ══ PLAN D'ACCÈS ══ */}
      <Section id="acces" bg="linear-gradient(135deg,#1a4a2e,#0d2b1a)">
        <div className="py-20 px-6 md:px-16 max-w-5xl mx-auto">
          <SectionTitle emoji="🗺️" title="Plan d'Accès" sub="Salle Jasmine · 8 rue des Gaillards · Garges-lès-Gonesse" dark />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Carte / Photo salle */}
            <div>
              <div className="rounded-2xl overflow-hidden mb-4" style={{border:'1px solid rgba(201,168,76,0.3)'}}>
                {/* Google Maps iframe — méthode sans clé API (place search) */}
                <iframe
                  src="https://maps.google.com/maps?q=8+rue+des+Gaillards+95140+Garges-les-Gonesse&output=embed&z=16"
                  width="100%" height="280"
                  style={{border:0, display:'block'}}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Salle Jasmine — 8 rue des Gaillards, Garges-lès-Gonesse"
                />
              </div>
              <a href="https://maps.google.com/?q=8+rue+des+Gaillards+95140+Garges-les-Gonesse"
                 target="_blank" rel="noreferrer"
                 className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm tracking-widest uppercase font-bold text-green-dark transition-all hover:-translate-y-0.5"
                 style={{background:'linear-gradient(135deg,#c9a84c,#f0d080)'}}>
                📍 Ouvrir dans Google Maps
              </a>
            </div>

            {/* Infos transport */}
            <div className="space-y-4">
              <h3 className="text-gold-light italic text-xl playfair mb-4">Comment venir ?</h3>
              {[
                { icon:'🚗', title:'En voiture',      desc:"A1 direction Roissy, sortie Garges-lès-Gonesse. Parking gratuit sur place (200 places)." },
                { icon:'🚇', title:'RER D',            desc:"Station Garges-Sarcelles. Puis 10 min à pied ou taxi depuis la gare." },
                { icon:'🚌', title:'Bus',              desc:"Ligne 250 arrêt Gaillards. Ligne 269 arrêt Mairie de Garges." },
                { icon:'🚕', title:'Taxi / VTC',       desc:"G7, Uber disponibles dans toute la région. Comptez 30 min depuis Paris." },
                { icon:'✈️', title:'Depuis CDG',       desc:"15 minutes en voiture depuis l'aéroport Charles de Gaulle." },
              ].map((t,i)=>(
                <div key={i} className="flex gap-4 p-4 rounded-xl" style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)'}}>
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
          <div className="mt-8 p-6 rounded-2xl" style={{background:'rgba(201,168,76,0.1)',border:'1px solid rgba(201,168,76,0.3)'}}>
            <div className="flex items-start gap-4">
              <span className="text-3xl">⚖️</span>
              <div>
                <h4 className="text-gold-light italic text-lg playfair">Cérémonie Civile — 11h30</h4>
                <p className="text-white/80 text-sm mt-1">Mairie de Créteil — 1 rue Tirard, 94000 Créteil</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {HOTELS.map((h,i)=>(
                <a key={i} href={h.maps} target="_blank" rel="noreferrer"
                   className="flex items-center justify-between p-4 rounded-xl transition-all hover:-translate-y-0.5 group"
                   style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)'}}>
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
      <section id="tables" style={{ background: 'linear-gradient(160deg,#0d2b1a 0%,#1a4a2e 50%,#0d2b1a 100%)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '80px 24px' }}>

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
          <div style={{ marginBottom: '40px' }}>
            <div style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '2px solid rgba(201,168,76,0.4)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}>
              {/* Photo */}
              <img
                src="/salle-jasmine.jpg"
                alt="Salle Jasmine — Piste de danse"
                style={{ width: '100%', height: '420px', objectFit: 'cover', objectPosition: 'center 40%', display: 'block' }}
              />
              {/* Voile dégradé bas */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(10,31,18,0.85) 0%, rgba(10,31,18,0.3) 40%, transparent 70%)',
              }}/>
              {/* Bandeau haut */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                background: 'linear-gradient(to bottom, rgba(10,31,18,0.6) 0%, transparent 100%)',
                height: '80px',
              }}/>
              {/* Badge PISTE DE DANSE au centre-bas */}
              <div style={{
                position: 'absolute', bottom: '28px', left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
              }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  background: 'rgba(10,31,18,0.75)',
                  border: '1px solid rgba(201,168,76,0.5)',
                  borderRadius: '50px',
                  padding: '10px 28px',
                  backdropFilter: 'blur(8px)',
                }}>
                  <span style={{ fontSize: '1.2rem' }}>💃</span>
                  <span style={{ fontFamily: '"Josefin Sans",sans-serif', fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#f0d080' }}>
                    Piste de danse au centre
                  </span>
                  <span style={{ fontSize: '1.2rem' }}>🕺</span>
                </div>
              </div>
              {/* Coin haut-gauche : nom salle */}
              <div style={{ position: 'absolute', top: '20px', left: '24px' }}>
                <div style={{ fontFamily: '"Playfair Display",serif', fontStyle: 'italic', color: '#f0d080', fontSize: '1.1rem' }}>
                  Salle Jasmine
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: '2px' }}>
                  8 rue des Gaillards · Garges-lès-Gonesse
                </div>
              </div>
              {/* Fleurs déco coins */}
              <div style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '1.8rem', opacity: 0.6 }}>🌺</div>
              <div style={{ position: 'absolute', bottom: '16px', right: '20px', fontSize: '1.4rem', opacity: 0.5 }}>🌸</div>
              <div style={{ position: 'absolute', bottom: '16px', left: '20px', fontSize: '1.4rem', opacity: 0.5 }}>🌿</div>
            </div>

            {/* Séparateur */}
            <div style={{ textAlign: 'center', marginTop: '28px', marginBottom: '8px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '60px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5))' }}/>
                <span style={{ color: 'rgba(201,168,76,0.5)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: '"Josefin Sans",sans-serif' }}>
                  Vue schématique de la salle
                </span>
                <div style={{ width: '60px', height: '1px', background: 'linear-gradient(90deg, rgba(201,168,76,0.5), transparent)' }}/>
              </div>
            </div>
          </div>

          {/* Plan SVG de la salle */}
          <SallePlan />

          {/* Légende */}
          <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: '12px' }}>
            {TABLES.map(t => (
              <div key={t.id} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(201,168,76,0.25)',
                borderRadius: '12px',
                padding: '12px 8px',
                textAlign: 'center',
                transition: 'transform 0.2s',
                cursor: 'default',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{t.flower}</div>
                <div style={{ color: '#f0d080', fontSize: '0.72rem', fontWeight: 600, lineHeight: 1.2 }}>{t.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.6rem', marginTop: '3px' }}>{t.capacity} places</div>
              </div>
            ))}
          </div>

          {/* Note bas */}
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', marginTop: '28px', letterSpacing: '0.15em' }}>
            ✦ Le plan nominatif sera affiché à l'entrée de la salle le jour J ✦
          </p>
        </div>
      </section>

      {/* ══ RSVP ══ */}
      <Section id="rsvp" bg="linear-gradient(135deg,#fdf8f0,#f0f8f0)">
        <div className="py-20 px-6 max-w-xl mx-auto">
          <SectionTitle emoji="✉️" title="Confirmez votre présence" sub={`Avant le ${WEDDING.rsvpLimit}`} />

          {rsvpSent ? (
            <div className="text-center p-10 rounded-2xl" style={{background:'white',border:'2px solid #4caf7d40',boxShadow:'0 8px 30px rgba(76,175,125,0.15)'}}>
              <div className="text-5xl mb-4">🌺</div>
              <h3 className="text-2xl italic text-green-dark playfair mb-2">Merci {rsvp.prenom} !</h3>
              <p className="text-green-mid text-sm">Votre réponse a bien été enregistrée. Nous avons hâte de vous voir ! 🎉</p>
            </div>
          ) : (
            <form onSubmit={submitRsvp} className="rounded-2xl p-8 shadow-xl"
                  style={{background:'white',border:'1px solid rgba(201,168,76,0.2)'}}>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs tracking-widest uppercase text-green-mid block mb-1.5">Prénom *</label>
                  <input value={rsvp.prenom} onChange={e=>setR('prenom',e.target.value)} placeholder="Marie" required className={IC}/>
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-green-mid block mb-1.5">Nom *</label>
                  <input value={rsvp.nom} onChange={e=>setR('nom',e.target.value)} placeholder="Dupont" required className={IC}/>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs tracking-widest uppercase text-green-mid block mb-1.5">Téléphone</label>
                <input value={rsvp.telephone} onChange={e=>setR('telephone',e.target.value)} placeholder="+33 6 00 00 00 00" className={IC}/>
              </div>

              <div className="mb-4">
                <label className="text-xs tracking-widest uppercase text-green-mid block mb-1.5">Serez-vous présent(e) ? *</label>
                <div className="flex gap-3">
                  {[{v:'oui',l:'✅ Oui, avec joie !'},{v:'non',l:'❌ Je ne pourrai pas'}].map(opt=>(
                    <label key={opt.v} className="flex-1 cursor-pointer">
                      <input type="radio" name="presence" value={opt.v} checked={rsvp.presence===opt.v}
                             onChange={()=>setR('presence',opt.v)} className="sr-only"/>
                      <div className={`text-center py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
                        rsvp.presence===opt.v ? 'border-gold bg-gold/10 text-green-dark' : 'border-gray-200 text-gray-400 hover:border-gold/50'
                      }`}>{opt.l}</div>
                    </label>
                  ))}
                </div>
              </div>

              {rsvp.presence==='oui' && (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-xs tracking-widest uppercase text-green-mid block mb-1.5">Nombre de personnes</label>
                      <select value={rsvp.personnes} onChange={e=>setR('personnes',e.target.value)} className={SC}>
                        {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} personne{n>1?'s':''}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs tracking-widest uppercase text-green-mid block mb-1.5">Menu</label>
                      <select value={rsvp.menu} onChange={e=>setR('menu',e.target.value)} className={SC}>
                        <option value="standard">🍽️ Standard</option>
                        <option value="vegetarien">🥗 Végétarien</option>
                        <option value="halal">🌙 Halal</option>
                        <option value="casher">✡️ Casher</option>
                        <option value="allergie">⚠️ Allergie</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="mb-6">
                <label className="text-xs tracking-widest uppercase text-green-mid block mb-1.5">Message pour les mariés</label>
                <textarea value={rsvp.message} onChange={e=>setR('message',e.target.value)}
                          rows={3} placeholder="Un mot, un souvenir, une question…"
                          className={IC+' resize-none'}/>
              </div>

              <button type="submit" disabled={rsvpLoad}
                      className="w-full py-4 rounded-xl text-sm tracking-widest uppercase font-bold text-green-dark hover:-translate-y-1 transition-all hover:shadow-xl disabled:opacity-50"
                      style={{background:'linear-gradient(135deg,#c9a84c,#f0d080)'}}>
                {rsvpLoad ? '⏳ Envoi…' : '🌺 Confirmer ma présence'}
              </button>

              <p className="text-center text-green-mid/50 text-xs mt-4">Avant le <strong>{WEDDING.rsvpLimit}</strong></p>
            </form>
          )}
        </div>
      </Section>

      {/* ══ FOOTER ══ */}
      <footer className="py-10 px-6 text-center"
              style={{background:'#0d2b1a',borderTop:'1px solid rgba(201,168,76,0.2)'}}>
        <h3 className="text-gold-light italic text-2xl playfair">Katty &amp; Pascal</h3>
        <p className="text-white/40 text-xs tracking-widest uppercase mt-1">
          Balade Tropicale · 30 Juin 2026 · Salle Jasmine · Garges-lès-Gonesse
        </p>
        <div className="text-white/20 tracking-widest mt-4">✿ ✦ ✿ ✦ ✿</div>
        <p className="text-white/20 text-xs mt-3">Avec tout notre amour 🌺</p>
      </footer>
    </div>
  )
}

/* ── Schéma de salle ── */
function SallePlan() {
  const [hovered, setHovered] = useState(null)

  // Couleurs par table
  const COLORS = {
    1:'#e74c3c', 2:'#e91e8c', 3:'#e74c3c', 4:'#9b59b6', 5:'#f39c12',
    6:'#f1c40f', 7:'#e74c3c', 8:'#27ae60', 9:'#16a085', 10:'#2ecc71',
    11:'#f39c12', 12:'#27ae60', 13:'#e91e8c', 14:'#f0d080'
  }

  // Positions SVG des 14 tables dans une salle 800×560
  // Piste de danse centrale ~200×160 centrée à (400,280)
  const TABLE_POS = [
    // Haut (rangée 1) — T1 à T5
    { id:1,  x:100, y:80  },
    { id:2,  x:230, y:80  },
    { id:3,  x:400, y:65  },
    { id:4,  x:570, y:80  },
    { id:5,  x:700, y:80  },
    // Milieu gauche — T6, T7
    { id:6,  x:90,  y:220 },
    { id:7,  x:90,  y:340 },
    // Milieu droit — T8, T9
    { id:8,  x:710, y:220 },
    { id:9,  x:710, y:340 },
    // Bas (rangée 3) — T10 à T13
    { id:10, x:100, y:470 },
    { id:11, x:230, y:480 },
    { id:12, x:400, y:490 },
    { id:13, x:570, y:480 },
    { id:14, x:700, y:470 },
  ]

  const hovT = hovered ? TABLES.find(t => t.id === hovered) : null

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '820px', margin: '0 auto' }}>

      {/* Tooltip */}
      {hovT && (
        <div style={{
          position: 'absolute', top: '-48px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(13,43,26,0.95)', border: '1px solid #c9a84c',
          borderRadius: '10px', padding: '8px 18px', zIndex: 10,
          pointerEvents: 'none', whiteSpace: 'nowrap',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}>
          <span style={{ color: '#f0d080', fontFamily: '"Playfair Display",serif', fontStyle: 'italic', fontSize: '0.95rem' }}>
            {hovT.flower} Table {hovT.name}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginLeft: '10px' }}>
            {hovT.capacity} places
          </span>
        </div>
      )}

      <svg
        viewBox="0 0 800 560"
        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '20px', border: '2px solid rgba(201,168,76,0.35)' }}
      >
        {/* Fond salle */}
        <defs>
          <radialGradient id="hallBg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#1e5c35"/>
            <stop offset="100%" stopColor="#0a1f12"/>
          </radialGradient>
          <radialGradient id="danceGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#c9a84c" stopOpacity="0"/>
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <pattern id="parquet" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
            <rect width="40" height="40" fill="#c9a84c" opacity="0.04"/>
            <rect width="20" height="20" fill="#c9a84c" opacity="0.04"/>
          </pattern>
        </defs>

        {/* Salle */}
        <rect x="10" y="10" width="780" height="540" rx="18" fill="url(#hallBg)" stroke="rgba(201,168,76,0.3)" strokeWidth="2"/>

        {/* Murs déco */}
        <rect x="10" y="10" width="780" height="540" rx="18" fill="url(#parquet)"/>

        {/* Entrée */}
        <rect x="340" y="8" width="120" height="18" rx="4" fill="#0a1f12" stroke="rgba(201,168,76,0.5)" strokeWidth="1.5"/>
        <text x="400" y="21" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="Josefin Sans,sans-serif" letterSpacing="3">ENTRÉE</text>

        {/* Scène DJ */}
        <rect x="290" y="532" width="220" height="20" rx="6" fill="#0a1f12" stroke="rgba(201,168,76,0.5)" strokeWidth="1.5"/>
        <text x="400" y="546" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="Josefin Sans,sans-serif" letterSpacing="3">🎤 DJ / SCÈNE</text>

        {/* ═══ PISTE DE DANSE CENTRALE ═══ */}
        <rect x="240" y="190" width="320" height="180" rx="16" fill="url(#danceGlow)"/>
        <rect x="240" y="190" width="320" height="180" rx="16"
              fill="none" stroke="#c9a84c" strokeWidth="2" strokeDasharray="8 4" opacity="0.6"/>
        {/* Carrelage piste */}
        {[0,1,2,3].map(col => [0,1,2].map(row => (
          <rect key={`${col}-${row}`}
            x={248 + col*78} y={198 + row*58} width="72" height="52" rx="4"
            fill="rgba(201,168,76,0.06)" stroke="rgba(201,168,76,0.12)" strokeWidth="1"/>
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
               style={{ cursor:'pointer', transition:'transform 0.2s', transform: isHov ? `translate(${pos.x}px,${pos.y}px) scale(1.12) translate(-${pos.x}px,-${pos.y}px)` : 'none' }}
            >
              {/* Ombre */}
              <circle cx={pos.x} cy={pos.y+4} r={r} fill="rgba(0,0,0,0.3)" filter="url(#glow)"/>
              {/* Nappe */}
              <circle cx={pos.x} cy={pos.y} r={r} fill={`${col}22`} stroke={col} strokeWidth={isHov ? 3 : 1.5} opacity={isHov ? 1 : 0.85}/>
              {/* Cercle intérieur */}
              <circle cx={pos.x} cy={pos.y} r={r-10} fill={`${col}18`} stroke={`${col}`} strokeWidth="0.8" opacity="0.5"/>
              {/* Chaises autour */}
              {[0,45,90,135,180,225,270,315].slice(0, t.capacity > 8 ? 10 : 8).map((angle, i) => {
                const rad = (angle * Math.PI) / 180
                const cx2 = pos.x + (r+10) * Math.cos(rad)
                const cy2 = pos.y + (r+10) * Math.sin(rad)
                return <circle key={i} cx={cx2} cy={cy2} r="5" fill={`${col}60`} stroke={col} strokeWidth="1"/>
              })}
              {/* Emoji fleur */}
              <text x={pos.x} y={pos.y-6} textAnchor="middle" fontSize="18" dominantBaseline="middle">{t.flower}</text>
              {/* Numéro */}
              <text x={pos.x} y={pos.y+14} textAnchor="middle" fill="white" fontSize="9"
                    fontFamily="Josefin Sans,sans-serif" letterSpacing="0.5" opacity="0.9">
                {t.name.length > 8 ? t.name.slice(0,8) : t.name}
              </text>
            </g>
          )
        })}

        {/* Coins décoratifs floraux */}
        <text x="35" y="55" fontSize="22" opacity="0.3">🌺</text>
        <text x="740" y="55" fontSize="22" opacity="0.3">🌸</text>
        <text x="35" y="525" fontSize="22" opacity="0.3">🌿</text>
        <text x="740" y="525" fontSize="22" opacity="0.3">🌻</text>

        {/* Légende capacité */}
        <rect x="22" y="490" width="130" height="30" rx="6" fill="rgba(0,0,0,0.3)"/>
        <circle cx="38" cy="505" r="6" fill="rgba(201,168,76,0.3)" stroke="#c9a84c" strokeWidth="1"/>
        <circle cx="38" cy="505" r="3" fill="rgba(201,168,76,0.5)"/>
        <text x="50" y="509" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Josefin Sans,sans-serif" letterSpacing="1">Table ronde · 10 pl.</text>
      </svg>
    </div>
  )
}
