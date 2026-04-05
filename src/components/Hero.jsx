import { useState } from 'react'

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

export default function Hero({ lang, setView, onSearch }) {
  const isFr = lang === 'fr'
  const [dest, setDest] = useState('')
  const [from, setFrom] = useState('')

  const handleSearch = () => {
    onSearch({ dest, from })
    setView('browse')
  }

  return (
    <section style={{ padding: '64px 48px', background: '#FDFAF6', borderBottom: '1px solid #E8E0D4' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>

        {/* Tag */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, background: '#FDF3E3', color: '#8A5800', borderRadius: 20, padding: '5px 14px', marginBottom: 20, border: '1px solid #F0C878', letterSpacing: '.02em' }}>
          🌍 {isFr ? 'Approuvé par la diaspora ouest-africaine' : 'Trusted by the West African diaspora'}
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 52, fontWeight: 700, color: '#1C1A17', lineHeight: 1.12, marginBottom: 16, letterSpacing: '-.5px' }}>
          {isFr ? <>Envoyez vos colis <em style={{ fontStyle: 'italic', color: '#C8810A' }}>chez vous,</em><br />avec des personnes de confiance.</> : <>Send packages <em style={{ fontStyle: 'italic', color: '#C8810A' }}>home,</em><br />through people you trust.</>}
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: 16, color: '#6B6560', lineHeight: 1.75, marginBottom: 32, maxWidth: 580, margin: '0 auto 32px' }}>
          {isFr ? "Trouvez des voyageurs vérifiés allant à Dakar, Conakry et ailleurs. Votre colis voyage avec une vraie personne de votre communauté." : "Find verified travelers going to Dakar, Conakry, and beyond. Your package travels with a real person — not a faceless courier."}
        </p>

        {/* Search card */}
        <div style={{ background: '#fff', border: '1px solid #E8DDD0', borderRadius: 20, padding: 8, maxWidth: 680, margin: '0 auto 12px', boxShadow: '0 4px 20px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            <div style={{ flex: 1, padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 3, borderRadius: 14, cursor: 'pointer' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#A09890', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                {isFr ? 'Où?' : 'Where to?'}
              </div>
              <select value={dest} onChange={e => setDest(e.target.value)}
                style={{ fontSize: 14, fontWeight: 600, color: '#1C1A17', border: 'none', outline: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', width: '100%' }}>
                {DESTINATIONS.map(d => <option key={d.value} value={d.value}>{d.label[lang]}</option>)}
              </select>
            </div>
            <div style={{ width: 1, background: '#E8DDD0', margin: '8px 0', flexShrink: 0 }} />
            <div style={{ flex: 1, padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 3, borderRadius: 14, cursor: 'pointer' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#A09890', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                {isFr ? 'Depuis' : 'Departing from'}
              </div>
              <select value={from} onChange={e => setFrom(e.target.value)}
                style={{ fontSize: 14, fontWeight: 600, color: '#1C1A17', border: 'none', outline: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', width: '100%' }}>
                {FROM_CITIES.map(c => <option key={c.value} value={c.value}>{c.label[lang]}</option>)}
              </select>
            </div>
            <button onClick={handleSearch}
              style={{ background: '#C8810A', color: '#fff', border: 'none', borderRadius: 14, padding: '0 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 8, margin: 2, whiteSpace: 'nowrap', transition: 'background .15s' }}>
              {isFr ? 'Trouver' : 'Find travelers'}
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>→</span>
            </button>
          </div>
        </div>

        {/* Trust line */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 36 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1A5C38', flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: '#A09890' }}>
            {isFr
              ? <span>Chaque voyageur est <span style={{ color: '#1A5C38', fontWeight: 600 }}>vérifié par téléphone</span> — les GPs vérifiés portent un badge bouclier.</span>
              : <span>Every traveler is <span style={{ color: '#1A5C38', fontWeight: 600 }}>phone verified</span> — ID-verified GPs carry a shield badge.</span>}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', paddingTop: 24, borderTop: '1px solid #E8E0D4', maxWidth: 600, margin: '0 auto' }}>
          {[
            { n: '247',  l: isFr ? 'livrés'    : 'delivered' },
            { n: '98%',  l: isFr ? 'réussite'  : 'success rate' },
            { n: '500+', l: isFr ? 'familles'  : 'families' },
            { n: '4',    l: isFr ? 'routes'    : 'routes' },
          ].map(({ n, l }, i) => (
            <div key={l} style={{ flex: 1, textAlign: 'center', padding: '0 16px', borderRight: i < 3 ? '1px solid #E8E0D4' : 'none' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: '#C8810A', lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 11, color: '#A09890', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}