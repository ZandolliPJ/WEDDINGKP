// app/page.js — Redirection directe vers la page invités
import { redirect } from 'next/navigation'

export default function Root() {
  redirect('/bienvenue')
}
