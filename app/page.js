// app/page.js
// Redirige la racine :
// — Invités → /bienvenue
// — Admin   → /admin

import { redirect } from 'next/navigation'
export default function Root() {
  redirect('/bienvenue')
}
