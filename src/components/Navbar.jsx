import { useState } from 'react'

export default function Navbar({ lang, setLang, setView }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isFr = lang === 'fr'

  return (
    <>
      <style>{`
        .nav-link:hover { color: #C8891C !important; }
        .btn-post:hover { background: #E5A630 !important; }
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
            Yob<span style={{ color: '#C8891C' }}>bu</span>
          </div>

          {/* Desktop nav */}
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', background: '#F7F3ED', borderRadius: 20, overflow: 'hidden', marginRight: 16 }}>
              {['en', 'fr'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  style={{ padding: '6px 14px', border: 'none', background: lang === l ? '#C8891C' : 'transparent', color: lang === l ? '#fff' : '#8A8070', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, cursor: 'pointer', borderRadius: 20, transition: 'all .2s' }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <span className="nav-link" onClick={() => setView('browse')}
              style={{ fontSize: 14, fontWeight: 500, color: '#3D3829', cursor: 'pointer', padding: '8px 16px', transition: 'color .2s' }}>
              {isFr ? 'Voir les GPs' : 'Browse GPs'}
            </span>
            <button className="btn-post" onClick={() => setView('post')}
              style={{ background: '#C8891C', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 24, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .25s' }}>
              {isFr ? '+ Poster un voyage' : '+ Post a trip'}
            </button>
          </div>

          {/* Mobile */}
          <div className="nav-mobile-btn" style={{ alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', background: '#F7F3ED', borderRadius: 20, overflow: 'hidden' }}>
              {['en', 'fr'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  style={{ padding: '5px 12px', border: 'none', background: lang === l ? '#C8891C' : 'transparent', color: lang === l ? '#fff' : '#8A8070', fontFamily: 'DM Sans, sans-serif', fontSize: 12, cursor: 'pointer', borderRadius: 20 }}>
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
            <button onClick={() => { setView('post'); setMenuOpen(false) }}
              style={{ background: '#C8891C', color: '#fff', border: 'none', padding: '13px 24px', borderRadius: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {isFr ? '+ Poster un voyage' : '+ Post a trip'}
            </button>
          </div>
        )}
      </nav>
    </>
  )
}