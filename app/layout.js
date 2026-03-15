// app/layout.js
// ─────────────────────────────────────────────────────
// Squelette HTML commun à toutes les pages
// ─────────────────────────────────────────────────────
import './globals.css'

export const metadata = {
  title:       'Wedding Planner — Katty & Pascal',
  description: 'Balade Tropicale — Gestion de mariage 2026',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-green-dark text-white">
        {children}
      </body>
    </html>
  )
}
