// app/admin/page.js
// Redirige /admin → /admin/dashboard
import { redirect } from 'next/navigation'
export default function AdminRoot() {
  redirect('/admin/dashboard')
}
