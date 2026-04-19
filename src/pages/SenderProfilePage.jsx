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
      border: '1px solid #E8E4DE',
      borderRadius: 12,
      padding: '14px',
      marginBottom: 10,
      transition: 'all .2s',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.05)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>
            {request.from_city} → {request.to_city}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
            {request.weight}kg {request.description && `• ${request.description.slice(0, 20)}...`}
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: statusColor[request.status] + '12',
          border: `1px solid ${statusColor[request.status]}40`,
          borderRadius: 8,
          padding: '6px 10px',
          flexShrink: 0,
        }}>
          {statusIcon[request.status]}
          <span style={{ fontSize: 11, fontWeight: 600, color: statusColor[request.status] }}>
            {t.status[request.status]}
          </span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: 12,
        fontSize: 11,
        color: '#9CA3AF',
      }}>
        <span>{new Date(request.created_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-US')}</span>
        {request.deadline && <span>•  {new Date(request.deadline).toLocaleDateString(isFr ? 'fr-FR' : 'en-US')}</span>}
        {request.budget && <span>• ${request.budget}/kg</span>}
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
          fontSize: 26,
          color: '#1F2937',
          marginBottom: 20,
          letterSpacing: '-.3px',
        }}>
          {t.greeting}<span style={{ color: '#F59E0B' }}>{firstName}</span> 🧳
        </h1>

        <button
          onClick={() => setView('send')}
          style={{
            width: '100%',
            background: '#F59E0B',
            border: 'none',
            borderRadius: 14,
            padding: '16px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            transition: 'background .2s',
          }}
          onMouseEnter={e => e.target.style.background = '#D97706'}
          onMouseLeave={e => e.target.style.background = '#F59E0B'}
        >
          <div style={{
            width: 44,
            height: 44,
            background: 'rgba(255,255,255,.3)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <PackageIcon size={22} color="#fff" />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 1 }}>
              {t.postPackage}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.85)' }}>
              {t.postDesc}
            </div>
          </div>
          <div style={{ color: '#fff', fontSize: 20, flexShrink: 0 }}>+</div>
        </button>
      </div>

      {/* Stats */}
      {stats.total > 0 && (
        <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
          {[
            { label: t.stats.total, value: stats.total, color: '#F59E0B' },
            { label: t.stats.open, value: stats.open, color: '#10B981' },
            { label: t.stats.matched, value: stats.matched, color: '#F59E0B' },
            { label: t.stats.completed, value: stats.completed, color: '#10B981' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: '#fff',
              border: '1px solid #E8E4DE',
              borderRadius: 12,
              padding: '14px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: color, marginBottom: 4 }}>
                {value}
              </div>
              <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
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
          borderBottom: '1px solid #E8E4DE',
        }}>
          {['all', 'open', 'matched', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 14px',
                borderRadius: 16,
                border: 'none',
                background: filter === f ? '#10B981' : '#F9F7F5',
                color: filter === f ? '#fff' : '#6B7280',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all .2s',
              }}
              onMouseEnter={e => {
                if (filter !== f) e.currentTarget.style.background = '#F0EDE8'
              }}
              onMouseLeave={e => {
                if (filter !== f) e.currentTarget.style.background = '#F9F7F5'
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
            border: '1px solid #E8E4DE',
            borderRadius: 14,
            padding: '36px 24px',
            textAlign: 'center',
          }}>
            <div style={{
              width: 60,
              height: 60,
              background: '#FEF3E2',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <PackageIcon size={30} color="#F59E0B" />
            </div>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 18,
              color: '#1F2937',
              marginBottom: 8,
              letterSpacing: '-.2px',
            }}>
              {t.noRequests}
            </h2>
            <p style={{
              fontSize: 13,
              color: '#9CA3AF',
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
