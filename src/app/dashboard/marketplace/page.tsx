"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { ShoppingCart, Globe, CreditCard, X, Loader2, Package } from 'lucide-react';

type CartItem = {
  product_type: 'WET' | 'DRY';
  quantity_kg: number;
  price_per_kg: number;
  currency: 'NGN' | 'USD';
};

type Stock = { wetKg: number; dryKg: number };

const BASE_PRODUCTS = [
  {
    id: 'dry-bulk',
    name: 'Dry Oyster Mushrooms',
    type: 'DRY' as const,
    description: 'Premium grade A dried white oyster mushrooms. Ideal for industrial food processors, nutraceuticals, and export. Certified stock available for immediate dispatch.',
    priceNGN: 20000,
    priceUSD: 13,
    unit: 'per kg',
    badgeColor: '#2d6a4f',
    icon: '🍂',
    minOrder: 10,
  },
  {
    id: 'wet-fresh',
    name: 'Fresh Wet Oyster Mushrooms',
    type: 'WET' as const,
    description: 'Farm-fresh wet oyster mushrooms for local restaurants, hotels, and retailers. Harvested to order, delivered within 24 hours in Lagos.',
    priceNGN: 5000,
    priceUSD: 3.3,
    unit: 'per kg',
    badgeColor: '#1a6db5',
    icon: <img src="/wet-oyster.png" alt="Fresh White Oyster Mushroom" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', verticalAlign: 'middle' }} />,
    minOrder: 10,
  },
];

// Mirrors exactly how Inventory computes totals:
// harvests table  = wet entries from Harvest Log + dry/wet entries from Inventory
// mushroom_products table = sale deductions (stored as negative values)
async function fetchStock(): Promise<Stock> {
  const [{ data: harvests }, { data: products }] = await Promise.all([
    supabase.from('harvests').select('weight, harvest_type'),
    supabase.from('mushroom_products').select('quantity_kg, product_type'),
  ]);

  let wetKg = 0;
  let dryKg = 0;

  (harvests || []).forEach((h: any) => {
    if (h.harvest_type === 'DRY') {
      dryKg += Number(h.weight);
    } else {
      wetKg += Number(h.weight);
    }
  });

  (products || []).forEach((p: any) => {
    if (p.product_type === 'WET') {
      wetKg += Number(p.quantity_kg); // negative = sale deduction
    } else {
      dryKg += Number(p.quantity_kg); // negative = sale deduction
    }
  });

  // Seed dry stock with 2000kg if no dry data exists (matches Inventory logic)
  const hasDryData = (harvests || []).some((h: any) => h.harvest_type === 'DRY') ||
                     (products || []).some((p: any) => p.product_type === 'DRY');
  if (dryKg === 0 && !hasDryData) dryKg = 2000;

  return { wetKg: Math.max(0, wetKg), dryKg: Math.max(0, dryKg) };
}

export default function MarketplacePage() {
  const [user, setUser] = useState<any>(null);
  const [stock, setStock] = useState<Stock>({ wetKg: 0, dryKg: 0 });
  const [stockLoading, setStockLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<(typeof BASE_PRODUCTS[0] & { availableKg: number; badge: string }) | null>(null);
  const [quantity, setQuantity] = useState(10);
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState('');

  // Derive live products from base + stock
  const PRODUCTS = BASE_PRODUCTS.map(p => ({
    ...p,
    badge: p.type === 'DRY'
      ? stockLoading ? 'Loading...' : `${stock.dryKg.toLocaleString()} kg Available`
      : stockLoading ? 'Loading...' : `${stock.wetKg.toLocaleString()} kg Available`,
    availableKg: p.type === 'DRY' ? stock.dryKg : stock.wetKg,
  }));

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    // Initial fetch
    fetchStock().then(s => { setStock(s); setStockLoading(false); });

    // Realtime on BOTH tables — marketplace updates instantly when:
    // - Farm worker logs harvest (harvests table)
    // - Admin records a sale/dry entry in Inventory (mushroom_products table)
    const channel = supabase
      .channel('marketplace_stock')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'harvests' }, () => {
        fetchStock().then(s => setStock(s));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mushroom_products' }, () => {
        fetchStock().then(s => setStock(s));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const openOrderModal = (product: typeof PRODUCTS[0]) => {
    setSelectedProduct(product);
    setQuantity(product.minOrder);
    setError('');
    setOrderSuccess(false);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setIsProcessing(false);
    setError('');
  };

  const pricePerKg = selectedProduct
    ? currency === 'NGN' ? selectedProduct.priceNGN : selectedProduct.priceUSD
    : 0;
  const totalAmount = pricePerKg * quantity;
  const formattedTotal = currency === 'NGN'
    ? `₦${totalAmount.toLocaleString()}`
    : `$${totalAmount.toLocaleString()}`;

  const handlePayWithPaystack = async () => {
    if (!user || !selectedProduct) return;
    setIsProcessing(true);
    setError('');

    try {
      // Initialize Paystack payment (order will be created securely on server)
      const res = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'NGN',
          metadata: {
            product: selectedProduct.name,
            quantity_kg: quantity,
          },
        }),
      });

      const { authorization_url, error: initErr } = await res.json();
      if (initErr) throw new Error(initErr);

      // Redirect to Paystack secure checkout
      window.location.href = authorization_url;
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handlePayWithFlutterwave = async () => {
    if (!user || !selectedProduct) return;
    setIsProcessing(true);
    setError('');

    try {
      // Initialize Flutterwave payment (order will be created securely on server)
      const res = await fetch('/api/payments/flutterwave/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: currency,
          metadata: {
            product: selectedProduct.name,
            quantity_kg: quantity,
          },
        }),
      });

      const { payment_link, error: initErr } = await res.json();
      if (initErr) throw new Error(initErr);

      // Redirect to Flutterwave secure checkout
      window.location.href = payment_link;
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }} className="animate-fade-in">
      <header>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShoppingCart size={40} style={{ color: 'var(--color-forest-500)' }} />
          Marketplace
        </h1>
        <p style={{ fontSize: '1.1rem' }}>
          Order premium oyster mushrooms directly from the farm. Local NGN payments via Paystack · International payments via Flutterwave.
        </p>
      </header>

      {/* Product Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {PRODUCTS.map(product => (
          <div key={product.id} className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', transition: 'transform 0.2s', cursor: 'default' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '3rem' }}>{product.icon}</span>
              <span style={{ backgroundColor: product.badgeColor, color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>
                {product.badge}
              </span>
            </div>

            <div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--color-earth-900)', marginBottom: '0.5rem' }}>{product.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{product.description}</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--color-forest-50, #f0fdf4)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-forest-600)', fontWeight: 700, textTransform: 'uppercase' }}>NGN Price</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-forest-700)' }}>₦{product.priceNGN.toLocaleString()}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.unit}</div>
              </div>
              <div style={{ flex: 1, backgroundColor: '#f0f4ff', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#4361ee', fontWeight: 700, textTransform: 'uppercase' }}>USD Price</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3a0ca3' }}>${product.priceUSD}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.unit}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Min. order: <strong>{product.minOrder} kg</strong>
            </div>

            <button
              onClick={() => openOrderModal(product)}
              style={{ backgroundColor: product.badgeColor, color: 'white', border: 'none', borderRadius: '12px', padding: '1rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s', boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)' }}
              onMouseEnter={e => {
                e.currentTarget.style.filter = 'brightness(1.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.filter = 'brightness(1)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(0,0,0,0.1)';
              }}
            >
              <Package size={20} /> Place Order
            </button>
          </div>
        ))}
      </div>

      {/* Order Modal */}
      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '520px', padding: '2.5rem', position: 'relative', borderRadius: '20px' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={24} />
            </button>

            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', color: 'var(--color-earth-900)' }}>
              {selectedProduct.icon} {selectedProduct.name}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Configure your order below.</p>

            {/* Currency Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Payment Currency</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setCurrency('NGN')}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: `2px solid ${currency === 'NGN' ? 'var(--color-forest-500)' : 'transparent'}`, backgroundColor: currency === 'NGN' ? 'var(--color-forest-50, #f0fdf4)' : 'rgba(0,0,0,0.04)', cursor: 'pointer', fontWeight: 700, color: currency === 'NGN' ? 'var(--color-forest-700)' : 'var(--text-muted)' }}>
                  🇳🇬 NGN (Local)
                </button>
                <button onClick={() => setCurrency('USD')}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: `2px solid ${currency === 'USD' ? '#4361ee' : 'transparent'}`, backgroundColor: currency === 'USD' ? '#f0f4ff' : 'rgba(0,0,0,0.04)', cursor: 'pointer', fontWeight: 700, color: currency === 'USD' ? '#3a0ca3' : 'var(--text-muted)' }}>
                  🌍 USD (International)
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                Quantity (kg) — Min: {selectedProduct.minOrder} kg · Available: <span style={{ color: 'var(--color-forest-600)' }}>{(selectedProduct.availableKg ?? 0).toLocaleString()} kg</span>
              </label>
              <input
                type="number"
                min={selectedProduct.minOrder}
                max={selectedProduct.availableKg ?? 999999}
                value={quantity}
                onChange={e => setQuantity(Math.min(selectedProduct.availableKg ?? 999999, Math.max(selectedProduct.minOrder, Number(e.target.value))))}
                style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '10px', border: '2px solid rgba(0,0,0,0.1)', fontSize: '1.1rem', fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Order Summary */}
            <div style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Price per kg</span>
                <span style={{ fontWeight: 600 }}>{currency === 'NGN' ? `₦${pricePerKg.toLocaleString()}` : `$${pricePerKg}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Quantity</span>
                <span style={{ fontWeight: 600 }}>{quantity} kg</span>
              </div>
              <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.08)', margin: '0.75rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 800 }}>
                <span>Total</span>
                <span style={{ color: 'var(--color-forest-700)' }}>{formattedTotal}</span>
              </div>
            </div>

            {error && (
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            {/* Payment Buttons */}
            {currency === 'NGN' ? (
              <button onClick={handlePayWithPaystack} disabled={isProcessing}
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', backgroundColor: '#0BA4DB', color: 'white', fontSize: '1rem', fontWeight: 700, cursor: isProcessing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isProcessing ? 0.7 : 1 }}>
                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <CreditCard size={20} />}
                {isProcessing ? 'Processing...' : `Pay ${formattedTotal} with Paystack`}
              </button>
            ) : (
              <button onClick={handlePayWithFlutterwave} disabled={isProcessing}
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', backgroundColor: '#F5A623', color: 'white', fontSize: '1rem', fontWeight: 700, cursor: isProcessing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isProcessing ? 0.7 : 1 }}>
                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Globe size={20} />}
                {isProcessing ? 'Processing...' : `Pay ${formattedTotal} with Flutterwave`}
              </button>
            )}

            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              🔒 Secured by {currency === 'NGN' ? 'Paystack' : 'Flutterwave'} · Your payment is encrypted
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
