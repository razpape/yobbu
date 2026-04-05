import { translations } from '../utils/translations'

export default function Navbar({ lang, setLang, view, setView, user, onSignOut, onLoginClick }) {
  const t = translations[lang]
  const meta = user?.user_metadata || {}
  const fullName = meta.full_name || meta.first_name || user?.email?.split('@')[0] || 'Me'
  const initials = fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <nav className="sticky top-0 z-50 bg-sand border-b border-sand-200 px-8 py-3.5 flex items-center justify-between">
      <div className="font-display text-2xl font-bold text-ink cursor-pointer" onClick={() => setView('home')}>
        Yob<span className="text-gold">bu</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Language toggle */}
        <div className="flex bg-sand-100 rounded-full p-0.5 border border-sand-200">
          {['en', 'fr'].map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all duration-150 ${lang === l ? 'bg-gold text-white' : 'text-ink-200 hover:text-ink'}`}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <span className="text-sm font-medium text-ink-200 hover:text-ink cursor-pointer transition-colors" onClick={() => setView('browse')}>
          {t.navBrowse}
        </span>

        {user ? (
          <div className="flex items-center gap-3">
            <button className="btn-primary text-sm" onClick={() => setView('post')}>{t.navPost}</button>
            <div
              className="w-9 h-9 rounded-full bg-gold-light text-gold-dark flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-gold hover:text-white transition-colors"
              onClick={() => setView('profile')}
              title={fullName}
            >
              {initials}
            </div>
          </div>
        ) : (
          <button className="btn-primary text-sm" onClick={onLoginClick}>
            {lang === 'fr' ? 'Se connecter' : 'Log in'}
          </button>
        )}
      </div>
    </nav>
  )
}