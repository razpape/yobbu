import { useState, useRef, useEffect } from 'react'
import { Check } from 'lucide-react'

export default function OTPInput({ length = 6, onComplete, onChange, lang = 'en' }) {
  const isFr = lang === 'fr'
  const [code, setCode] = useState(new Array(length).fill(''))
  const [focusedIndex, setFocusedIndex] = useState(0)
  const inputRefs = useRef([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, '')

    if (value.length > 1) {
      const digits = value.slice(0, length).split('')
      const newCode = [...code]
      digits.forEach((digit, i) => {
        if (index + i < length) newCode[index + i] = digit
      })
      setCode(newCode)
      onChange?.(newCode.join(''))
      const nextIndex = Math.min(index + digits.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
      setFocusedIndex(nextIndex)
      if (newCode.every(d => d !== '')) onComplete?.(newCode.join(''))
    } else {
      const newCode = [...code]
      newCode[index] = value
      setCode(newCode)
      onChange?.(newCode.join(''))
      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
        setFocusedIndex(index + 1)
      }
      if (newCode.every(d => d !== '')) onComplete?.(newCode.join(''))
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code]
      newCode[index - 1] = ''
      setCode(newCode)
      inputRefs.current[index - 1]?.focus()
      setFocusedIndex(index - 1)
      onChange?.(newCode.join(''))
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setFocusedIndex(index - 1)
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setFocusedIndex(index + 1)
    }
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
    const focusIndex = Math.min(pasted.length, length - 1)
    inputRefs.current[focusIndex]?.focus()
    setFocusedIndex(focusIndex)
    if (newCode.every(d => d !== '')) onComplete?.(newCode.join(''))
  }

  const isComplete = code.every(d => d !== '')

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 10,
          marginBottom: 16,
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
            onFocus={() => setFocusedIndex(index)}
            style={{
              width: 46,
              height: 54,
              border: `2px solid ${
                focusedIndex === index
                  ? '#C8891C'
                  : digit
                    ? '#C8891C80'
                    : '#E0DAD0'
              }`,
              borderRadius: 12,
              fontSize: 22,
              fontWeight: 700,
              textAlign: 'center',
              color: '#1A1710',
              background: focusedIndex === index ? '#FDF6ED' : digit ? '#FAFAF8' : '#fff',
              outline: 'none',
              transition: 'all 0.15s',
              fontFamily: "'DM Sans', sans-serif",
              caretColor: '#C8891C',
            }}
          />
        ))}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
        color: isComplete ? '#16a34a' : '#A09080',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {isComplete ? (
          <>
            <Check size={14} strokeWidth={2.5} />
            <span style={{ fontWeight: 600 }}>{isFr ? 'Complet' : 'Complete'}</span>
          </>
        ) : (
          <span>{isFr ? 'Code a 6 chiffres' : '6-digit code'}</span>
        )}
      </div>
    </div>
  )
}
