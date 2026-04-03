import { useState } from 'react'
import { translations } from '../utils/translations'

const FROM_CITIES = ['New York', 'Washington DC', 'Atlanta', 'Houston', 'Los Angeles', 'Paris', 'London']
const TO_CITIES   = ['Dakar', 'Conakry', 'Abidjan', 'Bamako', 'Lomé', 'Cotonou']

export default function PostTripForm({ lang, setView, onAdd }) {
  const t = translations[lang]
  const [form, setForm] = useState({
    name: '', phone: '', from: 'New York', to: 'Dakar',
    date: '', space: '', price: '', note: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]       = useState(false)
  const [error, setError]           = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.name || !form.date || !form.space) {
      setError(t.formRequired)
      return
    }
    setError(null)
    setSubmitting(true)

    try {
      const initials = form.name.trim().split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
      const avatarColors = [
        ['#8A5800', '#FDF3E3'], ['#1A5C38', '#E8F4ED'],
        ['#7A3B1E', '#FDF0E8'], ['#185FA5', '#E6F1FB'],
      ]
      const [color, bg] = avatarColors[Math.floor(Math.random() * avatarColors.length)]

      await onAdd({
        initials, color, bg,
        rating: 5.0, trips: 0, delivered: 0,
        responseTime: '—',
        memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        verified: { phone: false, id: false, community: false },
        review: { text: '', author: '' },
        ...form,
      })

      setSuccess(true)
      setTimeout(() => { setSuccess(false); setView('browse') }, 2200)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="bg-sand rounded-2xl border border-sand-200 p-7">
        <h2 className="font-display text-2xl font-bold text-ink mb-1">{t.formTitle}</h2>
        <p className="text-sm text-ink-200 mb-6">{t.formSub}</p>

        {success && (
          <div className="bg-forest-light border border-green-300 rounded-lg px-4 py-3 mb-5 text-sm font-medium text-forest">
            {t.successMsg}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="section-label mb-3">{t.fsPersonal}</div>
        <label className="text-xs font-semibold text-ink-200 block mb-1.5">{t.flName}</label>
        <input className="form-input mb-4" placeholder="e.g. Aminata Mbaye"
          value={form.name} onChange={(e) => set('name', e.target.value)} />

        <label className="text-xs font-semibold text-ink-200 block mb-1.5">{t.flPhone}</label>
        <input className="form-input mb-4" type="tel" placeholder="+1 (212) 555-0100"
          value={form.phone} onChange={(e) => set('phone', e.target.value)} />

        <div className="h-px bg-sand-200 my-5" />
        <div className="section-label mb-3">{t.fsTrip}</div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-ink-200 block mb-1.5">{t.flFrom}</label>
            <select className="form-input" value={form.from} onChange={(e) => set('from', e.target.value)}>
              {FROM_CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-200 block mb-1.5">{t.flTo}</label>
            <select className="form-input" value={form.to} onChange={(e) => set('to', e.target.value)}>
              {TO_CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-ink-200 block mb-1.5">{t.flDate}</label>
            <input className="form-input" type="date"
              value={form.date} onChange={(e) => set('date', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-200 block mb-1.5">{t.flSpace}</label>
            <input className="form-input" type="number" placeholder="10"
              value={form.space} onChange={(e) => set('space', e.target.value)} />
          </div>
        </div>

        <label className="text-xs font-semibold text-ink-200 block mb-1.5">{t.flPrice}</label>
        <input className="form-input mb-4" placeholder="e.g. $3/kg"
          value={form.price} onChange={(e) => set('price', e.target.value)} />

        <label className="text-xs font-semibold text-ink-200 block mb-1.5">{t.flNote}</label>
        <textarea className="form-input mb-5 resize-none" rows={3} placeholder={t.flNotePh}
          value={form.note} onChange={(e) => set('note', e.target.value)} />

        <button
          className="btn-primary w-full py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={submit}
          disabled={submitting}
        >
          {submitting ? '...' : t.btnSubmit}
        </button>
        <button className="btn-outline w-full py-2.5 text-sm mt-2" onClick={() => setView('browse')}>
          {t.btnCancel}
        </button>
      </div>
    </div>
  )
}
