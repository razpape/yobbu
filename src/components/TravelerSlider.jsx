import { useRef, useState, useEffect } from 'react'
import { translations } from '../utils/translations'

const CARD_WIDTH = 240
const CARD_GAP = 14

export default function TravelerSlider({ trips, lang, user, onLoginRequired, setView }) {
  const trackRef = useRef(null)
  const [current, setCurrent] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const t = translations[lang]
  const isFr = lang === 'fr'

  const displayed = trips.slice(0, 8)

  function goTo(i) {
    const idx = Math.max(0, Math.min(i, displayed.length - 1))
    setCurrent(idx)
    trackRef.current?.scrollTo({ left: idx * (CARD_WIDTH + CARD_GAP), behavior: 'smooth' })
  }

  function handleContact(e, gp) {
    e.stopPropagation()
    if (!user) { onLoginRequired(); return }
    const message = encodeURIComponent(
      `Hi ${gp.name}, I found you on Yobbu and I'd like to send a package to ${gp.to}. Can we discuss?`
    )
    window.open(`https://wa.me/${gp.phone?.replace(/\D/g,'')}?text=${message}`, '_blank')
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const onScroll = () => setCurrent(Math.round(el.scrollLeft / (CARD_WIDTH + CARD_GAP)))
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  if (!displayed.length) return null

  return (
    <section className="py-16 border-b border-sand-200 overflow-hidden" style={{ background: '#FDFAF6' }}>
      {/* Header */}
      <div className="flex items-end justify-between px-8 mb-8">
        <div>
          <div className="inline-block text-xs font-bold bg-gold-light text-gold-dark rounded-full px-4 py-1.5 mb-3 tracking-wider uppercase border border-amber-200">
            {isFr ? 'Disponibles maintenant' : 'Available now'}
          </div>
          <h2 className="font-display text-3xl font-bold text-ink leading-tight">
            {isFr ? <>Voyageurs prêts à porter<br /><em className="not-italic text-gold">vos colis chez vous</em></> : <>Travelers ready to carry<br /><em className="not-italic text-gold">your packages home</em></>}
          </h2>
        </div>
        <button
          onClick={() => setView('browse')}
          className="text-xs font-semibold text-gold-dark border border-amber-200 rounded-full px-4 py-2 bg-transparent hover:bg-gold-light transition-colors whitespace-nowrap"
        >
          {isFr ? 'Voir tous →' : 'See all →'}
        </button>
      </div>

      {/* Slider */}
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => goTo(current - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-sand-200 flex items-center justify-center shadow-sm hover:border-gold-mid hover:bg-gold-light transition-all"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#C8810A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        {/* Track */}
        <div
          ref={trackRef}
          className={`flex gap-3.5 px-8 pb-3 overflow-x-auto select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={e => { setDragging(true); startX.current = e.pageX - trackRef.current.offsetLeft; scrollLeft.current = trackRef.current.scrollLeft }}
          onMouseLeave={() => setDragging(false)}
          onMouseUp={() => setDragging(false)}
          onMouseMove={e => { if (!dragging) return; e.preventDefault(); trackRef.current.scrollLeft = scrollLeft.current - (e.pageX - trackRef.current.offsetLeft - startX.current) * 1.5 }}
        >
          {displayed.map((gp) => {
            const route = gp.from === 'Paris' ? `Paris → ${gp.to}` : `${gp.from} → ${gp.to}`
            return (
              <div
                key={gp.id}
                className="flex-shrink-0 bg-white border border-sand-200 rounded-2xl p-4 flex flex-col gap-3 hover:border-gold-mid hover:-translate-y-0.5 transition-all"
                style={{ width: CARD_WIDTH, scrollSnapAlign: 'start' }}
              >
                {/* Top */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: gp.bg, color: gp.color }}>
                    {gp.initials}
                  </div>
                  <div className="text-sm font-bold text-ink">{gp.name}</div>
                </div>

                {/* Route + dates */}
                <div className="bg-sand-100 rounded-xl p-3 flex flex-col gap-2">
                  <div className="text-sm font-semibold text-ink">{route}</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-bold text-ink-300 uppercase tracking-wider mb-0.5">
                        {isFr ? 'Départ' : 'Departs'}
                      </div>
                      <div className="text-xs font-semibold text-ink-200">{gp.date}</div>
                    </div>
                    <div className="w-px h-6 bg-sand-200" />
                    <div className="text-right">
                      <div className="text-[9px] font-bold text-ink-300 uppercase tracking-wider mb-0.5">
                        {isFr ? 'Arrive' : 'Arrives'}
                      </div>
                      <div className="text-xs font-semibold text-ink-200">+1 day</div>
                    </div>
                  </div>
                </div>

                {/* Contact button */}
                <button
                  className="w-full py-2.5 rounded-lg bg-gold text-white text-xs font-semibold hover:bg-gold-dark transition-colors"
                  onClick={e => handleContact(e, gp)}
                >
                  {isFr ? 'Contacter' : 'Contact'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => goTo(current + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-sand-200 flex items-center justify-center shadow-sm hover:border-gold-mid hover:bg-gold-light transition-all"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#C8810A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {displayed.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="border-none cursor-pointer transition-all rounded-full"
            style={{ width: current === i ? 18 : 5, height: 5, background: current === i ? '#C8810A' : '#E8E0D4', borderRadius: 3 }}
          />
        ))}
      </div>
    </section>
  )
}