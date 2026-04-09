import { useState, useRef, useEffect } from 'react'

export default function OTPInput({ length = 6, onComplete, onChange, lang = 'en' }) {
  const isFr = lang === 'fr'
  const [code, setCode] = useState(new Array(length).fill(''))
  const [focusedIndex, setFocusedIndex] = useState(0)
  const inputRefs = useRef([])

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, '')
    
    if (value.length > 1) {
      // Handle paste - fill multiple boxes
      const digits = value.slice(0, length).split('')
      const newCode = [...code]
      digits.forEach((digit, i) => {
        if (index + i < length) {
          newCode[index + i] = digit
        }
      })
      setCode(newCode)
      onChange?.(newCode.join(''))
      
      // Focus appropriate box
      const nextIndex = Math.min(index + digits.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
      setFocusedIndex(nextIndex)
      
      // Check if complete
      if (newCode.every(d => d !== '')) {
        onComplete?.(newCode.join(''))
      }
    } else {
      // Single digit
      const newCode = [...code]
      newCode[index] = value
      setCode(newCode)
      onChange?.(newCode.join(''))

      // Auto-advance to next box
      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
        setFocusedIndex(index + 1)
      }

      // Check if complete
      if (newCode.every(d => d !== '')) {
        onComplete?.(newCode.join(''))
      }
    }
  }

  const handleKeyDown = (e, index) => {
    // Backspace on empty box - go back
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code]
      newCode[index - 1] = ''
      setCode(newCode)
      inputRefs.current[index - 1]?.focus()
      setFocusedIndex(index - 1)
      onChange?.(newCode.join(''))
    }
    
    // Arrow navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setFocusedIndex(index - 1)
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setFocusedIndex(index + 1)
    }
  }

  const handleFocus = (index) => {
    setFocusedIndex(index)
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    
    const newCode = [...code]
    pasted.split('').forEach((digit, i) => {
      if (i < length) newCode[i] = digit
    })
    setCode(newCode)
    onChange?.(newCode.join(''))
    
    // Focus last filled or next empty
    const focusIndex = Math.min(pasted.length, length - 1)
    inputRefs.current[focusIndex]?.focus()
    setFocusedIndex(focusIndex)
    
    if (newCode.every(d => d !== '')) {
      onComplete?.(newCode.join(''))
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 20,
        }}
        onPaste={handlePaste}
      >
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={() => handleFocus(index)}
            style={{
              width: 48,
              height: 56,
              border: `2px solid ${
                focusedIndex === index 
                  ? '#C8891C' 
                  : digit 
                    ? '#25D366' 
                    : '#E8DDD0'
              }`,
              borderRadius: 12,
              fontSize: 24,
              fontWeight: 600,
              textAlign: 'center',
              color: '#1A1710',
              background: digit ? '#F0FAF4' : '#fff',
              outline: 'none',
              transition: 'all 0.2s',
              fontFamily: 'monospace',
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 14,
        }}
      >
        <span style={{ color: '#8A8070' }}>
          {isFr ? 'Code à 6 chiffres' : '6-digit code'}
        </span>
        
        {code.every(d => d !== '') && (
          <span style={{ color: '#25D366', fontWeight: 600 }}>
            ✓ {isFr ? 'Complet' : 'Complete'}
          </span>
        )}
      </div>
    </div>
  )
}
