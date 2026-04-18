import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function BellIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}

function LogOutIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

export default function Navbar({ lang, setLang, setView, user, onSignOut, onLoginClick }) {
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const isFr = lang === 'fr'

  const meta = user?.user_metadata || {}
  const fullName = user?.first_name || meta.full_name || user?.phone || 'Me'
  const initials = (fullName.split(' ').map(w => w[0]).filter(Boolean).join('').toUpperCase().slice(0, 2)) || 'ME'

  useEffect(() => {
    if (!user?.id) return
    supabase.from('profiles').select('avatar_url, country_of_origin').eq('id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data?.avatar_url) setAvatarUrl(data.avatar_url)
      })
      .catch(err => console.error('Error fetching avatar:', err))
  }, [user?.id])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarMenuOpen && !e.target.closest('[data-avatar-menu]')) {
        setAvatarMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [avatarMenuOpen])

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchText.trim()) {
      setView('browse')
    }
  }

  return (
    <nav style={{ fontFamily: 'DM Sans, sans-serif', background: '#fff', borderBottom: '1px solid #E5E1DB', position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 1400, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>

        {/* Left: Logo + Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, maxWidth: 600 }}>
          <div onClick={() => setView('home')} style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: '#1A1710', cursor: 'pointer', letterSpacing: '-.5px', flexShrink: 0 }}>
            Yob<span style={{ color: '#52B5D9' }}>bu</span>
          </div>

          <input
            type="text"
            placeholder={isFr ? 'Rechercher...' : 'Search travelers, routes...'}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onKeyDown={handleSearch}
            style={{
              flex: 1,
              padding: '9px 14px',
              border: '1px solid #E5E1DB',
              borderRadius: 20,
              fontSize: 13,
              fontFamily: 'DM Sans, sans-serif',
              outline: 'none',
              color: '#1A1710',
              background: '#FDFBF7',
              transition: 'border-color .2s'
            }}
            onFocus={e => e.target.style.borderColor = '#52B5D9'}
            onBlur={e => e.target.style.borderColor = '#E5E1DB'}
          />
        </div>

        {/* Right: New Request + Language + Bell + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          {user?.role === 'sender' && (
            <button onClick={() => setView('packages')}
              style={{ background: '#52B5D9', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 20, fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'background .2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#3D9FBD'}
              onMouseLeave={e => e.currentTarget.style.background = '#52B5D9'}
            >
              + {isFr ? 'Demande' : 'New Request'}
            </button>
          )}

          {/* Language */}
          <div style={{ display: 'flex', background: '#F7F3ED', borderRadius: 16, overflow: 'hidden', padding: 2 }}>
            {['EN', 'FR'].map(l => (
              <button key={l} onClick={() => setLang(l.toLowerCase())}
                style={{ padding: '5px 10px', border: 'none', background: lang === l.toLowerCase() ? '#52B5D9' : 'transparent', color: lang === l.toLowerCase() ? '#fff' : '#8A8070', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}>
                {l}
              </button>
            ))}
          </div>

          {/* Bell */}
          {user && (
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#8A8070', transition: 'color .2s', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.color = '#52B5D9'}
              onMouseLeave={e => e.currentTarget.style.color = '#8A8070'}
            >
              <BellIcon size={20} color="currentColor" />
            </button>
          )}

          {/* Avatar */}
          {user ? (
            <div style={{ position: 'relative' }} data-avatar-menu>
              <button onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                style={{ width: 38, height: 38, borderRadius: '50%', background: '#D4E8F4', border: '1.5px solid #D4A574', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#52B5D9', cursor: 'pointer', overflow: 'hidden', padding: 0, transition: 'all .2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials
                )}
              </button>

              {avatarMenuOpen && (
                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, background: '#fff', border: '1px solid #EDEAE4', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,.1)', overflow: 'hidden', zIndex: 100, minWidth: 160 }} data-avatar-menu>
                  <button onClick={() => { setView('profile'); setAvatarMenuOpen(false) }}
                    style={{ width: '100%', padding: '11px 14px', textAlign: 'left', border: 'none', background: 'transparent', color: '#1A1710', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderBottom: '1px solid #F0EDE8', transition: 'background .2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9F7F5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {isFr ? 'Mon profil' : 'My profile'}
                  </button>
                  <button onClick={() => { setView('sender-profile'); setAvatarMenuOpen(false) }}
                    style={{ width: '100%', padding: '11px 14px', textAlign: 'left', border: 'none', background: 'transparent', color: '#1A1710', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderBottom: '1px solid #F0EDE8', transition: 'background .2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9F7F5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {isFr ? 'Mes colis' : 'My packages'}
                  </button>
                  <button onClick={() => { onSignOut(); setAvatarMenuOpen(false) }}
                    style={{ width: '100%', padding: '11px 14px', textAlign: 'left', border: 'none', background: 'transparent', color: '#DC2626', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'background .2s', display: 'flex', alignItems: 'center', gap: 8 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOutIcon size={14} color="#DC2626" />
                    {isFr ? 'Déconnexion' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onLoginClick}
              style={{ background: 'transparent', color: '#3D3829', border: '1px solid #E5E1DB', padding: '8px 16px', borderRadius: 20, fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F7F3ED'; e.currentTarget.style.borderColor = '#D4C8BC' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#E5E1DB' }}
            >
              {isFr ? 'Se connecter' : 'Sign in'}
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
