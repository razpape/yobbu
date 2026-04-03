import { translations } from '../utils/translations'

export default function Hero({ lang, setView }) {
  const t = translations[lang]

  return (
    <>
      {/* Hero */}
      <section className="bg-sand border-b border-sand-200 px-8 py-14">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold bg-gold-light text-gold-dark rounded-full px-4 py-1.5 mb-5 border border-amber-200">
            {t.heroTag}
          </div>
          <h1 className="font-display text-5xl font-bold leading-tight text-ink mb-4 max-w-2xl">
            {t.heroTitle1}{' '}
            <em className="text-gold not-italic">{t.heroTitleEm}</em>
            <br />
            {t.heroTitle2}
          </h1>
          <p className="text-base text-ink-200 leading-relaxed max-w-lg mb-8">
            {t.heroSub}
          </p>
          <div className="flex gap-3 flex-wrap mb-10">
            <button className="btn-primary text-base px-7 py-3" onClick={() => setView('browse')}>
              {t.heroCta1}
            </button>
            <button className="btn-secondary text-base px-7 py-3" onClick={() => setView('post')}>
              {t.heroCta2}
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-10 pt-8 border-t border-sand-200">
            {[
              { n: '247',  l: t.stat1 },
              { n: '98%',  l: t.stat2 },
              { n: '500+', l: t.stat3 },
              { n: '4',    l: t.stat4 },
            ].map(({ n, l }) => (
              <div key={l}>
                <div className="font-display text-3xl font-bold text-gold">{n}</div>
                <div className="text-xs text-ink-300 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div className="bg-forest-light border-b border-green-200 px-8 py-2.5 flex items-center gap-2">
        <span className="text-sm">🛡</span>
        <span className="text-xs font-medium text-forest">{t.trustStrip}</span>
      </div>
    </>
  )
}
