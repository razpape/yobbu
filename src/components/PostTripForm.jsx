import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { LockIcon, CheckCircleIcon } from './Icons'

const CITIES_FROM = [
  'New York', 'Paris', 'Washington DC', 'Atlanta', 'Houston', 'London', 'Montreal', 'Brussels',
  'Madrid', 'Barcelona', 'Bilbao', 'Marseille', 'Lyon', 'Milan', 'Rome', 'Lisbon',
  'Dakar', 'Conakry', 'Abidjan', 'Bamako', 'Lomé', 'Accra', 'Cotonou',
  'Casablanca', 'Nouakchott', 'Bissau', 'Freetown', 'Banjul',
]
const CITIES_TO = [
  'Dakar', 'Conakry', 'Abidjan', 'Bamako', 'Lomé', 'Accra', 'Cotonou',
  'Casablanca', 'Nouakchott', 'Bissau', 'Freetown', 'Banjul',
  'New York', 'Paris', 'Washington DC', 'Atlanta', 'Houston', 'London', 'Montreal', 'Brussels',
  'Madrid', 'Barcelona', 'Bilbao', 'Marseille', 'Lyon', 'Milan', 'Rome', 'Lisbon',
]

export default function PostTripForm({ lang, setView, user, onLoginRequired, inline = false }) {
  const isFr = lang === 'fr'

  const meta     = user?.user_metadata || {}
  const fullName = meta.full_name || meta.name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || ''

  const defaultPhone = meta.whatsapp_phone || user?.phone || ''
  const [form, setForm]       = useState({
    from_city: '', to_city: '', date: '', space: '', price: '', phone: defaultPhone, note: '', flight_number: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState(null)

  // Not logged in — show message
  if (!user) {
    return (
      <div style={{ minHeight:'100vh', background:'#FDFBF7', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Sans, sans-serif', padding:24 }}>
        <div style={{ textAlign:'center', maxWidth:400 }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}><LockIcon size={48} color="#C8DDD0" /></div>
          <h2 style={{ fontFamily:'DM Serif Display, serif', fontSize:28, color:'#1A1710', marginBottom:12 }}>
            {isFr ? 'Connexion requise' : 'Sign in required'}
          </h2>
          <p style={{ fontSize:15, color:'#8A8070', marginBottom:24, lineHeight:1.65 }}>
            {isFr ? 'Vous devez être connecté pour poster un voyage.' : 'You need to be signed in to post a trip.'}
          </p>
          <button onClick={onLoginRequired}
            style={{ background:'#C8891C', color:'#fff', border:'none', padding:'13px 32px', borderRadius:12, fontFamily:'DM Sans, sans-serif', fontSize:15, fontWeight:600, cursor:'pointer', marginRight:10 }}>
            {isFr ? 'Se connecter' : 'Sign in'}
          </button>
          <button onClick={() => setView('home')}
            style={{ background:'transparent', color:'#8A8070', border:'1px solid rgba(0,0,0,.1)', padding:'13px 24px', borderRadius:12, fontFamily:'DM Sans, sans-serif', fontSize:15, cursor:'pointer' }}>
            {isFr ? 'Retour' : 'Go back'}
          </button>
        </div>
      </div>
    )
  }

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    setError(null)
    if (!form.from_city || !form.to_city || !form.date || !form.space || !form.price) {
      setError(isFr ? 'Remplissez tous les champs obligatoires.' : 'Please fill in all required fields.')
      return
    }
    setLoading(true)
    try {
      const initials = fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'GP'
      const colors   = ['#C8891C','#2D8B4E','#185FA5','#7A3B1E','#534AB7']
      const bgs      = ['#FFF8EB','#F0FAF4','#E6F1FB','#FDF0E8','#F0EBF8']
      const idx      = Math.floor(Math.random() * colors.length)

      const { error } = await supabase.from('trips').insert({
        name:       fullName,
        initials,
        color:      colors[idx],
        bg:         bgs[idx],
        phone:      form.phone,
        from_city:  form.from_city,
        to_city:    form.to_city,
        date:       form.date,
        space:      form.space,
        price:      form.price,
        note:       form.note,
        flight_number: form.flight_number || null,
        approved:   false,
        user_id:    user.id,
        user_email: user.email || null,
      })
      if (error) throw error
      setSuccess(true)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const inp = { width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid rgba(0,0,0,.1)', background:'#fff', color:'#1A1710', fontSize:14, fontFamily:'DM Sans, sans-serif', outline:'none', boxSizing:'border-box', marginBottom:16 }
  const lbl = { fontSize:11, fontWeight:700, color:'#8A8070', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'.06em' }
  const sel = { ...inp, cursor:'pointer', appearance:'none' }

  if (success) {
    const successContent = (
      <div style={{ textAlign:'center', maxWidth:400, margin:'0 auto', padding:'40px 24px' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}><CheckCircleIcon size={56} color="#2D8B4E" /></div>
        <h2 style={{ fontFamily:'DM Serif Display, serif', fontSize:28, color:'#1A1710', marginBottom:12 }}>
          {isFr ? 'Voyage soumis !' : 'Trip submitted!'}
        </h2>
        <p style={{ fontSize:15, color:'#8A8070', marginBottom:24, lineHeight:1.65 }}>
          {isFr ? 'Votre annonce sera examinée et publiée sous peu.' : 'Your listing will be reviewed and published shortly.'}
        </p>

        <button onClick={() => setView('profile')}
          style={{ background:'#C8891C', color:'#fff', border:'none', padding:'13px 32px', borderRadius:12, fontFamily:'DM Sans, sans-serif', fontSize:15, fontWeight:600, cursor:'pointer' }}>
          {isFr ? 'Voir mon profil' : 'View my profile'}
        </button>
      </div>
    )
    if (inline) return successContent
    return <div style={{ minHeight:'100vh', background:'#FDFBF7', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Sans, sans-serif', padding:24 }}>{successContent}</div>
  }

  const inner = (
    <div style={{ maxWidth:600, margin:'0 auto', padding: inline ? '0' : '48px 24px' }}>

      {!inline && (
        <div style={{ marginBottom:32 }}>
          <button onClick={() => setView('home')}
            style={{ background:'none', border:'none', color:'#8A8070', cursor:'pointer', fontSize:13, fontFamily:'DM Sans, sans-serif', marginBottom:16, padding:0, display:'flex', alignItems:'center', gap:6 }}>
            ← {isFr ? 'Retour' : 'Back'}
          </button>
          <h1 style={{ fontFamily:'DM Serif Display, serif', fontSize:32, color:'#1A1710', marginBottom:8 }}>
            {isFr ? 'Poster un voyage' : 'Post a trip'}
          </h1>
          <p style={{ fontSize:14, color:'#8A8070' }}>
            {isFr ? 'Votre annonce sera examinée avant publication.' : 'Your listing will be reviewed before going live.'}
          </p>
        </div>
      )}

      {/* Traveler info */}
      <div style={{ background:'#FFF8EB', border:'1px solid #F0C878', borderRadius:14, padding:'16px 20px', marginBottom:24, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:'50%', background:'#C8891C', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#fff', flexShrink:0 }}>
          {fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'GP'}
        </div>
        <div>
          <div style={{ fontSize:15, fontWeight:600, color:'#1A1710' }}>{fullName}</div>
          <div style={{ fontSize:12, color:'#8A8070' }}>{user.email || user.phone}</div>
        </div>
        <div style={{ marginLeft:'auto', fontSize:11, color:'#C8891C', fontWeight:600, background:'#fff', border:'1px solid #F0C878', borderRadius:20, padding:'3px 10px' }}>
          {isFr ? 'Vous' : 'You'}
        </div>
      </div>

      {/* Form */}
      <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,.06)', borderRadius:20, padding:'28px 24px', boxShadow:'0 2px 12px rgba(0,0,0,.04)' }}>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:0 }}>
          <div>
            <label style={lbl}>{isFr ? 'Départ *' : 'Departing from *'}</label>
            <select style={sel} value={form.from_city} onChange={e => set('from_city', e.target.value)}>
              <option value="">{isFr ? 'Choisir' : 'Select'}</option>
              {CITIES_FROM.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>{isFr ? 'Destination *' : 'Going to *'}</label>
            <select style={sel} value={form.to_city} onChange={e => set('to_city', e.target.value)}>
              <option value="">{isFr ? 'Choisir' : 'Select'}</option>
              {CITIES_TO.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <label style={lbl}>{isFr ? 'Date de départ *' : 'Departure date *'}</label>
        <input style={inp} type="date" value={form.date} onChange={e => set('date', e.target.value)} min={new Date().toISOString().split('T')[0]} />

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div>
            <label style={lbl}>{isFr ? 'Espace disponible (kg) *' : 'Available space (kg) *'}</label>
            <input style={inp} type="number" placeholder="10" value={form.space} onChange={e => set('space', e.target.value)} />
          </div>
          <div>
            <label style={lbl}>{isFr ? 'Prix par kg *' : 'Price per kg *'}</label>
            <input style={inp} placeholder="$5/kg" value={form.price} onChange={e => set('price', e.target.value)} />
          </div>
        </div>

        <label style={lbl}>{isFr ? 'Numéro de téléphone' : 'Phone number'}</label>
        <input style={inp} type="tel" placeholder="+1 (212) 555-0100" value={form.phone} onChange={e => set('phone', e.target.value)} />

        <label style={lbl}>{isFr ? 'Note (optionnel)' : 'Note (optional)'}</label>
        <textarea style={{ ...inp, minHeight:80, resize:'vertical' }} placeholder={isFr ? "Ex: Je livre à domicile, j'accepte les médicaments..." : 'Ex: Home delivery available, I accept medicine...'} value={form.note} onChange={e => set('note', e.target.value)} />

        {/* Flight number - recommended for security */}
        <div style={{ background:'#F0FAF4', border:'1px solid #25D366', borderRadius:10, padding:'12px 14px', marginBottom:12, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:20 }}>✈️</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#1A1710' }}>
              {isFr ? 'Numéro de vol (recommandé)' : 'Flight number (recommended)'}
            </div>
            <div style={{ fontSize:11, color:'#2D8B4E', marginTop:2 }}>
              {isFr ? 'Ajoute votre numéro de vol pour plus de confiance' : 'Add your flight number for more trust and security'}
            </div>
          </div>
        </div>
        <input style={inp} placeholder={isFr ? 'Ex: AA1234, DL567' : 'Ex: AA1234, DL567'} value={form.flight_number} onChange={e => set('flight_number', e.target.value)} />

        {error && (
          <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13, color:'#DC2626' }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width:'100%', padding:'14px', borderRadius:12, border:'none', background:'#C8891C', color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif', opacity: loading ? .6 : 1 }}>
          {loading ? '...' : isFr ? 'Soumettre mon annonce' : 'Submit my listing'}
        </button>
      </div>

    </div>
  )

  if (inline) return inner
  return <div style={{ minHeight:'100vh', background:'#FDFBF7', fontFamily:'DM Sans, sans-serif' }}>{inner}</div>
}