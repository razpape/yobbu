import { useState, useRef, useEffect } from 'react'

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
      // Clear PIN on error
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
      // Handle paste
      const digits = value.slice(0, length).split('')
      const newPin = [...pin]
      digits.forEach((digit, i) => {
        if (index + i < length) {
          newPin[index + i] = digit
        }
      })
      setPin(newPin)
      onChange?.(newPin.join(''))
      
      const nextIndex = Math.min(index + digits.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
      setFocusedIndex(nextIndex)
      
      if (newPin.every(d => d !== '')) {
        handleComplete(newPin.join(''))
      }
    } else {
      const newPin = [...pin]
      newPin[index] = value
      setPin(newPin)
      onChange?.(newPin.join(''))

      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
        setFocusedIndex(index + 1)
      }

      if (newPin.every(d => d !== '')) {
        handleComplete(newPin.join(''))
      }
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

  const handleFocus = (index) => {
    setFocusedIndex(index)
    setShowError(false)
  }

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          marginBottom: showError ? 12 : 20,
        }}
      >
        {pin.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={() => handleFocus(index)}
            style={{
              width: 56,
              height: 64,
              border: `3px solid ${
                showError 
                  ? '#DC2626' 
                  : focusedIndex === index 
                    ? '#C8891C' 
                    : digit 
                      ? '#25D366' 
                      : '#E8DDD0'
              }`,
              borderRadius: 16,
              fontSize: 28,
              fontWeight: 700,
              textAlign: 'center',
              color: '#1A1710',
              background: showError ? '#FEF2F2' : digit ? '#F0FAF4' : '#fff',
              outline: 'none',
              transition: 'all 0.2s',
              fontFamily: 'monospace',
              caretColor: '#C8891C',
            }}
          />
        ))}
      </div>

      {showError && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 8,
            padding: '10px 16px',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          <span style={{ color: '#DC2626', fontSize: 14, fontWeight: 500 }}>
            {error || (isFr ? "Les codes ne correspondent pas" : "PINs don't match")}
          </span>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          fontSize: 14,
          color: '#8A8070',
        }}
      >
        <span style={{ fontSize: 16 }}>🔒</span>
        <span>
          {verifyMode 
            ? (isFr ? "Vérification du code" : "Verifying PIN")
            : (isFr ? "Sécurisé par chiffrement" : "Secured with encryption")
          }
        </span>
      </div>
    </div>
  )
}
