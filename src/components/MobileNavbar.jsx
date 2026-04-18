import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { HomeIcon, SearchIcon, PackageIcon, UserIcon, BellIcon, MenuIcon, XIcon } from './Icons'

export default function MobileNavbar({ lang, setLang, setView, user, onSignOut, onLoginClick, currentView }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const isFr = lang === 'fr'

  const meta = user?.user_metadata || {}
  const initials = (user?.first_name || meta.full_name || user?.phone || '?')
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)

  useEffect(() => {
    if (!user?.id) return
    supabase.from('profiles').select('avatar_url').eq('id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data?.avatar_url) setAvatarUrl(data.avatar_url)
      })
      .catch(err => console.error('Error fetching avatar:', err))
  }, [user?.id])

  const handleMenuClose = () => setMenuOpen(false)

  const navTabs = [
    { label: isFr ? 'Accueil' : 'Home', view: 'home', icon: HomeIcon },
    { label: isFr ? 'Explorer' : 'Browse', view: 'browse', icon: SearchIcon },
    { label: isFr ? 'Envoyer' : 'Send', view: 'send', icon: PackageIcon },
    { label: isFr ? 'Profil' : 'Profile', view: user?.role === 'sender' ? 'sender-profile' : 'profile', icon: UserIcon },
  ]

  return (
    <>
      {/* Top Navigation - Clean & Modern */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        background: '#fff',
        borderBottom: '1px solid #F5F0EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 100,
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: '0 1px 3px rgba(0,0,0,.04)',
      }}>
        {/* Left: Logo */}
        <div
          onClick={() => { setView('home'); handleMenuClose() }}
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 22,
            fontWeight: 700,
            color: '#1F2937',
            cursor: 'pointer',
            letterSpacing: '-.5px',
          }}
        >
          Yob<span style={{ color: '#10B981' }}>bu</span>
        </div>

        {/* Right: Icons & Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {user && (
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                color: '#6B7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setView('notifications')}
            >
              <BellIcon size={22} color="currentColor" />
            </button>
          )}

          {user ? (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: avatarUrl ? 'transparent' : '#F0FAF4',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: '#2D8B4E',
                cursor: 'pointer',
                overflow: 'hidden',
                padding: 0,
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              style={{
                background: '#10B981',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {isFr ? 'Connexion' : 'Login'}
            </button>
          )}
        </div>
      </nav>

      {/* Sidebar Menu - Modern Drawer */}
      {menuOpen && (
        <>
          {/* Overlay - Subtle */}
          <div
            onClick={handleMenuClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,.15)',
              zIndex: 101,
              backdropFilter: 'blur(2px)',
            }}
          />

          {/* Sidebar */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '85%',
            maxWidth: 300,
            height: '100vh',
            background: '#FDFBF7',
            zIndex: 102,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: '2px 0 12px rgba(0,0,0,.08)',
          }}>
            {/* Header with Close Button */}
            <div style={{
              padding: '20px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #E5E1DB',
            }}>
              <div style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 20,
                fontWeight: 700,
                color: '#1F2937',
              }}>
                Yob<span style={{ color: '#10B981' }}>bu</span>
              </div>
              <button
                onClick={handleMenuClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: '#6B7280',
                }}
              >
                <XIcon size={24} color="currentColor" />
              </button>
            </div>

            {/* User Card */}
            {user && (
              <div style={{
                padding: '16px',
                margin: '12px 8px',
                background: '#fff',
                border: '1px solid #E5E1DB',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: avatarUrl ? 'transparent' : '#F0FAF4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#2D8B4E',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    initials
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1F2937',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {user.first_name || user.phone}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: '#6B7280',
                    marginTop: 2,
                  }}>
                    {user.role === 'sender' ? (isFr ? 'Expéditeur' : 'Sender') : (isFr ? 'Voyageur' : 'Traveler')}
                  </div>
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px' }}>
              {[
                { label: isFr ? 'Accueil' : 'Home', view: 'home', icon: '🏠' },
                { label: isFr ? 'Explorer' : 'Browse travelers', view: 'browse', icon: '🗺️' },
                { label: isFr ? 'Envoyer un colis' : 'Send package', view: 'send', icon: '📦' },
                { label: isFr ? 'Demandes' : 'Package requests', view: 'packages', icon: '📮' },
                { label: isFr ? 'Mon profil' : 'My profile', view: user?.role === 'sender' ? 'sender-profile' : 'profile', icon: '👤' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setView(item.view)
                    handleMenuClose()
                  }}
                  style={{
                    padding: '12px 12px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    fontSize: 15,
                    fontWeight: 500,
                    color: '#1F2937',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderRadius: 8,
                    transition: 'all .2s',
                    margin: '4px 0',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#F0EDE8'
                    e.currentTarget.style.color = '#10B981'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'none'
                    e.currentTarget.style.color = '#1F2937'
                  }}
                >
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 8px',
              borderTop: '1px solid #E5E1DB',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              {/* Language Selector */}
              <div style={{ display: 'flex', gap: 8, padding: '0 8px' }}>
                {['EN', 'FR'].map(l => (
                  <button
                    key={l}
                    onClick={() => setLang(l.toLowerCase())}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: lang === l.toLowerCase() ? '1.5px solid #10B981' : '1.5px solid #E5E1DB',
                      background: lang === l.toLowerCase() ? '#F0FAF4' : '#fff',
                      color: lang === l.toLowerCase() ? '#10B981' : '#6B7280',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderRadius: 8,
                      transition: 'all .2s',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    onMouseEnter={e => {
                      if (lang !== l.toLowerCase()) {
                        e.currentTarget.style.borderColor = '#D4C8BC'
                      }
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {/* Logout Button */}
              {user && (
                <button
                  onClick={() => {
                    onSignOut()
                    handleMenuClose()
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #FECACA',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    borderRadius: 8,
                    transition: 'all .2s',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#FEE2E2'
                    e.currentTarget.style.borderColor = '#FCA5A5'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#FEF2F2'
                    e.currentTarget.style.borderColor = '#FECACA'
                  }}
                >
                  {isFr ? 'Déconnexion' : 'Sign out'}
                </button>
              )}

              {/* Footer Links */}
              <div style={{ display: 'flex', gap: 8, padding: '0 8px' }}>
                <button
                  onClick={() => {
                    setView('privacy')
                    handleMenuClose()
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: 'none',
                    background: 'none',
                    color: '#6B7280',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    borderRadius: 6,
                    transition: 'all .2s',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#10B981'
                    e.currentTarget.style.background = '#F0EDE8'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#6B7280'
                    e.currentTarget.style.background = 'none'
                  }}
                >
                  {isFr ? 'Confidentialité' : 'Privacy'}
                </button>
                <button
                  onClick={() => {
                    setView('terms')
                    handleMenuClose()
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: 'none',
                    background: 'none',
                    color: '#6B7280',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    borderRadius: 6,
                    transition: 'all .2s',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#10B981'
                    e.currentTarget.style.background = '#F0EDE8'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#6B7280'
                    e.currentTarget.style.background = 'none'
                  }}
                >
                  {isFr ? 'Conditions' : 'Terms'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Tab Navigation - Two-Tab Switcher */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        background: '#fff',
        borderTop: '1px solid #F5F0EB',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        boxShadow: '0 -1px 3px rgba(0,0,0,.04)',
        padding: '12px 20px 20px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          display: 'flex',
          gap: 12,
          background: '#F5F3F1',
          borderRadius: 24,
          padding: 6,
          width: '100%',
          maxWidth: 340,
        }}>
          <button
            onClick={() => setView('send')}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: 20,
              border: 'none',
              background: currentView === 'send' ? '#fff' : 'transparent',
              color: '#1F2937',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'all .2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {isFr ? 'Envoyer' : 'Send'}
          </button>
          <button
            onClick={() => setView('browse')}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: 20,
              border: 'none',
              background: currentView === 'browse' ? '#fff' : 'transparent',
              color: '#1F2937',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'all .2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            {isFr ? 'GP' : 'GP'}
          </button>
        </div>
      </div>

      {/* Spacer for bottom nav */}
      <div style={{ height: 80 }} />
    </>
  )
}
