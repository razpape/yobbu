import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { LockIcon, CheckCircleIcon, PlaneIcon } from './Icons'

const AREAS = {
  'New York':      ['Bronx', 'Brooklyn', 'Queens', 'Manhattan', 'Harlem', 'Staten Island', 'Yonkers', 'Jamaica', 'Flushing', 'Flatbush', 'Crown Heights', 'Canarsie', 'East New York', 'Bedford-Stuyvesant'],
  'Paris':         ['Paris 1er', 'Paris 10e', 'Paris 18e', 'Paris 19e', 'Paris 20e', 'Saint-Denis', 'Aubervilliers', 'Montreuil', 'Bobigny', 'Évry', 'Créteil', 'Vitry-sur-Seine', 'Colombes'],
  'Washington DC': ['DC', 'Silver Spring', 'Hyattsville', 'Takoma Park', 'Suitland', 'Bladensburg', 'Capitol Heights', 'Maryland', 'Virginia', 'Alexandria'],
  'Atlanta':       ['Atlanta', 'Decatur', 'Stone Mountain', 'Clarkston', 'College Park', 'East Point', 'Forest Park', 'Norcross', 'Smyrna'],
  'Houston':       ['Houston', 'Stafford', 'Missouri City', 'Pearland', 'Sugar Land', 'Alief', 'Katy', 'Humble', 'Friendswood'],
  'London':        ['London', 'Peckham', 'Brixton', 'Hackney', 'Lewisham', 'Woolwich', 'Tottenham', 'Walthamstow', 'Stratford', 'Barking'],
  'Montreal':      ['Montréal', 'Laval', 'Côte-des-Neiges', 'Saint-Michel', 'Montréal-Nord', 'LaSalle', 'Longueuil', 'Brossard'],
  'Brussels':      ['Bruxelles', 'Molenbeek', 'Anderlecht', 'Schaerbeek', 'Etterbeek', 'Ixelles', 'Forest', 'Laeken'],
  'Madrid':        ['Madrid', 'Lavapiés', 'Tetuán', 'Vallecas', 'Alcorcón', 'Leganés', 'Móstoles', 'Getafe'],
  'Barcelona':     ['Barcelona', 'Badalona', 'L\'Hospitalet', 'Cornellà', 'Santa Coloma', 'Mataró'],
  'Marseille':     ['Marseille', 'Aix-en-Provence', 'Aubagne', 'Vitrolles', 'Martigues'],
  'Lyon':          ['Lyon', 'Villeurbanne', 'Vénissieux', 'Bron', 'Vaulx-en-Velin', 'Saint-Priest'],
  'Dakar':         ['Dakar', 'Médina', 'Plateau', 'HLM', 'Grand Yoff', 'Parcelles Assainies', 'Guédiawaye', 'Pikine', 'Rufisque', 'Yoff', 'Ouakam', 'Ngor', 'Almadies', 'Sacré-Cœur', 'Point E', 'Liberté', 'Mermoz', 'Sicap', 'Fass', 'Gueule Tapée'],
  'Conakry':       ['Conakry', 'Kaloum', 'Dixinn', 'Ratoma', 'Matoto', 'Matam', 'Almamya', 'Boulbinet', 'Coronthie', 'Kipé', 'Lambandji', 'Hamdallaye'],
  'Abidjan':       ['Abidjan', 'Cocody', 'Plateau', 'Marcory', 'Treichville', 'Adjamé', 'Yopougon', 'Abobo', 'Koumassi', 'Attécoubé', 'Port-Bouët', 'Bingerville'],
  'Bamako':        ['Bamako', 'Commune I', 'Commune II', 'Commune III', 'Commune IV', 'Commune V', 'Commune VI', 'Badalabougou', 'Hamdallaye', 'Lafiabougou', 'Kalaban-Coro'],
  'Lomé':          ['Lomé', 'Bè', 'Tokoin', 'Agoè', 'Adidogomé', 'Nyékonakpoè', 'Kodjoviakopé'],
  'Accra':         ['Accra', 'Tema', 'Madina', 'Osu', 'Dansoman', 'Achimota', 'Adabraka', 'Lapaz', 'Tesano', 'Nungua'],
  'Cotonou':       ['Cotonou', 'Cadjehoun', 'Akpakpa', 'Fidjrossè', 'Agla', 'Menontin', 'Zogbo', 'Jéricho'],
  'Casablanca':    ['Casablanca', 'Hay Hassani', 'Sidi Bernoussi', 'Ain Chock', 'Ben M\'Sick', 'Mohammedia', 'Derb Sultan'],
}

function AreaInput({ value, onChange, placeholder, city, style: extraStyle }) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef()
  const suggestions = city && AREAS[city]
    ? AREAS[city].filter(a => a.toLowerCase().includes(value.toLowerCase()) && a.toLowerCase() !== value.toLowerCase())
    : []
  const show = focused && value.length >= 1 && suggestions.length > 0

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder={placeholder}
        style={extraStyle}
        autoComplete="off"
      />
      {show && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: '#fff', border: '1px solid rgba(0,0,0,.12)', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,.1)', maxHeight: 200, overflowY: 'auto',
          marginTop: 2,
        }}>
          {suggestions.slice(0, 8).map(s => (
            <div key={s}
              onMouseDown={() => { onChange(s); setFocused(false) }}
              style={{ padding: '10px 14px', fontSize: 14, color: '#1A1710', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,.04)', fontFamily: 'DM Sans, sans-serif' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FFF8EB'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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

  const meta             = user?.user_metadata || {}
  const fallbackName     = user?.first_name
    ? `${user.first_name} ${user?.last_name || ''}`.trim()
    : meta.full_name || meta.name || ''

  const [profileName, setProfileName] = useState(fallbackName)
  const [avatarUrl,   setAvatarUrl]   = useState(null)

  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.full_name) setProfileName(data.full_name)
        if (data?.avatar_url) setAvatarUrl(data.avatar_url)
      })
  }, [user?.id])

  const fullName = profileName || fallbackName
  const initials = fullName ? fullName.split(' ').map(w => w[0]).filter(Boolean).join('').toUpperCase().slice(0, 2) : 'GP'

  const defaultPhone = user?.whatsapp_number || meta.whatsapp_phone || user?.phone || ''
  const [form, setForm]       = useState({
    service_type: 'baggage',
    from_city: '', to_city: '', date: '', space: '', price: '', phone: defaultPhone, note: '', flight_number: '',
    pickup_area: '', dropoff_area: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState(null)

  // Shared nav bar (shown on all states when not inline)
  const navBar = !inline && (
    <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 24px', borderBottom:'1px solid rgba(0,0,0,.06)', background:'#FDFBF7', position:'sticky', top:0, zIndex:50, fontFamily:'DM Sans, sans-serif' }}>
      <div onClick={() => setView('home')} style={{ fontFamily:'DM Serif Display, serif', fontSize:22, color:'#1A1710', cursor:'pointer', letterSpacing:'-.5px' }}>
        Yob<span style={{ color:'#C8891C' }}>bu</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {user && (
          <button onClick={() => setView('profile')}
            style={{ display:'flex', alignItems:'center', gap:8, background:'#FFF8EB', border:'1px solid #F0C878', borderRadius:20, padding:'6px 14px 6px 6px', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
            <div style={{ width:26, height:26, borderRadius:'50%', background:'#C8891C', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : initials}
            </div>
            <span style={{ fontSize:12, fontWeight:600, color:'#C8891C' }}>{isFr ? 'Mon profil' : 'My profile'}</span>
          </button>
        )}
      </div>
    </nav>
  )

  // Not logged in — show message
  if (!user) {
    return (
      <div style={{ minHeight:'100vh', background:'#FDFBF7', fontFamily:'DM Sans, sans-serif' }}>
        {navBar}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:24, minHeight:'calc(100vh - 57px)' }}>
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
            <button onClick={() => setView('browse')}
              style={{ background:'transparent', color:'#8A8070', border:'1px solid rgba(0,0,0,.1)', padding:'13px 24px', borderRadius:12, fontFamily:'DM Sans, sans-serif', fontSize:15, cursor:'pointer' }}>
              {isFr ? 'Parcourir' : 'Browse trips'}
            </button>
          </div>
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
        name:          fullName,
        initials,
        color:         colors[idx],
        bg:            bgs[idx],
        phone:         form.phone,
        from_city:     form.from_city,
        to_city:       form.to_city,
        date:          form.date,
        space:         form.space,
        price:         form.price,
        note:          form.note,
        service_type:  form.service_type  || null,
        flight_number: form.service_type === 'baggage' ? (form.flight_number || null) : null,
        pickup_area:   form.pickup_area   || null,
        dropoff_area:  form.dropoff_area  || null,
        approved:      false,
        user_id:       user.id,
        user_email:    user.email || null,
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
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => setView('profile')}
            style={{ background:'#C8891C', color:'#fff', border:'none', padding:'13px 28px', borderRadius:12, fontFamily:'DM Sans, sans-serif', fontSize:15, fontWeight:600, cursor:'pointer' }}>
            {isFr ? 'Voir mes voyages' : 'View my trips'}
          </button>
          <button onClick={() => setView('browse')}
            style={{ background:'transparent', color:'#3D3829', border:'1px solid rgba(0,0,0,.1)', padding:'13px 24px', borderRadius:12, fontFamily:'DM Sans, sans-serif', fontSize:15, cursor:'pointer' }}>
            {isFr ? 'Voir les GPs' : 'Browse GPs'}
          </button>
        </div>
      </div>
    )
    if (inline) return successContent
    return (
      <div style={{ minHeight:'100vh', background:'#FDFBF7', fontFamily:'DM Sans, sans-serif' }}>
        {navBar}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:24, minHeight:'calc(100vh - 57px)' }}>
          {successContent}
        </div>
      </div>
    )
  }

  const inner = (
    <div style={{ maxWidth:600, margin:'0 auto', padding: inline ? '0' : '32px 24px 64px' }}>

      {!inline && (
        <div style={{ marginBottom:28 }}>
          <button onClick={() => setView('profile')}
            style={{ background:'none', border:'none', color:'#8A8070', cursor:'pointer', fontSize:13, fontFamily:'DM Sans, sans-serif', marginBottom:16, padding:0, display:'flex', alignItems:'center', gap:6 }}>
            ← {isFr ? 'Mes voyages' : 'My trips'}
          </button>
          <h1 style={{ fontFamily:'DM Serif Display, serif', fontSize:30, color:'#1A1710', marginBottom:6 }}>
            {isFr ? 'Poster un voyage' : 'Post a trip'}
          </h1>
          <p style={{ fontSize:14, color:'#8A8070' }}>
            {isFr ? 'Votre annonce sera examinée avant publication.' : 'Your listing will be reviewed before going live.'}
          </p>
        </div>
      )}

      {/* Traveler info */}
      <div style={{ background:'#FFF8EB', border:'1px solid #F0C878', borderRadius:14, padding:'16px 20px', marginBottom:24, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:'50%', background:'#C8891C', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#fff', flexShrink:0 }}>
          {avatarUrl
            ? <img src={avatarUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : (fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'GP')
          }
        </div>
        <div>
          <div style={{ fontSize:15, fontWeight:600, color:'#1A1710' }}>{fullName || (isFr ? 'Chargement...' : 'Loading...')}</div>
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
            <input style={inp} placeholder="5€/kg" value={form.price} onChange={e => set('price', e.target.value)} />
          </div>
        </div>

        <label style={lbl}>{isFr ? 'Numéro de téléphone (WhatsApp)' : 'Phone number (WhatsApp)'}</label>
        <input style={inp} type="tel" placeholder="+1 (212) 555-0100" value={form.phone} onChange={e => set('phone', e.target.value)} />

        {/* Pickup area */}
        <label style={lbl}>{isFr ? 'Zone de ramassage' : 'Pickup area'}</label>
        <AreaInput value={form.pickup_area} onChange={v => set('pickup_area', v)} placeholder={isFr ? 'Ex: Bronx, Médina...' : 'Ex: Bronx, Queens...'} city={form.from_city} style={inp} />
        <div style={{ fontSize:11, color:'#8A8070', marginTop:-6, marginBottom:10 }}>
          {isFr ? 'Quartier ou ville — pas d\'adresse exacte' : 'Neighborhood or city — no exact address needed'}
        </div>

        {/* Dropoff area */}
        <label style={lbl}>{isFr ? 'Zone de livraison' : 'Dropoff area'}</label>
        <AreaInput value={form.dropoff_area} onChange={v => set('dropoff_area', v)} placeholder={isFr ? 'Ex: Médina, Plateau...' : 'Ex: Médina, Plateau...'} city={form.to_city} style={inp} />
        <div style={{ fontSize:11, color:'#8A8070', marginTop:-6, marginBottom:10 }}>
          {isFr ? 'Quartier ou ville — pas d\'adresse exacte' : 'Neighborhood or city — no exact address needed'}
        </div>

        <label style={lbl}>{isFr ? 'Note (optionnel)' : 'Note (optional)'}</label>
        <textarea style={{ ...inp, minHeight:80, resize:'vertical' }} placeholder={isFr ? "Ex: J'accepte électronique, médicaments, vêtements..." : 'Ex: I accept electronics, medicine, clothing...'} value={form.note} onChange={e => set('note', e.target.value)} />

        {/* Flight number — only for carry-on */}
        {form.service_type === 'baggage' && (
          <>
            <div style={{ background:'#F0FAF4', border:'1px solid rgba(45,139,78,.25)', borderRadius:10, padding:'12px 14px', marginBottom:12, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#1A1710' }}>
                  {isFr ? 'Numéro de vol (recommandé)' : 'Flight number (recommended)'}
                </div>
                <div style={{ fontSize:11, color:'#2D8B4E', marginTop:2 }}>
                  {isFr ? 'Ajoute ton numéro de vol pour plus de confiance' : 'Add your flight number for more trust and security'}
                </div>
              </div>
            </div>
            <input style={inp} placeholder={isFr ? 'Ex: AA1234, DL567' : 'Ex: AA1234, DL567'} value={form.flight_number} onChange={e => set('flight_number', e.target.value)} />
          </>
        )}

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
  return (
    <div style={{ minHeight:'100vh', background:'#FDFBF7', fontFamily:'DM Sans, sans-serif' }}>
      {navBar}
      {inner}
    </div>
  )
}