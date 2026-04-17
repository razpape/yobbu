import { useState } from 'react'

export default function ProfitCalculator({ lang }) {
  const isFr = lang === 'fr'
  
  const [flightCost, setFlightCost] = useState('1100')
  const [spaceKg, setSpaceKg] = useState('20')
  const [pricePerKg, setPricePerKg] = useState('15')
  const [yobbuFeePercent, setYobbuFeePercent] = useState('10')
  
  // Calculate profit
  const totalRevenue = parseFloat(spaceKg || 0) * parseFloat(pricePerKg || 0)
  const yobbuFee = totalRevenue * (parseFloat(yobbuFeePercent || 0) / 100)
  const netEarnings = totalRevenue - yobbuFee
  const flightCostNum = parseFloat(flightCost || 0)
  const netProfit = netEarnings - flightCostNum
  const breakEvenKg = flightCostNum / (parseFloat(pricePerKg || 1) * (1 - parseFloat(yobbuFeePercent || 0) / 100))
  
  const isProfitable = netProfit > 0
  
  return (
    <div style={{ background: '#D4E8F4', border: '1px solid #D4A574', borderRadius: 12, padding: 16, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#52B5D9">
          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#52B5D9' }}>
          {isFr ? 'Calculateur de profit' : 'Trip Profit Calculator'}
        </span>
      </div>
      
      {/* Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: '#8A8070', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 4 }}>
            {isFr ? 'Coût du vol ($)' : 'Flight Cost ($)'}
          </label>
          <input 
            type="number" 
            value={flightCost}
            onChange={(e) => setFlightCost(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px 10px', 
              borderRadius: 8, 
              border: '1px solid #E8DDD0', 
              background: '#fff',
              fontSize: 13,
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: '#8A8070', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 4 }}>
            {isFr ? 'Espace (kg)' : 'Space (kg)'}
          </label>
          <input 
            type="number" 
            value={spaceKg}
            onChange={(e) => setSpaceKg(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px 10px', 
              borderRadius: 8, 
              border: '1px solid #E8DDD0', 
              background: '#fff',
              fontSize: 13,
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: '#8A8070', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 4 }}>
            {isFr ? 'Prix/kg ($)' : 'Price/kg ($)'}
          </label>
          <input 
            type="number" 
            value={pricePerKg}
            onChange={(e) => setPricePerKg(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px 10px', 
              borderRadius: 8, 
              border: '1px solid #E8DDD0', 
              background: '#fff',
              fontSize: 13,
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: '#8A8070', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 4 }}>
            {isFr ? 'Frais Yobbu (%)' : 'Yobbu Fee (%)'}
          </label>
          <input 
            type="number" 
            value={yobbuFeePercent}
            onChange={(e) => setYobbuFeePercent(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px 10px', 
              borderRadius: 8, 
              border: '1px solid #E8DDD0', 
              background: '#fff',
              fontSize: 13,
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>
      
      {/* Results */}
      <div style={{ 
        background: isProfitable ? '#F0FAF4' : '#FEF2F2', 
        border: `1px solid ${isProfitable ? '#B8DCC8' : '#FECACA'}`, 
        borderRadius: 10, 
        padding: 14 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#8A8070' }}>{isFr ? 'Revenus totaux' : 'Total Revenue'}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1710' }}>${totalRevenue.toFixed(0)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#8A8070' }}>{isFr ? 'Frais Yobbu' : 'Yobbu Fee'}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#8A8070' }}>-${yobbuFee.toFixed(0)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#8A8070' }}>{isFr ? 'Coût du vol' : 'Flight Cost'}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#8A8070' }}>-${flightCostNum.toFixed(0)}</span>
        </div>
        <div style={{ borderTop: `1px solid ${isProfitable ? '#B8DCC8' : '#FECACA'}`, margin: '10px 0', paddingTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1710' }}>{isFr ? 'PROFIT NET' : 'NET PROFIT'}</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: isProfitable ? '#2D8B4E' : '#DC2626' }}>
              {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(0)}
            </span>
          </div>
        </div>
        
        {/* Break-even info */}
        <div style={{ marginTop: 10, padding: 8, background: 'rgba(255,255,255,0.5)', borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: '#5A6578' }}>
            {isFr 
              ? `Point mort: ${breakEvenKg.toFixed(1)} kg à vendre`
              : `Break-even: Sell ${breakEvenKg.toFixed(1)} kg`
            }
          </div>
        </div>
      </div>
      
      {/* Tip */}
      <div style={{ marginTop: 10, fontSize: 11, color: '#8A8070', fontStyle: 'italic' }}>
        {isProfitable 
          ? (isFr ? '✓ Ce voyage est rentable!' : '✓ This trip is profitable!')
          : (isFr 
              ? `💡 Augmentez l'espace à ${Math.ceil(breakEvenKg)}kg ou le prix à $${Math.ceil(flightCostNum / (spaceKg * 0.9))}/kg`
              : `💡 Increase space to ${Math.ceil(breakEvenKg)}kg or price to $${Math.ceil(flightCostNum / (spaceKg * 0.9))}/kg`
            )
        }
      </div>
    </div>
  )
}
