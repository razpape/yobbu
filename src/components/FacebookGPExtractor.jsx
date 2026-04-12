import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { CITIES_FROM, CITIES_TO, EXTRACTION_FIELDS, EXTRACTION_SYSTEM_PROMPT } from '../utils/extractionPrompt'

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY

// ─── Styles ──────────────────────────────────────────────────────────────────

const btn = {
  base:    { fontSize:11, fontWeight:700, padding:'6px 13px', borderRadius:7, cursor:'pointer', fontFamily:"'Inter',sans-serif", border:'2px solid transparent', transition:'opacity .15s' },
  approve: { background:'#22c55e', color:'#fff', borderColor:'#16a34a' },
  edit:    { background:'#404040', color:'#fff', borderColor:'#555' },
  reject:  { background:'#ef4444', color:'#fff', borderColor:'#dc2626' },
  import:  { background:'#C8810A', color:'#fff', borderColor:'#b07008' },
  ghost:   { background:'transparent', color:'#555', borderColor:'#333' },
  ai:      { background:'linear-gradient(135deg,#7C3AED,#4F46E5)', color:'#fff', borderColor:'#6D28D9' },
}

function Btn({ type, children, onClick, disabled, style: extra }) {
  return (
    <button
      style={{ ...btn.base, ...btn[type], opacity: disabled ? .5 : 1, ...extra }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

const inp = { padding:'9px 12px', borderRadius:8, border:'1px solid #333', background:'#111', color:'#fff', fontSize:13, fontFamily:"'Inter',sans-serif", outline:'none', width:'100%', boxSizing:'border-box' }
const lbl = { fontSize:10, color:'#666', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'.06em' }

// ─── Component ───────────────────────────────────────────────────────────────

export default function FacebookGPExtractor({ showToast }) {
  const [posts, setPosts]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [dailyStats, setDailyStats]   = useState({ today: 0, withName: 0, withPhone: 0, total: 0 })

  // AI extraction states
  const [extractState, setExtractState] = useState(null) // null | 'uploading' | 'analyzing' | 'review' | 'error'
  const [draft, setDraft]             = useState(null)
  const [draftImg, setDraftImg]       = useState(null)
  const [confidence, setConfidence]   = useState(0)
  const [errorMsg, setErrorMsg]       = useState('')
  const [saving, setSaving]           = useState(false)
  const [selectedPhone, setSelectedPhone] = useState('')
  const [serviceType, setServiceType]  = useState('colis_gp')

  // Post management
  const [importing, setImporting]     = useState(null)
  const [editingPost, setEditingPost] = useState(null)
  const [showDetails, setShowDetails] = useState({})
  const [filterDest, setFilterDest]   = useState('all')

  const fileRef = useRef()

  // ── Fetch existing posts ────────────────────────────────────────────────

  const DAILY_GOAL = 25

  useEffect(() => { fetchPosts() }, [])

  async function fetchPosts() {
    setLoading(true)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data } = await supabase
      .from('facebook_posts')
      .select('*')
      .order('created_at', { ascending: false })

    const all = data || []
    const todayCount = all.filter(p => new Date(p.created_at) >= todayStart).length
    const withName   = all.filter(p => p.name && p.name.trim()).length
    const withPhone  = all.filter(p => p.phone && p.phone.trim()).length

    setPosts(all)
    setDailyStats({ today: todayCount, withName, withPhone, total: all.length })
    setLoading(false)
  }

  // ── AI extraction ──────────────────────────────────────────────────────

  async function handleFile(file) {
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result
      setDraftImg(dataUrl)
      setExtractState('analyzing')
      setErrorMsg('')

      try {
        if (!OPENAI_KEY || OPENAI_KEY === 'sk-your-key-here') {
          throw new Error('VITE_OPENAI_API_KEY not set in .env file')
        }

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            max_tokens: 800,
            temperature: 0.1,
            messages: [
              { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Extract trip details from this Facebook screenshot.' },
                  { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
                ],
              },
            ],
          }),
        })

        if (!res.ok) {
          const errText = await res.text()
          throw new Error(`OpenAI API error ${res.status}: ${errText.slice(0, 200)}`)
        }

        const data = await res.json()
        let content = data.choices?.[0]?.message?.content?.trim()
        if (!content) throw new Error('Empty response from OpenAI')

        // Strip markdown fences if present
        if (content.startsWith('```')) {
          content = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
        }

        const extracted = JSON.parse(content)
        // Normalize phones — AI may return phones (array) or legacy phone (string)
        if (!Array.isArray(extracted.phones)) {
          extracted.phones = extracted.phone ? [extracted.phone] : []
        }
        delete extracted.phone
        // Ensure all fields exist
        const fields = ['name','from_city','to_city','date','space','price','note']
        for (const f of fields) { if (!(f in extracted)) extracted[f] = null }
        if (!('confidence' in extracted)) extracted.confidence = 0

        setDraft(extracted)
        setSelectedPhone(extracted.phones[0] || '')
        setConfidence(extracted.confidence || 0)
        setExtractState('review')
      } catch (err) {
        // Error handled silently
        setErrorMsg(err.message)
        setExtractState('error')
        showToast?.('AI extraction failed: ' + err.message)
      }
    }
    reader.readAsDataURL(file)
  }

  function resetExtraction() {
    setExtractState(null)
    setDraft(null)
    setDraftImg(null)
    setConfidence(0)
    setErrorMsg('')
    setSelectedPhone('')
    setServiceType('colis_gp')
  }

  // ── Save & import ─────────────────────────────────────────────────────

  async function savePost() {
    if (!draft.name && !selectedPhone && (!draft.phones || draft.phones.length === 0)) {
      showToast?.('Add at least a name or phone number')
      return
    }
    setSaving(true)
    const { phones, confidence, ...rest } = draft
    const chosenPhone = selectedPhone || phones?.[0] || null
    // Store extra phones in note if multiple found
    const extraPhones = phones?.length > 1 ? phones.filter(p => p !== chosenPhone) : []
    const noteWithExtras = extraPhones.length > 0
      ? `${rest.note || ''}\nOther numbers: ${extraPhones.join(', ')}`.trim()
      : (rest.note || null)

    const { data, error } = await supabase
      .from('facebook_posts')
      .insert({
        name:           rest.name || null,
        phone:          chosenPhone,
        from_city:      rest.from_city || null,
        to_city:        rest.to_city || null,
        date:           rest.date || null,
        space:          rest.space || null,
        price:          rest.price || null,
        note:           noteWithExtras,
        screenshot_url: draftImg,
        service_type:   serviceType,
        status:         'new',
      })
      .select()
      .single()

    if (!error) {
      setPosts(prev => {
        const next = [data, ...prev]
        const todayStart = new Date(); todayStart.setHours(0,0,0,0)
        setDailyStats({
          today:     next.filter(p => new Date(p.created_at) >= todayStart).length,
          withName:  next.filter(p => p.name?.trim()).length,
          withPhone: next.filter(p => p.phone?.trim()).length,
          total:     next.length,
        })
        return next
      })
      showToast?.('Saved!')
      resetExtraction()
    } else {
      console.error('Save failed:', error)
      showToast?.('Save failed: ' + error.message)
      setErrorMsg(error.message)
    }
    setSaving(false)
  }

  async function importAsTrip(post) {
    setImporting(post.id)
    const colors = ['#C8891C','#2D8B4E','#185FA5','#7A3B1E','#534AB7']
    const bgs    = ['#FFF8EB','#F0FAF4','#E6F1FB','#FDF0E8','#F0EBF8']
    const idx    = Math.floor(Math.random() * colors.length)
    const name   = post.name || 'Unknown GP'
    const { error } = await supabase.from('trips').insert({
      name,
      initials: name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || 'GP',
      color: colors[idx], bg: bgs[idx],
      phone: post.phone, from_city: post.from_city, to_city: post.to_city,
      date: post.date, space: post.space, price: post.price, note: post.note,
      service_type: post.service_type || 'colis_gp',
      approved: true, source: 'facebook_ai',
    })
    if (!error) {
      await supabase.from('facebook_posts').update({ status: 'imported' }).eq('id', post.id)
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'imported' } : p))
      showToast?.(`${name} imported as a trip!`)
    } else {
      showToast?.('Import failed: ' + error.message)
    }
    setImporting(null)
  }

  async function deletePost(id) {
    if (!window.confirm('Delete this post?')) return
    const { error } = await supabase.from('facebook_posts').delete().eq('id', id)
    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== id))
      showToast?.('Deleted')
    }
  }

  async function saveEdit() {
    const { error } = await supabase.from('facebook_posts').update({
      name: editingPost.name, phone: editingPost.phone,
      from_city: editingPost.from_city, to_city: editingPost.to_city,
      date: editingPost.date, space: editingPost.space,
      price: editingPost.price, note: editingPost.note,
      service_type: editingPost.service_type || 'colis_gp',
    }).eq('id', editingPost.id)
    if (!error) {
      setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, ...editingPost } : p))
      setEditingPost(null)
      showToast?.('Updated')
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  const setD = (k, v) => setDraft(d => ({ ...d, [k]: v }))
  const setE = (k, v) => setEditingPost(p => ({ ...p, [k]: v }))
  const statusColor = s => s === 'imported' ? '#4ade80' : s === 'rejected' ? '#f87171' : '#fbbf24'
  const statusLabel = s => s === 'imported' ? 'Imported' : s === 'rejected' ? 'Rejected' : 'New'

  const confColor = c => c >= 80 ? '#22c55e' : c >= 50 ? '#f59e0b' : '#ef4444'
  const confLabel = c => c >= 80 ? 'High' : c >= 50 ? 'Medium' : 'Low'

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div>

      {/* ── Edit modal ──────────────────────────────────────────────── */}
      {editingPost && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:998, padding:16 }}>
          <div style={{ background:'#1a1a1a', borderRadius:16, padding:28, width:'100%', maxWidth:440, border:'1px solid #333', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:20, color:'#fff' }}>Edit contact</div>

            <label style={lbl}>Name</label>
            <input style={{ ...inp, fontSize:15, fontWeight:700, border:'2px solid #C8810A', marginBottom:14 }}
              value={editingPost.name || ''} onChange={e => setE('name', e.target.value)} placeholder="Traveler name..." />
            <label style={lbl}>Phone / WhatsApp</label>
            <input style={{ ...inp, marginBottom:14 }}
              value={editingPost.phone || ''} onChange={e => setE('phone', e.target.value)} placeholder="+1 212 555 0100" />

            <label style={lbl}>Service type</label>
            <div style={{ display:'flex', gap:8, marginBottom:20 }}>
              {[
                { value:'colis_gp',   label:'Colis GP',   icon:'📦' },
                { value:'containers', label:'Containers', icon:'🚢' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setE('service_type', opt.value)}
                  style={{
                    flex:1, padding:'9px 12px', borderRadius:8, cursor:'pointer',
                    fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:700,
                    display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                    background: (editingPost.service_type || 'colis_gp') === opt.value ? 'rgba(200,129,10,.15)' : '#111',
                    border: `2px solid ${(editingPost.service_type || 'colis_gp') === opt.value ? '#C8810A' : '#333'}`,
                    color: (editingPost.service_type || 'colis_gp') === opt.value ? '#C8810A' : '#666',
                    transition:'all .15s',
                  }}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>

            <div style={{ fontSize:10, color:'#444', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>Trip details</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <label style={lbl}>From</label>
                <select style={{ ...inp, cursor:'pointer' }} value={editingPost.from_city || ''} onChange={e => setE('from_city', e.target.value)}>
                  <option value="">—</option>{CITIES_FROM.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>To</label>
                <select style={{ ...inp, cursor:'pointer' }} value={editingPost.to_city || ''} onChange={e => setE('to_city', e.target.value)}>
                  <option value="">—</option>{CITIES_TO.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Date</label><input style={inp} value={editingPost.date || ''} onChange={e => setE('date', e.target.value)} /></div>
              <div><label style={lbl}>Space (kg)</label><input style={inp} value={editingPost.space || ''} onChange={e => setE('space', e.target.value)} /></div>
              <div><label style={lbl}>Price</label><input style={inp} value={editingPost.price || ''} onChange={e => setE('price', e.target.value)} /></div>
            </div>

            <div style={{ display:'flex', gap:8, marginTop:4 }}>
              <Btn type="approve" onClick={saveEdit}>Save</Btn>
              <Btn type="edit" onClick={() => setEditingPost(null)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── Daily goal + stats ──────────────────────────────────────── */}
      {(() => {
        const todayDone  = dailyStats.today  >= DAILY_GOAL
        const nameDone   = dailyStats.withName  >= DAILY_GOAL
        const phoneDone  = dailyStats.withPhone >= DAILY_GOAL
        const statCard = ({ label, n, done, color }) => (
          <div style={{ background:'#1a1a1a', border:`1px solid ${done ? color + '44' : '#2a2a2a'}`, borderRadius:12, padding:'14px 16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:11, color:'#666', fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em' }}>{label}</span>
              <span style={{ fontSize:11, fontWeight:800, color: done ? color : '#C8810A' }}>{n} / {DAILY_GOAL}</span>
            </div>
            <div style={{ height:6, background:'#2a2a2a', borderRadius:3 }}>
              <div style={{ height:'100%', borderRadius:3, background: done ? color : '#C8810A', width:`${Math.min(100, Math.round(n/DAILY_GOAL*100))}%`, transition:'width .4s' }} />
            </div>
            <div style={{ fontSize:10, color:'#555', marginTop:5 }}>
              {done ? 'Goal reached!' : `${DAILY_GOAL - n} more to go`}
            </div>
          </div>
        )
        return (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:20 }}>
            {statCard({ label:"Today's contacts", n: dailyStats.today,     done: todayDone, color:'#22c55e' })}
            {statCard({ label:'Names collected',  n: dailyStats.withName,  done: nameDone,  color:'#818cf8' })}
            {statCard({ label:'Phones collected', n: dailyStats.withPhone, done: phoneDone, color:'#4ade80' })}
          </div>
        )
      })()}

      {/* ── Upload zone ─────────────────────────────────────────────── */}
      {!extractState && (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
          style={{
            border:'2px dashed #4F46E5',
            borderRadius:14, padding:'32px', textAlign:'center',
            marginBottom:24, cursor:'pointer',
            background:'linear-gradient(135deg, rgba(124,58,237,.08), rgba(79,70,229,.08))',
          }}
        >
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
            onChange={e => { handleFile(e.target.files[0]); e.target.value = '' }} />
          <div style={{ fontSize:32, marginBottom:8 }}>🤖</div>
          <div style={{ fontSize:14, fontWeight:600, color:'#ccc' }}>AI-Powered Screenshot Extraction</div>
          <div style={{ fontSize:12, color:'#888', marginTop:4 }}>
            Upload a Facebook screenshot · GPT-4 Vision extracts all trip details automatically
          </div>
          <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:14, flexWrap:'wrap' }}>
            {['Name','Phone','Route','Date','Price','Space','Type'].map(tag => (
              <span key={tag} style={{ fontSize:10, fontWeight:600, padding:'3px 10px', borderRadius:20, background:'rgba(124,58,237,.15)', color:'#A78BFA', border:'1px solid rgba(124,58,237,.25)' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Analyzing spinner ───────────────────────────────────────── */}
      {extractState === 'analyzing' && (
        <div style={{ background:'#1a1a1a', border:'1px solid #4F46E5', borderRadius:14, padding:32, marginBottom:24, textAlign:'center' }}>
          {draftImg && <img src={draftImg} alt="preview" style={{ maxHeight:120, borderRadius:8, marginBottom:14, opacity:.5 }} />}

          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, marginBottom:12 }}>
            <div style={{
              width:20, height:20, border:'3px solid rgba(124,58,237,.3)',
              borderTopColor:'#7C3AED', borderRadius:'50%',
              animation:'gpext-spin 1s linear infinite',
            }} />
            <span style={{ fontSize:14, fontWeight:700, color:'#A78BFA' }}>Analyzing with GPT-4 Vision...</span>
          </div>
          <div style={{ fontSize:12, color:'#666' }}>This may take a few seconds</div>

          <style>{`@keyframes gpext-spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* ── Error state ─────────────────────────────────────────────── */}
      {extractState === 'error' && (
        <div style={{ background:'#1a1a1a', border:'1px solid #ef4444', borderRadius:14, padding:24, marginBottom:24 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#ef4444', marginBottom:8 }}>❌ Extraction failed</div>
          <div style={{ fontSize:12, color:'#888', marginBottom:16 }}>{errorMsg}</div>
          <div style={{ display:'flex', gap:8 }}>
            <Btn type="ai" onClick={() => { setExtractState(null) }} style={{ background:'#7C3AED' }}>Try again</Btn>
            <Btn type="edit" onClick={resetExtraction}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* ── Review panel ────────────────────────────────────────────── */}
      {extractState === 'review' && draft && (
        <div style={{ background:'#1a1a1a', border:'1px solid #7C3AED', borderRadius:14, padding:24, marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:13, fontWeight:700, color:'#A78BFA' }}>🤖 AI Extraction Result</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:10, color:'#888', textTransform:'uppercase', letterSpacing:'.06em' }}>Confidence</span>
              <span style={{
                fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:6,
                background: `${confColor(confidence)}22`,
                color: confColor(confidence),
                border: `1px solid ${confColor(confidence)}44`,
              }}>
                {confidence}% · {confLabel(confidence)}
              </span>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'160px 1fr', gap:20, alignItems:'start' }}>
            {/* Screenshot thumbnail */}
            <div>
              <img src={draftImg} alt="screenshot" style={{ width:'100%', borderRadius:8, border:'1px solid #333', cursor:'pointer' }}
                onClick={() => window.open(draftImg, '_blank')} title="Click to enlarge" />
              <div style={{ fontSize:10, color:'#555', marginTop:4, textAlign:'center' }}>Click to enlarge</div>
            </div>

            <div>
              {/* ── PRIMARY: Name + Phone ── */}
              <label style={lbl}>Name</label>
              <input
                value={draft.name || ''}
                onChange={e => setD('name', e.target.value)}
                placeholder="Traveler name..."
                style={{ ...inp, fontSize:15, fontWeight:700, border:'2px solid #7C3AED', marginBottom:12 }}
              />

              {/* ── Phone selector — handles multiple ── */}
              <label style={lbl}>
                Phone / WhatsApp
                {draft.phones?.length > 1 && (
                  <span style={{ marginLeft:6, fontSize:9, background:'rgba(124,58,237,.2)', color:'#A78BFA', borderRadius:4, padding:'1px 6px', fontWeight:700, border:'1px solid rgba(124,58,237,.3)' }}>
                    {draft.phones.length} found
                  </span>
                )}
              </label>
              {draft.phones?.length > 1 ? (
                <div style={{ marginBottom:16 }}>
                  {draft.phones.map((ph, i) => (
                    <label key={ph} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', marginBottom:6, borderRadius:8, border:`2px solid ${selectedPhone === ph ? '#7C3AED' : '#333'}`, background: selectedPhone === ph ? 'rgba(124,58,237,.1)' : '#111', cursor:'pointer' }}>
                      <input
                        type="radio"
                        name="phone_select"
                        checked={selectedPhone === ph}
                        onChange={() => setSelectedPhone(ph)}
                        style={{ accentColor:'#7C3AED', flexShrink:0 }}
                      />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:'#fff', fontFamily:'monospace' }}>{ph}</div>
                        {i === 0 && <div style={{ fontSize:10, color:'#555' }}>First number in post</div>}
                      </div>
                      <a href={`https://wa.me/${ph.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ fontSize:10, color:'#4ade80', textDecoration:'none', fontWeight:600 }}>
                        WA
                      </a>
                    </label>
                  ))}
                  <div style={{ marginTop:4 }}>
                    <label style={{ ...lbl, marginBottom:4 }}>Or enter manually</label>
                    <input
                      value={draft.phones.includes(selectedPhone) ? '' : selectedPhone}
                      onChange={e => setSelectedPhone(e.target.value)}
                      placeholder="Custom number..."
                      style={inp}
                    />
                  </div>
                </div>
              ) : (
                <input
                  value={selectedPhone}
                  onChange={e => setSelectedPhone(e.target.value)}
                  placeholder="+1 212 555 0100"
                  style={{ ...inp, marginBottom:16 }}
                />
              )}

              {/* ── Service type ── */}
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Service type</label>
                <div style={{ display:'flex', gap:8 }}>
                  {[
                    { value:'colis_gp',   label:'Colis GP',   icon:'📦' },
                    { value:'containers', label:'Containers', icon:'🚢' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setServiceType(opt.value)}
                      style={{
                        flex:1, padding:'9px 12px', borderRadius:8, cursor:'pointer',
                        fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:700,
                        display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                        background: serviceType === opt.value ? 'rgba(200,129,10,.15)' : '#111',
                        border: `2px solid ${serviceType === opt.value ? '#C8810A' : '#333'}`,
                        color: serviceType === opt.value ? '#C8810A' : '#666',
                        transition:'all .15s',
                      }}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Trip details ── */}
              <button
                onClick={() => setShowDetails(s => ({ ...s, draft: !s.draft }))}
                style={{ ...btn.base, ...btn.ghost, fontSize:11, marginBottom:12 }}
              >
                {showDetails.draft ? '▲ Hide' : '▼ Show'} trip details
              </button>

              {showDetails.draft && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                  <div>
                    <label style={lbl}>From</label>
                    <select style={{ ...inp, cursor:'pointer' }} value={draft.from_city || ''} onChange={e => setD('from_city', e.target.value)}>
                      <option value="">—</option>{CITIES_FROM.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>To</label>
                    <select style={{ ...inp, cursor:'pointer' }} value={draft.to_city || ''} onChange={e => setD('to_city', e.target.value)}>
                      <option value="">—</option>{CITIES_TO.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label style={lbl}>Date</label><input style={inp} type="date" value={draft.date || ''} onChange={e => setD('date', e.target.value)} /></div>
                  <div><label style={lbl}>Space (kg)</label><input style={inp} value={draft.space || ''} onChange={e => setD('space', e.target.value)} /></div>
                  <div><label style={lbl}>Price</label><input style={inp} value={draft.price || ''} onChange={e => setD('price', e.target.value)} /></div>
                </div>
              )}

              {/* Note preview */}
              {draft.note && (
                <div style={{ fontSize:11, color:'#777', background:'#111', borderRadius:8, padding:'8px 12px', marginBottom:12, lineHeight:1.4, border:'1px solid #222' }}>
                  <span style={{ fontSize:9, color:'#555', textTransform:'uppercase', letterSpacing:'.06em' }}>AI Note: </span>
                  {draft.note}
                </div>
              )}

              {errorMsg && (
                <div style={{ fontSize:12, color:'#f87171', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:8, padding:'8px 12px', marginBottom:10 }}>
                  {errorMsg}
                </div>
              )}
              <div style={{ display:'flex', gap:8 }}>
                <Btn type="import" onClick={savePost} disabled={saving}>
                  {saving ? 'Saving...' : '✓ Save contact'}
                </Btn>
                <Btn type="edit" onClick={resetExtraction}>Cancel</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Posts list ───────────────────────────────────────────────── */}
      {!loading && posts.length > 0 && (() => {
        const destinations = ['all', ...new Set(posts.map(p => p.to_city).filter(Boolean))]
        return (
          <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
            {destinations.map(dest => (
              <button key={dest} onClick={() => setFilterDest(dest)} style={{
                fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:20, cursor:'pointer',
                fontFamily:"'Inter',sans-serif",
                background: filterDest === dest ? '#C8810A' : '#1a1a1a',
                color:      filterDest === dest ? '#fff'     : '#666',
                border:     `1px solid ${filterDest === dest ? '#C8810A' : '#2a2a2a'}`,
              }}>
                {dest === 'all' ? `All (${posts.length})` : dest}
              </button>
            ))}
          </div>
        )
      })()}

      {loading ? (
        <div style={{ color:'#555', padding:'40px 0', textAlign:'center' }}>Loading...</div>
      ) : posts.length === 0 ? (
        <div style={{ background:'#1a1a1a', borderRadius:14, border:'1px solid #2a2a2a', padding:'40px', textAlign:'center' }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
          <div style={{ fontSize:13, color:'#555' }}>No contacts yet. Upload a screenshot to get started.</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {posts.filter(p => filterDest === 'all' || p.to_city === filterDest).map(post => (
            <div key={post.id} style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:12, padding:'16px 20px', display:'flex', alignItems:'center', gap:16 }}>

              {/* Screenshot thumbnail */}
              {post.screenshot_url && (
                <img src={post.screenshot_url} alt="screenshot"
                  style={{ width:52, height:52, objectFit:'cover', borderRadius:8, border:'1px solid #333', flexShrink:0, cursor:'pointer' }}
                  onClick={() => window.open(post.screenshot_url, '_blank')} />
              )}

              {/* Name + Phone */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                  <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>
                    {post.name || <span style={{ color:'#555', fontWeight:400, fontStyle:'italic' }}>No name</span>}
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, borderRadius:6, padding:'2px 8px', background: statusColor(post.status), color:'#000' }}>
                    {statusLabel(post.status)}
                  </span>
                  {post.source === 'ai_extraction' && (
                    <span style={{ fontSize:9, fontWeight:600, borderRadius:6, padding:'2px 6px', background:'rgba(124,58,237,.2)', color:'#A78BFA', border:'1px solid rgba(124,58,237,.3)' }}>
                      AI
                    </span>
                  )}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontSize:13, color: post.phone ? '#4ade80' : '#555', fontWeight: post.phone ? 600 : 400, fontFamily:'monospace' }}>
                    {post.phone || 'No phone number'}
                  </span>
                  {post.phones_all && (
                    <span title={post.phones_all} style={{ fontSize:10, color:'#A78BFA', background:'rgba(124,58,237,.15)', borderRadius:4, padding:'1px 6px', fontWeight:600, cursor:'help', border:'1px solid rgba(124,58,237,.25)' }}>
                      +{post.phones_all.split(',').length - 1} more
                    </span>
                  )}
                </div>

                {(post.from_city || post.to_city || post.date || post.service_type) && (
                  <div style={{ display:'flex', gap:10, marginTop:6, flexWrap:'wrap', alignItems:'center' }}>
                    {post.service_type && (
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:6,
                        background: post.service_type === 'containers' ? 'rgba(24,95,165,.2)' : 'rgba(200,129,10,.15)',
                        color: post.service_type === 'containers' ? '#60a5fa' : '#C8810A',
                        border: `1px solid ${post.service_type === 'containers' ? 'rgba(24,95,165,.3)' : 'rgba(200,129,10,.25)'}`,
                      }}>
                        {post.service_type === 'containers' ? '🚢 Containers' : '📦 Colis GP'}
                      </span>
                    )}
                    {post.from_city && post.to_city && <span style={{ fontSize:11, color:'#C8810A' }}>✈ {post.from_city} → {post.to_city}</span>}
                    {post.date  && <span style={{ fontSize:11, color:'#666' }}>📅 {post.date}</span>}
                    {post.price && <span style={{ fontSize:11, color:'#666' }}>💰 {post.price}</span>}
                    {post.space && <span style={{ fontSize:11, color:'#666' }}>📦 {post.space} kg</span>}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                {post.status !== 'imported' && (
                  <Btn type="import" onClick={() => importAsTrip(post)} disabled={importing === post.id}>
                    {importing === post.id ? '...' : '⬆ Import'}
                  </Btn>
                )}
                <Btn type="edit" onClick={() => setEditingPost(post)}>Edit</Btn>
                <Btn type="reject" onClick={() => deletePost(post.id)}>✕</Btn>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
