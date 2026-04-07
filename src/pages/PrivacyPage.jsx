export default function PrivacyPage({ lang, setView }) {
  const isFr = lang === 'fr'

  const s = {
    page:    { minHeight:'100vh', background:'#FDFBF7', fontFamily:'DM Sans, sans-serif' },
    nav:     { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 48px', borderBottom:'1px solid rgba(0,0,0,.06)', background:'#FDFBF7', position:'sticky', top:0, zIndex:50 },
    body:    { maxWidth:720, margin:'0 auto', padding:'48px 24px 80px' },
    h1:      { fontFamily:'DM Serif Display, serif', fontSize:'clamp(28px,4vw,42px)', color:'#1A1710', letterSpacing:'-.5px', marginBottom:8, lineHeight:1.1 },
    h2:      { fontFamily:'DM Serif Display, serif', fontSize:22, color:'#1A1710', marginBottom:12, marginTop:40 },
    p:       { fontSize:15, color:'#8A8070', lineHeight:1.75, marginBottom:16 },
    tag:     { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px', color:'#C8891C', background:'#FFF8EB', border:'1px solid #F0C878', borderRadius:20, display:'inline-block', padding:'4px 14px', marginBottom:20 },
    li:      { fontSize:15, color:'#8A8070', lineHeight:1.75, marginBottom:8, paddingLeft:16 },
    divider: { height:1, background:'rgba(0,0,0,.06)', margin:'8px 0' },
  }

  return (
    <div style={s.page}>
      <style>{`@media(max-width:768px){ .pp-nav{padding:14px 16px !important;} .pp-body{padding:32px 16px 60px !important;} }`}</style>

      {/* Nav */}
      <nav className="pp-nav" style={s.nav}>
        <div onClick={() => setView('home')} style={{ fontFamily:'DM Serif Display, serif', fontSize:24, color:'#1A1710', cursor:'pointer', letterSpacing:'-.5px' }}>
          Yob<span style={{ color:'#C8891C' }}>bu</span>
        </div>
        <button onClick={() => setView('home')}
          style={{ fontSize:13, fontWeight:500, padding:'7px 16px', borderRadius:20, border:'1px solid rgba(0,0,0,.1)', background:'transparent', color:'#3D3829', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
          ← {isFr ? 'Retour' : 'Back home'}
        </button>
      </nav>

      <div className="pp-body" style={s.body}>
        <div style={s.tag}>{isFr ? 'Confidentialité' : 'Privacy Policy'}</div>
        <h1 style={s.h1}>{isFr ? 'Politique de confidentialité' : 'Privacy Policy'}</h1>
        <p style={{ ...s.p, fontSize:13, color:'#B0A090' }}>{isFr ? 'Dernière mise à jour : avril 2026' : 'Last updated: April 2026'}</p>

        <div style={s.divider} />

        {/* Intro */}
        <h2 style={s.h2}>{isFr ? '1. Introduction' : '1. Introduction'}</h2>
        <p style={s.p}>
          {isFr
            ? "Yobbu (\"nous\") exploite le site yobbu.co. Cette politique explique comment nous collectons, utilisons et protégeons vos informations personnelles lorsque vous utilisez notre plateforme."
            : "Yobbu (\"we\") operates yobbu.co. This policy explains how we collect, use, and protect your personal information when you use our platform."}
        </p>

        {/* Data collected */}
        <h2 style={s.h2}>{isFr ? '2. Données collectées' : '2. Data we collect'}</h2>
        <p style={s.p}>{isFr ? 'Nous collectons les informations suivantes :' : 'We collect the following information:'}</p>
        {[
          isFr ? 'Nom complet — pour afficher votre profil de voyageur' : 'Full name — to display on your traveler listing',
          isFr ? 'Numéro de téléphone — pour la vérification SMS et le contact WhatsApp' : 'Phone number — for SMS verification and WhatsApp contact',
          isFr ? 'Adresse email — si vous vous connectez via Google' : 'Email address — if you sign in via Google',
          isFr ? 'Informations de voyage — destination, date, espace disponible, prix' : 'Trip details — destination, date, available space, price',
          isFr ? 'Adresse IP et données d\'utilisation — pour la sécurité et les analyses' : 'IP address and usage data — for security and analytics',
        ].map((item, i) => (
          <div key={i} style={{ display:'flex', gap:10, marginBottom:10 }}>
            <span style={{ color:'#C8891C', flexShrink:0, marginTop:2 }}>→</span>
            <p style={{ ...s.p, margin:0 }}>{item}</p>
          </div>
        ))}

        {/* How we use it */}
        <h2 style={s.h2}>{isFr ? '3. Utilisation des données' : '3. How we use your data'}</h2>
        <p style={s.p}>{isFr ? 'Vos données sont utilisées pour :' : 'Your data is used to:'}</p>
        {[
          isFr ? 'Afficher votre annonce aux expéditeurs potentiels' : 'Show your listing to potential senders',
          isFr ? 'Vérifier votre identité et maintenir la confiance de la communauté' : 'Verify your identity and maintain community trust',
          isFr ? 'Vous envoyer des notifications importantes (approbation, mise à jour)' : 'Send you important notifications (approval, updates)',
          isFr ? 'Améliorer notre plateforme' : 'Improve our platform',
        ].map((item, i) => (
          <div key={i} style={{ display:'flex', gap:10, marginBottom:10 }}>
            <span style={{ color:'#2D8B4E', flexShrink:0, marginTop:2 }}>✓</span>
            <p style={{ ...s.p, margin:0 }}>{item}</p>
          </div>
        ))}

        {/* Third parties */}
        <h2 style={s.h2}>{isFr ? '4. Services tiers' : '4. Third-party services'}</h2>
        <p style={s.p}>{isFr ? 'Nous utilisons les services tiers suivants :' : 'We use the following third-party services:'}</p>
        {[
          { name: 'Supabase', desc: isFr ? 'Stockage des données et authentification (serveurs UE/US)' : 'Data storage and authentication (EU/US servers)' },
          { name: 'Google OAuth', desc: isFr ? 'Connexion optionnelle via compte Google' : 'Optional sign-in via Google account' },
          { name: 'WhatsApp', desc: isFr ? 'Contact direct entre expéditeurs et voyageurs' : 'Direct contact between senders and travelers' },
          { name: 'Vercel', desc: isFr ? 'Hébergement de la plateforme' : 'Platform hosting' },
        ].map(({ name, desc }) => (
          <div key={name} style={{ background:'#fff', border:'1px solid rgba(0,0,0,.06)', borderRadius:12, padding:'14px 16px', marginBottom:10, display:'flex', gap:14, alignItems:'flex-start' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#1A1710', width:100, flexShrink:0, paddingTop:2 }}>{name}</div>
            <div style={{ ...s.p, margin:0, fontSize:14 }}>{desc}</div>
          </div>
        ))}

        {/* Data sharing */}
        <h2 style={s.h2}>{isFr ? '5. Partage des données' : '5. Data sharing'}</h2>
        <p style={s.p}>
          {isFr
            ? "Nous ne vendons jamais vos données personnelles. Vos informations de contact (numéro WhatsApp) ne sont visibles que par les utilisateurs connectés qui consultent votre annonce."
            : "We never sell your personal data. Your contact details (WhatsApp number) are only visible to signed-in users viewing your listing."}
        </p>

        {/* Retention */}
        <h2 style={s.h2}>{isFr ? '6. Conservation des données' : '6. Data retention'}</h2>
        <p style={s.p}>
          {isFr
            ? "Vos données sont conservées tant que votre compte est actif. Vous pouvez supprimer vos annonces à tout moment depuis votre profil. Pour supprimer entièrement votre compte, contactez-nous."
            : "Your data is kept as long as your account is active. You can delete your listings anytime from your profile. To fully delete your account, contact us."}
        </p>

        {/* Rights */}
        <h2 style={s.h2}>{isFr ? '7. Vos droits' : '7. Your rights'}</h2>
        <p style={s.p}>
          {isFr
            ? "Conformément au RGPD et aux lois applicables, vous avez le droit d'accéder à vos données, de les corriger, de les supprimer et de vous opposer à leur traitement. Contactez-nous à hello@yobbu.co."
            : "Under GDPR and applicable laws, you have the right to access, correct, delete, and object to processing of your data. Contact us at hello@yobbu.co."}
        </p>

        {/* Contact */}
        <h2 style={s.h2}>{isFr ? '8. Contact' : '8. Contact'}</h2>
        <div style={{ background:'#1A1710', borderRadius:16, padding:'24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ fontFamily:'DM Serif Display, serif', fontSize:18, color:'#fff', marginBottom:4 }}>
              {isFr ? 'Des questions ?' : 'Questions?'}
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,.5)' }}>
              {isFr ? 'Nous répondons dans les 24 heures.' : 'We respond within 24 hours.'}
            </div>
          </div>
          <a href="mailto:hello@yobbu.co"
            style={{ background:'#C8891C', color:'#fff', textDecoration:'none', padding:'11px 22px', borderRadius:12, fontSize:14, fontWeight:600, fontFamily:'DM Sans, sans-serif' }}>
            hello@yobbu.co
          </a>
        </div>
      </div>
    </div>
  )
}
