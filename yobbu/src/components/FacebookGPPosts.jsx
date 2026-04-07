import { useState, useEffect, useRef } from 'react'
import { createWorker } from 'tesseract.js'
import { supabase } from '../lib/supabase'

const CITIES_FROM = ['New York', 'Paris', 'Washington DC', 'Atlanta', 'Houston', 'London', 'Montreal', 'Brussels']
const CITIES_TO   = ['Dakar', 'Conakry', 'Abidjan', 'Bamako', 'Lomé', 'Accra', 'Cotonou']

const MONTHS_PATTERN = [
  'january','février','february','fevrier','janvier','march','mars',
  'april','avril','may','mai','june','juin','july','juillet',
  'august','août','aout','september','septembre','october','octobre',
  'november','novembre','december','décembre','decembre',
].join('|')

function parseGPPost(text) {
  const t = text || ''

  // From / To city
  const fromCity = CITIES_FROM.find(c => new RegExp(`(?:de|depuis|from|départ|depart)?\\s*${c}`, 'i').test(t))
    || CITIES_FROM.find(c => t.toLowerCase().includes(c.toLowerCase())) || ''
  const toCity = CITIES_TO.find(c => new RegExp(`(?:à|a|pour|to|→|->|destination)?\\s*${c}`, 'i').test(t))
    || CITIES_TO.find(c => t.toLowerCase().includes(c.toLowerCase())) || ''

  // Date
  const dateRe = new RegExp(
    `\\b\\d{1,2}[\\/.\\-]\\d{1,2}(?:[\\/.\\-]\\d{2,4})?\\b` +
    `|(?:le\\s+)?\\d{1,2}\\s+(?:${MONTHS_PATTERN})(?:\\s+\\d{4})?` +
    `|(?:${MONTHS_PATTERN})\\s+\\d{1,2}(?:,?\\s*\\d{4})?`, 'i'
  )
  const dateMatch = t.match(dateRe)
  const date = dateMatch ? dateMatch[0].replace(/^le\s+/i, '').trim() : ''

  // Space & price
  const spaceMatch = t.match(/(\d+(?:[.,]\d+)?)\s*(?:kg|kgs|kilos?|kilogrammes?)/i)
  const space = spaceMatch ? spaceMatch[1].replace(',', '.') : ''
  const priceMatch = t.match(/(?:[\$€£]\s*\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?\s*(?:[\$€£]|dollars?|euros?|cfa|fcfa|francs?))\s*(?:\/\s*(?:kg|kilo)|le\s*(?:kg|kilo)|per\s*kg)?/i)
  const price = priceMatch ? priceMatch[0].replace(/\s+/g, ' ').trim() : ''

  // Phone — multiple patterns in priority order
  const phoneMatch =
    t.match(/(?:whatsapp|tel|phone|portable|numéro|numero|contact)\s*:?\s*((?:\+|00)\d{1,3}[\s\-.]?\(?\d{1,4}\)?[\s\-.]?\d[\d\s\-.()/]{4,15})/i)?.[1] ||
    t.match(/(?:\+|00)\d{1,3}[\s\-.]?\(?\d{1,4}\)?[\s\-.]?\d[\d\s\-.()/]{4,15}/)?.[0] ||
    t.match(/\b0\d[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}\b/)?.[0] ||
    t.match(/\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b/)?.[0] || ''
  const phone = (phoneMatch || '').replace(/\s+/g, ' ').trim()

  // Name — short line, looks like a person's name
  const lines = t.split('\n').map(l => l.trim()).filter(Boolean)
  const nameLine = lines.find(l => {
    if (l.length < 3 || l.length > 50) return false
    if (/http|www|\.com|facebook|groupe|group|whatsapp|voyag|travel|kg|prix|price|\d{4}/i.test(l)) return false
    const words = l.trim().split(/\s+/)
    return words.length >= 1 && words.length <= 4 && /^[A-Za-zÀ-ÿ]/.test(l)
  })
  const name = nameLine || ''

  const note = t.slice(0, 300).trim()

  return { name, phone, from_city: fromCity, to_city: toCity, date, space, price, note, raw_text: t }
}

// ─────────────────────────────────────────────────────────────────────────────

const btn = {
  base:    { fontSize:11, fontWeight:700, padding:'6px 13px', borderRadius:7, cursor:'pointer', fontFamily:"'Inter',sans-serif", border:'2px solid transparent' },
  approve: { background:'#22c55e', color:'#fff', borderColor:'#16a34a' },
  edit:    { background:'#404040', color:'#fff', borderColor:'#555' },
  reject:  { background:'#ef4444', color:'#fff', borderColor:'#dc2626' },
  import:  { background:'#C8810A', color:'#fff', borderColor:'#b07008' },
  ghost:   { background:'transparent', color:'#555', borderColor:'#333' },
}

function Btn({ type, children, onClick, disabled }) {
  return (
    <button style={{ ...btn.base, ...btn[type], opacity: disabled ? .5 : 1 }} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

const inp = { padding:'9px 12px', borderRadius:8, border:'1px solid #333', background:'#111', color:'#fff', fontSize:13, fontFamily:"'Inter',sans-serif", outline:'none', width:'100%', boxSizing:'border-box' }
const lbl = { fontSize:10, color:'#666', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'.06em' }

export default function FacebookGPPosts({ showToast }) {
  const [posts, setPosts]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [ocrState, setOcrState]     = useState(null)   // null | 'scanning' | 'review'
  const [ocrProgress, setOcrProgress] = useState(0)
  const [draft, setDraft]           = useState(null)
  const [draftImg, setDraftImg]     = useState(null)
  const [saving, setSaving]         = useState(false)
  const [importing, setImporting]   = useState(null)
  const [editingPost, setEditingPost] = useState(null)
  const [showDetails, setShowDetails] = useState({})
  const fileRef = useRef()

  useEffect(() => { fetchPosts() }, [])

  async function fetchPosts() {
    setLoading(true)
    const { data } = await supabase.from('facebook_posts').select('*').order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  async function handleFile(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result
      setDraftImg(dataUrl)
      setOcrState('scanning')
      setOcrProgress(0)
      try {
        const worker = await createWorker('eng+fra', 1, {
          logger: m => { if (m.status === 'recognizing text') setOcrProgress(Math.round(m.progress * 100)) },
        })
        const { data: { text } } = await worker.recognize(dataUrl)
        await worker.terminate()
        setDraft({ ...parseGPPost(text) })
        setOcrState('review')
      } catch (err) {
        showToast('OCR failed: ' + err.message)
        setOcrState(null)
      }
    }
    reader.readAsDataURL(file)
  }

  async function savePost() {
    if (!draft.name && !draft.phone) { showToast('Add at least a name or phone number'); return }
    setSaving(true)
    const { data, error } = await supabase.from('facebook_posts').insert({
      ...draft, screenshot_url: draftImg, status: 'new',
    }).select().single()
    if (!error) {
      setPosts(prev => [data, ...prev])
      showToast('Saved!')
      setOcrState(null); setDraft(null); setDraftImg(null)
    } else {
      showToast('Save failed: ' + error.message)
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
      name, initials: name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || 'GP',
      color: colors[idx], bg: bgs[idx],
      phone: post.phone, from_city: post.from_city, to_city: post.to_city,
      date: post.date, space: post.space, price: post.price, note: post.note,
      approved: true, source: 'facebook',
    })
    if (!error) {
      await supabase.from('facebook_posts').update({ status: 'imported' }).eq('id', post.id)
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'imported' } : p))
      showToast(`${name} imported as a trip!`)
    } else {
      showToast('Import failed: ' + error.message)
    }
    setImporting(null)
  }

  async function deletePost(id) {
    if (!window.confirm('Delete this post?')) return
    const { error } = await supabase.from('facebook_posts').delete().eq('id', id)
    if (!error) { setPosts(prev => prev.filter(p => p.id !== id)); showToast('Deleted') }
  }

  async function saveEdit() {
    const { error } = await supabase.from('facebook_posts').update({
      name: editingPost.name, phone: editingPost.phone,
      from_city: editingPost.from_city, to_city: editingPost.to_city,
      date: editingPost.date, space: editingPost.space, price: editingPost.price, note: editingPost.note,
    }).eq('id', editingPost.id)
    if (!error) {
      setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, ...editingPost } : p))
      setEditingPost(null); showToast('Updated')
    }
  }

  const setD = (k, v) => setDraft(d => ({ ...d, [k]: v }))
  const setE = (k, v) => setEditingPost(p => ({ ...p, [k]: v }))
  const statusColor = s => s === 'imported' ? '#4ade80' : s === 'rejected' ? '#f87171' : '#fbbf24'
  const statusLabel = s => s === 'imported' ? 'Imported' : s === 'rejected' ? 'Rejected' : 'New'

  return (
    <div>

      {/* ── Edit modal ──────────────────────────────────────────────────── */}
      {editingPost && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:998, padding:16 }}>
          <div style={{ background:'#1a1a1a', borderRadius:16, padding:28, width:'100%', maxWidth:440, border:'1px solid #333', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:20, color:'#fff' }}>Edit contact</div>

            {/* Name & Phone — primary */}
            <label style={lbl}>Name</label>
            <input style={{ ...inp, fontSize:15, fontWeight:700, border:'2px solid #C8810A', marginBottom:14 }}
              value={editingPost.name || ''} onChange={e => setE('name', e.target.value)} placeholder="Traveler name..." />
            <label style={lbl}>Phone / WhatsApp</label>
            <input style={{ ...inp, marginBottom:20 }}
              value={editingPost.phone || ''} onChange={e => setE('phone', e.target.value)} placeholder="+1 212 555 0100" />

            {/* Divider */}
            <div style={{ fontSize:10, color:'#444', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>Trip details (optional)</div>
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

      {/* ── Upload zone ─────────────────────────────────────────────────── */}
      {!ocrState && (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
          style={{ border:'2px dashed #333', borderRadius:14, padding:'32px', textAlign:'center', marginBottom:24, cursor:'pointer', background:'#111' }}
        >
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
            onChange={e => { handleFile(e.target.files[0]); e.target.value = '' }} />
          <div style={{ fontSize:32, marginBottom:8 }}>📸</div>
          <div style={{ fontSize:14, fontWeight:600, color:'#ccc' }}>Upload a Facebook group screenshot</div>
          <div style={{ fontSize:12, color:'#555', marginTop:4 }}>Click or drag & drop · Extracts name & phone automatically</div>
        </div>
      )}

      {/* ── OCR scanning ────────────────────────────────────────────────── */}
      {ocrState === 'scanning' && (
        <div style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:14, padding:24, marginBottom:24, textAlign:'center' }}>
          {draftImg && <img src={draftImg} alt="preview" style={{ maxHeight:120, borderRadius:8, marginBottom:14, opacity:.5 }} />}
          <div style={{ background:'#111', borderRadius:8, height:8, overflow:'hidden', marginBottom:8, maxWidth:300, margin:'0 auto 8px' }}>
            <div style={{ height:'100%', background:'#C8810A', width:`${ocrProgress}%`, transition:'width .3s' }} />
          </div>
          <div style={{ fontSize:13, color:'#C8810A', fontWeight:600, marginTop:8 }}>Reading text... {ocrProgress}%</div>
        </div>
      )}

      {/* ── Review panel ────────────────────────────────────────────────── */}
      {ocrState === 'review' && draft && (
        <div style={{ background:'#1a1a1a', border:'1px solid #C8810A', borderRadius:14, padding:24, marginBottom:24 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#C8810A', marginBottom:16 }}>✅ Review & confirm</div>

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
                style={{ ...inp, fontSize:15, fontWeight:700, border:'2px solid #C8810A', marginBottom:12 }}
              />
              <label style={lbl}>Phone / WhatsApp</label>
              <input
                value={draft.phone || ''}
                onChange={e => setD('phone', e.target.value)}
                placeholder="+1 212 555 0100"
                style={{ ...inp, marginBottom:16 }}
              />

              {/* ── SECONDARY: Trip details (collapsible) ── */}
              <button
                onClick={() => setShowDetails(s => ({ ...s, draft: !s.draft }))}
                style={{ ...btn.base, ...btn.ghost, fontSize:11, marginBottom:12 }}>
                {showDetails.draft ? '▲ Hide' : '▼ Show'} trip details (optional)
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
                  <div><label style={lbl}>Date</label><input style={inp} value={draft.date || ''} onChange={e => setD('date', e.target.value)} /></div>
                  <div><label style={lbl}>Space (kg)</label><input style={inp} value={draft.space || ''} onChange={e => setD('space', e.target.value)} /></div>
                  <div><label style={lbl}>Price</label><input style={inp} value={draft.price || ''} onChange={e => setD('price', e.target.value)} /></div>
                </div>
              )}

              <div style={{ display:'flex', gap:8 }}>
                <Btn type="import" onClick={savePost} disabled={saving}>{saving ? 'Saving...' : 'Save contact'}</Btn>
                <Btn type="edit" onClick={() => { setOcrState(null); setDraft(null); setDraftImg(null) }}>Cancel</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Posts list ──────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ color:'#555', padding:'40px 0', textAlign:'center' }}>Loading...</div>
      ) : posts.length === 0 ? (
        <div style={{ background:'#1a1a1a', borderRadius:14, border:'1px solid #2a2a2a', padding:'40px', textAlign:'center' }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
          <div style={{ fontSize:13, color:'#555' }}>No contacts yet. Upload a screenshot to get started.</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {posts.map(post => (
            <div key={post.id} style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:12, padding:'16px 20px', display:'flex', alignItems:'center', gap:16 }}>

              {/* Screenshot thumbnail */}
              {post.screenshot_url && (
                <img src={post.screenshot_url} alt="screenshot"
                  style={{ width:52, height:52, objectFit:'cover', borderRadius:8, border:'1px solid #333', flexShrink:0, cursor:'pointer' }}
                  onClick={() => window.open(post.screenshot_url, '_blank')} />
              )}

              {/* Name + Phone — primary info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                  <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>
                    {post.name || <span style={{ color:'#555', fontWeight:400, fontStyle:'italic' }}>No name</span>}
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, borderRadius:6, padding:'2px 8px', background: statusColor(post.status), color:'#000' }}>
                    {statusLabel(post.status)}
                  </span>
                </div>
                <div style={{ fontSize:13, color: post.phone ? '#4ade80' : '#555', fontWeight: post.phone ? 600 : 400 }}>
                  {post.phone || 'No phone number'}
                </div>

                {/* Secondary info — only if present */}
                {(post.from_city || post.to_city || post.date) && (
                  <div style={{ display:'flex', gap:10, marginTop:6, flexWrap:'wrap' }}>
                    {post.from_city && post.to_city && <span style={{ fontSize:11, color:'#C8810A' }}>✈ {post.from_city} → {post.to_city}</span>}
                    {post.date  && <span style={{ fontSize:11, color:'#666' }}>📅 {post.date}</span>}
                    {post.price && <span style={{ fontSize:11, color:'#666' }}>💰 {post.price}</span>}
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
                <Btn type="edit"   onClick={() => setEditingPost(post)}>Edit</Btn>
                <Btn type="reject" onClick={() => deletePost(post.id)}>✕</Btn>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
