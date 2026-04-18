import { useState, useRef, useCallback, useEffect } from 'react'

const SIZE = 280   // circle diameter in the cropper

export default function CircleCropper({ src, onConfirm, onCancel }) {
  const canvasRef   = useRef()
  const [offset, setOffset]   = useState({ x: 0, y: 0 })
  const [scale, setScale]     = useState(1)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(null)
  const imgRef    = useRef(null)

  // Load image once
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      // Fit image so the shorter side fills the circle
      const fit = Math.max(SIZE / img.naturalWidth, SIZE / img.naturalHeight)
      setScale(fit)
      setOffset({ x: (SIZE - img.naturalWidth * fit) / 2, y: (SIZE - img.naturalHeight * fit) / 2 })
    }
    img.src = src
  }, [src])

  // Redraw canvas whenever offset/scale changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !imgRef.current) return
    const ctx = canvas.getContext('2d')
    const img = imgRef.current

    ctx.clearRect(0, 0, SIZE, SIZE)

    // Clip to circle
    ctx.save()
    ctx.beginPath()
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2)
    ctx.clip()

    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    ctx.drawImage(img, offset.x, offset.y, w, h)
    ctx.restore()
  }, [offset, scale])

  const clampOffset = useCallback((ox, oy, sc) => {
    if (!imgRef.current) return { x: ox, y: oy }
    const w = imgRef.current.naturalWidth * sc
    const h = imgRef.current.naturalHeight * sc
    return {
      x: Math.min(0, Math.max(SIZE - w, ox)),
      y: Math.min(0, Math.max(SIZE - h, oy)),
    }
  }, [])

  // Pointer drag
  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    dragStart.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y }
  }
  const onPointerMove = (e) => {
    if (!dragging || !dragStart.current) return
    const dx = e.clientX - dragStart.current.px
    const dy = e.clientY - dragStart.current.py
    const raw = { x: dragStart.current.ox + dx, y: dragStart.current.oy + dy }
    setOffset(clampOffset(raw.x, raw.y, scale))
  }
  const onPointerUp = () => { setDragging(false); dragStart.current = null }

  // Wheel zoom
  const onWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY < 0 ? 1.05 : 0.95
    const newScale = Math.max(
      Math.max(SIZE / (imgRef.current?.naturalWidth || SIZE), SIZE / (imgRef.current?.naturalHeight || SIZE)),
      Math.min(scale * delta, 5)
    )
    const cx = SIZE / 2, cy = SIZE / 2
    const newOx = cx - (cx - offset.x) * (newScale / scale)
    const newOy = cy - (cy - offset.y) * (newScale / scale)
    setScale(newScale)
    setOffset(clampOffset(newOx, newOy, newScale))
  }

  const handleConfirm = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(blob => onConfirm(blob), 'image/jpeg', 0.92)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#1C1A17', borderRadius: 20, padding: '28px 24px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        maxWidth: 360, width: '90vw',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#F5EFE6', letterSpacing: '-0.3px' }}>
          Frame your photo
        </div>
        <div style={{ fontSize: 12, color: '#A09070', textAlign: 'center', lineHeight: 1.5 }}>
          Drag to reposition · Scroll or pinch to zoom
        </div>

        {/* Canvas inside a circle border */}
        <div style={{
          position: 'relative', borderRadius: '50%',
          boxShadow: '0 0 0 3px #10B981, 0 0 0 6px rgba(200,137,28,.18)',
          cursor: dragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
        }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onWheel={onWheel}
        >
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            style={{ display: 'block', borderRadius: '50%' }}
          />
        </div>

        {/* Zoom slider */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: '#A09070' }}>−</span>
          <input
            type="range" min={0} max={100} value={
              imgRef.current
                ? Math.round(((scale - Math.max(SIZE / imgRef.current.naturalWidth, SIZE / imgRef.current.naturalHeight)) /
                    (5 - Math.max(SIZE / imgRef.current.naturalWidth, SIZE / imgRef.current.naturalHeight))) * 100)
                : 0
            }
            onChange={e => {
              if (!imgRef.current) return
              const minS = Math.max(SIZE / imgRef.current.naturalWidth, SIZE / imgRef.current.naturalHeight)
              const newScale = minS + (5 - minS) * (Number(e.target.value) / 100)
              const cx = SIZE / 2, cy = SIZE / 2
              const newOx = cx - (cx - offset.x) * (newScale / scale)
              const newOy = cy - (cy - offset.y) * (newScale / scale)
              setScale(newScale)
              setOffset(clampOffset(newOx, newOy, newScale))
            }}
            style={{ flex: 1, accentColor: '#10B981' }}
          />
          <span style={{ fontSize: 11, color: '#A09070' }}>+</span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #3A3530',
            background: 'transparent', color: '#A09070', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button onClick={handleConfirm} style={{
            flex: 2, padding: '10px 0', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#10B981,#E6A832)', color: '#fff',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 3px 12px rgba(200,137,28,.35)',
          }}>
            Use Photo
          </button>
        </div>
      </div>
    </div>
  )
}
