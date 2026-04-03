import { useState } from 'react'
import { translations } from '../utils/translations'

function Stars({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(rating) ? 'text-gold' : 'text-sand-200'}>
          ★
        </span>
      ))}
    </span>
  )
}

function VerifiedBadges({ verified, lang }) {
  const t = translations[lang]
  const badges = [
    { key: 'phone',     label: t.badgePhone,     color: 'text-forest bg-forest-light' },
    { key: 'id',        label: t.badgeId,         color: 'text-gold-dark bg-gold-light' },
    { key: 'community', label: t.badgeCommunity,  color: 'text-orange-800 bg-orange-50' },
  ]

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {badges.map(({ key, label, color }) =>
        verified[key] ? (
          <span key={key} className={`badge ${color}`}>
            <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] text-white ${
              key === 'phone' ? 'bg-forest' : key === 'id' ? 'bg-gold' : 'bg-orange-700'
            }`}>✓</span>
            {label}
          </span>
        ) : key === 'id' ? (
          <span key={key} className="badge bg-sand-100 text-ink-300 border border-sand-200">
            {t.idPending}
          </span>
        ) : null
      )}
    </div>
  )
}

export default function GPCard({ gp, lang }) {
  const [showReview, setShowReview] = useState(false)
  const t = translations[lang]
  const route = gp.from === 'Paris' ? `Paris → ${gp.to}` : `${gp.from} → ${gp.to}`

  return (
    <div className="card">
      {/* Top: avatar + info */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative flex-shrink-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: gp.bg, color: gp.color }}
          >
            {gp.initials}
          </div>
          {gp.verified.id && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-sand rounded-full border border-sand-200 flex items-center justify-center text-[9px]">
              🛡
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">{gp.name}</span>
            <span className="text-[11px] text-ink-300">{t.memberSince} {gp.memberSince}</span>
          </div>
          <div className="flex items-center gap-1.5 my-1">
            <Stars rating={gp.rating} />
            <span className="text-xs font-semibold text-ink">{gp.rating.toFixed(1)}</span>
            <span className="text-[11px] text-ink-300">
              ({gp.trips} {t.tripsLabel} · {gp.delivered} {t.deliveredLabel})
            </span>
          </div>
          <VerifiedBadges verified={gp.verified} lang={lang} />
        </div>
      </div>

      {/* Pills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="pill bg-gold-light text-gold-dark">{route}</span>
        <span className="pill bg-forest-light text-forest">{gp.date}</span>
        <span className="pill bg-orange-50 text-orange-800">~{gp.space} kg</span>
        <span className="pill bg-sand-100 text-ink-200">{gp.price}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-ink-300">⏱ {t.responds} {gp.responseTime}</span>
        <div className="flex items-center gap-2">
          <button
            className="text-[11px] font-semibold text-gold-dark hover:text-gold transition-colors"
            onClick={(e) => { e.stopPropagation(); setShowReview((v) => !v) }}
          >
            {showReview ? t.hideReview : t.seeReview}
          </button>
          <button className="btn-primary text-xs px-4 py-1.5">
            {t.contact}
          </button>
        </div>
      </div>

      {/* Review */}
      {showReview && (
        <div className="mt-3 bg-sand-100 rounded-lg p-3 border-l-2 border-gold-mid">
          <p className="text-xs text-ink-200 leading-relaxed italic">"{gp.review.text}"</p>
          <p className="text-[11px] text-ink-300 mt-1.5 font-medium">— {gp.review.author}</p>
        </div>
      )}
    </div>
  )
}
