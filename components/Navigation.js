'use client'

const NAV = [
  { id:'dashboard',   e:'📊', l:'Dashboard'    },
  { id:'budget',      e:'💰', l:'Budget'        },
  { id:'placement',   e:'🤖', l:'Placement IA'  },
  { id:'tables',      e:'🌸', l:'Tables'        },
  { id:'guests',      e:'👥', l:'Invités'       },
  { id:'invitations', e:'✉️', l:'Faire-Part'    },
  { id:'rsvp',        e:'📋', l:'RSVP reçus'    },
  { id:'checkin',     e:'✅', l:'Check-in'      },
  { id:'export',      e:'📄', l:'Exports PDF'   },
]

export default function Navigation({ activeTab, onTabChange }) {
  return (
    <nav className="flex border-b border-gold/25 overflow-x-auto"
         style={{background:'#0d2b1a',padding:'0 16px'}}>
      {NAV.map(item=>(
        <button key={item.id} onClick={()=>onTabChange(item.id)}
                className={`px-4 py-3 text-xs tracking-widest uppercase whitespace-nowrap border-b-2 relative top-px transition-all
                  ${activeTab===item.id ? 'text-gold-light border-gold' : 'text-white/45 border-transparent hover:text-gold-light/60 hover:border-gold/35'}`}
                style={{fontFamily:'"Josefin Sans",sans-serif'}}>
          {item.e} {item.l}
        </button>
      ))}
    </nav>
  )
}
