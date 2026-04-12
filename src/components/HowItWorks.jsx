import { useState } from 'react'

const SENDER_STEPS = {
  en: [
    {
      num: '1', color: '#C8891C', bg: '#FFF8EB',
      title: 'Search your route',
      desc: 'Enter where you are and where your family is. Yobbu shows you all verified GPs traveling that route — by plane or container — with their dates, capacity, and price per kg.',
      bullets: ['Filter by date & space', 'Plane or boat groupage', 'See full GP profile'],
    },
    {
      num: '2', color: '#2D8B4E', bg: '#F0FAF4',
      title: 'Contact directly on WhatsApp',
      desc: 'No middleman. You pick the GP you trust, click WhatsApp, and work out the details directly — price, drop-off address, what you\'re sending. Everything on your terms.',
      bullets: ['One click to WhatsApp', 'Agree your own price', 'Flexible drop-off'],
    },
    {
      num: '3', color: '#534AB7', bg: '#F3F2FD',
      title: 'Your family receives it',
      desc: 'The GP delivers to your family in their city. Most deliveries happen within 2–3 days of landing. Quick, personal, and a fraction of the cost of a shipping company.',
      bullets: ['Direct home delivery', '2–3 days after landing', 'Leave a review'],
    },
  ],
  fr: [
    {
      num: '1', color: '#C8891C', bg: '#FFF8EB',
      title: 'Cherchez votre route',
      desc: 'Entrez votre ville de départ et la destination. Yobbu vous montre tous les GPs vérifiés sur cette route — en avion ou en groupage conteneur — avec leurs dates, capacité et prix au kilo.',
      bullets: ['Filtrer par date & espace', 'Avion ou groupage bateau', 'Voir le profil complet'],
    },
    {
      num: '2', color: '#2D8B4E', bg: '#F0FAF4',
      title: 'Contactez sur WhatsApp',
      desc: 'Pas d\'intermédiaire. Vous choisissez le GP en qui vous avez confiance, cliquez WhatsApp, et organisez tout directement — prix, adresse de dépôt, ce que vous envoyez.',
      bullets: ['Un clic vers WhatsApp', 'Négociez votre prix', 'Remise flexible'],
    },
    {
      num: '3', color: '#534AB7', bg: '#F3F2FD',
      title: 'Votre famille le reçoit',
      desc: 'Le GP livre chez votre famille dans leur ville. La plupart des livraisons ont lieu dans les 2–3 jours après l\'atterrissage. Rapide, personnel et bien moins cher qu\'un transporteur.',
      bullets: ['Livraison à domicile', '2–3 jours après atterrissage', 'Laisser un avis'],
    },
  ],
}

const GP_STEPS = {
  en: [
    {
      num: '1', color: '#C8891C', bg: '#FFF8EB',
      title: 'Post your trip',
      desc: 'You\'re already traveling. Tell Yobbu your route, date, how many kg you can carry, and your price. Takes 2 minutes. Whether you\'re flying or running a container groupage — both work.',
      bullets: ['Plane or container', 'Set your own price', 'Full address for groupage'],
    },
    {
      num: '2', color: '#2D8B4E', bg: '#F0FAF4',
      title: 'Senders find and contact you',
      desc: 'Verified senders browse your listing and reach out directly on WhatsApp. You decide who you work with, what you accept, and how you arrange the pickup. You\'re in control.',
      bullets: ['Senders come to you', 'You choose who you work with', 'Direct WhatsApp only'],
    },
    {
      num: '3', color: '#534AB7', bg: '#F3F2FD',
      title: 'Deliver & get paid',
      desc: 'Deliver the package when you land. Payment is agreed directly with the sender — cash, mobile money, whatever works for both of you. Yobbu never touches the money.',
      bullets: ['You set payment terms', 'Cash or mobile money', 'Build your reputation'],
    },
  ],
  fr: [
    {
      num: '1', color: '#C8891C', bg: '#FFF8EB',
      title: 'Publiez votre voyage',
      desc: 'Vous voyagez déjà. Indiquez votre route, la date, combien de kg vous pouvez transporter et votre prix. Ça prend 2 minutes. En avion ou en groupage conteneur — les deux fonctionnent.',
      bullets: ['Avion ou conteneur', 'Fixez votre propre prix', 'Adresse complète pour groupage'],
    },
    {
      num: '2', color: '#2D8B4E', bg: '#F0FAF4',
      title: 'Les expéditeurs vous trouvent',
      desc: 'Les expéditeurs vérifiés parcourent votre annonce et vous contactent directement sur WhatsApp. Vous choisissez avec qui vous travaillez, ce que vous acceptez, et comment organiser la remise.',
      bullets: ['Les expéditeurs viennent à vous', 'Vous choisissez vos clients', 'WhatsApp uniquement'],
    },
    {
      num: '3', color: '#534AB7', bg: '#F3F2FD',
      title: 'Livrez et soyez payé',
      desc: 'Livrez le colis à l\'arrivée. Le paiement est convenu directement avec l\'expéditeur — espèces, mobile money, ce qui vous convient. Yobbu ne touche jamais l\'argent.',
      bullets: ['Vous fixez les modalités', 'Espèces ou mobile money', 'Construisez votre réputation'],
    },
  ],
}

const WHY = {
  en: [
    { label: 'Facebook groups', items: ['Posts get buried instantly', 'No search by route or date', 'Zero verification — anyone can post', 'Negotiate in public comments', 'No profile, no history, no trust'] },
    { label: 'Yobbu', items: ['Search by route, date, capacity', 'Plane and boat listings side by side', 'Phone-verified GPs only', 'Private WhatsApp contact', 'Full GP profile + reviews'], highlight: true },
  ],
  fr: [
    { label: 'Groupes Facebook', items: ['Les posts disparaissent vite', 'Pas de recherche par route ou date', 'Aucune vérification — n\'importe qui peut poster', 'Négociation en commentaires publics', 'Pas de profil, pas d\'historique, pas de confiance'] },
    { label: 'Yobbu', items: ['Recherche par route, date, capacité', 'Avion et bateau côte à côte', 'GPs vérifiés par téléphone uniquement', 'Contact WhatsApp privé', 'Profil complet + avis'], highlight: true },
  ],
}

const colors = { '#C8891C': '#C8891C', '#2D8B4E': '#2D8B4E', '#534AB7': '#534AB7' }

export default function HowItWorks({ lang }) {
  const isFr = lang === 'fr'
  const [side, setSide] = useState('sender')

  const steps = side === 'sender' ? SENDER_STEPS[isFr ? 'fr' : 'en'] : GP_STEPS[isFr ? 'fr' : 'en']
  const why   = WHY[isFr ? 'fr' : 'en']

  return (
    <>
      <style>{`
        .hiw-bullet { transition: transform .15s; }
        .hiw-bullet:hover { transform: translateY(-1px); }
        .hiw-toggle-btn { transition: all .2s; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; }
        @media (max-width: 768px) {
          .hiw-section { padding: 56px 20px !important; }
          .hiw-why-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <section className="hiw-section" style={{ padding: '80px 48px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,.06)', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#C8891C', background: '#FFF8EB', border: '1px solid #F0C878', borderRadius: 20, display: 'inline-block', padding: '4px 14px', marginBottom: 16 }}>
              {isFr ? 'Comment ça marche' : 'How it works'}
            </div>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(26px, 3vw, 40px)', color: '#1A1710', lineHeight: 1.12, letterSpacing: '-.5px', marginBottom: 12, marginTop: 0 }}>
              {isFr ? <>Simple pour tout le monde,<br /><em style={{ color: '#C8891C' }}>des deux côtés</em></> : <>Simple for everyone,<br /><em style={{ color: '#C8891C' }}>on both sides</em></>}
            </h2>
            <p style={{ fontSize: 15, color: '#8A8070', lineHeight: 1.65, maxWidth: 500, margin: 0 }}>
              {isFr
                ? "Que vous envoyiez un colis ou que vous voyagiez avec de l'espace, Yobbu vous met en relation directement."
                : "Whether you're sending a package or traveling with space to spare, Yobbu connects you directly."}
            </p>
          </div>

          {/* Toggle */}
          <div style={{ display: 'inline-flex', background: '#F5F3EF', borderRadius: 12, padding: 4, marginBottom: 44, gap: 4 }}>
            {[
              { key: 'sender', en: 'I want to send a package', fr: "J'envoie un colis" },
              { key: 'gp',     en: "I'm a GP / carrier",       fr: 'Je suis GP / transporteur' },
            ].map(opt => (
              <button key={opt.key} className="hiw-toggle-btn"
                onClick={() => setSide(opt.key)}
                style={{
                  padding: '10px 20px', borderRadius: 9, fontSize: 13, fontWeight: 700,
                  background: side === opt.key ? '#fff' : 'transparent',
                  color: side === opt.key ? '#1A1710' : '#8A8070',
                  boxShadow: side === opt.key ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
                }}>
                {isFr ? opt.fr : opt.en}
              </button>
            ))}
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {steps.map((step, i) => (
              <div key={step.num} style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: step.bg, border: `1.5px solid ${step.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: step.color }}>{step.num}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ width: 1, flex: 1, minHeight: 24, background: 'rgba(0,0,0,.08)', margin: '6px 0' }} />
                  )}
                </div>
                <div style={{ paddingLeft: 24, paddingBottom: i < steps.length - 1 ? 44 : 0 }}>
                  <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 21, color: '#1A1710', lineHeight: 1.2, marginBottom: 10 }}>
                    {step.title}
                  </div>
                  <p style={{ fontSize: 14, color: '#8A8070', lineHeight: 1.75, marginBottom: 14, maxWidth: 540 }}>
                    {step.desc}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {step.bullets.map((b, j) => (
                      <span key={b} className="hiw-bullet" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, borderRadius: 6, padding: '5px 12px', background: '#FDFBF7', border: '1px solid rgba(0,0,0,.08)', color: '#3D3829' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: step.color, display: 'inline-block', flexShrink: 0 }} />
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Why not Facebook */}
          <div style={{ marginTop: 64, paddingTop: 48, borderTop: '1px solid rgba(0,0,0,.06)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#C8891C', marginBottom: 12 }}>
              {isFr ? 'Pourquoi pas un groupe Facebook ?' : 'Why not just a Facebook group?'}
            </div>
            <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 26, color: '#1A1710', marginBottom: 28, marginTop: 0 }}>
              {isFr ? 'Facebook, c\'est du bruit. Yobbu, c\'est de la clarté.' : 'Facebook is noise. Yobbu is clarity.'}
            </h3>
            <div className="hiw-why-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {why.map(col => (
                <div key={col.label} style={{
                  borderRadius: 16, padding: '20px 22px',
                  background: col.highlight ? '#FFF8EB' : '#F5F3EF',
                  border: `1.5px solid ${col.highlight ? '#F0C878' : 'rgba(0,0,0,.06)'}`,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: col.highlight ? '#C8891C' : '#8A8070', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {col.highlight && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C8891C', display: 'inline-block' }} />}
                    {col.label}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {col.items.map(item => (
                      <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span style={{ fontSize: 13, color: col.highlight ? '#C8891C' : '#B0A090', flexShrink: 0, marginTop: 1 }}>
                          {col.highlight ? '✓' : '✕'}
                        </span>
                        <span style={{ fontSize: 13, color: col.highlight ? '#3D3829' : '#A09080', lineHeight: 1.5 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
