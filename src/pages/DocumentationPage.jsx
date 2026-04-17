import { useState, useMemo } from 'react'

export default function DocumentationPage({ lang, setView }) {
  const isFr = lang === 'fr'
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedTutorial, setExpandedTutorial] = useState(null)
  const [expandedFaq, setExpandedFaq] = useState(null)

  const tutorials = [
    {
      id: 'signup',
      titleEn: 'How to Sign Up',
      titleFr: 'Comment s\'inscrire',
      descEn: 'Create your Yobbu account in minutes',
      descFr: 'Créez votre compte Yobbu en quelques minutes',
      contentEn: [
        '1. Click "Sign In" in the top right',
        '2. Enter your phone number',
        '3. Enter the OTP code sent via SMS',
        '4. Complete your profile with a photo and name',
        '5. Verify your identity when prompted',
      ],
      contentFr: [
        '1. Cliquez sur "Connexion" en haut à droite',
        '2. Entrez votre numéro de téléphone',
        '3. Entrez le code OTP envoyé par SMS',
        '4. Complétez votre profil avec une photo et votre nom',
        '5. Vérifiez votre identité lorsque demandé',
      ],
    },
    {
      id: 'post-trip',
      titleEn: 'How to Post a Trip',
      titleFr: 'Comment publier un voyage',
      descEn: 'Share your upcoming trip and earn money',
      descFr: 'Partagez votre prochain voyage et gagnez de l\'argent',
      contentEn: [
        '1. Go to "Post a Trip" from your profile',
        '2. Enter your destination and travel dates',
        '3. Set the price per item and available space',
        '4. Add a description (optional)',
        '5. Click "Post Trip" to publish',
      ],
      contentFr: [
        '1. Allez à "Publier un voyage" depuis votre profil',
        '2. Entrez votre destination et dates de voyage',
        '3. Définissez le prix par article et l\'espace disponible',
        '4. Ajoutez une description (optionnel)',
        '5. Cliquez sur "Publier" pour publier',
      ],
    },
    {
      id: 'send-package',
      titleEn: 'How to Send a Package',
      titleFr: 'Comment envoyer un colis',
      descEn: 'Request someone to carry your items',
      descFr: 'Demandez à quelqu\'un de transporter vos articles',
      contentEn: [
        '1. Go to "Send a Package"',
        '2. Select a destination',
        '3. Describe what you want to send',
        '4. Contact travelers and negotiate the price',
        '5. Confirm once you reach an agreement',
      ],
      contentFr: [
        '1. Allez à "Envoyer un colis"',
        '2. Sélectionnez une destination',
        '3. Décrivez ce que vous voulez envoyer',
        '4. Contactez des voyageurs et négociez le prix',
        '5. Confirmez une fois que vous êtes d\'accord',
      ],
    },
  ]

  const faqs = [
    {
      id: 'safe',
      questionEn: 'Is it safe to use Yobbu?',
      questionFr: 'Est-ce sûr d\'utiliser Yobbu ?',
      answerEn: 'Yes. All travelers are verified through SMS and government ID. We also offer insurance for valuable items. Always meet in public places.',
      answerFr: 'Oui. Tous les voyageurs sont vérifiés par SMS et pièce d\'identité. Nous proposons également une assurance pour les articles de valeur. Rencontrez-vous toujours dans les lieux publics.',
    },
    {
      id: 'payment',
      questionEn: 'How do I pay?',
      questionFr: 'Comment puis-je payer ?',
      answerEn: 'You negotiate prices directly with travelers on WhatsApp. Payment is made privately between you and the traveler.',
      answerFr: 'Vous négociez les prix directement avec les voyageurs sur WhatsApp. Le paiement est effectué en privé entre vous et le voyageur.',
    },
    {
      id: 'cancel',
      questionEn: 'Can I cancel my trip?',
      questionFr: 'Puis-je annuler mon voyage ?',
      answerEn: 'Yes, you can delete your trip anytime from your profile. Notify any senders who have contacted you.',
      answerFr: 'Oui, vous pouvez supprimer votre voyage à tout moment depuis votre profil. Notifiez les expéditeurs qui vous ont contacté.',
    },
    {
      id: 'fees',
      questionEn: 'Does Yobbu charge fees?',
      questionFr: 'Yobbu facture-t-il des frais ?',
      answerEn: 'Yobbu is free to use. You keep 100% of the price you negotiate with senders.',
      answerFr: 'Yobbu est gratuit. Vous conservez 100% du prix que vous négociez avec les expéditeurs.',
    },
  ]

  const filteredTutorials = useMemo(() => {
    if (!searchQuery.trim()) return tutorials
    const q = searchQuery.toLowerCase()
    return tutorials.filter(t => {
      const title = (isFr ? t.titleFr : t.titleEn).toLowerCase()
      const desc = (isFr ? t.descFr : t.descEn).toLowerCase()
      return title.includes(q) || desc.includes(q)
    })
  }, [searchQuery, isFr])

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs
    const q = searchQuery.toLowerCase()
    return faqs.filter(f => {
      const question = (isFr ? f.questionFr : f.questionEn).toLowerCase()
      const answer = (isFr ? f.answerFr : f.answerEn).toLowerCase()
      return question.includes(q) || answer.includes(q)
    })
  }, [searchQuery, isFr])

  const s = {
    page: { minHeight: '100vh', background: '#FDFBF7', fontFamily: 'DM Sans, sans-serif' },
    container: { maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' },
    header: { marginBottom: 48 },
    tag: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#52B5D9', background: '#D4E8F4', border: '1px solid rgba(0,0,0,.06)', borderRadius: 20, display: 'inline-block', padding: '4px 14px', marginBottom: 12 },
    h1: { fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(28px,4vw,42px)', color: '#1A1710', letterSpacing: '-.5px', marginBottom: 8, lineHeight: 1.1 },
    searchContainer: { marginBottom: 40 },
    searchInput: { width: '100%', padding: '12px 16px', fontSize: 15, border: '1px solid rgba(0,0,0,.1)', borderRadius: 12, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' },
    section: { marginBottom: 48 },
    sectionTitle: { fontFamily: 'DM Serif Display, serif', fontSize: 22, color: '#1A1710', marginBottom: 20, fontWeight: 500 },
    tutorialCard: { background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 12, padding: 16, marginBottom: 12, cursor: 'pointer', transition: 'all 0.2s ease' },
    tutorialTitle: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 16, fontWeight: 600, color: '#1A1710', margin: 0 },
    cardDesc: { fontSize: 14, color: '#8A8070', margin: 0, marginTop: 4 },
    toggleIcon: { fontSize: 18, color: '#52B5D9', transition: 'transform 0.2s ease' },
    cardContent: { marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,.06)' },
    contentItem: { fontSize: 14, color: '#8A8070', lineHeight: 1.6, marginBottom: 8 },
    faqItem: { background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
    faqQuestion: { padding: 16, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 15, fontWeight: 600, color: '#1A1710' },
    faqAnswer: { padding: '0 16px 16px 16px', fontSize: 14, color: '#8A8070', lineHeight: 1.7, borderTop: '1px solid rgba(0,0,0,.06)' },
    noResults: { textAlign: 'center', padding: '32px 16px', fontSize: 14, color: '#8A8070' },
  }

  return (
    <div style={s.page}>
      <style>{`
        @media(max-width:768px) {
          .doc-container { padding: 32px 16px 60px !important; }
        }
      `}</style>

      <div className="doc-container" style={s.container}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.tag}>{isFr ? 'Aide' : 'Help'}</div>
          <h1 style={s.h1}>{isFr ? 'Centre d\'aide' : 'Help Center'}</h1>
          <p style={{ fontSize: 14, color: '#8A8070', margin: 0, marginTop: 8 }}>
            {isFr ? 'Trouvez les réponses aux questions courantes' : 'Find answers to common questions'}
          </p>
        </div>

        {/* Search */}
        <div style={s.searchContainer}>
          <input
            type="text"
            placeholder={isFr ? 'Rechercher...' : 'Search...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={s.searchInput}
          />
        </div>

        {/* Tutorials */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>{isFr ? 'Guides' : 'Tutorials'}</h2>
          {filteredTutorials.length > 0 ? (
            filteredTutorials.map(tutorial => (
              <div
                key={tutorial.id}
                style={{
                  ...s.tutorialCard,
                  background: expandedTutorial === tutorial.id ? '#FDFBF7' : '#fff',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0,0,0,.15)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0,0,0,.06)'}
              >
                <div style={s.tutorialTitle} onClick={() => setExpandedTutorial(expandedTutorial === tutorial.id ? null : tutorial.id)}>
                  <div>
                    <p style={s.cardTitle}>{isFr ? tutorial.titleFr : tutorial.titleEn}</p>
                    <p style={s.cardDesc}>{isFr ? tutorial.descFr : tutorial.descEn}</p>
                  </div>
                  <div style={{ ...s.toggleIcon, transform: expandedTutorial === tutorial.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                  </div>
                </div>
                {expandedTutorial === tutorial.id && (
                  <div style={s.cardContent}>
                    {(isFr ? tutorial.contentFr : tutorial.contentEn).map((item, i) => (
                      <div key={i} style={s.contentItem}>• {item}</div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={s.noResults}>{isFr ? 'Aucun résultat trouvé' : 'No results found'}</div>
          )}
        </div>

        {/* FAQ */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>{isFr ? 'Questions fréquemment posées' : 'Frequently Asked Questions'}</h2>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map(faq => (
              <div key={faq.id} style={s.faqItem}>
                <div
                  style={s.faqQuestion}
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FDFBF7'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                >
                  <span>{isFr ? faq.questionFr : faq.questionEn}</span>
                  <div style={{ ...s.toggleIcon, transform: expandedFaq === faq.id ? 'rotate(180deg)' : 'rotate(0deg)', marginLeft: 16, flexShrink: 0 }}>
                    ▼
                  </div>
                </div>
                {expandedFaq === faq.id && (
                  <div style={s.faqAnswer}>
                    {isFr ? faq.answerFr : faq.answerEn}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={s.noResults}>{isFr ? 'Aucun résultat trouvé' : 'No results found'}</div>
          )}
        </div>

        {/* Contact CTA */}
        <div style={{ background: '#1A1710', borderRadius: 16, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: '#fff', marginBottom: 4 }}>
              {isFr ? 'Encore des questions ?' : 'Still have questions?'}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>
              {isFr ? 'Contactez-nous directement' : 'Contact us directly'}
            </div>
          </div>
          <a href="mailto:hello@yobbu.co" style={{ background: '#52B5D9', color: '#fff', textDecoration: 'none', padding: '11px 22px', borderRadius: 12, fontSize: 14, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
            hello@yobbu.co
          </a>
        </div>
      </div>
    </div>
  )
}
