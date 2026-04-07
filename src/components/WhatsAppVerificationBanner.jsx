import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import WhatsAppVerificationModal from './WhatsAppVerificationModal'

export default function WhatsAppVerificationBanner({ user, lang }) {
  const isFr = lang === 'fr'

  const [verified,   setVerified]   = useState(null)   // null = loading
  const [dismissed,  setDismissed]  = useState(false)
  const [showModal,  setShowModal]  = useState(false)

  useEffect(() => {
    if (!user) return
    // Check if banner was dismissed this session
    if (sessionStorage.getItem('wa_banner_dismissed')) { setDismissed(true); return }

    supabase
      .from('profiles')
      .select('whatsapp_verified')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setVerified(data?.whatsapp_verified ?? false))
  }, [user])

  const handleDismiss = () => {
    sessionStorage.setItem('wa_banner_dismissed', '1')
    setDismissed(true)
  }

  const handleVerified = () => {
    setVerified(true)
    setShowModal(false)
  }

  // Hide when: no user, still loading, already verified, or dismissed
  if (!user || verified === null || verified === true || dismissed) return null

  return (
    <>
      {showModal && (
        <WhatsAppVerificationModal
          user={user}
          lang={lang}
          onClose={() => setShowModal(false)}
          onVerified={handleVerified}
        />
      )}

      <div style={{
        background:   'linear-gradient(135deg, #F0FAF4 0%, #E8F4ED 100%)',
        borderBottom: '1px solid #C8E6D4',
        padding:      '12px 24px',
        display:      'flex',
        alignItems:   'center',
        gap:          12,
        fontFamily:   "'DM Sans', sans-serif",
        flexWrap:     'wrap',
      }}>
        {/* WhatsApp icon */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: '#25D366',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35C8.5 21.52 10.21 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.93 13.66c-.2.56-1.18 1.08-1.62 1.13-.44.06-.86.2-2.9-.6-2.46-.96-4.04-3.47-4.16-3.63-.12-.17-.97-1.29-.97-2.46 0-1.18.62-1.75.84-2 .2-.23.44-.29.59-.29h.42c.14 0 .32-.01.49.37.18.4.62 1.52.67 1.63.06.1.09.23.02.37-.07.14-.1.22-.2.34-.1.12-.21.27-.3.36-.1.1-.2.21-.09.41.12.2.52.85 1.12 1.38.77.69 1.42.9 1.62 1 .2.1.32.08.44-.05.12-.13.5-.58.64-.78.13-.2.26-.16.44-.1.18.07 1.16.55 1.36.65.2.1.33.15.38.23.06.08.06.46-.14 1.02z"/>
          </svg>
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1A5C38' }}>
            {isFr ? 'Vérifiez votre compte WhatsApp' : 'Verify your WhatsApp account'}
          </span>
          <span style={{ fontSize: 13, color: '#2D7A50', marginLeft: 6 }}>
            {isFr
              ? '— obtenez votre badge vérifié et inspirez confiance aux expéditeurs.'
              : '— earn your verified badge and build trust with senders.'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding:     '8px 18px',
              background:  '#2D8B4E',
              color:       '#fff',
              border:      'none',
              borderRadius: 10,
              fontFamily:  "'DM Sans', sans-serif",
              fontSize:    13,
              fontWeight:  600,
              cursor:      'pointer',
              transition:  'background .2s',
              whiteSpace:  'nowrap',
            }}
            onMouseEnter={e => e.target.style.background = '#1A6B38'}
            onMouseLeave={e => e.target.style.background = '#2D8B4E'}
          >
            {isFr ? 'Vérifier maintenant' : 'Verify now'}
          </button>

          <button
            onClick={handleDismiss}
            title={isFr ? 'Masquer' : 'Dismiss'}
            style={{
              width: 28, height: 28, borderRadius: '50%', border: 'none',
              background: 'rgba(45,139,78,.12)', color: '#2D8B4E',
              cursor: 'pointer', fontSize: 13, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </>
  )
}
