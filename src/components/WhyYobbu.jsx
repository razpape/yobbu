export default function WhyYobbu({ lang }) {
  const isFr = lang === 'fr'

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .why-grid { grid-template-columns: 1fr !important; }
          .why-right { grid-row: 1; }
          .why-section { padding: 48px 20px !important; }
        }
      `}</style>
      <section className="why-section" style={{ padding: '80px 48px', background: '#FDFBF7', borderBottom: '1px solid rgba(0,0,0,.06)', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#52B5D9', marginBottom: 12, background: '#D4E8F4', border: '1px solid #D4A574', borderRadius: 20, display: 'inline-block', padding: '4px 14px' }}>
              {isFr ? 'Pourquoi Yobbu' : 'Why choose us'}
            </div>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(28px, 3vw, 42px)', color: '#1A1710', lineHeight: 1.12, letterSpacing: '-.5px', marginTop: 12 }}>
              {isFr
                ? <>Pourquoi <em style={{ fontStyle: 'italic', color: '#52B5D9' }}>Yobbu</em> est le bon choix</>
                : <>Why <em style={{ fontStyle: 'italic', color: '#52B5D9' }}>Yobbu</em> is the right choice</>}
            </h2>
          </div>

          {/* Grid */}
          <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'stretch' }}>

            {/* Left — 2x2 small cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {[
                {
                  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#52B5D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                  title: isFr ? 'Plus de groupes Facebook' : 'No more Facebook groups',
                  desc: isFr ? "Trouvez des GPs vérifiés en quelques secondes, sans défiler pendant des heures." : "Find verified GPs in seconds — stop scrolling through endless Facebook posts.",
                },
                {
                  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#52B5D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
                  title: isFr ? 'GPs vérifiés' : 'Verified GPs',
                  desc: isFr ? "Chaque GP est vérifié par téléphone et ID avant d'apparaître sur Yobbu." : "Every GP is phone and ID verified before their listing goes live on Yobbu.",
                },
                {
                  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#52B5D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
                  title: isFr ? '100% gratuit' : '100% free to use',
                  desc: isFr ? "Aucune commission, aucun frais. Vous négociez directement avec le GP." : "Zero platform fees, zero commission. You agree on the price directly with the GP.",
                },
                {
                  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#52B5D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
                  title: isFr ? 'Contact WhatsApp direct' : 'Direct WhatsApp contact',
                  desc: isFr ? "Contactez le GP directement sur WhatsApp — pas de chat intégré compliqué." : "Contact GPs directly on WhatsApp — no complicated in-app messaging.",
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', border: '1px solid rgba(0,0,0,.06)', boxShadow: '0 1px 6px rgba(0,0,0,.04)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#D4E8F4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    {icon}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1710', marginBottom: 8, lineHeight: 1.3 }}>{title}</div>
                  <div style={{ fontSize: 13, color: '#8A8070', lineHeight: 1.65 }}>{desc}</div>
                </div>
              ))}
            </div>

            {/* Right — big dark card */}
            <div className="why-right" style={{ background: '#1A1710', borderRadius: 20, padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 360 }}>
              <div>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(200,137,28,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#52B5D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, color: '#fff', lineHeight: 1.2, marginBottom: 16, letterSpacing: '-.3px' }}>
                  {isFr ? 'Construit pour la communauté ouest-africaine' : 'Built for the West African community'}
                </h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', lineHeight: 1.75, marginBottom: 24 }}>
                  {isFr
                    ? "Yobbu n'est pas une application générique. Elle est construite spécialement pour la diaspora sénégalaise, guinéenne et ouest-africaine. Nous comprenons la tradition du GP parce que nous en faisons partie."
                    : "Yobbu isn't a generic app. It's built specifically for the Senegalese, Guinean, and West African diaspora. We understand the GP tradition because we're part of the community."}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    isFr ? 'Disponible en français et en anglais' : 'Available in French and English',
                    isFr ? 'Routes NY, Paris, Atlanta → Dakar et plus' : 'Routes NY, Paris, Atlanta → Dakar and more',
                    isFr ? 'Confiance de la communauté dès le premier jour' : 'Community trust from day one',
                  ].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(200,137,28,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#52B5D9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                style={{ marginTop: 32, background: '#52B5D9', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 8, width: 'fit-content', transition: 'background .2s' }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                {isFr ? 'Trouver un GP maintenant' : 'Find a GP now'} →
              </button>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}