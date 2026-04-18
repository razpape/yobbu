import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { HomeIcon, SearchIcon, ShoppingBagIcon, UserIcon, BellIcon, MenuIcon, PackageIcon } from './Icons'

function LogOutIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

export default function MobileNavbar({ lang, setLang, setView, user, onSignOut, onLoginClick, currentView }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [notifCount, setNotifCount] = useState(0)
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

  const menuItems = [
    { label: isFr ? 'Accueil' : 'Home', view: 'home', icon: '🏠' },
    { label: isFr ? 'Explorer' : 'Browse', view: 'browse', icon: '🗺️' },
    { label: isFr ? 'Envoyer' : 'Send', view: 'send', icon: '📦' },
    { label: isFr ? 'Demandes' : 'Requests', view: 'packages', icon: '📮' },
    { divider: true },
    { label: isFr ? 'Confidentialité' : 'Privacy', view: 'privacy' },
    { label: isFr ? 'Conditions' : 'Terms', view: 'terms' },
  ]

  const navTabs = [
    { label: isFr ? 'Accueil' : 'Home', view: 'home', icon: HomeIcon },
    { label: isFr ? 'Explorer' : 'Browse', view: 'browse', icon: SearchIcon },
    { label: isFr ? 'Envoyer' : 'Send', view: 'send', icon: PackageIcon },
    { label: isFr ? 'Profil' : 'Profile', view: user?.role === 'sender' ? 'sender-profile' : 'profile', icon: UserIcon },
  ]

  return (
    <>
      {/* Top Navigation Bar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        background: '#fff',
        borderBottom: '1px solid #E5E1DB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        zIndex: 100,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Left: Menu */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            color: '#1A1710',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MenuIcon size={24} color="#1A1710" />
        </button>

        {/* Center: Logo */}
        <div
          onClick={() => { setView('home'); handleMenuClose() }}
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 18,
            color: '#1A1710',
            cursor: 'pointer',
            letterSpacing: '-.5px',
            fontWeight: 700,
          }}
        >
          Yob<span style={{ color: '#52B5D9' }}>bu</span>
        </div>

        {/* Right: Notifications + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user && (
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                color: '#8A8070',
                position: 'relative',
              }}
              onClick={() => setView('notifications')}
            >
              <BellIcon size={20} color="currentColor" />
              {notifCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 16,
                  height: 16,
                  background: '#DC2626',
                  color: '#fff',
                  borderRadius: '50%',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {notifCount}
                </span>
              )}
            </button>
          )}

          {/* Avatar */}
          {user ? (
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#D4E8F4',
              border: '1.5px solid #D4A574',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#52B5D9',
              overflow: 'hidden',
            }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              style={{
                background: '#52B5D9',
                color: '#fff',
                border: 'none',
                padding: '7px 14px',
                borderRadius: 16,
                fontSize: 12,
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

      {/* Sidebar Menu */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={handleMenuClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,.3)',
              zIndex: 101,
            }}
          />

          {/* Sidebar */}
          <div style={{
            position: 'fixed',
            top: 56,
            left: 0,
            width: 280,
            height: 'calc(100vh - 56px)',
            background: '#fff',
            zIndex: 102,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {/* User Info */}
            {user && (
              <div style={{ padding: '16px', borderBottom: '1px solid #E5E1DB' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1710', marginBottom: 4 }}>
                  {user.first_name || user.phone}
                </div>
                <div style={{ fontSize: 12, color: '#8A8070' }}>
                  {user.role === 'sender' ? (isFr ? 'Expéditeur' : 'Sender') : (isFr ? 'Voyageur' : 'Traveler')}
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {menuItems.map((item, idx) => (
                item.divider ? (
                  <div key={idx} style={{ height: '1px', background: '#E5E1DB', margin: '8px 0' }} />
                ) : (
                  <button
                    key={idx}
                    onClick={() => {
                      setView(item.view)
                      handleMenuClose()
                    }}
                    style={{
                      padding: '12px 16px',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      fontSize: 14,
                      color: '#1A1710',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => e.target.style.background = '#F9F7F5'}
                    onMouseLeave={e => e.target.style.background = 'none'}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                )
              ))}
            </div>

            {/* Language & Logout */}
            {user && (
              <div style={{ padding: '16px', borderTop: '1px solid #E5E1DB', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, background: '#F7F3ED', borderRadius: 12, overflow: 'hidden', padding: 4 }}>
                  {['EN', 'FR'].map(l => (
                    <button
                      key={l}
                      onClick={() => setLang(l.toLowerCase())}
                      style={{
                        flex: 1,
                        padding: '6px',
                        border: 'none',
                        background: lang === l.toLowerCase() ? '#52B5D9' : 'transparent',
                        color: lang === l.toLowerCase() ? '#fff' : '#8A8070',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        borderRadius: 8,
                        transition: 'all .15s',
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    onSignOut()
                    handleMenuClose()
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: 'none',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'background .15s',
                  }}
                  onMouseEnter={e => e.target.style.background = '#FEF2F2'}
                  onMouseLeave={e => e.target.style.background = '#FEF2F2'}
                >
                  <LogOutIcon size={16} color="#DC2626" />
                  {isFr ? 'Déconnexion' : 'Sign out'}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Bottom Tab Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: '#fff',
        borderTop: '1px solid #E5E1DB',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        zIndex: 100,
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
                background: isActive ? 'rgba(82, 181, 217, .05)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                transition: 'all .2s',
                borderTop: isActive ? '3px solid #52B5D9' : '3px solid transparent',
              }}
            >
              <Icon size={24} color={isActive ? '#52B5D9' : '#8A8070'} />
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: isActive ? '#52B5D9' : '#8A8070',
                transition: 'color .2s',
              }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Spacer for bottom nav */}
      <div style={{ height: 64 }} />
    </>
  )
}
