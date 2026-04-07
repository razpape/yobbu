import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
 
// Maps a raw Supabase row → the shape our components expect
function rowToTrip(row, profile = {}) {
  return {
    id:               row.id,
    name:             row.name,
    initials:         row.initials,
    color:            row.color,
    bg:               row.bg,
    from:             row.from_city,
    to:               row.to_city,
    date:             row.date,
    space:            row.space,
    price:            row.price,
    phone:            row.phone,
    note:             row.note,
    rating:           row.rating,
    trips:            row.trips_count,
    delivered:        row.delivered,
    responseTime:     row.response_time,
    memberSince:      row.member_since,
    whatsapp_verified: profile.whatsapp_verified ?? false,
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
 
  // Fetch all trips on mount
  useEffect(() => {
    async function fetchTrips() {
      setLoading(true)
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        // Fetch whatsapp_verified for all trip owners in one query
        const userIds = [...new Set(data.map(r => r.user_id).filter(Boolean))]
        let profileMap = {}
        if (userIds.length) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, whatsapp_verified')
            .in('id', userIds)
          profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))
        }
        setTrips(data.map(row => rowToTrip(row, profileMap[row.user_id] || {})))
      }
      setLoading(false)
    }
 
    fetchTrips()
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
