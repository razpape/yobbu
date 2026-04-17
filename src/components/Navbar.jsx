import { useState } from 'react'

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
  const [menuOpen, setMenuOpen] = useState(false)
  const isFr = lang === 'fr'

  const meta = user?.user_metadata || {}
  const fullName = user?.first_name || meta.full_name || user?.phone || 'Me'
  const initials = (fullName.split(' ').map(w => w[0]).filter(Boolean).join('').toUpperCase().slice(0, 2)) || 'ME'

  return (
    <>
      <style>{`
        .nav-link:hover { color: #52B5D9 !important; }
        .btn-post:hover { background: #E5A630 !important; }
        .btn-signin:hover { background: #F7F3ED !important; }
        .avatar-btn:hover { background: #52B5D9 !important; color: #fff !important; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-btn { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>

      <nav style={{ fontFamily: 'DM Sans, sans-serif', background: '#FDFBF7', borderBottom: '1px solid rgba(0,0,0,.06)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <div onClick={() => { setView('home'); setMenuOpen(false) }}
            style={{ fontFamily: 'DM Serif Display, serif', fontSize: 26, color: '#1A1710', cursor: 'pointer', letterSpacing: '-.5px' }}>
            Yob<span style={{ color: '#52B5D9' }}>bu</span>
          </div>

          {/* Desktop */}
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', background: '#F7F3ED', borderRadius: 20, overflow: 'hidden', marginRight: 16 }}>
              {['en', 'fr'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  style={{ padding: '6px 14px', border: 'none', background: lang === l ? '#52B5D9' : 'transparent', color: lang === l ? '#fff' : '#8A8070', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, cursor: 'pointer', borderRadius: 20, transition: 'all .2s' }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            <span className="nav-link" onClick={() => setView('browse')}
              style={{ fontSize: 14, fontWeight: 500, color: '#3D3829', cursor: 'pointer', padding: '8px 16px', transition: 'color .2s' }}>
              {isFr ? 'Voir les GPs' : 'Browse GPs'}
            </span>

            {user ? (
              <>
                <button className="btn-post" onClick={() => setView('post')}
                  style={{ background: '#52B5D9', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 24, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .25s' }}>
                  {isFr ? '+ Poster' : '+ Post a trip'}
                </button>
                <div className="avatar-btn" onClick={() => setView('profile')}
                  style={{ width: 38, height: 38, borderRadius: '50%', background: '#D4E8F4', border: '1.5px solid #D4A574', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#52B5D9', cursor: 'pointer', transition: 'all .2s' }}>
                  {initials}
                </div>
              </>
            ) : (
              <>
                <button className="btn-signin" onClick={onLoginClick}
                  style={{ background: 'transparent', color: '#3D3829', border: '1px solid rgba(0,0,0,.12)', padding: '9px 20px', borderRadius: 24, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all .2s' }}>
                  {isFr ? 'Se connecter' : 'Sign in'}
                </button>
                <button className="btn-post" onClick={() => setView('post')}
                  style={{ background: '#52B5D9', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 24, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .25s' }}>
                  {isFr ? '+ Poster un voyage' : '+ Post a trip'}
                </button>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="nav-mobile-btn" style={{ alignItems: 'center', gap: 10 }}>
            {user && (
              <div onClick={() => setView('profile')}
                style={{ width: 34, height: 34, borderRadius: '50%', background: '#D4E8F4', border: '1.5px solid #D4A574', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#52B5D9', cursor: 'pointer', flexShrink: 0 }}>
                {initials}
              </div>
            )}
            <div style={{ display: 'flex', background: '#F7F3ED', borderRadius: 20, overflow: 'hidden' }}>
              {['en', 'fr'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  style={{ padding: '5px 12px', border: 'none', background: lang === l ? '#52B5D9' : 'transparent', color: lang === l ? '#fff' : '#8A8070', fontFamily: 'DM Sans, sans-serif', fontSize: 12, cursor: 'pointer', borderRadius: 20 }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ width: 36, height: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#fff', border: '1px solid rgba(0,0,0,.08)', borderRadius: 10, cursor: 'pointer' }}>
              {[0,1,2].map(i => (
                <span key={i} style={{ display: 'block', width: 20, height: 2, background: '#1A1710', transition: 'all .2s',
                  transform: menuOpen ? (i === 0 ? 'rotate(45deg) translateY(7px)' : i === 2 ? 'rotate(-45deg) translateY(-7px)' : 'none') : 'none',
                  opacity: menuOpen && i === 1 ? 0 : 1 }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mobile-menu" style={{ borderTop: '1px solid rgba(0,0,0,.06)', background: '#FDFBF7', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span onClick={() => { setView('browse'); setMenuOpen(false) }}
              style={{ fontSize: 15, fontWeight: 500, color: '#3D3829', cursor: 'pointer', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,.06)' }}>
              {isFr ? 'Voir les GPs' : 'Browse GPs'}
            </span>
            {!user && (
              <button onClick={() => { onLoginClick(); setMenuOpen(false) }}
                style={{ background: 'transparent', color: '#3D3829', border: '1px solid rgba(0,0,0,.12)', padding: '12px 24px', borderRadius: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                {isFr ? 'Se connecter' : 'Sign in'}
              </button>
            )}
            <button onClick={() => { setView('post'); setMenuOpen(false) }}
              style={{ background: '#52B5D9', color: '#fff', border: 'none', padding: '13px 24px', borderRadius: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {isFr ? '+ Poster un voyage' : '+ Post a trip'}
            </button>
            {user && (
              <button onClick={() => { setView('profile'); setMenuOpen(false) }}
                style={{ background: 'transparent', color: '#3D3829', border: '1px solid rgba(0,0,0,.08)', padding: '12px 24px', borderRadius: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                {isFr ? 'Mon profil' : 'My profile'}
              </button>
            )}
            {user && (
              <button onClick={() => { onSignOut(); setMenuOpen(false) }}
                style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '12px 24px', borderRadius: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <LogOutIcon size={15} color="#DC2626" />
                {isFr ? 'Déconnexion' : 'Sign out'}
              </button>
            )}
          </div>
        )}
      </nav>
    </>
  )
}