"use client";
import Link from 'next/link';
import { SparklesText } from '@/components/SparklesText';
import { HeroSubtitleText } from '@/components/HeroSubtitleText';

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
        {/* Nav Styles */}
        <style>{`
          @keyframes logo-shine {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
          }
          .brand-logo {
            font-size: 1.8rem;
            font-weight: 900;
            letter-spacing: -0.04em;
            background: linear-gradient(
              120deg,
              var(--color-forest-700) 20%,
              #4ADE80 40%,
              #FFD700 50%,
              #4ADE80 60%,
              var(--color-forest-700) 80%
            );
            background-size: 200% auto;
            color: transparent;
            -webkit-background-clip: text;
            background-clip: text;
            animation: logo-shine 6s linear infinite;
            text-shadow: 0 4px 15px rgba(75, 127, 82, 0.2);
            text-decoration: none;
          }
          .nav-link {
            font-weight: 700;
            color: var(--color-earth-700);
            text-decoration: none;
            position: relative;
            transition: color 0.3s ease;
            font-size: 1.05rem;
          }
          .nav-link:hover {
            color: var(--color-forest-600);
          }
          .nav-link::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: -4px;
            left: 0;
            background-color: var(--color-forest-500);
            transition: width 0.3s ease;
          }
          .nav-link:hover::after {
            width: 100%;
          }
        `}</style>
        <Link href="/" className="brand-logo">
          Lomstel Farms
        </Link>
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#features" className="nav-link">Why Us</a>
          <a href="#products" className="nav-link">Products</a>
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
          maxWidth: '800px',
          padding: '0 2rem'
        }}>
          <SparklesText
            text="Premium Oyster Mushrooms, Cultivated with Precision."
            colors={{ first: '#FFD700', second: '#FFA500' }}
            sparklesCount={15}
            style={{ fontSize: '4.5rem', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.5rem', textShadow: '0 4px 20px rgba(0,0,0,0.6)', color: '#FFD700' }}
          />
          <HeroSubtitleText />
          
          {/* Custom style for the button's beautiful pulsing glow */}
          <style>{`
            @keyframes button-glow {
              0% { box-shadow: 0 0 15px rgba(75, 127, 82, 0.4), 0 0 30px rgba(75, 127, 82, 0.2); transform: translateY(0); }
              50% { box-shadow: 0 0 25px rgba(116, 198, 157, 0.8), 0 0 50px rgba(116, 198, 157, 0.4); transform: translateY(-3px); }
              100% { box-shadow: 0 0 15px rgba(75, 127, 82, 0.4), 0 0 30px rgba(75, 127, 82, 0.2); transform: translateY(0); }
            }
            .hero-btn-animated {
              animation: button-glow 3s infinite ease-in-out;
              background: linear-gradient(135deg, var(--color-forest-500) 0%, var(--color-forest-700) 100%);
              border: 1px solid rgba(255,255,255,0.2);
            }
            .hero-btn-animated:hover {
              animation: none;
              transform: scale(1.05) translateY(-3px) !important;
              filter: brightness(1.15) saturate(1.2);
              box-shadow: 0 10px 40px rgba(116, 198, 157, 0.8);
            }
          `}</style>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '-1.5rem', position: 'relative', zIndex: 10 }}>
            <Link href="#products" className="hero-btn-animated" style={{
              padding: '1.4rem 3.5rem',
              color: 'white',
              borderRadius: '50px',
              fontWeight: 800,
              fontSize: '1.6rem',
              letterSpacing: '0.02em',
              textDecoration: 'none',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
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
