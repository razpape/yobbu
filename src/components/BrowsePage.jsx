import { useState } from 'react'
import GPCard from './GPCard'
import { DESTINATIONS } from '../data/trips'
import { translations } from '../utils/translations'
 
export default function BrowsePage({ lang, setView, trips, loading, error }) {
  const [dest, setDest] = useState('all')
  const t = translations[lang]
 
  const filtered = dest === 'all' ? trips
    : dest === 'Dakar'       ? trips.filter((g) => g.to === 'Dakar' && g.from !== 'Paris')
    : dest === 'Conakry'     ? trips.filter((g) => g.to === 'Conakry')
    : dest === 'Paris-Dakar' ? trips.filter((g) => g.from === 'Paris')
    : dest === 'US-Dakar'    ? trips.filter((g) => g.to === 'Dakar' && g.from !== 'New York' && g.from !== 'Paris')
    : trips
 
  return (
    <>
      <div className="bg-forest-light border-b border-green-200 px-8 py-2.5 flex items-center gap-2">
        <span className="text-sm">🛡</span>
        <span className="text-xs font-medium text-forest">{t.browseTrust}</span>
      </div>
 
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
 
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <span className="section-label">
                {loading ? '...' : t.countLabel(filtered.length)}
              </span>
              <select
                className="text-xs font-medium px-4 py-2 rounded-full border border-sand-300 bg-sand text-ink cursor-pointer outline-none focus:border-gold-mid"
                value={dest}
                onChange={(e) => setDest(e.target.value)}
              >
                {DESTINATIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label[lang]}</option>
                ))}
              </select>
            </div>
 
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="bg-sand rounded-2xl border border-sand-200 p-5 animate-pulse">
                    <div className="flex gap-3 mb-4">
                      <div className="w-11 h-11 rounded-full bg-sand-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-sand-200 rounded w-1/2" />
                        <div className="h-2 bg-sand-200 rounded w-3/4" />
                        <div className="h-2 bg-sand-200 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-5 bg-sand-200 rounded-full w-24" />
                      <div className="h-5 bg-sand-200 rounded-full w-20" />
                    </div>
                    <div className="h-8 bg-sand-200 rounded-lg" />
                  </div>
                ))}
              </div>
            )}
 
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-700">
                Could not load trips. Check your Supabase connection.
                <span className="text-xs text-red-400 mt-1 block">{error}</span>
              </div>
            )}
 
            {!loading && !error && filtered.length === 0 && (
              <div className="text-center py-16 text-ink-300 text-sm">{t.noResults}</div>
            )}
 
            {!loading && !error && filtered.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map((gp) => (
                  <GPCard key={gp.id} gp={gp} lang={lang} />
                ))}
              </div>
            )}
          </div>
 
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-sand rounded-2xl border border-sand-200 p-5">
              <div className="text-sm font-semibold text-ink mb-2">{t.sidebarTitle}</div>
              <p className="text-xs text-ink-200 leading-relaxed mb-4">{t.sidebarText}</p>
              <button className="btn-primary w-full text-sm py-2.5" onClick={() => setView('post')}>
                {t.sidebarCta}
              </button>
            </div>
          </div>
 
        </div>
      </div>
    </>
  )
}
 