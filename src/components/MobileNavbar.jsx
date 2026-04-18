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
            color: '#1A1710',
            cursor: 'pointer',
            letterSpacing: '-.5px',
          }}
        >
          Yob<span style={{ color: '#52B5D9' }}>bu</span>
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
                color: '#8A8070',
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
                background: '#52B5D9',
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
                color: '#1A1710',
              }}>
                Yob<span style={{ color: '#52B5D9' }}>bu</span>
              </div>
              <button
                onClick={handleMenuClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: '#8A8070',
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
                    color: '#1A1710',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {user.first_name || user.phone}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: '#8A8070',
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
                    color: '#1A1710',
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
                    e.currentTarget.style.color = '#52B5D9'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'none'
                    e.currentTarget.style.color = '#1A1710'
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
                      border: lang === l.toLowerCase() ? '1.5px solid #52B5D9' : '1.5px solid #E5E1DB',
                      background: lang === l.toLowerCase() ? '#F0FAF4' : '#fff',
                      color: lang === l.toLowerCase() ? '#52B5D9' : '#8A8070',
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
                    color: '#8A8070',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    borderRadius: 6,
                    transition: 'all .2s',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#52B5D9'
                    e.currentTarget.style.background = '#F0EDE8'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#8A8070'
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
                    color: '#8A8070',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    borderRadius: 6,
                    transition: 'all .2s',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#52B5D9'
                    e.currentTarget.style.background = '#F0EDE8'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#8A8070'
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

      {/* Bottom Tab Navigation - Sleek & Modern */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 72,
        background: '#fff',
        borderTop: '1px solid #F5F0EB',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        zIndex: 100,
        boxShadow: '0 -1px 3px rgba(0,0,0,.04)',
      }}>
        {navTabs.map((tab) => {
          const isActive = currentView === tab.view
          const Icon = tab.icon

          return (
            <button
              key={tab.view}
              onClick={() => setView(tab.view)}
              style={{
                flex: 1,
                height: '100%',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all .2s',
                paddingBottom: 8,
              }}
            >
              <Icon size={26} color={isActive ? '#52B5D9' : '#D0C7BD'} />
              <span style={{
                fontSize: 11,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#52B5D9' : '#8A8070',
                transition: 'color .2s',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Spacer for bottom nav */}
      <div style={{ height: 72 }} />
    </>
  )
}
