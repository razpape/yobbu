import { useState, useRef } from 'react'

const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸', name: 'US / Canada', mask: '(___) ___-____' },
  { code: '+44', flag: '🇬🇧', name: 'UK', mask: '____ _______' },
  { code: '+33', flag: '🇫🇷', name: 'France', mask: '_ __ __ __ __' },
  { code: '+221', flag: '🇸🇳', name: 'Senegal', mask: '__ ___ __ __' },
  { code: '+224', flag: '🇬🇳', name: 'Guinea', mask: '___ ___ ___' },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire", mask: '__ ___ ___' },
  { code: '+223', flag: '🇲🇱', name: 'Mali', mask: '__ __ __ __' },
  { code: '+229', flag: '🇧🇯', name: 'Benin', mask: '__ ___ ___' },
  { code: '+228', flag: '🇹🇬', name: 'Togo', mask: '__ ___ ___' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana', mask: '__ ___ ____' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium', mask: '___ ___ ___' },
  { code: '+1514', flag: '🇨🇦', name: 'Canada (QC)', mask: '___-___-____' },
]

export default function PhoneInput({ value, onChange, onValid, lang = 'en' }) {
  const isFr = lang === 'fr'
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0])
  const [showDropdown, setShowDropdown] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const inputRef = useRef(null)

  const handleCountrySelect = (country) => {
    setSelectedCountry(country)
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    setPhoneNumber(raw)
    
    const fullNumber = `${selectedCountry.code}${raw}`
    onChange?.(fullNumber)
    
    // Basic validation - at least 10 digits
    const isValid = raw.length >= 10
    onValid?.(isValid)
  }

  const formatDisplay = (raw) => {
    if (!raw) return ''
    const mask = selectedCountry.mask
    let formatted = ''
    let rawIndex = 0
    
    for (let i = 0; i < mask.length && rawIndex < raw.length; i++) {
      if (mask[i] === '_') {
        formatted += raw[rawIndex] || '_'
        rawIndex++
      } else {
        formatted += mask[i]
      }
    }
    
    return formatted
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Country Selector */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            width: '100%',
            padding: '14px 16px',
            border: '2px solid #E8DDD0',
            borderRadius: 12,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          <span style={{ fontSize: 24 }}>{selectedCountry.flag}</span>
          <span style={{ flex: 1, textAlign: 'left', color: '#1A1710' }}>
            {selectedCountry.name}
          </span>
          <span style={{ color: '#8A8070', fontSize: 14 }}>{selectedCountry.code}</span>
          <span style={{ fontSize: 12 }}>{showDropdown ? '▲' : '▼'}</span>
        </button>

        {showDropdown && (
          <>
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1,
              }}
              onClick={() => setShowDropdown(false)}
            />
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                maxHeight: 280,
                overflow: 'auto',
                background: '#fff',
                border: '2px solid #E8DDD0',
                borderRadius: 12,
                zIndex: 2,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }}
            >
              {COUNTRY_CODES.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    border: 'none',
                    borderBottom: '1px solid #F0EBE3',
                    background: selectedCountry.code === country.code ? '#FDF0E8' : '#fff',
                    cursor: 'pointer',
                    fontSize: 15,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{country.flag}</span>
                  <span style={{ flex: 1, textAlign: 'left', color: '#1A1710' }}>
                    {country.name}
                  </span>
                  <span style={{ color: '#8A8070', fontSize: 13 }}>{country.code}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Phone Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          border: '2px solid #C8891C',
          borderRadius: 12,
          background: '#fff',
          padding: '4px 4px 4px 16px',
        }}
      >
        <span style={{ 
          color: '#8A8070', 
          fontSize: 16, 
          fontWeight: 500,
          marginRight: 8,
        }}>
          {selectedCountry.code}
        </span>
        <input
          ref={inputRef}
          type="tel"
          value={formatDisplay(phoneNumber)}
          onChange={handlePhoneChange}
          placeholder={selectedCountry.mask.replace(/_/g, '•')}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            padding: '12px 8px',
            fontSize: 18,
            fontFamily: 'monospace',
            letterSpacing: '0.5px',
            outline: 'none',
            color: '#1A1710',
          }}
          autoFocus
        />
      </div>

      <p style={{ 
        fontSize: 12, 
        color: '#8A8070', 
        marginTop: 8,
        marginBottom: 0,
      }}>
        {isFr 
          ? "Nous vous enverrons un code de vérification."
          : "We'll send you a verification code."}
      </p>
    </div>
  )
}
