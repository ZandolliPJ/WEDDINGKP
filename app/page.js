// app/page.js
// Logique de redirection par date :
// — Avant le 15 juin 2026  → /confirmation
// — À partir du 15 juin 2026 → /bienvenue

import { redirect } from 'next/navigation'

export default function Root() {
  const now      = new Date()
  const openDate = new Date('2026-06-15T00:00:00')

  if (now >= openDate) {
    redirect('/bienvenue')
  } else {
    redirect('/confirmation')
  }
}
