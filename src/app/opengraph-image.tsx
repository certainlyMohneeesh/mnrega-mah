import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'MGNREGA India Dashboard - Employment & Expenditure Tracking'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #252653 0%, #514E80 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui',
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: 80, marginRight: '20px' }}>🇮🇳</div>
          <div style={{ fontSize: 72, fontWeight: 'bold' }}>MGNREGA</div>
        </div>
        <div
          style={{
            fontSize: 48,
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.4,
            marginBottom: '30px',
          }}
        >
          All India Employment Dashboard
        </div>
        <div
          style={{
            fontSize: 28,
            opacity: 0.9,
            textAlign: 'center',
          }}
        >
          Track 700+ Districts Across 36 States
        </div>
        <div
          style={{
            marginTop: '60px',
            display: 'flex',
            gap: '60px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 20, opacity: 0.8 }}>States</div>
            <div style={{ fontSize: 48, fontWeight: 'bold' }}>36</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 20, opacity: 0.8 }}>Districts</div>
            <div style={{ fontSize: 48, fontWeight: 'bold' }}>700+</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 20, opacity: 0.8 }}>Languages</div>
            <div style={{ fontSize: 48, fontWeight: 'bold' }}>9</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
