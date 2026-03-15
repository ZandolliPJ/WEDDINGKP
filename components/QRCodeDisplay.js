// components/QRCodeDisplay.js
// Génère un QR Code — accepte text OU value

'use client'
import { useEffect, useRef } from 'react'

export default function QRCodeDisplay({ text, value, size = 150 }) {
  const canvasRef = useRef(null)
  const content   = text || value || ''          // ← accepte les deux props

  useEffect(() => {
    if (!canvasRef.current || !content) return
    import('qrcode').then(QRCode => {
      QRCode.default.toCanvas(canvasRef.current, content, {
        width:  size,
        margin: 1,
        color:  { dark: '#1a4a2e', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      }).catch(console.error)
    }).catch(console.error)
  }, [content, size])

  return <canvas ref={canvasRef} width={size} height={size} />
}
