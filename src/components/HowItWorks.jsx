export default function HowItWorks({ lang }) {
  const isFr = lang === 'fr'

  const steps = [
    {
      num: '1',
      color: '#C8891C',
      bg: '#FFF8EB',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8891C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      ),
      title: isFr ? 'Trouvez un voyageur vérifié' : 'Find a verified traveler',
      desc: isFr
        ? "Parcourez les GPs vérifiés voyageant vers votre destination. Chaque voyageur est vérifié par téléphone avant d'apparaître sur Yobbu. Filtrez par route, date et espace disponible."
        : "Browse verified GPs traveling to your destination. Every traveler is phone-verified before their listing appears on Yobbu. Filter by route, date, and available luggage space.",
      bullets: isFr
        ? ['Vérifié par téléphone & ID', 'Notes & avis', 'Filtrer par route & date']
        : ['Phone & ID verified', 'Ratings & reviews', 'Filter by route & date'],
      bulletColors: ['#2D8B4E', '#C8891C', '#8A8070'],
    },
    {
      num: '2',
      color: '#2D8B4E',
      bg: '#F0FAF4',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D8B4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      title: isFr ? 'Contactez via WhatsApp' : 'Contact & agree on WhatsApp',
      desc: isFr
        ? "Une fois que vous trouvez un voyageur de confiance, contactez-le directement sur WhatsApp. Convenez du prix, du lieu de remise et des détails du colis. Sans intermédiaire."
        : "Once you find a traveler you trust, contact them directly on WhatsApp. Discuss details, agree on a price, and arrange pickup — all on your terms. No middlemen.",
      bullets: isFr
        ? ['Contact WhatsApp direct', 'Convenez de vos conditions', 'Remise flexible']
        : ['Direct WhatsApp contact', 'Agree on your own terms', 'Flexible pickup'],
      bulletColors: ['#2D8B4E', '#C8891C', '#8A8070'],
    },
    {
      num: '3',
      color: '#534AB7',
      bg: '#F3F2FD',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      title: isFr ? 'Votre famille le reçoit' : 'Your family receives it',
      desc: isFr
        ? "Le voyageur livre votre colis directement à votre famille. La plupart des livraisons ont lieu dans les 2 à 3 jours suivant l'atterrissage. Laissez un avis après livraison."
        : "The traveler delivers your package directly to your family. Most deliveries happen within 2–3 days of landing. Leave a review to help the next person in the community.",
      bullets: isFr
        ? ['Photo à la livraison', '2–3 jours en moyenne', 'Laisser un avis']
        : ['Photo on delivery', '2–3 days average', 'Leave a review'],
      bulletColors: ['#2D8B4E', '#C8891C', '#534AB7'],
    },
  ]

  return (
    <>
      <style>{`
        .hiw-bullet { transition: transform .15s; }
        .hiw-bullet:hover { transform: translateY(-1px); }
        @media (max-width: 768px) {
          .hiw-section { padding: 60px 24px !important; }
        }
      `}</style>
      <section className="hiw-section" style={{ padding: '80px 48px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,.06)', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#C8891C', marginBottom: 14, background: '#FFF8EB', border: '1px solid #F0C878', borderRadius: 20, display: 'inline-block', padding: '4px 14px' }}>
              {isFr ? 'Comment ça marche' : 'How it works'}
            </div>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(28px, 3vw, 42px)', color: '#1A1710', lineHeight: 1.12, letterSpacing: '-.5px', marginBottom: 14, marginTop: 12 }}>
              {isFr
                ? <>Trois étapes pour envoyer <em style={{ fontStyle: 'italic', color: '#C8891C' }}>n'importe quoi chez vous</em></>
                : <>Three steps to send <em style={{ fontStyle: 'italic', color: '#C8891C' }}>anything home</em></>}
            </h2>
            <p style={{ fontSize: 16, color: '#8A8070', lineHeight: 1.65, maxWidth: 500 }}>
              {isFr
                ? "Pas de transporteurs, pas de délais, pas de frais cachés. Juste des gens de votre communauté."
                : "No shipping companies, no long delays, no hidden fees. Just real people from your community carrying packages."}
            </p>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {steps.map((step, i) => (
              <div key={step.num} style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: 0 }}>
                {/* Number + line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: step.bg, border: `1.5px solid ${step.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: step.color }}>{step.num}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ width: 1, flex: 1, minHeight: 24, background: 'rgba(0,0,0,.08)', margin: '6px 0' }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ paddingLeft: 24, paddingBottom: i < steps.length - 1 ? 48 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: step.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {step.icon}
                    </div>
                    <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: '#1A1710', lineHeight: 1.2 }}>
                      {step.title}
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: '#8A8070', lineHeight: 1.75, marginBottom: 16, maxWidth: 540 }}>
                    {step.desc}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {step.bullets.map((b, j) => (
                      <span key={b} className="hiw-bullet" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, borderRadius: 6, padding: '5px 12px', background: '#FDFBF7', border: '1px solid rgba(0,0,0,.08)', color: '#3D3829' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: step.bulletColors[j], display: 'inline-block', flexShrink: 0 }} />
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  )
}