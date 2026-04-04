import { useState } from 'react'

const FAQS = {
  en: [
    { q: 'What is a GP?', a: 'GP stands for "Going Places" — a person from the community who is traveling to West Africa and has extra luggage space. They carry packages for senders and get paid for it. It\'s a tradition that has existed for decades in the diaspora.' },
    { q: 'Is it safe to send packages with a stranger?', a: 'Every GP on Yobbu is phone-verified before they can list a trip. ID-verified GPs carry a special shield badge. You can also read reviews from previous senders before deciding who to trust.' },
    { q: 'How much does it cost?', a: 'Prices are set by each traveler, typically between $2.50 and $5 per kg. You negotiate directly with the GP on WhatsApp. Yobbu is currently free to use — we don\'t take a commission yet.' },
    { q: 'What can I send?', a: 'Most GPs accept clothes, food items, medicine, electronics, and personal gifts. Always discuss what you\'re sending with the GP before handing over the package. Illegal items are strictly prohibited.' },
    { q: 'How do I pay the GP?', a: 'Payment is agreed directly between you and the GP — most use CashApp, Zelle, Wave, or cash. Yobbu does not handle payments yet. This will change in a future update.' },
    { q: 'I\'m a traveler — how do I list my trip?', a: 'Click "Post a trip" in the navigation, create a free account, and fill in your route, date, and available space. Your listing will appear on the browse page immediately.' },
  ],
  fr: [
    { q: 'Qu\'est-ce qu\'un GP?', a: 'GP signifie "Going Places" — une personne de la communauté qui voyage en Afrique de l\'Ouest et dispose d\'espace supplémentaire dans ses bagages. Elle transporte des colis pour les expéditeurs et est rémunérée pour cela.' },
    { q: 'Est-il sûr d\'envoyer des colis avec un inconnu?', a: 'Chaque GP sur Yobbu est vérifié par téléphone avant de pouvoir publier un voyage. Les GPs vérifiés par pièce d\'identité portent un badge bouclier spécial. Vous pouvez également lire les avis des expéditeurs précédents.' },
    { q: 'Combien ça coûte?', a: 'Les prix sont fixés par chaque voyageur, généralement entre 2,50 $ et 5 $ par kg. Vous négociez directement avec le GP sur WhatsApp. Yobbu est actuellement gratuit.' },
    { q: 'Que puis-je envoyer?', a: 'La plupart des GPs acceptent les vêtements, les aliments, les médicaments, l\'électronique et les cadeaux personnels. Discutez toujours de ce que vous envoyez avec le GP. Les articles illégaux sont strictement interdits.' },
    { q: 'Comment payer le GP?', a: 'Le paiement est convenu directement entre vous et le GP — la plupart utilisent CashApp, Zelle, Wave ou espèces. Yobbu ne gère pas encore les paiements.' },
    { q: 'Je suis voyageur — comment publier mon voyage?', a: 'Cliquez sur "Poster un voyage", créez un compte gratuit et remplissez votre route, date et espace disponible. Votre annonce apparaîtra immédiatement.' },
  ],
}

export default function FAQ({ lang }) {
  const [open, setOpen] = useState(null)
  const isFr = lang === 'fr'
  const faqs = FAQS[lang]

  return (
    <section className="py-16 px-8 bg-sand-100 border-b border-sand-200">
      <div className="max-w-2xl mx-auto">
        <div className="inline-block text-xs font-bold bg-gold-light text-gold-dark rounded-full px-4 py-1.5 mb-4 tracking-wider uppercase border border-amber-200">
          {isFr ? 'Questions fréquentes' : 'FAQ'}
        </div>
        <h2 className="font-display text-3xl font-bold text-ink mb-10">
          {isFr ? 'Questions courantes' : 'Common questions'}
        </h2>

        <div className="flex flex-col">
          {faqs.map((f, i) => (
            <div key={i} className="border-b border-sand-200 py-5 last:border-none">
              <button
                className="w-full flex items-center justify-between text-left gap-4"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-semibold text-ink">{f.q}</span>
                <span className={`text-ink-300 transition-transform duration-200 flex-shrink-0 ${open === i ? 'rotate-180' : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </span>
              </button>
              {open === i && (
                <p className="text-sm text-ink-200 leading-relaxed mt-3 pr-8">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}