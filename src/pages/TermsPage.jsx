export default function TermsPage({ lang, setView }) {
  const isFr = lang === 'fr'

  const s = {
    page:    { minHeight: '100vh', background: '#FDFBF7', fontFamily: 'DM Sans, sans-serif' },
    nav:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 48px', borderBottom: '1px solid rgba(0,0,0,.06)', background: '#FDFBF7', position: 'sticky', top: 0, zIndex: 50 },
    body:    { maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' },
    h1:      { fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(26px,4vw,40px)', color: '#1A1710', letterSpacing: '-.5px', marginBottom: 8, lineHeight: 1.1 },
    h2:      { fontFamily: 'DM Serif Display, serif', fontSize: 20, color: '#1A1710', marginBottom: 10, marginTop: 40 },
    p:       { fontSize: 15, color: '#8A8070', lineHeight: 1.75, marginBottom: 14 },
    li:      { fontSize: 15, color: '#8A8070', lineHeight: 1.75, marginBottom: 8 },
    tag:     { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#52B5D9', background: '#D4E8F4', border: '1px solid #D4A574', borderRadius: 20, display: 'inline-block', padding: '4px 14px', marginBottom: 20 },
    divider: { height: 1, background: 'rgba(0,0,0,.06)', margin: '8px 0' },
    box:     { background: '#D4E8F4', border: '1px solid #D4A574', borderRadius: 14, padding: '18px 22px', marginBottom: 24 },
  }

  return (
    <div style={s.page}>
      <style>{`@media(max-width:768px){ .tos-body{padding:32px 16px 60px !important;} }`}</style>

      <div className="tos-body" style={s.body}>
        <div style={s.tag}>{isFr ? 'Conditions d\'utilisation' : 'Terms of Service'}</div>
        <h1 style={s.h1}>{isFr ? 'Conditions d\'utilisation' : 'Terms of Service'}</h1>
        <p style={{ ...s.p, fontSize: 13, color: '#B0A090' }}>{isFr ? 'Dernière mise à jour : avril 2026' : 'Last updated: April 2026'}</p>
        <div style={s.divider} />

        {/* Key summary box */}
        <div style={s.box}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#52B5D9', marginBottom: 10 }}>
            {isFr ? 'En bref' : 'Plain language summary'}
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 18px' }}>
            {(isFr ? [
              'Yobbu est une place de marché. Nous mettons en relation des expéditeurs et des voyageurs (GPs). Nous ne sommes pas partie à la transaction.',
              'Yobbu ne touche pas l\'argent. Le paiement se fait directement entre l\'expéditeur et le GP.',
              'Yobbu n\'est pas responsable des colis perdus, endommagés ou confisqués.',
              'Vous devez respecter les lois douanières et les règles de l\'aviation de votre pays.',
              'Les articles illégaux ou dangereux sont strictement interdits.',
            ] : [
              'Yobbu is a marketplace. We connect senders and travelers (GPs). We are not a party to any transaction.',
              'Yobbu never handles money. Payment is agreed directly between the sender and the GP.',
              'Yobbu is not responsible for lost, damaged, or seized packages.',
              'You must comply with the customs laws and aviation rules of your country.',
              'Illegal or dangerous items are strictly prohibited.',
            ]).map(item => (
              <li key={item} style={s.li}>{item}</li>
            ))}
          </ul>
        </div>

        <h2 style={s.h2}>{isFr ? '1. Ce qu\'est Yobbu' : '1. What Yobbu is'}</h2>
        <p style={s.p}>
          {isFr
            ? "Yobbu est une plateforme en ligne qui permet aux membres de la diaspora africaine de trouver des voyageurs (GPs) disposés à transporter des colis vers l'Afrique ou l'Europe. Yobbu agit uniquement comme intermédiaire de mise en relation — comme une petite annonce. Nous ne sommes pas transporteurs, nous ne garantissons aucun service et nous ne sommes pas parties aux accords conclus entre expéditeurs et GPs."
            : "Yobbu is an online platform that allows members of the African diaspora to find travelers (GPs) willing to carry packages to Africa or Europe. Yobbu acts solely as a connection marketplace — like a classifieds board. We are not a carrier, we do not guarantee any service, and we are not a party to any agreement made between senders and GPs."}
        </p>

        <h2 style={s.h2}>{isFr ? '2. Responsabilité des utilisateurs' : '2. User responsibility'}</h2>
        <p style={s.p}>
          {isFr
            ? "En utilisant Yobbu, vous acceptez que :"
            : "By using Yobbu, you agree that:"}
        </p>
        <ul style={{ margin: 0, padding: '0 0 16px 18px' }}>
          {(isFr ? [
            'Les accords de prix, de remise et de livraison sont conclus directement entre l\'expéditeur et le GP.',
            'Le paiement est géré entièrement entre vous et l\'autre partie. Yobbu n\'intervient pas.',
            'Vous êtes seul responsable du contenu de votre colis et de sa conformité avec les lois douanières.',
            'Vous devez respecter toutes les réglementations aériennes et maritimes applicables.',
            'Yobbu n\'est pas responsable des retards, pertes, dommages ou confiscations.',
          ] : [
            'Pricing, drop-off, and delivery arrangements are made directly between sender and GP.',
            'Payment is handled entirely between you and the other party. Yobbu is not involved.',
            'You are solely responsible for the contents of any package and its compliance with customs law.',
            'You must comply with all applicable aviation and maritime regulations.',
            'Yobbu is not liable for delays, losses, damages, or seizures.',
          ]).map(item => <li key={item} style={s.li}>{item}</li>)}
        </ul>

        <h2 style={s.h2}>{isFr ? '3. Articles interdits' : '3. Prohibited items'}</h2>
        <p style={s.p}>
          {isFr
            ? "Les articles suivants sont strictement interdits sur Yobbu. Tout utilisateur trouvé en violation sera immédiatement banni de la plateforme :"
            : "The following items are strictly prohibited on Yobbu. Any user found in violation will be immediately removed from the platform:"}
        </p>
        <ul style={{ margin: 0, padding: '0 0 16px 18px' }}>
          {(isFr ? [
            'Argent liquide en grande quantité ou valeurs mobilières',
            'Drogues illicites ou substances contrôlées',
            'Armes, munitions ou articles dangereux',
            'Marchandises contrefaites',
            'Tout article interdit par la réglementation aérienne ou douanière',
            'Animaux vivants',
          ] : [
            'Large amounts of cash or securities',
            'Illegal drugs or controlled substances',
            'Weapons, ammunition, or dangerous goods',
            'Counterfeit goods',
            'Any item prohibited by aviation or customs regulations',
            'Live animals',
          ]).map(item => <li key={item} style={s.li}>{item}</li>)}
        </ul>
        <p style={s.p}>
          {isFr
            ? "Pour tout le reste, suivez les règles de votre compagnie aérienne ou de l'opérateur maritime."
            : "For everything else, follow the rules of your airline or maritime operator."}
        </p>

        <h2 style={s.h2}>{isFr ? '4. Vérification et confiance' : '4. Verification and trust'}</h2>
        <p style={s.p}>
          {isFr
            ? "Yobbu vérifie les numéros de téléphone des utilisateurs afin d'améliorer la confiance sur la plateforme. Cette vérification n'est pas une garantie de l'identité, du comportement ou des antécédents d'un utilisateur. Vous êtes responsable de l'évaluation des personnes avec lesquelles vous choisissez de travailler."
            : "Yobbu verifies user phone numbers to increase trust on the platform. This verification is not a guarantee of a user's identity, behavior, or background. You are responsible for evaluating the people you choose to work with."}
        </p>

        <h2 style={s.h2}>{isFr ? '5. Règles de la plateforme' : '5. Platform rules'}</h2>
        <ul style={{ margin: 0, padding: '0 0 16px 18px' }}>
          {(isFr ? [
            'Les annonces doivent être exactes et honnêtes.',
            'Les fausses annonces ou les profils trompeurs entraîneront une suspension immédiate.',
            'Toute tentative d\'escroquerie ou de tromperie sera signalée et bannie.',
            'Yobbu se réserve le droit de supprimer toute annonce ou compte sans préavis.',
          ] : [
            'Listings must be accurate and honest.',
            'False listings or misleading profiles will result in immediate suspension.',
            'Any attempt to scam or deceive will be reported and banned.',
            'Yobbu reserves the right to remove any listing or account without notice.',
          ]).map(item => <li key={item} style={s.li}>{item}</li>)}
        </ul>

        <h2 style={s.h2}>{isFr ? '6. Litiges' : '6. Disputes'}</h2>
        <p style={s.p}>
          {isFr
            ? "Les litiges entre expéditeurs et GPs doivent être résolus directement entre les parties. Yobbu n'est pas arbitre et ne peut pas être tenu responsable des différends résultant de transactions privées. En cas de problème grave, nous vous encourageons à contacter les autorités compétentes."
            : "Disputes between senders and GPs must be resolved directly between the parties. Yobbu is not an arbitrator and cannot be held liable for disputes arising from private transactions. In the case of serious issues, we encourage you to contact the relevant authorities."}
        </p>

        <h2 style={s.h2}>{isFr ? '7. Contact' : '7. Contact'}</h2>
        <p style={s.p}>
          {isFr
            ? "Pour toute question relative à ces conditions, contactez-nous à : "
            : "For any questions about these terms, contact us at: "}
          <strong style={{ color: '#1A1710' }}>support@yobbu.co</strong>
        </p>

      </div>
    </div>
  )
}
