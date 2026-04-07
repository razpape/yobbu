/**
 * VerifiedBadge — reusable WhatsApp-verified indicator
 *
 * Props:
 *   size   — 'sm' | 'md' | 'lg'  (default: 'md')
 *   byAdmin — boolean — shows different tooltip if admin-verified
 *   showLabel — boolean — show text label next to icon
 */
export default function VerifiedBadge({ size = 'md', byAdmin = false, showLabel = false }) {
  const dim = { sm: 16, md: 20, lg: 26 }[size] ?? 20
  const fontSize = { sm: 10, md: 11, lg: 13 }[size] ?? 11

  const label = byAdmin ? 'Verified' : 'WhatsApp Verified'
  const title = byAdmin
    ? 'Manually verified by the Yobbu team'
    : 'Phone verified via WhatsApp — one number, one account'

  return (
    <span
      title={title}
      style={{
        display:     'inline-flex',
        alignItems:  'center',
        gap:         5,
        flexShrink:  0,
        cursor:      'default',
        userSelect:  'none',
      }}
    >
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={label}
      >
        {/* Shield background */}
        <path
          d="M10 2L3.5 4.5V9.5C3.5 13.5 6.5 17 10 18C13.5 17 16.5 13.5 16.5 9.5V4.5L10 2Z"
          fill="#2D8B4E"
        />
        {/* Checkmark */}
        <path
          d="M7 10L9 12L13 8"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showLabel && (
        <span style={{ fontSize, fontWeight: 600, color: '#2D8B4E', lineHeight: 1 }}>
          {label}
        </span>
      )}
    </span>
  )
}
