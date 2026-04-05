import { useState } from 'react'
import { translations } from '../utils/translations'

export default function Navbar({ lang, setLang, view, setView, user, onSignOut, onLoginClick }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const t = translations[lang]

  return (
    <nav className="sticky top-0 z-50 bg-sand border-b border-sand-200">
      <div className="px-6 py-3.5 flex items-center justify-between">

        {/* Logo */}
        <div className="font-display text-2xl font-bold text-ink cursor-pointer flex-shrink-0"
          onClick={() => { setView('home'); setMenuOpen(false) }}>
          Yob<span className="text-gold">bu</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex bg-sand-100 rounded-full p-0.5 border border-sand-200">
            {['en', 'fr'].map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all duration-150 ${lang === l ? 'bg-gold text-white' : 'text-ink-200 hover:text-ink'}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="text-sm font-medium text-ink-200 hover:text-ink cursor-pointer transition-colors"
            onClick={() => setView('browse')}>
            {t.navBrowse}
          </span>
          <button className="btn-primary text-sm" onClick={() => setView('post')}>
            {t.navPost}
          </button>
        </div>

        {/* Mobile — lang toggle + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <div className="flex bg-sand-100 rounded-full p-0.5 border border-sand-200">
            {['en', 'fr'].map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all duration-150 ${lang === l ? 'bg-gold text-white' : 'text-ink-200'}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-sand-200 bg-white">
            <span className={`block w-5 h-0.5 bg-ink transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-ink transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-ink transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-sand-200 bg-sand px-6 py-4 flex flex-col gap-3">
          <button className="text-left text-sm font-medium text-ink-200 py-2 border-b border-sand-200"
            onClick={() => { setView('browse'); setMenuOpen(false) }}>
            {t.navBrowse}
          </button>
          <button className="btn-primary text-sm py-3 w-full"
            onClick={() => { setView('post'); setMenuOpen(false) }}>
            {t.navPost}
          </button>
        </div>
      )}
    </nav>
  )
}