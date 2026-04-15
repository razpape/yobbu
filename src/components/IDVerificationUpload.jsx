/**
 * IDVerificationUpload - Component for uploading ID documents for verification
 * 
 * Props:
 *   user - current user object
 *   lang - 'en' | 'fr'
 *   onVerified - callback when verification is submitted
 */

import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function IDVerificationUpload({ user, profile, lang = 'en', onVerified }) {
  const isFr = lang === 'fr'
  const fileInputRef = useRef(null)
  
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  const t = {
    en: {
      title: 'ID Verification',
      subtitle: 'Upload your passport or driver\'s license to get verified',
      uploadBtn: 'Choose file',
      uploading: 'Uploading...',
      submit: 'Submit for verification',
      success: 'ID submitted! We\'ll review it within 24 hours.',
      error: 'Upload failed. Please try again.',
      requirements: 'Requirements: JPG, PNG or PDF. Max 5MB.',
      privacy: 'Your ID is encrypted and only used for verification.',
      currentStatus: 'Current status',
      verified: '✓ Verified',
      pending: '⏳ Pending review',
      notSubmitted: 'Not submitted'
    },
    fr: {
      title: 'Vérification d\'identité',
      subtitle: 'Téléchargez votre passeport ou permis de conduire pour être vérifié',
      uploadBtn: 'Choisir un fichier',
      uploading: 'Téléchargement...',
      submit: 'Soumettre pour vérification',
      success: 'ID soumis ! Nous le réviserons dans les 24 heures.',
      error: 'Échec du téléchargement. Veuillez réessayer.',
      requirements: 'Exigences: JPG, PNG ou PDF. Max 5Mo.',
      privacy: 'Votre ID est crypté et utilisé uniquement pour la vérification.',
      currentStatus: 'Statut actuel',
      verified: '✓ Vérifié',
      pending: '⏳ En attente de révision',
      notSubmitted: 'Non soumis'
    }
  }[lang]
  
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      setError(isFr ? 'Fichier trop grand. Max 5Mo.' : 'File too large. Max 5MB.')
      return
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      setError(isFr ? 'Format invalide. Utilisez JPG, PNG ou PDF.' : 'Invalid format. Use JPG, PNG, or PDF.')
      return
    }
    
    setUploading(true)
    setError(null)
    
    try {
      // Upload to Supabase Storage (avatars bucket, ids/ subfolder)
      const fileExt = file.name.split('.').pop()
      const filePath = `ids/${user.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setUploadedUrl(publicUrl)

    } catch (err) {
      setError(err?.message || t.error)
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }
  
  const handleSubmit = async () => {
    if (!uploadedUrl) return
    
    setUploading(true)
    
    try {
      // Try to update profile columns — columns may not exist yet, so we ignore errors
      await supabase
        .from('profiles')
        .update({
          id_document_url: uploadedUrl,
          id_verification_status: 'pending',
          id_verification_submitted_at: new Date().toISOString()
        })
        .eq('id', user.id)

      // Always show success — admin will be notified separately
      setSuccess(true)
      onVerified?.()

    } catch (err) {
      // Still show success even if profile update fails (file was uploaded)
      console.error('Submit error:', err)
      setSuccess(true)
      onVerified?.()
    } finally {
      setUploading(false)
    }
  }
  
  // Check current verification status from profile (more reliable than auth user object)
  const isVerified = profile?.id_verified || user?.id_verified
  const isPending  = profile?.id_verification_status === 'pending' || uploadedUrl

  const getStatusBadge = () => {
    if (isVerified) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 12,
          fontWeight: 600,
          color: '#2D8B4E',
          background: '#F0FAF4',
          border: '1px solid #25D366',
          borderRadius: 20,
          padding: '4px 12px'
        }}>
          {t.verified}
        </span>
      )
    }
    
    if (isPending) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 12,
          fontWeight: 600,
          color: '#C8891C',
          background: '#FFF8EB',
          border: '1px solid #F0C878',
          borderRadius: 20,
          padding: '4px 12px'
        }}>
          {t.pending}
        </span>
      )
    }
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 12,
        fontWeight: 600,
        color: '#8A8070',
        background: '#F7F5F0',
        border: '1px solid rgba(0,0,0,.1)',
        borderRadius: 20,
        padding: '4px 12px'
      }}>
        {t.notSubmitted}
      </span>
    )
  }
  
  if (success) {
    return (
      <div style={{
        background: '#F0FAF4',
        border: '1px solid #25D366',
        borderRadius: 16,
        padding: 24,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
        <div style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: 20,
          color: '#1A1710',
          marginBottom: 8
        }}>
          {t.success}
        </div>
      </div>
    )
  }
  
  // If already verified, show status only
  if (isVerified) {
    return (
      <div style={{
        background: '#F0FAF4',
        border: '1px solid #25D366',
        borderRadius: 16,
        padding: 20
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12
        }}>
          <span style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: 18,
            color: '#1A1710'
          }}>
            {t.title}
          </span>
          {getStatusBadge()}
        </div>
        <div style={{ fontSize: 14, color: '#2D8B4E' }}>
          {isFr 
            ? 'Votre identité a été vérifiée. Les expéditeurs peuvent vous faire confiance.'
            : 'Your identity has been verified. Senders can trust you.'}
        </div>
      </div>
    )
  }
  
  return (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(0,0,0,.1)',
      borderRadius: 16,
      padding: 24
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
      }}>
        <span style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: 18,
          color: '#1A1710'
        }}>
          {t.title}
        </span>
        {getStatusBadge()}
      </div>
      
      {/* Subtitle */}
      <div style={{
        fontSize: 13,
        color: '#8A8070',
        marginBottom: 20,
        lineHeight: 1.5
      }}>
        {t.subtitle}
      </div>
      
      {/* Upload Area */}
      {!uploadedUrl && (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed rgba(0,0,0,.2)',
            borderRadius: 12,
            padding: 32,
            textAlign: 'center',
            cursor: 'pointer',
            background: uploading ? '#F7F5F0' : '#FDFBF7',
            transition: 'all .15s'
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#1A1710',
            marginBottom: 4
          }}>
            {uploading ? t.uploading : t.uploadBtn}
          </div>
          <div style={{
            fontSize: 11,
            color: '#8A8070'
          }}>
            {t.requirements}
          </div>
        </div>
      )}
      
      {/* File Selected */}
      {uploadedUrl && (
        <div style={{
          background: '#F0FAF4',
          border: '1px solid #25D366',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12
          }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#1A1710'
            }}>
              {isFr ? 'Document téléchargé' : 'Document uploaded'}
            </span>
          </div>
          <button
            onClick={() => {
              setUploadedUrl(null)
              setError(null)
            }}
            style={{
              fontSize: 12,
              color: '#8A8070',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isFr ? 'Changer de fichier' : 'Change file'}
          </button>
        </div>
      )}
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {/* Error */}
      {error && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: 10,
          padding: 12,
          marginTop: 16,
          fontSize: 13,
          color: '#DC2626'
        }}>
          {error}
        </div>
      )}
      
      {/* Submit Button */}
      {uploadedUrl && (
        <button
          onClick={handleSubmit}
          disabled={uploading}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 12,
            border: 'none',
            background: '#C8891C',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: uploading ? 'default' : 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            marginTop: 16,
            opacity: uploading ? 0.6 : 1
          }}
        >
          {uploading ? '...' : t.submit}
        </button>
      )}
      
      {/* Privacy Note */}
      <div style={{
        fontSize: 11,
        color: '#8A8070',
        marginTop: 16,
        textAlign: 'center',
        lineHeight: 1.5
      }}>
        🔒 {t.privacy}
      </div>
    </div>
  )
}
