export default function Footer({ lang, setView }) {
  const isFr = lang === 'fr'

  const links = {
    product: [
      { label: isFr ? 'Voir les GPs' : 'Browse GPs', action: () => setView('browse') },
      { label: isFr ? 'Poster un voyage' : 'Post a trip', action: () => setView('post') },
      { label: isFr ? 'Comment ça marche' : 'How it works', action: () => setView('home') },
    ],
    company: [
      { label: isFr ? 'À propos' : 'About Yobbu', action: null },
      { label: 'Blog', action: () => setView('blog') },
      { label: isFr ? 'Presse' : 'Press', action: null },
    ],
    support: [
      { label: isFr ? 'Centre d\'aide' : 'Help center', action: () => setView('docs') },
      { label: isFr ? 'Nous contacter' : 'Contact us', action: null },
      { label: isFr ? 'Confidentialité' : 'Privacy policy', action: () => setView('privacy') },
      { label: isFr ? 'Conditions' : 'Terms of service', action: () => setView('terms') },
    ],
  }

  const socials = [
    { label: 'F', title: 'Facebook' },
    { label: 'ig', title: 'Instagram' },
    { label: 'X', title: 'Twitter/X' },
    { label: 'wa', title: 'WhatsApp' },
  ]

  return (
    <footer className="bg-ink px-8 pt-14 pb-8">
      <style>{`
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 24px !important; padding: 0 0 8px !important; }
          .footer-brand { grid-column: 1 / -1 !important; }
          .footer-bottom { flex-direction: column !important; gap: 6px !important; text-align: center; }
          footer { padding-left: 20px !important; padding-right: 20px !important; padding-top: 40px !important; }
        }
      `}</style>
      <div className="max-w-5xl mx-auto">
        <div className="footer-grid grid gap-10 mb-12" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>

          {/* Brand */}
          <div className="footer-brand">
            <div className="font-display text-2xl font-bold text-white mb-3">
              Yob<span className="text-gold">bu</span>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: '#6B6560', maxWidth: 220 }}>
              {isFr
                ? 'Connecter la diaspora ouest-africaine avec des GPs de confiance.'
                : 'Connecting the West African diaspora with trusted GPs who carry packages home.'}
            </p>
            <div className="flex gap-2">
              {socials.map((s) => (
                <div key={s.title} title={s.title}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-colors duration-150"
                  style={{ background: '#2A2826', color: '#888', border: '1px solid #333' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#10B981'}
                  onMouseLeave={e => e.currentTarget.style.background = '#2A2826'}
                >
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#555' }}>
              {isFr ? 'Produit' : 'Product'}
            </div>
            {links.product.map((l) => (
              <button key={l.label} onClick={l.action}
                className="block text-sm mb-2.5 text-left w-full transition-colors duration-150"
                style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#888'}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Company */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#555' }}>
              {isFr ? 'Entreprise' : 'Company'}
            </div>
            {links.company.map((l) => (
              <button key={l.label} onClick={l.action} disabled={!l.action}
                className="block text-sm mb-2.5 text-left w-full transition-colors duration-150"
                style={{ color: '#888', background: 'none', border: 'none', cursor: l.action ? 'pointer' : 'default', fontFamily: 'inherit', opacity: l.action ? 1 : 0.5 }}
                onMouseEnter={l.action ? (e => e.currentTarget.style.color = '#fff') : undefined}
                onMouseLeave={l.action ? (e => e.currentTarget.style.color = '#888') : undefined}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Support */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#555' }}>
              {isFr ? 'Support' : 'Support'}
            </div>
            {links.support.map((l) => (
              <button key={l.label} onClick={l.action} disabled={!l.action}
                className="block text-sm mb-2.5 text-left w-full transition-colors duration-150"
                style={{ color: '#888', background: 'none', border: 'none', cursor: l.action ? 'pointer' : 'default', fontFamily: 'inherit', opacity: l.action ? 1 : 0.5 }}
                onMouseEnter={l.action ? (e => e.currentTarget.style.color = '#fff') : undefined}
                onMouseLeave={l.action ? (e => e.currentTarget.style.color = '#888') : undefined}
              >
                {l.label}
              </button>
            ))}
          </div>

        </div>

        {/* Bottom bar */}
        <div className="footer-bottom flex items-center justify-between pt-6" style={{ borderTop: '1px solid #2A2826' }}>
          <div className="text-xs" style={{ color: '#444' }}>
            © 2025 Yobbu Co. {isFr ? 'Tous droits réservés.' : 'All rights reserved.'}
          </div>
          <div className="text-xs text-gold">hello@yobbu.co</div>
        </div>
      </div>
    </footer>
  )
}