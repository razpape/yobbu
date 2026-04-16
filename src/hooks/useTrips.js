import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { deriveInitials } from '../utils/string'

const PROFILE_SELECT = 'id, full_name, whatsapp_verified, phone, avatar_url, photo_verified'

// Maps a raw Supabase row → the shape our components expect
function rowToTrip(row, profile = {}) {
  const rawName = profile.full_name || row.name || ''
  return {
    id:                  row.id,
    user_id:             row.user_id,
    name:                rawName,
    initials:            row.initials || deriveInitials(rawName),
    color:               row.color,
    bg:                  row.bg,
    from:                row.from_city,
    to:                  row.to_city,
    date:                row.date,
    space:               row.space,
    price:               row.price,
    phone:               row.phone || profile.phone || '',
    note:                row.note,
    pickup_area:         row.pickup_area,
    dropoff_area:        row.dropoff_area,
    flight_number:       row.flight_number,
    service_type:        row.service_type,
    availability_status: row.availability_status || 'open',
    created_at:          row.created_at,
    approved:            row.approved ?? false,
    suspended:           row.suspended ?? false,
    rating:              row.rating,
    trips:               row.trips_count,
    delivered:           row.delivered,
    responseTime:        row.response_time,
    memberSince:         row.member_since,
    phone_verified:      profile.whatsapp_verified ?? false,
    avatar_url:          profile.avatar_url || null,
    photo_verified:      profile.photo_verified ?? false,
    verified: {
      phone:     row.phone_verified     ?? false,
      id:        row.id_verified        ?? false,
      community: row.community_verified ?? false,
    },
    review: {
      text:   row.review_text   || '',
      author: row.review_author || '',
    },
  }
}

// Maps our form data → the shape Supabase expects
function tripToRow(trip) {
  return {
    name:               trip.name,
    initials:           trip.initials,
    color:              trip.color,
    bg:                 trip.bg,
    from_city:          trip.from,
    to_city:            trip.to,
    date:               trip.date,
    space:              trip.space,
    price:              trip.price,
    rating:             trip.rating       ?? 5.0,
    trips_count:        trip.trips        ?? 0,
    delivered:          trip.delivered    ?? 0,
    response_time:      trip.responseTime ?? '—',
    member_since:       trip.memberSince,
    phone_verified:     trip.verified?.phone     ?? false,
    id_verified:        trip.verified?.id        ?? false,
    community_verified: trip.verified?.community ?? false,
    review_text:        trip.review?.text   ?? '',
    review_author:      trip.review?.author ?? '',
    phone:              trip.phone ?? '',
    note:               trip.note  ?? '',
  }
}

async function fetchProfileForRow(row, cache = {}) {
  if (!row.user_id) return rowToTrip(row)
  if (cache[row.user_id]) return rowToTrip(row, cache[row.user_id])

  const { data: p } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', row.user_id)
    .maybeSingle()

  if (p) cache[row.user_id] = p
  return rowToTrip(row, p || {})
}

export function useTrips() {
  const [trips,   setTrips]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const profileCacheRef = useRef({})

  async function fetchTrips() {
    setLoading(true)
    setError(null)

    const { data, error: fetchErr } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchErr) {
      setError(fetchErr.message)
      setLoading(false)
      return
    }

    // Batch-fetch all profiles in one query
    const userIds = [...new Set(data.map(r => r.user_id).filter(Boolean))]
    let profileMap = {}
    if (userIds.length) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select(PROFILE_SELECT)
        .in('id', userIds)
      profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))
      profileCacheRef.current = profileMap
    }

    setTrips(data.map(row => rowToTrip(row, profileMap[row.user_id] || {})))
    setLoading(false)
  }

  useEffect(() => {
    fetchTrips()

    const channel = supabase
      .channel('trips-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trips' }, async ({ new: row }) => {
        const trip = await fetchProfileForRow(row, profileCacheRef.current)
        setTrips(prev => prev.some(t => t.id === row.id) ? prev : [trip, ...prev])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'trips' }, async ({ new: row }) => {
        const trip = await fetchProfileForRow(row, profileCacheRef.current)
        setTrips(prev => prev.map(t => t.id === row.id ? trip : t))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'trips' }, ({ old: row }) => {
        setTrips(prev => prev.filter(t => t.id !== row.id))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  // Insert a new trip — optimistically push to state immediately
  async function addTrip(tripData) {
    const row = tripToRow(tripData)
    const { data, error: insertErr } = await supabase
      .from('trips')
      .insert([row])
      .select()
      .single()

    if (insertErr) throw new Error(insertErr.message)

    // Push optimistically — the realtime handler will deduplicate
    const newTrip = rowToTrip(data)
    setTrips(prev => [newTrip, ...prev])
    return newTrip
  }

  return { trips, loading, error, addTrip, refetch: fetchTrips }
}
