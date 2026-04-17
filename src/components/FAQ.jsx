import { useState } from 'react'

const FAQS = {
  en: [
    { q: 'What is a GP?', a: 'A GP (from the French "Good Person" or informal "GP") is someone who travels between countries and carries packages for others — usually for a small fee per kg. It\'s a long-standing tradition in the West African diaspora community.' },
    { q: 'Is Yobbu free to use?', a: 'Yes — Yobbu is completely free. We don\'t charge any platform fees or commissions. You negotiate the price directly with the traveler and pay them however you agree.' },
    { q: 'How do I know the traveler is trustworthy?', a: 'Every GP on Yobbu is phone-verified before their listing goes live. ID-verified travelers carry a shield badge on their profile. You can also read reviews from other community members who have used them before.' },
    { q: 'What can I send?', a: 'Most everyday items are fine — clothes, food, electronics, medicine, documents. You cannot send liquids over 100ml, flammable items, or anything prohibited by customs regulations in the destination country.' },
    { q: 'How do I contact a traveler?', a: 'Once you find a GP you like, click the Contact button on their profile. This opens a WhatsApp conversation directly with them. You discuss the details, agree on a price, and arrange a pickup — all over WhatsApp.' },
    { q: 'What happens if my package doesn\'t arrive?', a: 'Yobbu connects senders and travelers — we are not a shipping company and cannot guarantee delivery. This is why we encourage you to only use verified travelers with good reviews, and to always confirm delivery with the recipient.' },
  ],
  fr: [
    { q: 'Qu\'est-ce qu\'un GP?', a: 'Un GP est quelqu\'un qui voyage entre pays et transporte des colis pour d\'autres — généralement contre une petite somme par kg. C\'est une longue tradition dans la communauté de la diaspora ouest-africaine.' },
    { q: 'Yobbu est-il gratuit?', a: 'Oui — Yobbu est entièrement gratuit. Nous ne facturons aucune commission. Vous négociez le prix directement avec le voyageur et le payez comme vous l\'entendez.' },
    { q: 'Comment savoir si le voyageur est fiable?', a: 'Chaque GP sur Yobbu est vérifié par téléphone avant que son annonce soit publiée. Les GPs vérifiés par ID portent un badge bouclier sur leur profil. Vous pouvez aussi lire les avis d\'autres membres de la communauté.' },
    { q: 'Que puis-je envoyer?', a: 'La plupart des articles courants sont acceptés — vêtements, nourriture, électronique, médicaments, documents. Vous ne pouvez pas envoyer de liquides de plus de 100ml, d\'articles inflammables, ou tout ce qui est interdit par les douanes.' },
    { q: 'Comment contacter un voyageur?', a: 'Une fois que vous avez trouvé un GP, cliquez sur le bouton Contacter de son profil. Cela ouvre une conversation WhatsApp directement avec lui. Vous discutez des détails et convenez d\'un prix.' },
    { q: 'Que se passe-t-il si mon colis n\'arrive pas?', a: 'Yobbu met en relation les expéditeurs et les voyageurs — nous ne sommes pas une société de transport. C\'est pourquoi nous vous encourageons à utiliser uniquement des voyageurs vérifiés avec de bons avis.' },
  ]
}

export default function FAQ({ lang }) {
  const isFr = lang === 'fr'
  const [open, setOpen] = useState(null)
  const faqs = FAQS[lang] || FAQS.en

  return (
    <>
      <style>{`
        .faq-item { border-bottom: 1px solid rgba(0,0,0,.06); }
        .faq-btn { transition: color .2s; }
        .faq-btn:hover { color: #52B5D9 !important; }
        .faq-answer { overflow: hidden; transition: max-height .3s ease, opacity .3s ease; }
        @media (max-width: 768px) {
          .faq-section { padding: 60px 24px !important; }
        }
      `}</style>
      <section className="faq-section" style={{ padding: '80px 48px', background: '#FDFBF7', borderBottom: '1px solid rgba(0,0,0,.06)', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#52B5D9', marginBottom: 14, background: '#D4E8F4', border: '1px solid #D4A574', borderRadius: 20, display: 'inline-block', padding: '4px 14px' }}>
              FAQ
            </div>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(28px, 3vw, 42px)', color: '#1A1710', lineHeight: 1.12, letterSpacing: '-.5px', marginTop: 12 }}>
              {isFr ? <>Questions <em style={{ fontStyle: 'italic', color: '#52B5D9' }}>fréquentes</em></> : <>Common <em style={{ fontStyle: 'italic', color: '#52B5D9' }}>questions</em></>}
            </h2>
          </div>

          {/* FAQ items */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,.06)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item" style={{ borderBottom: i < faqs.length - 1 ? '1px solid rgba(0,0,0,.06)' : 'none' }}>
                <button className="faq-btn" onClick={() => setOpen(open === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 28px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: open === i ? '#52B5D9' : '#1A1710', fontFamily: 'DM Sans, sans-serif' }}>
                  <span style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4, paddingRight: 24 }}>{faq.q}</span>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: open === i ? '#52B5D9' : '#F7F3ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={open === i ? '#fff' : '#8A8070'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {open === i
                        ? <line x1="5" y1="12" x2="19" y2="12"/>
                        : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}
                    </svg>
                  </div>
                </button>
                {open === i && (
                  <div style={{ padding: '0 28px 22px', fontSize: 15, color: '#8A8070', lineHeight: 1.75 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  )
}