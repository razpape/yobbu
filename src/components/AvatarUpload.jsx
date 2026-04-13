import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { CameraIcon } from './Icons'

const MAX_SIZE_MB = 3
const ACCEPTED    = ['image/jpeg', 'image/png', 'image/webp']

export default function AvatarUpload({ user, avatarUrl, initials, size = 68, onUpload }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState(null)
  const [hover, setHover]         = useState(false)
  const inputRef                  = useRef()

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    if (!ACCEPTED.includes(file.type)) {
      setError('Please upload a JPG, PNG or WebP image.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_SIZE_MB}MB.`)
      return
    }

    setUploading(true)
    try {
      const ext  = file.name.split('.').pop().toLowerCase()
      const path = `${user.id}.${ext}`   // path inside the bucket — no bucket name prefix

      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateErr) throw updateErr

      onUpload?.(publicUrl)
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
      console.error('[Avatar] Upload error:', err.message)
    } finally {
      setUploading(false)
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div
        style={{ position: 'relative', cursor: 'pointer' }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {/* Avatar circle */}
        <div style={{
          width: size, height: size, borderRadius: '50%',
          background: avatarUrl ? 'transparent' : 'linear-gradient(135deg,#C8891C,#E6A832)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'DM Serif Display, serif', fontSize: size * 0.33, color: '#fff',
          boxShadow: '0 3px 12px rgba(200,137,28,.25)',
          overflow: 'hidden', flexShrink: 0,
          transition: 'filter .2s',
          filter: hover ? 'brightness(0.75)' : 'brightness(1)',
        }}>
          {avatarUrl
            ? <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials
          }
        </div>

        {/* Camera overlay badge */}
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: size * 0.36, height: size * 0.36, borderRadius: '50%',
          background: uploading ? '#8A8070' : '#C8891C',
          border: '2px solid #fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .2s',
        }}>
          {uploading
            ? <div style={{ width: 10, height: 10, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'avatar-spin .7s linear infinite' }} />
            : <CameraIcon size={size * 0.18} color="#fff" />
          }
        </div>
      </div>

      <style>{`@keyframes avatar-spin { to { transform: rotate(360deg); } }`}</style>

      {error && (
        <div style={{ fontSize: 11, color: '#DC2626', textAlign: 'center', maxWidth: 160, lineHeight: 1.4 }}>{error}</div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  )
}
