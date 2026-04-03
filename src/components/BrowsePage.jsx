import { useState } from 'react'
import GPCard from './GPCard'
import { SEED_TRIPS, DESTINATIONS } from '../data/trips'
import { translations } from '../utils/translations'

export default function BrowsePage({ lang, setView, trips, setTrips }) {
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
      {/* Trust strip */}
      <div className="bg-forest-light border-b border-green-200 px-8 py-2.5 flex items-center gap-2">
        <span className="text-sm">🛡</span>
        <span className="text-xs font-medium text-forest">{t.browseTrust}</span>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <span className="section-label">{t.countLabel(filtered.length)}</span>
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

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-ink-300 text-sm">{t.noResults}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map((gp) => (
                  <GPCard key={gp.id} gp={gp} lang={lang} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-sand rounded-2xl border border-sand-200 p-5">
              <div className="text-sm font-semibold text-ink mb-2">{t.sidebarTitle}</div>
              <p className="text-xs text-ink-200 leading-relaxed mb-4">{t.sidebarText}</p>
              <button
                className="btn-primary w-full text-sm py-2.5"
                onClick={() => setView('post')}
              >
                {t.sidebarCta}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
