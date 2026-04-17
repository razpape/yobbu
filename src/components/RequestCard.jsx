import { formatDate, sanitizePhone } from '../utils/string'

export default function RequestCard({ req, lang }) {
  const isFr = lang === 'fr'

  return (
    <div style={{ background: '#fff', border: '1.5px solid #EDEAE4', borderRadius: 12, padding: 18, display: 'flex', gap: 16, justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1710', marginBottom: 6 }}>
          {req.from_city} → {req.to_city}
        </div>
        <div style={{ fontSize: 12, color: '#8A8070', marginBottom: 8, lineHeight: 1.5 }}>
          <span style={{ fontWeight: 600, color: '#1A1710' }}>{req.sender_name}</span>
          {req.weight && (
            <div>{isFr ? 'Poids' : 'Weight'}: {req.weight} kg</div>
          )}
          {req.description && (
            <div style={{ marginTop: 6, color: '#8A8070' }}>{req.description}</div>
          )}
          {req.deadline && (
            <div style={{ marginTop: 6, color: '#52B5D9', fontWeight: 500 }}>
              {isFr ? 'Avant le' : 'Needed by'}: {formatDate(req.deadline, lang)}
            </div>
          )}
        </div>
      </div>
      <a
        href={`https://wa.me/+${sanitizePhone(req.sender_phone)}?text=${encodeURIComponent(isFr ? 'Bonjour, je suis intéressé par votre demande d\'envoi' : 'Hi, I am interested in sending your package')}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ flexShrink: 0, padding: '11px 18px', background: '#25D366', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'background .15s' }}
        onMouseEnter={e => e.currentTarget.style.background = '#1EA853'}
        onMouseLeave={e => e.currentTarget.style.background = '#25D366'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.2-5.038 5.55-5.038 9.005 0 3.064 1.040 5.981 2.95 8.317l-3.135 3.135 4.924-1.537C7.15 21.75 10.563 23 14.318 23c4.092 0 7.862-1.622 10.685-4.566 2.822-2.945 4.374-6.948 4.374-11.466 0-3.13-.983-6.038-2.835-8.52-1.852-2.482-4.487-4.235-7.524-4.736a9.865 9.865 0 00-1.531-.111zM2.009 24h.018C.874 23.999 0 23.126 0 22.009c0-1.104.89-2.009 1.99-2.009 1.1 0 1.999.905 1.999 2.009-.001 1.117-.89 2-2-2z"/>
        </svg>
        {isFr ? 'WhatsApp' : 'WhatsApp'}
      </a>
    </div>
  )
}
