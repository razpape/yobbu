import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PackageIcon, PlusIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '../components/Icons'

const T = {
  en: {
    greeting: 'Hey, ',
    postPackage: 'Post a package request',
    postDesc: 'Share what you need, find travelers',
    yourRequests: 'your requests',
    noRequests: 'No requests posted yet',
    noRequestsDesc: 'Your package requests will appear here once you share your first one.',
    stats: {
      total: 'Total',
      open: 'Open',
      matched: 'Matched',
      completed: 'Completed',
    },
    status: {
      open: 'Open',
      matched: 'Matched',
      closed: 'Completed',
    },
    filters: {
      all: 'All',
      open: 'Open',
      matched: 'Matched',
      completed: 'Completed',
    },
  },
  fr: {
    greeting: 'Salut, ',
    postPackage: 'Poster une demande',
    postDesc: 'Partagez vos besoins, trouvez des voyageurs',
    yourRequests: 'vos demandes',
    noRequests: 'Aucune demande publiée',
    noRequestsDesc: 'Vos demandes apparaîtront ici une fois que vous partagerez la première.',
    stats: {
      total: 'Total',
      open: 'Ouverte',
      matched: 'Contactée',
      completed: 'Complétée',
    },
    status: {
      open: 'Ouverte',
      matched: 'Contactée',
      closed: 'Complétée',
    },
    filters: {
      all: 'Tous',
      open: 'Ouvertes',
      matched: 'Contactées',
      completed: 'Complétées',
    },
  }
}

function PackageRequestCard({ request, lang }) {
  const isFr = lang === 'fr'
  const t = isFr ? T.fr : T.en

  const statusColor = {
    open: '#10B981',
    matched: '#F59E0B',
    closed: '#22C55E',
  }

  const statusIcon = {
    open: <ClockIcon size={16} color={statusColor.open} />,
    matched: <ClockIcon size={16} color={statusColor.matched} />,
    closed: <CheckCircleIcon size={16} color={statusColor.closed} />,
  }

  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid #E5E1DB',
      borderRadius: 14,
      padding: '16px',
      marginBottom: 12,
      transition: 'border-color .15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
            {request.from_city} → {request.to_city}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>
            {request.weight}kg {request.description && `• ${request.description.slice(0, 20)}...`}
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: statusColor[request.status] + '15',
          border: `1px solid ${statusColor[request.status]}`,
          borderRadius: 8,
          padding: '6px 10px',
        }}>
          {statusIcon[request.status]}
          <span style={{ fontSize: 12, fontWeight: 600, color: statusColor[request.status] }}>
            {t.status[request.status]}
          </span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: 16,
        fontSize: 12,
        color: '#6B7280',
      }}>
        <span>📅 {new Date(request.created_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-US')}</span>
        {request.deadline && <span>⏳ {new Date(request.deadline).toLocaleDateString(isFr ? 'fr-FR' : 'en-US')}</span>}
        {request.budget && <span>💰 ${request.budget}/kg</span>}
      </div>
    </div>
  )
}

export default function SenderProfilePage({ user, lang, setView }) {
  const isFr = lang === 'fr'
  const t = isFr ? T.fr : T.en

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [stats, setStats] = useState({ total: 0, open: 0, matched: 0, completed: 0 })

  const firstName = user?.first_name || user?.phone?.slice(-4) || 'Friend'

  useEffect(() => {
    loadRequests()
  }, [user?.id])

  const loadRequests = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('package_requests')
        .select('*')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setRequests(data || [])

      // Calculate stats
      setStats({
        total: data?.length || 0,
        open: data?.filter(r => r.status === 'open').length || 0,
        matched: data?.filter(r => r.status === 'matched').length || 0,
        completed: data?.filter(r => r.status === 'closed').length || 0,
      })
    } catch (err) {
      console.error('Failed to load requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter)

  return (
    <div style={{ minHeight: '100vh', background: '#FDFBF7', fontFamily: "'DM Sans', sans-serif", paddingBottom: 80 }}>
      {/* Greeting & CTA */}
      <div style={{ padding: '24px 16px 16px' }}>
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 28,
          color: '#1F2937',
          marginBottom: 24,
          letterSpacing: '-.5px',
        }}>
          {t.greeting}<span style={{ color: '#10B981' }}>{firstName}</span> 📦
        </h1>

        <button
          onClick={() => setView('send')}
          style={{
            width: '100%',
            background: '#2D8B4E',
            border: 'none',
            borderRadius: 16,
            padding: '18px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            cursor: 'pointer',
            transition: 'background .15s',
          }}
          onMouseEnter={e => e.target.style.background = '#1F6137'}
          onMouseLeave={e => e.target.style.background = '#2D8B4E'}
        >
          <div style={{
            width: 48,
            height: 48,
            background: 'rgba(255,255,255,.2)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <PackageIcon size={24} color="#fff" />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
              {t.postPackage}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.8)' }}>
              {t.postDesc}
            </div>
          </div>
          <div style={{ color: '#fff', fontSize: 24 }}>→</div>
        </button>
      </div>

      {/* Stats */}
      {stats.total > 0 && (
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: t.stats.total, value: stats.total },
            { label: t.stats.open, value: stats.open },
            { label: t.stats.matched, value: stats.matched },
            { label: t.stats.completed, value: stats.completed },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: '#fff',
              border: '1px solid #E5E1DB',
              borderRadius: 12,
              padding: '12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#10B981', marginBottom: 4 }}>
                {value}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      {stats.total > 0 && (
        <div style={{
          padding: '12px 16px',
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          borderBottom: '1px solid #E5E1DB',
        }}>
          {['all', 'open', 'matched', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: 'none',
                background: filter === f ? '#10B981' : '#fff',
                color: filter === f ? '#fff' : '#6B7280',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all .15s',
              }}
            >
              {t.filters[f]}
            </button>
          ))}
        </div>
      )}

      {/* Requests List or Empty State */}
      <div style={{ padding: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 14, color: '#6B7280' }}>Loading...</div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{
            background: '#fff',
            border: '1.5px solid #E5E1DB',
            borderRadius: 16,
            padding: '40px 24px',
            textAlign: 'center',
          }}>
            <div style={{
              width: 64,
              height: 64,
              background: '#F0FAF4',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <PackageIcon size={32} color="#2D8B4E" />
            </div>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 20,
              color: '#1F2937',
              marginBottom: 8,
              letterSpacing: '-.5px',
            }}>
              {t.noRequests}
            </h2>
            <p style={{
              fontSize: 14,
              color: '#6B7280',
              lineHeight: 1.6,
            }}>
              {t.noRequestsDesc}
            </p>
          </div>
        ) : (
          <div>
            {filteredRequests.map(request => (
              <PackageRequestCard key={request.id} request={request} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
