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

  // AI extraction states
  const [extractState, setExtractState] = useState(null) // null | 'uploading' | 'analyzing' | 'review' | 'error'
  const [draft, setDraft]             = useState(null)
  const [draftImg, setDraftImg]       = useState(null)
  const [confidence, setConfidence]   = useState(0)
  const [errorMsg, setErrorMsg]       = useState('')
  const [saving, setSaving]           = useState(false)

  // Post management
  const [importing, setImporting]     = useState(null)
  const [editingPost, setEditingPost] = useState(null)
  const [showDetails, setShowDetails] = useState({})

  const fileRef = useRef()

  // ── Fetch existing posts ────────────────────────────────────────────────

  useEffect(() => { fetchPosts() }, [])

  async function fetchPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('facebook_posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts(data || [])
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
        // Ensure all fields exist
        const fields = ['name','phone','from_city','to_city','date','space','price','note']
        for (const f of fields) { if (!(f in extracted)) extracted[f] = null }
        if (!('confidence' in extracted)) extracted.confidence = 0

        setDraft(extracted)
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
  }

  // ── Save & import ─────────────────────────────────────────────────────

  async function savePost() {
    if (!draft.name && !draft.phone) {
      showToast?.('Add at least a name or phone number')
      return
    }
    setSaving(true)
    const { data, error } = await supabase
      .from('facebook_posts')
      .insert({ ...draft, screenshot_url: draftImg, status: 'new', source: 'ai_extraction' })
      .select()
      .single()

    if (!error) {
      setPosts(prev => [data, ...prev])
      showToast?.('Saved!')
      resetExtraction()
    } else {
      showToast?.('Save failed: ' + error.message)
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
            <input style={{ ...inp, marginBottom:20 }}
              value={editingPost.phone || ''} onChange={e => setE('phone', e.target.value)} placeholder="+1 212 555 0100" />

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
            {['Name','Phone','Route','Date','Price','Space'].map(tag => (
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
              <label style={lbl}>Phone / WhatsApp</label>
              <input
                value={draft.phone || ''}
                onChange={e => setD('phone', e.target.value)}
                placeholder="+1 212 555 0100"
                style={{ ...inp, marginBottom:16 }}
              />

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
                <div style={{ fontSize:13, color: post.phone ? '#4ade80' : '#555', fontWeight: post.phone ? 600 : 400 }}>
                  {post.phone || 'No phone number'}
                </div>

                {(post.from_city || post.to_city || post.date) && (
                  <div style={{ display:'flex', gap:10, marginTop:6, flexWrap:'wrap' }}>
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
