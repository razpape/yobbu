// Amadeus Flight API - Get live flight prices
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { from, to, date } = req.query

  if (!from || !to) {
    return res.status(400).json({ error: 'Origin and destination required' })
  }

  // City code mapping
  const CITY_CODES = {
    'New York': 'JFK', 'NYC': 'JFK',
    'Paris': 'CDG',
    'Atlanta': 'ATL',
    'Houston': 'IAH',
    'Washington DC': 'DCA',
    'London': 'LHR',
    'Montreal': 'YUL',
    'Brussels': 'BRU',
    'Dakar': 'DSS',
    'Conakry': 'CKY',
    'Abidjan': 'ABJ',
    'Bamako': 'BKO',
    'Lomé': 'LFW',
    'Accra': 'ACC',
    'Cotonou': 'COO',
  }

  const originCode = CITY_CODES[from] || from.slice(0, 3).toUpperCase()
  const destCode = CITY_CODES[to] || to.slice(0, 3).toUpperCase()

  // Use default date (tomorrow) if not provided
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = tomorrow.toISOString().split('T')[0]
  const departureDate = date || defaultDate

  try {
    // Get Amadeus access token
    const clientId = process.env.AMADEUS_CLIENT_ID
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      // Fallback to cached/estimated prices if no API credentials
      return res.status(200).json({
        prices: getEstimatedPrices(originCode, destCode),
        source: 'estimate',
        message: 'Live prices unavailable - showing estimates'
      })
    }

    // Get access token
    const tokenRes = await fetch('https://api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })

    if (!tokenRes.ok) {
      throw new Error('Failed to get Amadeus token')
    }

    const { access_token } = await tokenRes.json()

    // Search flight offers
    const searchUrl = `https://api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${originCode}&destinationLocationCode=${destCode}&departureDate=${departureDate}&adults=1&max=5&currencyCode=USD`

    const flightRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!flightRes.ok) {
      throw new Error('Flight search failed')
    }

    const flightData = await flightRes.json()

    // Extract lowest prices
    const prices = flightData.data?.map(offer => ({
      price: parseFloat(offer.price.total),
      currency: offer.price.currency,
      airline: offer.validatingAirlineCodes?.[0] || 'Unknown',
      duration: offer.itineraries[0]?.duration,
      stops: offer.itineraries[0]?.segments.length - 1,
    })) || []

    const lowestPrice = prices.length > 0 ? Math.min(...prices.map(p => p.price)) : null
    const priceRange = prices.length > 0 ? {
      low: Math.min(...prices.map(p => p.price)),
      high: Math.max(...prices.map(p => p.price)),
    } : null

    res.status(200).json({
      prices: priceRange || getEstimatedPrices(originCode, destCode),
      source: 'live',
      route: `${originCode} → ${destCode}`,
      date: departureDate,
      lastUpdated: new Date().toISOString(),
    })

  } catch (err) {
    console.error('Flight price error:', err)
    // Return estimates on error
    res.status(200).json({
      prices: getEstimatedPrices(originCode, destCode),
      source: 'estimate',
      error: 'Live prices unavailable'
    })
  }
}

function getEstimatedPrices(from, to) {
  // Known route estimates as fallback
  const ESTIMATES = {
    'JFK-DSS': { low: 850, high: 1400, duration: '8-10h' },
    'JFK-CDG': { low: 400, high: 900, duration: '7-8h' },
    'ATL-DSS': { low: 950, high: 1600, duration: '9-11h' },
    'IAD-DSS': { low: 900, high: 1500, duration: '8-10h' },
    'YUL-DSS': { low: 800, high: 1300, duration: '8-10h' },
  }

  const key = `${from}-${to}`
  return ESTIMATES[key] || { low: 600, high: 1200, duration: '8-12h' }
}
