export default function LoadingSpinner({ lang = 'en' }) {
  const loadingText = lang === 'fr' ? 'Chargement...' : 'Loading...'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#FDFBF7',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .loader-ring {
          width: 56px;
          height: 56px;
          border: 4px solid #E8E4DE;
          border-top-color: #52B5D9;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .loader-text {
          margin-top: 24px;
          font-size: 14px;
          color: #6B7280;
          font-weight: 500;
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="loader-ring" />
      <div className="loader-text">{loadingText}</div>
    </div>
  )
}
