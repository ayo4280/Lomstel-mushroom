"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import {
  LayoutDashboard, Boxes, FileText, Settings, LogOut,
  User, Loader2, Bot, Store, ShoppingCart, Vault,
  Sprout, MapPin, UserCircle, Truck, Menu, X
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }
        const { data: userProfile, error } = await supabase
          .from('profiles').select('*').eq('id', session.user.id).single();
        if (error || !userProfile) {
          setProfile({ full_name: session.user.user_metadata?.full_name || 'Lomstel Member', role: session.user.user_metadata?.role || 'BUYER' });
        } else {
          setProfile(userProfile);
        }
      } catch { router.push('/login'); }
      finally { setLoading(false); }
    }
    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', gap: '1rem' }}>
        <Loader2 size={36} className="animate-spin" color="var(--color-forest-500)" />
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading Command Center...</p>
      </div>
    );
  }

  const role = profile?.role || 'BUYER';
  const showAdminFeatures = role === 'ADMIN' || role === 'FARM_WORKER';

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, show: true },
    { href: '/dashboard/marketplace', label: 'Marketplace', icon: <Store size={20} />, show: true },
    { href: '/dashboard/orders', label: 'Orders', icon: <ShoppingCart size={20} />, show: true },
    { href: '/dashboard/inventory', label: 'Inventory', icon: <Boxes size={20} />, show: showAdminFeatures },
    { href: '/dashboard/certificates', label: 'Certificates', icon: <FileText size={20} />, show: showAdminFeatures },
    { href: '/dashboard/vault', label: 'Vault', icon: <Vault size={20} />, show: true },
    { href: '/dashboard/harvest', label: 'Harvest Log', icon: <Sprout size={20} />, show: showAdminFeatures },
    { href: '/dashboard/tracking', label: 'Tracking', icon: <MapPin size={20} />, show: showAdminFeatures },
    { href: '/dashboard/logistics', label: 'Logistics', icon: <Truck size={20} />, show: showAdminFeatures },
    { href: '/dashboard/ai-agent', label: 'AI Agent', icon: <Bot size={20} />, show: role === 'ADMIN' },
    { href: '/dashboard/profile', label: 'Profile', icon: <UserCircle size={20} />, show: true },
    { href: '/dashboard/settings', label: 'Settings', icon: <Settings size={20} />, show: true },
  ].filter(i => i.show);

  // Bottom tab items (most important 4)
  const bottomTabs = [
    { href: '/dashboard', label: 'Home', icon: <LayoutDashboard size={22} /> },
    { href: '/dashboard/marketplace', label: 'Market', icon: <Store size={22} /> },
    { href: '/dashboard/orders', label: 'Orders', icon: <ShoppingCart size={22} /> },
    { href: '/dashboard/profile', label: 'Profile', icon: <UserCircle size={22} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-main)' }}>
      <style>{`
        /* ── Desktop sidebar ── */
        .dash-sidebar {
          width: 260px;
          min-height: 100vh;
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-right: 1px solid var(--color-earth-200);
          background-color: rgba(255,255,255,0.5);
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          flex-shrink: 0;
        }

        /* ── Mobile top bar ── */
        .mobile-topbar {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 56px;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--color-earth-200);
          align-items: center;
          justify-content: space-between;
          padding: 0 1rem;
          z-index: 200;
        }
        .mobile-topbar-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--color-forest-700);
        }
        .mobile-menu-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          color: var(--color-earth-700);
          display: flex;
          align-items: center;
        }

        /* ── Mobile slide-out drawer ── */
        .mobile-drawer-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 300;
        }
        .mobile-drawer-overlay.open { display: block; }
        .mobile-drawer {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 260px;
          background: white;
          z-index: 400;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow-y: auto;
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 4px 0 24px rgba(0,0,0,0.12);
        }
        .mobile-drawer.open { transform: translateX(0); }

        /* ── Bottom tab bar ── */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          height: 60px;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(12px);
          border-top: 1px solid var(--color-earth-200);
          z-index: 200;
          align-items: center;
          justify-content: space-around;
        }
        .bottom-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 6px 10px;
          text-decoration: none;
          color: var(--color-earth-500);
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          transition: color 0.2s;
        }
        .bottom-tab.active { color: var(--color-forest-500); }

        /* ── Main content area ── */
        .dash-main {
          flex: 1;
          min-width: 0;
          padding: 2rem 3rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        /* ── Shared nav-link style ── */
        .dash-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 12px;
          color: var(--color-earth-700);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }
        .dash-nav-link:hover { background-color: var(--color-earth-200); color: var(--color-earth-900); }
        .dash-nav-link.active {
          background-color: var(--color-forest-500);
          color: white;
          box-shadow: 0 4px 12px rgba(75,127,82,0.2);
        }
        .nav-logout-btn:hover { background-color: rgba(200,90,60,0.08); }

        @media (max-width: 768px) {
          .dash-sidebar     { display: none !important; }
          .mobile-topbar    { display: flex !important; }
          .mobile-bottom-nav { display: flex !important; }
          .dash-main {
            padding: 1rem;
            padding-top: 72px;   /* below top bar */
            padding-bottom: 76px; /* above bottom nav */
          }
        }
      `}</style>

      {/* ── Desktop sidebar ── */}
      <aside className="dash-sidebar">
        <div>
          <div style={{ marginBottom: '2.5rem', padding: '0 0.5rem' }}>
            <h2 style={{ color: 'var(--color-forest-700)', margin: 0, fontSize: '1.75rem', letterSpacing: '-0.5px', fontWeight: 800 }}>Lomstel</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-earth-500)', fontWeight: 600 }}>Command Center</p>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className={`dash-nav-link ${pathname === item.href ? 'active' : ''}`}>
                {item.icon}{item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem' }}>
            <div style={{ backgroundColor: 'var(--color-forest-100)', color: 'var(--color-forest-700)', borderRadius: '50%', padding: '0.5rem', display: 'flex' }}>
              <User size={18} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-earth-900)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{profile?.full_name}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: role === 'ADMIN' ? 'var(--color-forest-600)' : role === 'FARM_WORKER' ? '#2980B9' : 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{role.replace('_', ' ')}</div>
            </div>
          </div>
          <button onClick={handleSignOut} className="nav-logout-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: 'none', backgroundColor: 'transparent', color: 'var(--color-accent)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}>
            <LogOut size={18} />Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="mobile-topbar">
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <Menu size={24} />
        </button>
        <span className="mobile-topbar-title">Lomstel</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ backgroundColor: 'var(--color-forest-100)', color: 'var(--color-forest-700)', borderRadius: '50%', padding: '6px', display: 'flex' }}>
            <User size={16} />
          </div>
        </div>
      </div>

      {/* ── Mobile drawer overlay ── */}
      <div className={`mobile-drawer-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <div className={`mobile-drawer ${sidebarOpen ? 'open' : ''}`}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ color: 'var(--color-forest-700)', margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Lomstel</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-earth-500)', fontWeight: 600 }}>Command Center</p>
            </div>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
              <X size={22} />
            </button>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className={`dash-nav-link ${pathname === item.href ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                {item.icon}{item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0 0.5rem' }}>
            <div style={{ backgroundColor: 'var(--color-forest-100)', color: 'var(--color-forest-700)', borderRadius: '50%', padding: '0.5rem', display: 'flex' }}>
              <User size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-earth-900)' }}>{profile?.full_name}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase' }}>{role.replace('_', ' ')}</div>
            </div>
          </div>
          <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: 'none', backgroundColor: 'transparent', color: 'var(--color-accent)', fontWeight: 600, cursor: 'pointer' }}>
            <LogOut size={18} />Sign Out
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="dash-main">
        {children}
      </main>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="mobile-bottom-nav">
        {bottomTabs.map(tab => (
          <Link key={tab.href} href={tab.href} className={`bottom-tab ${pathname === tab.href ? 'active' : ''}`}>
            {tab.icon}
            <span>{tab.label}</span>
          </Link>
        ))}
        <button className="bottom-tab" onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Menu size={22} />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
