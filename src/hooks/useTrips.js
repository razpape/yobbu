import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Maps a raw Supabase row → the shape our components expect
function rowToTrip(row, profile = {}) {
  return {
    id:               row.id,
    user_id:          row.user_id,
    name:             profile.full_name || row.name || '',
    initials:         row.initials || (profile.full_name || row.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'GP',
    color:            row.color,
    bg:               row.bg,
    from:             row.from_city,
    to:               row.to_city,
    date:             row.date,
    space:            row.space,
    price:            row.price,
    phone:            row.phone || profile.phone || '',
    note:             row.note,
    pickup_area:        row.pickup_area,
    dropoff_area:       row.dropoff_area,
    flight_number:      row.flight_number,
    availability_status: row.availability_status || 'open',
    rating:           row.rating,
    trips:            row.trips_count,
    delivered:        row.delivered,
    responseTime:     row.response_time,
    memberSince:      row.member_since,
    phone_verified: profile.whatsapp_verified ?? false,
    avatar_url:     profile.avatar_url || null,
    photo_verified: profile.photo_verified ?? false,
    verified: {
      phone:     row.phone_verified,
      id:        row.id_verified,
      community: row.community_verified,
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
    name:              trip.name,
    initials:          trip.initials,
    color:             trip.color,
    bg:                trip.bg,
    from_city:         trip.from,
    to_city:           trip.to,
    date:              trip.date,
    space:             trip.space,
    price:             trip.price,
    rating:            trip.rating      ?? 5.0,
    trips_count:       trip.trips       ?? 0,
    delivered:         trip.delivered   ?? 0,
    response_time:     trip.responseTime ?? '—',
    member_since:      trip.memberSince,
    phone_verified:    trip.verified?.phone     ?? false,
    id_verified:       trip.verified?.id        ?? false,
    community_verified:trip.verified?.community ?? false,
    review_text:       trip.review?.text   ?? '',
    review_author:     trip.review?.author ?? '',
    phone:             trip.phone ?? '',
    note:              trip.note  ?? '',
  }
}

export function useTrips() {
  const [trips,   setTrips]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  async function fetchTrips() {
    setLoading(true)
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      const userIds = [...new Set(data.map(r => r.user_id).filter(Boolean))]
      let profileMap = {}
      if (userIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, whatsapp_verified, phone, avatar_url, photo_verified')
          .in('id', userIds)
        profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))
      }
      setTrips(data.map(row => rowToTrip(row, profileMap[row.user_id] || {})))
    }
    setLoading(false)
  }

  // Fetch on mount + realtime subscription (granular updates — no full refetch)
  useEffect(() => {
    fetchTrips()

    const channel = supabase
      .channel('trips-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trips' }, ({ new: row }) => {
        setTrips(prev => [rowToTrip(row), ...prev])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'trips' }, ({ new: row }) => {
        setTrips(prev => prev.map(t => t.id === row.id ? rowToTrip(row) : t))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'trips' }, ({ old: row }) => {
        setTrips(prev => prev.filter(t => t.id !== row.id))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  // Insert a new trip
  async function addTrip(tripData) {
    const row = tripToRow(tripData)
    const { data, error } = await supabase
      .from('trips')
      .insert([row])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    const newTrip = rowToTrip(data)
    setTrips((prev) => [newTrip, ...prev])
    return newTrip
  }

  return { trips, loading, error, addTrip }
}
