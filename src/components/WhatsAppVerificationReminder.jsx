import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function WhatsAppVerificationReminder({ user, lang, onVerifyClick }) {
  const isFr = lang === 'fr'
  const [isVerified, setIsVerified] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    async function checkVerification() {
      const { data } = await supabase
        .from('profiles')
        .select('whatsapp_verified')
        .eq('id', user.id)
        .single()
      
      setIsVerified(data?.whatsapp_verified || false)
      setLoading(false)
    }

    checkVerification()
  }, [user?.id])

  if (loading || isVerified === null || isVerified) return null

  return (
    <div style={{
      background: 'linear-gradient(135deg, #D1F4E7 0%, #FDF0E8 100%)',
      border: '1px solid #F5D0A9',
      borderRadius: 12,
      padding: '14px 18px',
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
    }}>
      {/* Icon */}
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: '#10B981',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35C8.5 21.52 10.21 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.93 13.66c-.2.56-1.18 1.08-1.62 1.13-.44.06-.86.2-2.9-.6-2.46-.96-4.04-3.47-4.16-3.63-.12-.17-.97-1.29-.97-2.46 0-1.18.62-1.75.84-2 .2-.23.44-.29.59-.29h.42c.14 0 .32-.01.49.37.18.4.62 1.52.67 1.63.06.1.09.23.02.37-.07.14-.1.22-.2.34-.1.12-.21.27-.3.36-.1.1-.2.21-.09.41.12.2.52.85 1.12 1.38.77.69 1.42.9 1.62 1 .2.1.32.08.44-.05.12-.13.5-.58.64-.78.13-.2.26-.16.44-.1.18.07 1.16.55 1.36.65.2.1.33.15.38.23.06.08.06.46-.14 1.02z"/>
        </svg>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', marginBottom: 2 }}>
          {isFr ? 'Vérifiez votre compte WhatsApp' : 'Verify your WhatsApp account'}
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
          {isFr 
            ? 'Votre compte n\'est pas encore vérifié. Vérifiez votre WhatsApp pour débloquer toutes les fonctionnalités.' 
            : 'Your account is not yet verified. Verify your WhatsApp to unlock all features.'}
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onVerifyClick}
        style={{
          padding: '10px 18px',
          background: '#10B981',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          whiteSpace: 'nowrap',
          flexShrink: 0,
          transition: 'background .2s',
        }}
        onMouseEnter={(e) => e.target.style.background = '#B0781A'}
        onMouseLeave={(e) => e.target.style.background = '#10B981'}
      >
        {isFr ? 'Vérifier maintenant →' : 'Verify now →'}
      </button>
    </div>
  )
}
