import { useState } from 'react'

const WA_LOGO = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a13 13 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
)

const CITY_CODES = {
  'New York':'JFK','Paris':'CDG','Atlanta':'ATL','Houston':'IAH',
  'Washington DC':'DCA','London':'LHR','Montreal':'YUL','Brussels':'BRU',
  'Dakar':'DSS','Conakry':'CKY','Abidjan':'ABJ','Bamako':'BKO',
  'Lomé':'LFW','Accra':'ACC','Cotonou':'COO',
}

export default function ContactModal({ gp, lang, onClose, onSend }) {
  const isFr = lang === 'fr'
  const fromCity = gp.from_city || gp.from || ''
  const toCity   = gp.to_city   || gp.to   || ''
  const fromCode = CITY_CODES[fromCity] || fromCity.slice(0,3).toUpperCase()
  const toCode   = CITY_CODES[toCity]   || toCity.slice(0,3).toUpperCase()
  const initials = gp.initials || gp.name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || 'GP'

  const defaultMsg = isFr
    ? `Bonjour ${gp.name}, je vous ai trouvé sur Yobbu et j'aimerais envoyer un colis à ${toCity}. Pouvons-nous en discuter ?`
    : `Hi ${gp.name}, I found you on Yobbu and I'd like to send a package to ${toCity}. Can we discuss the details?`

  const [message, setMessage] = useState(defaultMsg)
  const [btnHover, setBtnHover] = useState(false)

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16, fontFamily:'DM Sans, sans-serif' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#FDFBF7', borderRadius:20, width:'100%', maxWidth:460, overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,.15)' }}>

        {/* GP preview */}
        <div style={{ background:'#fff', borderBottom:'1px solid rgba(0,0,0,.06)', padding:'18px 22px', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:50, height:50, borderRadius:'50%', background:gp.bg||'#D1F4E7', color:gp.color||'#10B981', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Serif Display, serif', fontSize:17, fontWeight:700, flexShrink:0 }}>
            {initials}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'DM Serif Display, serif', fontSize:18, color:'#1F2937', marginBottom:2 }}>{gp.name}</div>
            <div style={{ fontSize:12, color:'#6B7280' }}>
              {fromCity} → {toCity}
              {gp.date && ` · ${gp.date}`}
              {gp.price && ` · ${gp.price}`}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#B0A090', padding:4, lineHeight:1, flexShrink:0 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding:'20px 22px' }}>

          {/* Message box */}
          <label style={{ fontSize:11, fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:'.08em', display:'block', marginBottom:8 }}>
            {isFr ? 'Votre message' : 'Your message'}
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            style={{ width:'100%', padding:'12px 14px', borderRadius:12, border:'1px solid rgba(0,0,0,.1)', background:'#fff', color:'#1F2937', fontSize:13, fontFamily:'DM Sans, sans-serif', outline:'none', resize:'none', lineHeight:1.65, minHeight:110, boxSizing:'border-box', marginBottom:16, transition:'border-color .15s' }}
            onFocus={e => e.target.style.borderColor='#25D366'}
            onBlur={e => e.target.style.borderColor='rgba(0,0,0,.1)'}
          />

          {/* Info pills */}
          <div style={{ display:'flex', gap:10, marginBottom:20 }}>
            {[
              { label: isFr?'Route':'Route', value:`${fromCode} → ${toCode}` },
              { label: isFr?'Date':'Date', value: gp.date || '—' },
              { label: isFr?'Prix':'Price', value: gp.price || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ flex:1, background:'#F7F3ED', borderRadius:10, padding:'10px 12px', textAlign:'center' }}>
                <div style={{ fontSize:9, color:'#B0A090', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:3 }}>{label}</div>
                <div style={{ fontSize:13, fontWeight:600, color:'#1F2937' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* WhatsApp button */}
          <button
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            onClick={() => onSend(message)}
            style={{ width:'100%', padding:'14px', borderRadius:12, border:'none', background: btnHover ? '#1EBE5A' : '#25D366', color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:10, transition:'background .15s', marginBottom:8 }}>
            {WA_LOGO}
            {isFr ? 'Ouvrir WhatsApp' : 'Open WhatsApp'}
          </button>

          <button onClick={onClose}
            style={{ width:'100%', padding:'11px', borderRadius:12, border:'1px solid rgba(0,0,0,.1)', background:'transparent', color:'#6B7280', fontSize:13, cursor:'pointer', fontFamily:'DM Sans, sans-serif', transition:'all .15s' }}>
            {isFr ? 'Annuler' : 'Cancel'}
          </button>

        </div>
      </div>
    </div>
  )
}