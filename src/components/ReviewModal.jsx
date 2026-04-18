import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ReviewModal({ gpId, gpName, user, lang, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)

  const isFr = lang === 'fr'

  const copy = {
    title: isFr ? 'Laisser un avis' : 'Leave a Review',
    subtitle: isFr ? `Pour ${gpName}` : `For ${gpName}`,
    commentLabel: isFr ? 'Commentaire (optionnel)' : 'Comment (optional)',
    submitBtn: isFr ? 'Soumettre' : 'Submit',
    cancelBtn: isFr ? 'Annuler' : 'Cancel',
    alreadyDone: isFr ? 'Vous avez déjà laissé un avis pour ce GP.' : 'You already reviewed this GP.',
    selectRating: isFr ? 'Choisissez une note.' : 'Please pick a rating.',
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      setError(copy.selectRating)
      return
    }
    setSubmitting(true)
    setError(null)

    const { data, error: insertErr } = await supabase
      .from('reviews')
      .insert([{
        sender_id: user.id,
        gp_id: gpId,
        rating,
        comment: comment.trim() || null,
      }])
      .select()
      .single()

    if (insertErr) {
      if (insertErr.code === '23505') {
        setAlreadyReviewed(true)
      } else {
        setError(insertErr.message || (isFr ? 'Erreur lors de la soumission.' : 'Error submitting review.'))
      }
      setSubmitting(false)
      return
    }

    onSubmitted(data)
  }

  if (alreadyReviewed) {
    return (
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,.45)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 999,
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff',
            borderRadius: '20px 20px 0 0',
            padding: '28px 24px 40px',
            width: '100%',
            maxWidth: 520,
            boxShadow: '0 -8px 40px rgba(0,0,0,.15)',
            textAlign: 'center',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div style={{ width: 40, height: 4, background: '#E0D8CE', borderRadius: 2, margin: '0 auto 24px' }} />
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A1710', marginBottom: 12 }}>
            {isFr ? 'Avis déjà donné' : 'Already Reviewed'}
          </div>
          <div style={{ fontSize: 14, color: '#6B6860', marginBottom: 24, lineHeight: 1.6 }}>
            {copy.alreadyDone}
          </div>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '13px',
              background: '#52B5D9',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {isFr ? 'Fermer' : 'Close'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.45)',
        display: 'flex',
        alignItems: 'flex-end',
        zIndex: 999,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '20px 20px 0 0',
          padding: '28px 24px 40px',
          width: '100%',
          maxWidth: 520,
          boxShadow: '0 -8px 40px rgba(0,0,0,.15)',
          maxHeight: '90vh',
          overflowY: 'auto',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ width: 40, height: 4, background: '#E0D8CE', borderRadius: 2, margin: '0 auto 24px' }} />

        <div style={{ fontSize: 20, fontWeight: 700, color: '#1A1710', marginBottom: 2 }}>
          {copy.title}
        </div>
        <div style={{ fontSize: 13, color: '#6B6860', marginBottom: 24 }}>
          {copy.subtitle}
        </div>

        {/* Star picker */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 36,
                color: (hoverRating || rating) >= star ? '#F59E0B' : '#D1C4A8',
                transition: 'color .1s',
                padding: 0,
              }}
            >
              {(hoverRating || rating) >= star ? '★' : '☆'}
            </button>
          ))}
        </div>

        {/* Comment */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#3D3829', marginBottom: 8 }}>
            {copy.commentLabel}
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={isFr ? 'Partagez votre expérience...' : 'Share your experience...'}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '2px solid #E0DAD0',
              borderRadius: 12,
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'vertical',
              minHeight: 100,
              transition: 'border-color .2s',
            }}
            onFocus={e => (e.target.style.borderColor = '#52B5D9')}
            onBlur={e => (e.target.style.borderColor = '#E0DAD0')}
          />
        </div>

        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 10,
            padding: '11px 14px',
            color: '#DC2626',
            fontSize: 13,
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '13px',
              background: 'transparent',
              color: '#3D3829',
              border: '1.5px solid #E0DAD0',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'all .2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F9F7F5')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {copy.cancelBtn}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '13px',
              background: submitting ? '#E0DAD0' : '#52B5D9',
              color: submitting ? '#A09080' : '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'all .2s',
            }}
          >
            {submitting ? (isFr ? 'Envoi...' : 'Sending...') : copy.submitBtn}
          </button>
        </div>
      </div>
    </div>
  )
}
