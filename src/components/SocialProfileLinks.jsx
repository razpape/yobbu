/**
 * SocialProfileLinks - Component to add/edit social profile links for transparency
 *
 * Props:
 *   profile - user profile object
 *   lang - 'en' | 'fr'
 *   onSave - callback when links are saved
 */

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function SocialProfileLinks({ profile, lang = 'en', onSave }) {
  const isFr = lang === 'fr'
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [facebookUrl,  setFacebookUrl]  = useState(profile?.facebook_url  || '')
  const [instagramUrl, setInstagramUrl] = useState(profile?.instagram_url || '')
  const [twitterUrl,   setTwitterUrl]   = useState(profile?.twitter_url   || '')
  const [linkedinUrl,  setLinkedinUrl]  = useState(profile?.linkedin_url  || '')

  const t = {
    en: {
      title: 'Social Profiles',
      subtitle: 'Link your social profiles to build trust with senders',
      facebook: 'Facebook',
      instagram: 'Instagram',
      twitter: 'Twitter / X',
      linkedin: 'LinkedIn',
      add: 'Add links',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      placeholderFB: 'https://facebook.com/yourname',
      placeholderIG: 'https://instagram.com/yourname',
      placeholderTW: 'https://twitter.com/yourname',
      placeholderLI: 'https://linkedin.com/in/yourname',
      why: 'Why add social profiles?',
      reason1: '• Shows you\'re a real person',
      reason2: '• Builds trust with senders',
      reason3: '• Increases booking requests',
      notSet: 'Not set',
      view: 'View profile'
    },
    fr: {
      title: 'Profils Sociaux',
      subtitle: 'Liez vos profils sociaux pour établir la confiance avec les expéditeurs',
      facebook: 'Facebook',
      instagram: 'Instagram',
      twitter: 'Twitter / X',
      linkedin: 'LinkedIn',
      add: 'Ajouter des liens',
      edit: 'Modifier',
      save: 'Enregistrer',
      cancel: 'Annuler',
      placeholderFB: 'https://facebook.com/votrenom',
      placeholderIG: 'https://instagram.com/votrenom',
      placeholderTW: 'https://twitter.com/votrenom',
      placeholderLI: 'https://linkedin.com/in/votrenom',
      why: 'Pourquoi ajouter des profils sociaux ?',
      reason1: '• Montre que vous êtes une vraie personne',
      reason2: '• Établit la confiance avec les expéditeurs',
      reason3: '• Augmente les demandes de réservation',
      notSet: 'Non défini',
      view: 'Voir le profil'
    }
  }[lang]

  const handleSave = async () => {
    setSaving(true)
    try {
      const fbValid = !facebookUrl  || facebookUrl.includes('facebook.com')
      const igValid = !instagramUrl || instagramUrl.includes('instagram.com')
      const twValid = !twitterUrl   || twitterUrl.includes('twitter.com') || twitterUrl.includes('x.com')
      const liValid = !linkedinUrl  || linkedinUrl.includes('linkedin.com')

      if (!fbValid || !igValid || !twValid || !liValid) {
        alert(isFr ? 'URL invalide' : 'Invalid URL')
        setSaving(false)
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          facebook_url:  facebookUrl  || null,
          instagram_url: instagramUrl || null,
          twitter_url:   twitterUrl   || null,
          linkedin_url:  linkedinUrl  || null,
        })
        .eq('id', profile.id)

      if (error) throw error

      setEditing(false)
      onSave?.({ facebook_url: facebookUrl, instagram_url: instagramUrl, twitter_url: twitterUrl, linkedin_url: linkedinUrl })

    } catch (err) {
      console.error('Save error:', err)
      alert(isFr ? 'Erreur de sauvegarde' : 'Save error')
    } finally {
      setSaving(false)
    }
  }

  const hasLinks = profile?.facebook_url || profile?.instagram_url || profile?.twitter_url || profile?.linkedin_url

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid rgba(0,0,0,.1)',
    background: '#FDFBF7',
    color: '#1A1710',
    fontSize: 13,
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: '#8A8070',
    textTransform: 'uppercase',
    letterSpacing: '.06em',
    marginBottom: 6,
  }

  const socialFields = [
    { label: t.facebook,  value: facebookUrl,  set: setFacebookUrl,  placeholder: t.placeholderFB, color: '#1877F2', bg: '#F0F2F5', icon: 'f' },
    { label: t.instagram, value: instagramUrl, set: setInstagramUrl, placeholder: t.placeholderIG, color: '#E1306C', bg: '#FDF0F5', icon: '📷' },
    { label: t.twitter,   value: twitterUrl,   set: setTwitterUrl,   placeholder: t.placeholderTW, color: '#1DA1F2', bg: '#E8F5FD', icon: '𝕏' },
    { label: t.linkedin,  value: linkedinUrl,  set: setLinkedinUrl,  placeholder: t.placeholderLI, color: '#0A66C2', bg: '#E8F4F9', icon: 'in' },
  ]

  if (editing) {
    return (
      <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.1)', borderRadius: 16, padding: 20 }}>
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: '#1A1710', marginBottom: 16 }}>
          {t.title}
        </div>

        {socialFields.map(({ label, value, set, placeholder }) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{label}</label>
            <input
              type="url"
              value={value}
              onChange={e => set(e.target.value)}
              placeholder={placeholder}
              style={inputStyle}
            />
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: '#52B5D9', color: '#fff', fontSize: 14, fontWeight: 600, cursor: saving ? 'default' : 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: saving ? 0.6 : 1 }}>
            {saving ? '...' : t.save}
          </button>
          <button onClick={() => setEditing(false)}
            style={{ padding: '12px 20px', borderRadius: 10, border: '1px solid rgba(0,0,0,.1)', background: 'transparent', color: '#8A8070', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            {t.cancel}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.1)', borderRadius: 16, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: '#1A1710' }}>
          {t.title}
        </span>
        <button onClick={() => setEditing(true)}
          style={{ fontSize: 12, fontWeight: 600, color: '#52B5D9', background: 'none', border: 'none', cursor: 'pointer' }}>
          {hasLinks ? t.edit : t.add}
        </button>
      </div>

      {!hasLinks && (
        <div style={{ background: '#FDFBF7', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1710', marginBottom: 8 }}>{t.why}</div>
          <div style={{ fontSize: 12, color: '#8A8070', lineHeight: 1.6 }}>
            {t.reason1}<br/>
            {t.reason2}<br/>
            {t.reason3}
          </div>
        </div>
      )}

      {hasLinks && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {socialFields.filter(f => {
            if (f.label === t.facebook)  return !!profile?.facebook_url
            if (f.label === t.instagram) return !!profile?.instagram_url
            if (f.label === t.twitter)   return !!profile?.twitter_url
            if (f.label === t.linkedin)  return !!profile?.linkedin_url
            return false
          }).map(({ label, color, bg, icon }) => {
            const url = label === t.facebook  ? profile?.facebook_url
                      : label === t.instagram ? profile?.instagram_url
                      : label === t.twitter   ? profile?.twitter_url
                      : profile?.linkedin_url
            return (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: bg, borderRadius: 10, textDecoration: 'none', color: '#1A1710', fontSize: 13 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{icon}</span>
                <span style={{ flex: 1, fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 11, color }}>{t.view} →</span>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
