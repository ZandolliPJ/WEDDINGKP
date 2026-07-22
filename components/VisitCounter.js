'use client'
import { useState, useEffect } from 'react'

export default function VisitCounter({ showInAdmin = false }) {
  const [count, setCount] = useState(null)

  useEffect(() => {
    // Incrémenter à chaque visite
    fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 'bienvenue' }),
    })
      .then(r => r.json())
      .then(d => setCount(d.count))
      .catch(() => {
        // Fallback — lire sans incrémenter
        fetch('/api/visits')
          .then(r => r.json())
          .then(d => setCount(d.count))
      })
  }, [])

  if (!showInAdmin && count === null) return null

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      padding: '6px 14px', borderRadius: '20px',
      background: 'rgba(201,168,76,0.12)',
      border: '1px solid rgba(201,168,76,0.3)',
    }}>
      <span style={{ fontSize: '0.75rem' }}>👁️</span>
      <span style={{
        color: '#e8c97a', fontSize: '0.72rem',
        fontFamily: '"Josefin Sans",sans-serif',
        letterSpacing: '0.1em',
      }}>
        {count !== null ? count.toLocaleString('fr-FR') : '—'} visites
      </span>
    </div>
  )
}
