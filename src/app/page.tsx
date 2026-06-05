"use client";
import Link from 'next/link';
import { useState } from 'react';
import { SparklesText } from '@/components/SparklesText';
import { HeroSubtitleText } from '@/components/HeroSubtitleText';

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ fontFamily: 'var(--font-inter)', color: 'var(--color-earth-900)' }}>

      {/* ─── Global responsive styles ─── */}
      <style>{`
        /* ── Brand / Logo ── */
        @keyframes logo-shine {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .brand-logo {
          font-size: clamp(1.3rem, 5vw, 1.8rem);
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
          text-decoration: none;
          white-space: nowrap;
        }

        /* ── Desktop nav links ── */
        .nav-desktop-link {
          font-weight: 700;
          color: var(--color-earth-700);
          text-decoration: none;
          position: relative;
          transition: color 0.3s ease;
          font-size: 1.05rem;
          white-space: nowrap;
        }
        .nav-desktop-link:hover { color: var(--color-forest-600); }
        .nav-desktop-link::after {
          content: '';
          position: absolute;
          width: 0; height: 2px;
          bottom: -4px; left: 0;
          background-color: var(--color-forest-500);
          transition: width 0.3s ease;
        }
        .nav-desktop-link:hover::after { width: 100%; }

        /* ── Hamburger button ── */
        .hamburger-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          flex-direction: column;
          gap: 5px;
          z-index: 200;
        }
        .hamburger-btn span {
          display: block;
          width: 26px;
          height: 3px;
          background: var(--color-earth-700);
          border-radius: 3px;
          transition: all 0.3s ease;
        }

        /* ── Mobile drawer nav ── */
        .mobile-nav {
          display: none;
          flex-direction: column;
          gap: 0;
          background: rgba(255,255,255,0.98);
          backdrop-filter: blur(16px);
          position: fixed;
          top: 70px; left: 0; right: 0;
          padding: 1.5rem 5% 2rem;
          border-bottom: 1px solid var(--color-earth-200);
          z-index: 99;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          animation: slideDown 0.25s ease;
        }
        .mobile-nav.open { display: flex; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mobile-nav a {
          display: block;
          padding: 1rem 0;
          font-weight: 700;
          font-size: 1.15rem;
          color: var(--color-earth-700);
          text-decoration: none;
          border-bottom: 1px solid var(--color-earth-200);
        }
        .mobile-nav a:last-child { border-bottom: none; }

        /* ── Desktop nav strip ── */
        .nav-desktop {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        /* ── Hero title ── */
        .hero-title {
          font-size: clamp(2rem, 6vw, 4.5rem);
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 1.5rem;
          text-shadow: 0 4px 20px rgba(0,0,0,0.6);
          color: #FFD700;
        }

        /* ── Hero CTA button ── */
        @keyframes button-glow {
          0%   { box-shadow: 0 0 15px rgba(75,127,82,0.4), 0 0 30px rgba(75,127,82,0.2); transform: translateY(0); }
          50%  { box-shadow: 0 0 25px rgba(116,198,157,0.8), 0 0 50px rgba(116,198,157,0.4); transform: translateY(-3px); }
          100% { box-shadow: 0 0 15px rgba(75,127,82,0.4), 0 0 30px rgba(75,127,82,0.2); transform: translateY(0); }
        }
        .hero-btn-animated {
          animation: button-glow 3s infinite ease-in-out;
          background: linear-gradient(135deg, var(--color-forest-500) 0%, var(--color-forest-700) 100%);
          border: 1px solid rgba(255,255,255,0.2);
          display: inline-block;
          padding: clamp(0.9rem, 3vw, 1.4rem) clamp(2rem, 5vw, 3.5rem);
          color: white;
          border-radius: 50px;
          font-weight: 800;
          font-size: clamp(1rem, 3.5vw, 1.6rem);
          letter-spacing: 0.02em;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          white-space: nowrap;
        }
        .hero-btn-animated:hover {
          animation: none;
          transform: scale(1.05) translateY(-3px) !important;
          filter: brightness(1.15) saturate(1.2);
          box-shadow: 0 10px 40px rgba(116,198,157,0.8);
        }

        /* ── Section headings ── */
        .section-heading {
          font-size: clamp(1.8rem, 5vw, 3rem);
          font-weight: 900;
          color: var(--color-forest-700);
          letter-spacing: -0.03em;
        }

        /* ── Product card h3 ── */
        .product-card-title {
          font-size: clamp(1.4rem, 4vw, 2rem);
          font-weight: 900;
          color: var(--color-earth-900);
        }

        /* ── Features grid ── */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ── Products flex ── */
        .products-flex {
          display: flex;
          flex-wrap: wrap;
          gap: 2.5rem;
          justify-content: center;
          max-width: 1000px;
          margin: 0 auto;
        }
        .product-card {
          flex: 1 1 300px;
          min-width: 0;
          border: 1px solid var(--color-earth-200);
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.3s ease;
        }
        .product-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
        .product-card img {
          width: 100%;
          height: clamp(200px, 40vw, 320px);
          object-fit: cover;
          display: block;
        }

        /* ── Footer links ── */
        .footer-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 4rem;
        }

        /* ─── MOBILE BREAKPOINT ─────────────────── */
        @media (max-width: 640px) {
          .nav-desktop     { display: none !important; }
          .hamburger-btn   { display: flex !important; }

          .hero-section {
            height: auto !important;
            min-height: 60vh;
            padding-top: 2rem;
            padding-bottom: 3rem;
          }

          .features-section  { padding: 4rem 5% !important; }
          .products-section  { padding: 4rem 5% !important; }
          .section-mb        { margin-bottom: 3rem !important; }

          .features-grid {
            grid-template-columns: 1fr !important;
          }

          .products-flex {
            flex-direction: column;
            gap: 2rem;
          }
          .product-card { flex: 1 1 100%; }

          .footer-links { gap: 1rem; }
        }

        /* ─── TABLET BREAKPOINT ─────────────────── */
        @media (max-width: 900px) and (min-width: 641px) {
          .nav-desktop { gap: 1rem; }
          .features-section { padding: 5rem 5% !important; }
          .products-section { padding: 5rem 5% !important; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 5%',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(10px)',
        position: 'fixed',
        width: '100%',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid var(--color-earth-200)',
        boxSizing: 'border-box',
      }}>
        <Link href="/" className="brand-logo">Lomstel Farms</Link>

        {/* Desktop nav */}
        <nav className="nav-desktop">
          <a href="#features" className="nav-desktop-link">Why Us</a>
          <a href="#products" className="nav-desktop-link">Products</a>
          <Link href="/login" className="btn-primary" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Command Center Login
          </Link>
        </nav>

        {/* Hamburger */}
        <button
          className="hamburger-btn"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(o => !o)}
        >
          <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 6px)' : 'none' }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -6px)' : 'none' }} />
        </button>
      </header>

      {/* Mobile drawer */}
      <nav className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        <a href="#features" onClick={() => setMenuOpen(false)}>Why Us</a>
        <a href="#products" onClick={() => setMenuOpen(false)}>Products</a>
        <Link href="/login" onClick={() => setMenuOpen(false)} style={{ color: 'var(--color-forest-600)' }}>
          Command Center Login →
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section
        className="hero-section"
        style={{
          marginTop: '70px',
          height: '90vh',
          minHeight: '500px',
          backgroundImage: 'url(/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(20,40,20,0.55)' }} />
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: '800px',
          padding: '0 1.25rem',
          width: '100%',
        }}>
          <SparklesText
            text="Premium Oyster Mushrooms, Cultivated with Precision."
            colors={{ first: '#FFD700', second: '#FFA500' }}
            sparklesCount={10}
            className="hero-title"
          />
          <HeroSubtitleText />

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-0.5rem', position: 'relative', zIndex: 10 }}>
            <a href="#products" className="hero-btn-animated">
              Explore Our Harvest
            </a>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="features-section" style={{ padding: '8rem 5%', backgroundColor: 'var(--color-earth-100)' }}>
        <div className="section-mb" style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 className="section-heading">Why Choose Lomstel Farms</h2>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'var(--color-earth-700)', marginTop: '1rem', fontWeight: 500 }}>
            We combine nature's best with modern technology.
          </p>
        </div>
        <div className="features-grid">
          {[
            { icon: '🌿', title: 'Organic & Pure', body: 'Cultivated in highly controlled environments with zero harsh chemicals. Pure, natural growth for the best taste and nutrition.' },
            { icon: '🚚', title: 'Swift Logistics', body: 'Nationwide delivery tracked in real-time. We ensure your mushrooms arrive fresh, dry, and in perfect condition.' },
            { icon: '💻', title: 'Tech-Driven Quality', body: 'Our advanced Command Center ensures perfect stock, quality control, and streamlined wholesale ordering.' },
          ].map(card => (
            <div key={card.title}
              style={{ backgroundColor: 'white', padding: '2.5rem 1.75rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', textAlign: 'center', transition: 'transform 0.3s ease' }}
              onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-10px)')}
              onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}>
              <div style={{ fontSize: '3rem', marginBottom: '1.25rem' }}>{card.icon}</div>
              <h3 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-earth-900)' }}>{card.title}</h3>
              <p style={{ color: 'var(--color-earth-700)', lineHeight: 1.7, fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)' }}>{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Products ── */}
      <section id="products" className="products-section" style={{ padding: '8rem 5%', backgroundColor: 'white' }}>
        <div className="section-mb" style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 className="section-heading">Our Premium Harvest</h2>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'var(--color-earth-700)', marginTop: '1rem', fontWeight: 500 }}>
            Available for wholesale and direct distribution.
          </p>
        </div>

        <div className="products-flex">
          {/* Product 1 */}
          <div className="product-card">
            <img src="/wet-oyster.png" alt="Fresh Wet Oyster Mushrooms" />
            <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                <h3 className="product-card-title">Fresh Wet Oyster</h3>
                <span style={{ backgroundColor: '#eef2ff', color: '#1a6db5', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Fresh</span>
              </div>
              <p style={{ color: 'var(--color-earth-700)', lineHeight: 1.7, flex: 1, fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>
                Premium, hand-harvested fresh oyster mushrooms. Crisp texture, earthy flavor, perfect for culinary excellence.
              </p>
              <Link href="/login" style={{ display: 'block', textAlign: 'center', padding: '1.1rem', backgroundColor: '#1a6db5', color: 'white', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', marginTop: '2rem', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', transition: 'filter 0.2s ease' }}
                onMouseOver={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
                onMouseOut={e => (e.currentTarget.style.filter = 'brightness(1)')}>
                Order from Marketplace
              </Link>
            </div>
          </div>

          {/* Product 2 */}
          <div className="product-card">
            <img src="/dry-oyster.png" alt="Dry Oyster Mushrooms" />
            <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                <h3 className="product-card-title">Dry Oyster</h3>
                <span style={{ backgroundColor: 'var(--color-forest-100)', color: 'var(--color-forest-700)', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Preserved</span>
              </div>
              <p style={{ color: 'var(--color-earth-700)', lineHeight: 1.7, flex: 1, fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>
                Grade A dried white oyster mushrooms. Ideal for industrial food processors, nutraceuticals, and long-term storage.
              </p>
              <Link href="/login" style={{ display: 'block', textAlign: 'center', padding: '1.1rem', backgroundColor: 'var(--color-forest-600)', color: 'white', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', marginTop: '2rem', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', transition: 'filter 0.2s ease' }}
                onMouseOver={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
                onMouseOut={e => (e.currentTarget.style.filter = 'brightness(1)')}>
                Order from Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: 'var(--color-earth-900)', color: 'white', padding: 'clamp(3rem, 8vw, 6rem) 5% 3rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--color-earth-100)', letterSpacing: '-0.02em' }}>
            Lomstel Farms
          </h2>
          <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--color-forest-500)', margin: '0 auto 2rem', borderRadius: '2px' }} />
          <p style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', opacity: 0.9, marginBottom: '3rem', lineHeight: 1.8, fontWeight: 300 }}>
            35, Ewuoso street off Ayetoro road,<br />Kanuyi Ogun state
          </p>
          <div className="footer-links">
            <a href="#" style={{ color: 'var(--color-forest-300)', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.color = 'white')}
              onMouseOut={e => (e.currentTarget.style.color = 'var(--color-forest-300)')}>Privacy Policy</a>
            <a href="#" style={{ color: 'var(--color-forest-300)', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.color = 'white')}
              onMouseOut={e => (e.currentTarget.style.color = 'var(--color-forest-300)')}>Terms of Service</a>
            <a href="mailto:contact@lomstelfarms.com" style={{ color: 'var(--color-forest-300)', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.color = 'white')}
              onMouseOut={e => (e.currentTarget.style.color = 'var(--color-forest-300)')}>Contact Us</a>
          </div>
          <div style={{ opacity: 0.4, fontSize: '0.9rem' }}>
            &copy; {new Date().getFullYear()} Lomstel Farms. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
