import { translations } from '../utils/translations'

function CheckIcon({ color }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

const STEPS = [
  {
    num: '1',
    numBg: '#FDF3E3', numBorder: '#E8C87A', numColor: '#C8810A',
    iconBg: '#FDF3E3',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8810A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    titleKey: 'hiw1Title',
    descKey: 'hiw1Desc',
    bullets: [
      { label: 'Phone & ID verified', bg: '#E8F4ED', color: '#1A5C38', border: '#C0DDD0', dot: '#1A5C38' },
      { label: 'Ratings & reviews',   bg: '#FDF3E3', color: '#8A5800', border: '#E8C87A', dot: '#C8810A' },
      { label: 'Filter by route & date', bg: '#F5F0E8', color: '#6B6560', border: '#E0D8CC', dot: '#A09890' },
    ],
  },
  {
    num: '2',
    numBg: '#E8F4ED', numBorder: '#9FD4B8', numColor: '#1A5C38',
    iconBg: '#E8F4ED',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    titleKey: 'hiw2Title',
    descKey: 'hiw2Desc',
    bullets: [
      { label: 'Direct WhatsApp contact', bg: '#E8F4ED', color: '#1A5C38', border: '#C0DDD0', dot: '#1A5C38' },
      { label: 'Agree on your own terms', bg: '#FDF3E3', color: '#8A5800', border: '#E8C87A', dot: '#C8810A' },
      { label: 'Flexible pickup',         bg: '#F5F0E8', color: '#6B6560', border: '#E0D8CC', dot: '#A09890' },
    ],
  },
  {
    num: '3',
    numBg: '#F0EBF8', numBorder: '#C4B0E8', numColor: '#534AB7',
    iconBg: '#F0EBF8',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    titleKey: 'hiw3Title',
    descKey: 'hiw3Desc',
    bullets: [
      { label: 'Photo on delivery', bg: '#E8F4ED', color: '#1A5C38', border: '#C0DDD0', dot: '#1A5C38' },
      { label: '2–3 days average',  bg: '#FDF3E3', color: '#8A5800', border: '#E8C87A', dot: '#C8810A' },
      { label: 'Rate your GP',      bg: '#F0EBF8', color: '#534AB7', border: '#C4B0E8', dot: '#534AB7' },
    ],
  },
]

export default function HowItWorks({ lang }) {
  const isFr = lang === 'fr'

  const copy = {
    tag:   isFr ? 'Comment ça marche' : 'How it works',
    title: isFr ? <>Trois étapes pour envoyer<br /><em className="not-italic text-gold">n'importe quoi chez vous</em></> : <>Three steps to send<br /><em className="not-italic text-gold">anything home</em></>,
    sub:   isFr ? 'Pas de transporteurs, pas de délais. Juste des gens de votre communauté qui transportent des colis pour vous.' : 'No shipping companies, no long delays, no hidden fees. Just real people from your community carrying packages for each other.',
    hiw1Title: isFr ? 'Trouvez un voyageur vérifié' : 'Find a verified traveler',
    hiw1Desc:  isFr ? 'Parcourez les GPs vérifiés voyageant vers votre destination. Chaque voyageur est vérifié par téléphone avant d\'apparaître sur Yobbu. Filtrez par route, date et espace disponible.' : 'Browse verified GPs traveling to your destination. Every traveler is phone-verified before their listing appears on Yobbu. Filter by route, date, available luggage space, and price per kg to find your perfect match.',
    hiw2Title: isFr ? 'Contactez via WhatsApp' : 'Contact & agree on WhatsApp',
    hiw2Desc:  isFr ? 'Une fois que vous trouvez un voyageur de confiance, contactez-le directement sur WhatsApp. Discutez des détails, convenez d\'un prix et organisez un lieu de récupération.' : 'Once you find a traveler you trust, contact them directly on WhatsApp. Discuss the package details, agree on a price, and arrange a pickup location. No middlemen, no in-app chat.',
    hiw3Title: isFr ? 'Votre famille le reçoit' : 'Your family receives it',
    hiw3Desc:  isFr ? 'Le voyageur livre votre colis directement à votre famille. La plupart des livraisons ont lieu dans les 2 à 3 jours suivant l\'atterrissage. Laissez un avis après la livraison.' : 'The traveler delivers your package directly to your family. Most deliveries happen within 2–3 days of the traveler landing. After delivery, leave a review to help the next person in the community.',
  }

  return (
    <section className="py-16 px-8 bg-sand border-b border-sand-200">
      <div className="max-w-3xl mx-auto">
        <div className="inline-block text-xs font-bold bg-gold-light text-gold-dark rounded-full px-4 py-1.5 mb-4 tracking-wider uppercase border border-amber-200">
          {copy.tag}
        </div>
        <h2 className="font-display text-4xl font-bold text-ink leading-tight mb-3">
          {copy.title}
        </h2>
        <p className="text-base text-ink-200 leading-relaxed max-w-lg mb-14">{copy.sub}</p>

        <div className="flex flex-col">
          {STEPS.map((step, i) => (
            <div key={step.num} className="grid gap-0" style={{ gridTemplateColumns: '56px 1fr' }}>
              {/* Left — number + line */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                  style={{ background: step.numBg, border: `1.5px solid ${step.numBorder}` }}>
                  <span className="font-display text-lg font-bold" style={{ color: step.numColor }}>{step.num}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-px flex-1 min-h-6 my-1" style={{ background: '#E8DDD0' }} />
                )}
              </div>

              {/* Right — content */}
              <div className={`pl-7 ${i < STEPS.length - 1 ? 'pb-12' : 'pb-0'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: step.iconBg }}>
                    {step.icon}
                  </div>
                  <h3 className="font-display text-xl font-bold text-ink">{copy[step.titleKey]}</h3>
                </div>
                <p className="text-sm text-ink-200 leading-relaxed mb-4 max-w-xl">{copy[step.descKey]}</p>
                <div className="flex flex-wrap gap-2">
                  {step.bullets.map((b) => (
                    <span key={b.label} className="inline-flex items-center gap-1.5 text-xs font-medium rounded-md px-3 py-1.5"
                      style={{ background: b.bg, color: b.color, border: `1px solid ${b.border}` }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: b.dot }} />
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}