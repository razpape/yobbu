import { useState, useRef } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const COUNTRY_CODES = [
  { code: '+1',    iso: 'US',  name: 'US / Canada',    mask: '(___) ___-____' },
  { code: '+221',  iso: 'SN',  name: 'Senegal',        mask: '__ ___ __ __' },
  { code: '+33',   iso: 'FR',  name: 'France',         mask: '_ __ __ __ __' },
  { code: '+44',   iso: 'GB',  name: 'UK',             mask: '____ _______' },
  { code: '+224',  iso: 'GN',  name: 'Guinea',         mask: '___ ___ ___' },
  { code: '+225',  iso: 'CI',  name: "Côte d'Ivoire",  mask: '__ ___ ___' },
  { code: '+223',  iso: 'ML',  name: 'Mali',           mask: '__ __ __ __' },
  { code: '+229',  iso: 'BJ',  name: 'Benin',          mask: '__ ___ ___' },
  { code: '+228',  iso: 'TG',  name: 'Togo',           mask: '__ ___ ___' },
  { code: '+233',  iso: 'GH',  name: 'Ghana',          mask: '__ ___ ____' },
  { code: '+32',   iso: 'BE',  name: 'Belgium',        mask: '___ ___ ___' },
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
    setPhoneNumber('')
    onChange?.(`${country.code}`)
    onValid?.(false)
    inputRef.current?.focus()
  }

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    setPhoneNumber(raw)
    const fullNumber = `${selectedCountry.code}${raw}`
    onChange?.(fullNumber)
    const digitCount = selectedCountry.mask.split('').filter(c => c === '_').length
    onValid?.(raw.length >= digitCount - 1 && raw.length >= 7)
  }

  const formatDisplay = (raw) => {
    if (!raw) return ''
    const mask = selectedCountry.mask
    let formatted = ''
    let rawIndex = 0
    for (let i = 0; i < mask.length && rawIndex < raw.length; i++) {
      if (mask[i] === '_') {
        formatted += raw[rawIndex] || ''
        rawIndex++
      } else {
        formatted += mask[i]
      }
    }
    return formatted
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Country selector + phone in one row */}
      <div style={{
        display: 'flex',
        border: '2px solid #E0DAD0',
        borderRadius: 14,
        background: '#fff',
        overflow: 'hidden',
        transition: 'border-color .2s',
      }}>
        {/* Country button */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '14px 12px 14px 16px',
            background: '#FAFAF8',
            border: 'none',
            borderRight: '1px solid #E8E2D8',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            color: '#3D3829',
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 20,
            borderRadius: 4,
            background: '#E8E2D8',
            fontSize: 11,
            fontWeight: 700,
            color: '#5A5248',
            letterSpacing: '.04em',
          }}>
            {selectedCountry.iso}
          </span>
          <span style={{ color: '#8A8070', fontSize: 14 }}>{selectedCountry.code}</span>
          {showDropdown
            ? <ChevronUp size={14} color="#8A8070" />
            : <ChevronDown size={14} color="#8A8070" />
          }
        </button>

        {/* Phone number input */}
        <input
          ref={inputRef}
          type="tel"
          value={formatDisplay(phoneNumber)}
          onChange={handlePhoneChange}
          placeholder={selectedCountry.mask.replace(/_/g, '0')}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            padding: '14px 16px',
            fontSize: 17,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '0.3px',
            outline: 'none',
            color: '#1A1710',
            minWidth: 0,
          }}
          autoFocus
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 10 }}
            onClick={() => setShowDropdown(false)}
          />
          <div style={{
            position: 'relative',
            zIndex: 11,
          }}>
            <div style={{
              position: 'absolute',
              top: 4,
              left: 0,
              right: 0,
              maxHeight: 260,
              overflow: 'auto',
              background: '#fff',
              border: '1px solid #E0DAD0',
              borderRadius: 12,
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
            }}>
              {COUNTRY_CODES.map((country) => (
                <button
                  key={country.code + country.iso}
                  onClick={() => handleCountrySelect(country)}
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    border: 'none',
                    borderBottom: '1px solid #F5F1EC',
                    background: selectedCountry.code === country.code ? '#FDF6ED' : '#fff',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'background .15s',
                  }}
                  onMouseEnter={e => {
                    if (selectedCountry.code !== country.code) e.currentTarget.style.background = '#FAFAF8'
                  }}
                  onMouseLeave={e => {
                    if (selectedCountry.code !== country.code) e.currentTarget.style.background = '#fff'
                  }}
                >
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 20,
                    borderRadius: 4,
                    background: selectedCountry.code === country.code ? '#52B5D920' : '#E8E2D8',
                    fontSize: 11,
                    fontWeight: 700,
                    color: selectedCountry.code === country.code ? '#52B5D9' : '#5A5248',
                    letterSpacing: '.04em',
                  }}>
                    {country.iso}
                  </span>
                  <span style={{ flex: 1, textAlign: 'left', color: '#1A1710', fontWeight: 500 }}>
                    {country.name}
                  </span>
                  <span style={{ color: '#A09080', fontSize: 13 }}>{country.code}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
