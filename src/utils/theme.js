export const COLORS = {
  primary: '#C8891C',
  dark: '#1A1710',
  light: '#FDFBF7',
  muted: '#8A8070',
  border: 'rgba(0,0,0,.1)',
  success: '#28a745',
  danger: '#dc3545',
}

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
}

export const INPUT_STYLE = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.light,
  color: COLORS.dark,
  fontSize: 13,
  fontFamily: "'DM Sans', Arial, sans-serif",
}

export const LABEL_STYLE = {
  fontSize: 10,
  fontWeight: 700,
  color: COLORS.muted,
  marginBottom: 4,
  display: 'block',
}

export const BUTTON_STYLE = {
  padding: '10px 16px',
  borderRadius: 8,
  border: 'none',
  fontSize: 13,
  fontWeight: 600,
  fontFamily: "'DM Sans', Arial, sans-serif",
  cursor: 'pointer',
}

export const MODAL_OVERLAY = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'flex-end',
  zIndex: 1000,
}

export const MODAL_BOX = {
  background: COLORS.light,
  borderRadius: '20px 20px 0 0',
  padding: '20px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
}
