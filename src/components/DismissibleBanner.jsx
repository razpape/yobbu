import { useState, useEffect } from 'react'

export default function DismissibleBanner({ lang = 'en' }) {
  const [visible, setVisible] = useState(false)

  const isFr = lang === 'fr'
  const messages = {
    en: "Join thousands of travelers & senders - grow with Yobbu today!",
    fr: "Rejoignez des milliers de voyageurs et d'expéditeurs - grandissez avec Yobbu!"
  }

  useEffect(() => {
    const dismissed = localStorage.getItem('yobbu_banner_dismissed')
    if (!dismissed) setVisible(true)
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    localStorage.setItem('yobbu_banner_dismissed', 'true')
  }

  if (!visible) return null

  return (
    <div style={{
      background: 'linear-gradient(135deg, #52B5D9 0%, #2563EB 100%)',
      color: '#fff',
      padding: '14px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 13,
      fontWeight: 600,
      position: 'relative',
    }}>
      <span>{messages[isFr ? 'fr' : 'en']}</span>
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          right: 16,
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: 18,
          cursor: 'pointer',
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          opacity: 0.8,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
      >
        ✕
      </button>
    </div>
  )
}
