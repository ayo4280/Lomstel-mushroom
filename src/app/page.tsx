"use client";
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'var(--font-inter)', color: 'var(--color-earth-900)' }}>
      {/* Navbar */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1.5rem 5%', 
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        backdropFilter: 'blur(10px)',
        position: 'fixed',
        width: '100%',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid var(--color-earth-200)'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-forest-700)', letterSpacing: '-0.03em' }}>
          Lomstel Farms
        </div>
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#features" style={{ fontWeight: 600, color: 'var(--color-earth-700)', textDecoration: 'none' }}>Why Us</a>
          <a href="#products" style={{ fontWeight: 600, color: 'var(--color-earth-700)', textDecoration: 'none' }}>Products</a>
          <Link href="/login" className="btn-primary" style={{ textDecoration: 'none' }}>
            Command Center Login
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        marginTop: '80px',
        height: '90vh',
        minHeight: '600px',
        backgroundImage: 'url(/hero-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(20, 40, 20, 0.55)'
        }}></div>
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          color: 'white',
          maxWidth: '800px',
          padding: '0 2rem'
        }}>
          <h1 style={{ fontSize: '4.5rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Premium Oyster Mushrooms, Cultivated with Precision.
          </h1>
          <p style={{ fontSize: '1.4rem', marginBottom: '2.5rem', opacity: 0.95, fontWeight: 400, lineHeight: 1.5 }}>
            From farm to table, experience the highest grade wet and dry oyster mushrooms powered by data-driven agriculture.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="#products" style={{
              padding: '1.2rem 2.5rem',
              backgroundColor: 'var(--color-forest-500)',
              color: 'white',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '1.2rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(45, 106, 79, 0.4)',
              transition: 'transform 0.2s ease, filter 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'brightness(1)'; }}
            >
              Explore Our Harvest
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '8rem 5%', backgroundColor: 'var(--color-earth-100)' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-forest-700)', letterSpacing: '-0.03em' }}>Why Choose Lomstel Farms</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-earth-700)', marginTop: '1rem', fontWeight: 500 }}>We combine nature's best with modern technology.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Card 1 */}
          <div style={{ backgroundColor: 'white', padding: '3rem 2rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', textAlign: 'center', transition: 'transform 0.3s ease' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>🌿</div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-earth-900)' }}>Organic & Pure</h3>
            <p style={{ color: 'var(--color-earth-700)', lineHeight: 1.7, fontSize: '1.05rem' }}>Cultivated in highly controlled environments with zero harsh chemicals. Pure, natural growth for the best taste and nutrition.</p>
          </div>
          {/* Card 2 */}
          <div style={{ backgroundColor: 'white', padding: '3rem 2rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', textAlign: 'center', transition: 'transform 0.3s ease' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>🚚</div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-earth-900)' }}>Swift Logistics</h3>
            <p style={{ color: 'var(--color-earth-700)', lineHeight: 1.7, fontSize: '1.05rem' }}>Nationwide delivery tracked in real-time. We ensure your mushrooms arrive fresh, dry, and in perfect condition.</p>
          </div>
          {/* Card 3 */}
          <div style={{ backgroundColor: 'white', padding: '3rem 2rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', textAlign: 'center', transition: 'transform 0.3s ease' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>💻</div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-earth-900)' }}>Tech-Driven Quality</h3>
            <p style={{ color: 'var(--color-earth-700)', lineHeight: 1.7, fontSize: '1.05rem' }}>Our advanced Command Center ensures perfect stock, quality control, and streamlined wholesale ordering.</p>
          </div>
        </div>
      </section>

      {/* Products Showcase */}
      <section id="products" style={{ padding: '8rem 5%', backgroundColor: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-forest-700)', letterSpacing: '-0.03em' }}>Our Premium Harvest</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-earth-700)', marginTop: '1rem', fontWeight: 500 }}>Available for wholesale and direct distribution.</p>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          {/* Product 1 */}
          <div style={{ flex: '1 1 400px', border: '1px solid var(--color-earth-200)', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.3s ease' }}
               onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'}
               onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
            <img src="/wet-oyster.png" alt="Fresh Wet Oyster Mushrooms" style={{ width: '100%', height: '320px', objectFit: 'cover' }} />
            <div style={{ padding: '2.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-earth-900)' }}>Fresh Wet Oyster</h3>
                <span style={{ backgroundColor: '#eef2ff', color: '#1a6db5', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 800, fontSize: '0.9rem' }}>Fresh</span>
              </div>
              <p style={{ color: 'var(--color-earth-700)', lineHeight: 1.7, flex: 1, fontSize: '1.1rem' }}>Premium, hand-harvested fresh oyster mushrooms. Crisp texture, earthy flavor, perfect for culinary excellence.</p>
              <Link href="/login" style={{ display: 'block', textAlign: 'center', padding: '1.2rem', backgroundColor: '#1a6db5', color: 'white', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', marginTop: '2.5rem', fontSize: '1.1rem', transition: 'filter 0.2s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}>
                Order from Marketplace
              </Link>
            </div>
          </div>

          {/* Product 2 */}
          <div style={{ flex: '1 1 400px', border: '1px solid var(--color-earth-200)', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.3s ease' }}
               onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'}
               onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
            <img src="/dry-oyster.png" alt="Dry Oyster Mushrooms" style={{ width: '100%', height: '320px', objectFit: 'cover' }} />
            <div style={{ padding: '2.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-earth-900)' }}>Dry Oyster</h3>
                <span style={{ backgroundColor: 'var(--color-forest-100)', color: 'var(--color-forest-700)', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 800, fontSize: '0.9rem' }}>Preserved</span>
              </div>
              <p style={{ color: 'var(--color-earth-700)', lineHeight: 1.7, flex: 1, fontSize: '1.1rem' }}>Grade A dried white oyster mushrooms. Ideal for industrial food processors, nutraceuticals, and long-term storage.</p>
              <Link href="/login" style={{ display: 'block', textAlign: 'center', padding: '1.2rem', backgroundColor: 'var(--color-forest-600)', color: 'white', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', marginTop: '2.5rem', fontSize: '1.1rem', transition: 'filter 0.2s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}>
                Order from Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--color-earth-900)', color: 'white', padding: '6rem 5% 4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--color-earth-100)', letterSpacing: '-0.02em' }}>Lomstel Farms</h2>
          <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--color-forest-500)', margin: '0 auto 2rem', borderRadius: '2px' }}></div>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '3rem', lineHeight: 1.8, fontWeight: 300 }}>
            35, Ewuoso street off Ayetoro road,<br/>Kanuyi Ogun state
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginBottom: '4rem' }}>
            <a href="#" style={{ color: 'var(--color-forest-300)', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='var(--color-forest-300)'}>Privacy Policy</a>
            <a href="#" style={{ color: 'var(--color-forest-300)', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='var(--color-forest-300)'}>Terms of Service</a>
            <a href="mailto:contact@lomstelfarms.com" style={{ color: 'var(--color-forest-300)', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='var(--color-forest-300)'}>Contact Us</a>
          </div>
          <div style={{ opacity: 0.4, fontSize: '0.95rem' }}>
            &copy; {new Date().getFullYear()} Lomstel Farms. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
