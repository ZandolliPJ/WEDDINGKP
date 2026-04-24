// Navigation.js — Glassmorphism · Variables CSS · Cohérence architecturale
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
    <nav style={{
      display: 'flex',
      overflowX: 'auto',
      background: 'rgba(0,0,0,0.28)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(201,168,76,0.2)',
      padding: '0 clamp(8px,3vw,20px)',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}>
      {NAV.map(item => {
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              padding: '13px 16px',
              fontSize: '0.62rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              borderBottom: isActive
                ? '2px solid var(--yellow-trop)'
                : '2px solid transparent',
              color: isActive
                ? 'var(--gold-light)'
                : 'rgba(255,255,255,0.4)',
              fontFamily: 'var(--font-body)',
              fontWeight: isActive ? 700 : 400,
              position: 'relative',
              top: '1px',
              transition: 'all 0.2s',
              /* Jaune EAB308 pour l'onglet actif — soleil tropical */
              ...(isActive ? {
                textShadow: '0 0 20px rgba(234,179,8,0.4)',
              } : {}),
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.color = 'rgba(240,208,128,0.8)'
                e.currentTarget.style.borderBottomColor = 'rgba(201,168,76,0.4)'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
                e.currentTarget.style.borderBottomColor = 'transparent'
              }
            }}
          >
            <span style={{ marginRight: '5px' }}>{item.e}</span>
            {item.l}
          </button>
        )
      })}
    </nav>
  )
}
