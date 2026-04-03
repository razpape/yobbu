import { translations } from '../utils/translations'

const steps = [
  { icon: '📦', bg: 'bg-gold-light', titleKey: 'hiw1Title', textKey: 'hiw1Text' },
  { icon: '💬', bg: 'bg-forest-light', titleKey: 'hiw2Title', textKey: 'hiw2Text' },
  { icon: '✅', bg: 'bg-orange-50', titleKey: 'hiw3Title', textKey: 'hiw3Text' },
]

export default function HowItWorks({ lang }) {
  const t = translations[lang]

  return (
    <section className="bg-sand-100 border-b border-sand-200 px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-ink mb-1">{t.hiwTitle}</h2>
        <p className="text-sm text-ink-200 mb-8">{t.hiwSub}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map(({ icon, bg, titleKey, textKey }) => (
            <div key={titleKey} className="bg-sand rounded-2xl border border-sand-200 p-5">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center text-lg mb-3`}>
                {icon}
              </div>
              <div className="text-sm font-semibold text-ink mb-1.5">{t[titleKey]}</div>
              <div className="text-xs text-ink-200 leading-relaxed">{t[textKey]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
