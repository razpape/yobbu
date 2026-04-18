import { useState, useRef, useEffect } from 'react'
import { Lock } from 'lucide-react'

export default function PINInput({
  length = 4,
  onComplete,
  onChange,
  verifyMode = false,
  compareTo = '',
  error = '',
  lang = 'en'
}) {
  const isFr = lang === 'fr'
  const [pin, setPin] = useState(new Array(length).fill(''))
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [showError, setShowError] = useState(false)
  const inputRefs = useRef([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (error) {
      setShowError(true)
      setPin(new Array(length).fill(''))
      inputRefs.current[0]?.focus()
      setFocusedIndex(0)
      const timer = setTimeout(() => setShowError(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, '')
    setShowError(false)

    if (value.length > 1) {
      const digits = value.slice(0, length).split('')
      const newPin = [...pin]
      digits.forEach((digit, i) => {
        if (index + i < length) newPin[index + i] = digit
      })
      setPin(newPin)
      onChange?.(newPin.join(''))
      const nextIndex = Math.min(index + digits.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
      setFocusedIndex(nextIndex)
      if (newPin.every(d => d !== '')) handleComplete(newPin.join(''))
    } else {
      const newPin = [...pin]
      newPin[index] = value
      setPin(newPin)
      onChange?.(newPin.join(''))
      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
        setFocusedIndex(index + 1)
      }
      if (newPin.every(d => d !== '')) handleComplete(newPin.join(''))
    }
  }

  const handleComplete = (completedPin) => {
    if (verifyMode && compareTo) {
      if (completedPin !== compareTo) {
        setShowError(true)
        setTimeout(() => {
          setPin(new Array(length).fill(''))
          inputRefs.current[0]?.focus()
          setFocusedIndex(0)
          setShowError(false)
        }, 1500)
        return
      }
    }
    onComplete?.(completedPin)
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const newPin = [...pin]
      newPin[index - 1] = ''
      setPin(newPin)
      inputRefs.current[index - 1]?.focus()
      setFocusedIndex(index - 1)
      onChange?.(newPin.join(''))
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

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
        marginBottom: showError ? 12 : 20,
      }}>
        {pin.map((digit, index) => (
          <div
            key={index}
            style={{
              position: 'relative',
              width: 56,
              height: 64,
            }}
          >
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => { setFocusedIndex(index); setShowError(false) }}
              style={{
                width: '100%',
                height: '100%',
                border: `2px solid ${
                  showError
                    ? '#DC2626'
                    : focusedIndex === index
                      ? '#10B981'
                      : digit
                        ? '#10B98180'
                        : '#E0DAD0'
                }`,
                borderRadius: 14,
                fontSize: 26,
                fontWeight: 700,
                textAlign: 'center',
                color: '#1F2937',
                background: showError ? '#FEF2F2' : focusedIndex === index ? '#FDF6ED' : digit ? '#FAFAF8' : '#fff',
                outline: 'none',
                transition: 'all 0.15s',
                fontFamily: "'DM Sans', sans-serif",
                caretColor: '#10B981',
              }}
            />
            {/* Filled indicator dot */}
            {digit && !showError && (
              <div style={{
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#10B981',
              }} />
            )}
          </div>
        ))}
      </div>

      {showError && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: 10,
          padding: '10px 16px',
          marginBottom: 16,
          textAlign: 'center',
        }}>
          <span style={{ color: '#DC2626', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
            {error || (isFr ? 'Les codes ne correspondent pas' : "PINs don't match")}
          </span>
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
        color: '#A09080',
        fontFamily: "'DM Sans', sans-serif",
        marginTop: 8,
      }}>
        <Lock size={13} strokeWidth={2} />
        <span>
          {verifyMode
            ? (isFr ? 'Confirmez votre code' : 'Confirm your PIN')
            : (isFr ? 'Code securise' : 'Secured with encryption')
          }
        </span>
      </div>
    </div>
  )
}
