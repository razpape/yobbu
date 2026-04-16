export const AVAILABILITY_STATUS = {
  OPEN: 'open',
  FULL: 'full',
  UNAVAILABLE: 'unavailable',
}

export const TRIP_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  SUSPENDED: 'suspended',
}

export const REQUEST_STATUS = {
  OPEN: 'open',
  MATCHED: 'matched',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

export const VERIFICATION_STATUS = {
  PHONE: 'phone',
  ID: 'id',
  COMMUNITY: 'community',
}

export const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸', name: 'US / Canada' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium' },
  { code: '+221', flag: '🇸🇳', name: 'Senegal' },
  { code: '+224', flag: '🇬🇳', name: 'Guinea' },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire" },
  { code: '+223', flag: '🇲🇱', name: 'Mali' },
  { code: '+229', flag: '🇧🇯', name: 'Benin' },
  { code: '+228', flag: '🇹🇬', name: 'Togo' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+1514', flag: '🇨🇦', name: 'Canada (QC)' },
]

export const CITIES = [
  'Dakar',
  'Conakry',
  'Bamako',
  'Abidjan',
  'Cotonou',
  'Ouagadougou',
  'Douala',
  'Nouakchott',
  'Niamey',
  'Ndjamena',
  'Lome',
  'Libreville',
]

export const SORT_OPTIONS = {
  DATE: 'date',
  RATING: 'rating',
  PRICE: 'price',
}

export const SERVICE_TYPES = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  FRAGILE: 'fragile',
}
