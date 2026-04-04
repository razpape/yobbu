import { useState } from 'react'
import { translations } from '../utils/translations'

const DESTINATIONS = [
  { value: '',        label: { en: 'Select destination',     fr: 'Choisir destination' } },
  { value: 'Dakar',   label: { en: 'Dakar, Senegal',         fr: 'Dakar, Sénégal' } },
  { value: 'Conakry', label: { en: 'Conakry, Guinea',        fr: 'Conakry, Guinée' } },
  { value: 'Abidjan', label: { en: "Abidjan, Côte d'Ivoire", fr: "Abidjan, Côte d'Ivoire" } },
  { value: 'Bamako',  label: { en: 'Bamako, Mali',           fr: 'Bamako, Mali' } },
  { value: 'Lomé',    label: { en: 'Lomé, Togo',             fr: 'Lomé, Togo' } },
]

const FROM_CITIES = [
  { value: '',              label: { en: 'Any city',      fr: 'Toute ville' } },
  { value: 'New York',      label: { en: 'New York',      fr: 'New York' } },
  { value: 'Paris',         label: { en: 'Paris',         fr: 'Paris' } },
  { value: 'Washington DC', label: { en: 'Washington DC', fr: 'Washington DC' } },
  { value: 'Atlanta',       label: { en: 'Atlanta',       fr: 'Atlanta' } },
  { value: 'Houston',       label: { en: 'Houston',       fr: 'Houston' } },
]

function IllustrationCard({ isFr }) {
  return (
    <div className="w-full max-w-md rounded-3xl p-7 border border-amber-200 relative overflow-hidden"
      style={{ background: '#FDF3E3' }}>
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(200,129,10,.04) 20px,rgba(200,129,10,.04) 40px)'
      }} />

      <div className="relative z-10">
        {/* Cities */}
        <div className="flex items-end justify-between mb-3">
          <div className="bg-white rounded-2xl px-4 py-3 border border-sand-200 text-center min-w-24">
            <div className="text-xl mb-1">🇺🇸</div>
            <div className="text-sm font-bold text-ink">New York</div>
            <div className="text-xs text-ink-300">{isFr ? 'Départ' : 'Departure'}</div>
          </div>
          <div className="text-2xl pb-3">✈️</div>
          <div className="bg-white rounded-2xl px-4 py-3 border border-sand-200 text-center min-w-24">
            <div className="text-xl mb-1">🇸🇳</div>
            <div className="text-sm font-bold text-ink">Dakar</div>
            <div className="text-xs text-ink-300">{isFr ? 'Arrivée' : 'Destination'}</div>
          </div>
        </div>

        {/* Route line */}
        <div className="relative h-0.5 my-4" style={{
          background: 'repeating-linear-gradient(90deg,#C8810A 0,#C8810A 8px,transparent 8px,transparent 16px)'
        }}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-base">📦</div>
        </div>

        {/* GP card */}
        <div className="bg-white rounded-2xl p-3 border border-sand-200 flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gold-light flex items-center justify-center text-xs font-bold text-gold-dark flex-shrink-0">AM</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-ink">Aminata M.</div>
            <div className="text-xs text-ink-300">{isFr ? 'Voyage le 12 mai · 10 kg' : 'Traveling May 12 · 10 kg space'}</div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold bg-gold-light text-gold-dark rounded px-1.5 py-0.5 border border-amber-200">GP</span>
            <div className="w-2 h-2 rounded-full bg-forest flex-shrink-0" />
          </div>
        </div>

        {/* Package status */}
        <div className="bg-white rounded-2xl p-3 border border-sand-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-gold-light rounded-xl flex items-center justify-center text-lg flex-shrink-0">📦</div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-ink">{isFr ? 'Votre colis' : 'Your package'}</div>
            <div className="text-xs text-ink-300">{isFr ? 'En route vers Dakar' : 'In transit to Dakar'}</div>
          </div>
          <span className="text-xs font-bold bg-forest-light text-forest rounded-full px-2.5 py-1 whitespace-nowrap">
            {isFr ? 'En route' : 'On the way'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Hero({ lang, setView, onSearch }) {
  const t = translations[lang]
  const isFr = lang === 'fr'
  const [dest, setDest] = useState('')
  const [from, setFrom] = useState('')

  const handleSearch = () => {
    onSearch({ dest, from })
    setView('browse')
  }

  return (
    <section className="px-8 py-16 bg-sand border-b border-sand-200">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold bg-gold-light text-gold-dark rounded-full px-4 py-1.5 mb-5 border border-amber-200 tracking-wide">
              🌍 {isFr ? 'Approuvé par la diaspora ouest-africaine' : 'Trusted by the West African diaspora'}
            </div>

            <h1 className="font-display font-bold text-ink leading-tight mb-4" style={{ fontSize: 44, letterSpacing: '-.5px' }}>
              {isFr
                ? <>{`Envoyez vos colis `}<em className="not-italic text-gold">chez vous,</em><br />{`avec des personnes de confiance.`}</>
                : <>Send packages <em className="not-italic text-gold">home,</em><br />through people you trust.</>}
            </h1>

            <p className="text-base text-ink-200 leading-relaxed max-w-lg mb-8">
              {isFr
                ? "Trouvez des voyageurs vérifiés allant à Dakar, Conakry et ailleurs. Votre colis voyage avec une vraie personne de votre communauté."
                : "Find verified travelers going to Dakar, Conakry, and beyond. Your package travels with a real person — not a faceless courier."}
            </p>

            {/* Search card */}
            <div className="bg-white border border-sand-200 rounded-2xl p-2 max-w-lg" style={{ boxShadow: '0 4px 20px rgba(0,0,0,.06)' }}>
              <div className="flex items-stretch">
                <div className="flex-1 px-4 py-3 flex flex-col gap-1 rounded-2xl hover:bg-sand transition-colors cursor-pointer">
                  <div className="text-[9px] font-bold text-ink-300 uppercase tracking-widest">
                    {isFr ? 'Où?' : 'Where to?'}
                  </div>
                  <select value={dest} onChange={e => setDest(e.target.value)}
                    className="text-sm font-semibold text-ink border-none outline-none bg-transparent cursor-pointer"
                    style={{ fontFamily: 'inherit' }}>
                    {DESTINATIONS.map(d => <option key={d.value} value={d.value}>{d.label[lang]}</option>)}
                  </select>
                </div>
                <div className="w-px bg-sand-200 my-2 flex-shrink-0" />
                <div className="flex-1 px-4 py-3 flex flex-col gap-1 rounded-2xl hover:bg-sand transition-colors cursor-pointer">
                  <div className="text-[9px] font-bold text-ink-300 uppercase tracking-widest">
                    {isFr ? 'Depuis' : 'Departing from'}
                  </div>
                  <select value={from} onChange={e => setFrom(e.target.value)}
                    className="text-sm font-semibold text-ink border-none outline-none bg-transparent cursor-pointer"
                    style={{ fontFamily: 'inherit' }}>
                    {FROM_CITIES.map(c => <option key={c.value} value={c.value}>{c.label[lang]}</option>)}
                  </select>
                </div>
                <button onClick={handleSearch}
                  className="bg-gold text-white border-none rounded-2xl px-5 text-sm font-bold cursor-pointer flex items-center gap-2 hover:bg-gold-dark transition-colors m-0.5 whitespace-nowrap"
                  style={{ fontFamily: 'inherit' }}>
                  {isFr ? 'Trouver' : 'Find travelers'}
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ background: 'rgba(255,255,255,.2)' }}>→</span>
                </button>
              </div>
            </div>

            {/* Trust line */}
            <div className="flex items-center gap-2 mt-3 max-w-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-forest flex-shrink-0" />
              <p className="text-xs text-ink-300">
                {isFr
                  ? <span>Chaque voyageur est <span className="text-forest font-semibold">vérifié par téléphone</span> — les GPs vérifiés portent un badge bouclier.</span>
                  : <span>Every traveler is <span className="text-forest font-semibold">phone verified</span> — ID-verified GPs carry a shield badge.</span>}
              </p>
            </div>

            {/* Stats */}
            <div className="flex mt-8 pt-6 border-t border-sand-200 max-w-lg">
              {[
                { n: '247',  l: isFr ? 'livrés'           : 'delivered' },
                { n: '98%',  l: isFr ? 'réussite'         : 'success rate' },
                { n: '500+', l: isFr ? 'familles'         : 'families' },
                { n: '4',    l: isFr ? 'routes'           : 'routes' },
              ].map(({ n, l }, i) => (
                <div key={l} className={`flex-1 text-center px-4 ${i < 3 ? 'border-r border-sand-200' : ''} ${i === 0 ? 'pl-0 text-left' : ''}`}>
                  <div className="font-display text-2xl font-bold text-gold leading-none">{n}</div>
                  <div className="text-xs text-ink-300 mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="hidden lg:flex items-center justify-center">
            <img src="/packages.png" alt="Packages ready to be sent" className="w-full max-w-md object-contain drop-shadow-sm" />
          </div>

        </div>
      </div>
    </section>
  )
}