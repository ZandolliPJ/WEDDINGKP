// app/layout.js — Moteur de rendu global · Katty & Pascal 2026
// Force : même police, même palette, même fond sur TOUTES les pages
import './globals.css'

export const metadata = {
  title: 'Katty & Pascal — Balade Tropicale 2026',
  description: 'Mariage Balade Tropicale · 30 Juin 2026 · Salle Jasmine, Garges-lès-Gonesse',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1a4a2e',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      {/*
        body = Tropical Mesh via globals.css
        font-family forcé via var(--font-body)
        antialiased = rendu optimisé même sur iOS
      */}
      <body className="min-h-screen text-white antialiased">
        {children}
      </body>
    </html>
  )
}
