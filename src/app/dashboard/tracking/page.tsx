export default function TrackingPage() {
  return (
    <div className="pb-8">
      <style>{`
        .tracking-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        @media (min-width: 640px) {
          .tracking-header {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
          }
        }

        .tracking-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
        @media (min-width: 768px) {
          .tracking-grid { grid-template-columns: repeat(12, 1fr); }
          .col-8  { grid-column: span 8; }
          .col-4  { grid-column: span 4; }
          .col-12 { grid-column: span 12; }
          .col-6  { grid-column: span 6; }
        }

        .map-container {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0px 12px 32px rgba(11,28,48,0.06);
          background: var(--color-surface-container-low, #f5f1e9);
          position: relative;
          height: 260px;
        }
        @media (min-width: 480px) { .map-container { height: 320px; } }
        @media (min-width: 768px) { .map-container { height: 400px; } }

        .map-overlay {
          position: absolute;
          bottom: 1rem; left: 1rem; right: 1rem;
          padding: 0.875rem 1rem;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(12px);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid rgba(255,255,255,0.3);
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          gap: 0.75rem;
        }

        .item-summary-card {
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          border: 1px solid rgba(255,255,255,0.1);
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 600px) {
          .item-summary-card {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 2rem;
          }
        }

        .item-summary-value-block {
          text-align: left;
          border-top: 1px solid rgba(255,255,255,0.15);
          padding-top: 1rem;
        }
        @media (min-width: 600px) {
          .item-summary-value-block {
            text-align: right;
            border-top: none;
            border-left: 1px solid rgba(255,255,255,0.15);
            padding-top: 0;
            padding-left: 1.5rem;
          }
        }

        .shipping-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
        @media (min-width: 640px) {
          .shipping-grid { grid-template-columns: 1fr 1fr; }
        }

        .action-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1.25rem;
        }
        .action-row button {
          flex: 1 1 auto;
          min-width: 130px;
        }

        .tracking-h1 { font-size: clamp(1.6rem, 5vw, 2.25rem); }
        .val-text    { font-size: clamp(1.8rem, 6vw, 2.5rem); }
      `}</style>

      {/* Header */}
      <div className="tracking-header">
        <div>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--color-earth-500, #9B8B74)' }}>
            Transaction #PL-8821
          </span>
          <h1 className="tracking-h1" style={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-forest-500, #4B7F52)', margin: '0.25rem 0 0' }}>
            Order Tracking
          </h1>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-forest-100, #E8F0E8)', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid rgba(75,127,82,0.12)' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--color-forest-500, #4B7F52)', fontSize: '20px' }}>local_shipping</span>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-earth-700, #5C5243)' }}>Est: Oct 24, 14:00</span>
        </div>
      </div>

      {/* Main grid */}
      <div className="tracking-grid">

        {/* Map */}
        <div className="col-8">
          <div className="map-container">
            <img
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)', opacity: 0.6, display: 'block' }}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX8_IbScy1x1_cwnW5UZPbYR7ykbGdzgBltX0uUy0UzBPSl_VK-EAIlbZPM0KhU8ujnPGRLhKgl99oFcb4LeCNwgwFWY0FkYKjxc7IHVO5fPjqY7VtbsLrqZTD-sAuY0Zqhi_8SWd58Hxi3vvEocb_ZeVTpMivUyI2RBhJFroksTU1uRtCGhaExvIpQhrkIX7_t1lXALWURqD1g8qguAMz_MuW5uuggzWyW9QaUNfF0BCc4VvB85GZvBMqWSG06U_P-CgexB-1fwn5"
              alt="Map"
            />
            <div className="map-overlay">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-forest-500, #4B7F52)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '20px' }}>moped</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-earth-500)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Current Location</p>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-earth-900)', fontSize: '0.9rem' }}>Oshodi Interchange Hub</p>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-earth-500)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Next Stop</p>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-forest-500)', fontSize: '0.9rem' }}>VI Distribution</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="col-4" style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--color-earth-200, #EFEBE0)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', marginTop: 0 }}>Delivery Status</h3>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ position: 'absolute', left: '11px', top: '4px', bottom: '4px', width: '2px', backgroundColor: 'var(--color-earth-200)' }} />

            {[
              { label: 'Order Placed', time: 'Oct 21, 09:30 AM', done: true },
              { label: 'Processing', time: 'Oct 21, 14:15 PM', done: true },
              { label: 'In Transit', time: 'Oct 22, 08:00 AM', done: false, active: true, note: 'Package being sorted at Lagos Mainland hub.' },
              { label: 'Delivered', time: 'Expected Tomorrow', done: false, muted: true },
            ].map((step, i) => (
              <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', paddingLeft: '2rem', opacity: step.muted ? 0.4 : 1 }}>
                <div style={{
                  position: 'absolute', left: 0, width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
                  backgroundColor: step.done ? 'var(--color-forest-500)' : step.active ? 'white' : 'var(--color-earth-200)',
                  border: step.active ? '2px solid var(--color-forest-500)' : 'none',
                }}>
                  {step.done && <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'white', fontVariationSettings: '"FILL" 1' }}>check</span>}
                  {step.active && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-forest-500)', animation: 'pulse 1.5s infinite' }} />}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: step.active ? 'var(--color-forest-500)' : 'var(--color-earth-900)' }}>{step.label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--color-earth-500)', fontWeight: 600 }}>{step.time}</p>
                  {step.note && (
                    <div style={{ marginTop: '0.5rem', backgroundColor: 'var(--color-forest-100)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--color-earth-700)', fontWeight: 500 }}>
                      {step.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Item Summary */}
        <div className="col-12">
          <div className="item-summary-card" style={{ backgroundColor: 'var(--color-forest-700, #2D4C31)' }}>
            <div style={{ position: 'absolute', right: 0, top: 0, width: '160px', height: '100%', backgroundColor: 'rgba(255,255,255,0.04)', transform: 'skewX(12deg) translateX(40px)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.1)', flexShrink: 0, border: '1px solid rgba(255,255,255,0.2)' }}>
                <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoa_N_2p-eE0k9_3C-u_Oa5T6fU7x5o3jN6x8T1e_vPq7y2L4M-1N4z0r5-wT6m_S3u_V5b_C8n_P9q_R7i_L1c_hC_PqP4z-I55If9CRfY8dwNx9B07c9PVtBwl7Odorcg80dZb_jVK5I4McOpIVa9hPJDQ4C-zep5WHtVoX8QlsCdSn8mts25mLXocviqmwxiR0o6Qxj-TP0MhlAupzgDp2U6uuIR8NaT1mxJSfxnnf_RDPgkUjrL1ZXtBzju4d-r5-mW7jE1Xt3k0" alt="Product" />
              </div>
              <div>
                <h2 style={{ margin: 0, color: 'white', fontWeight: 800, fontSize: 'clamp(1rem, 3.5vw, 1.5rem)', letterSpacing: '-0.02em' }}>Fresh Oyster Mushrooms</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {['Quantity: 500kg', 'Grade: Premium', 'Origin: Jos Plateau'].map(tag => (
                    <span key={tag} style={{ backgroundColor: 'rgba(255,255,255,0.12)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="item-summary-value-block" style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Total Market Value</p>
              <p className="val-text" style={{ margin: '4px 0 0', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>₦1,920,000</p>
            </div>
          </div>
        </div>

        {/* Shipping + Support */}
        <div className="col-12">
          <div className="shipping-grid">
            <div style={{ backgroundColor: 'var(--color-earth-100, #FAF8F5)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--color-earth-200)' }}>
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-earth-500)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Shipping Destination</h4>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', lineHeight: 1.6, color: 'var(--color-earth-900)' }}>
                Nexus Culinary Center<br />15 Adeola Odeku Street<br />Victoria Island, Lagos 101241
              </p>
              <div className="action-row">
                <button style={{ backgroundColor: 'var(--color-earth-200)', padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                  Change Address
                </button>
              </div>
            </div>

            <div style={{ backgroundColor: '#FBECE8', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', border: '1px solid rgba(200,90,60,0.1)' }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-accent, #C85A3C)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Logistics Support</h4>
                <p style={{ margin: 0, fontWeight: 600, lineHeight: 1.6, color: 'var(--color-earth-700)', fontSize: '0.9rem' }}>
                  Chat with Tunde, our local logistics manager, for real-time updates.
                </p>
              </div>
              <button style={{ backgroundColor: 'var(--color-accent, #C85A3C)', color: 'white', padding: '0.875rem 1.25rem', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', alignSelf: 'flex-start' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>support_agent</span>
                Contact Support (WhatsApp)
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
