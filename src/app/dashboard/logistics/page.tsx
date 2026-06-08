"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Truck, MapPin, CheckCircle, Package, UserPlus, ShoppingBag } from 'lucide-react';

type Delivery = {
  id: string;
  order_id: string;
  buyer_name: string;
  buyer_email: string;
  delivery_address: string;
  product_type: 'WET' | 'DRY' | null;
  quantity_kg: number | null;
  total_amount: number | null;
  currency: string | null;
  status: 'Processing' | 'Dispatched' | 'Delivered';
  driver_name: string | null;
  driver_phone: string | null;
  estimated_delivery_date: string | null;
  created_at: string;
};

export default function LogisticsPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeliveries = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deliveries:', error);
    } else {
      setDeliveries(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDeliveries();

    // Realtime: update whenever a new delivery is created or updated
    const channel = supabase
      .channel('deliveries_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, () => {
        fetchDeliveries();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const assignDriver = async (id: string) => {
    const driverName = prompt('Enter Farm Worker / Driver Name:');
    if (!driverName) return;
    const driverPhone = prompt('Enter Driver Phone Number:');

    const { error } = await supabase
      .from('deliveries')
      .update({
        driver_name: driverName,
        driver_phone: driverPhone || '',
        status: 'Dispatched',
        estimated_delivery_date: new Date(Date.now() + 86400000).toISOString(),
      })
      .eq('id', id);

    if (error) alert('Failed to assign driver: ' + error.message);
  };

  const markDelivered = async (id: string) => {
    const { error } = await supabase
      .from('deliveries')
      .update({ status: 'Delivered' })
      .eq('id', id);

    if (error) alert('Failed to mark delivered: ' + error.message);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Processing': return { bg: '#fef3c7', text: '#92400e', icon: <Package size={14} /> };
      case 'Dispatched': return { bg: '#e0f2fe', text: '#0369a1', icon: <Truck size={14} /> };
      case 'Delivered':  return { bg: '#dcfce7', text: '#16a34a', icon: <CheckCircle size={14} /> };
      default:           return { bg: '#f3f4f6', text: '#374151', icon: <Package size={14} /> };
    }
  };

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount) return '—';
    const symbol = (currency || 'NGN') === 'NGN' ? '₦' : '$';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const stats = {
    total: deliveries.length,
    processing: deliveries.filter(d => d.status === 'Processing').length,
    dispatched: deliveries.filter(d => d.status === 'Dispatched').length,
    delivered: deliveries.filter(d => d.status === 'Delivered').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      
      {/* Header */}
      <header>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Truck size={40} style={{ color: 'var(--color-forest-500)' }} />
          Logistics & Tracking
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
          Deliveries are created automatically when a buyer's payment is confirmed.
        </p>
      </header>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Orders', value: stats.total, color: '#6366f1', bg: '#eef2ff' },
          { label: 'Processing', value: stats.processing, color: '#d97706', bg: '#fef3c7' },
          { label: 'Dispatched', value: stats.dispatched, color: '#0369a1', bg: '#e0f2fe' },
          { label: 'Delivered', value: stats.delivered, color: '#16a34a', bg: '#dcfce7' },
        ].map(stat => (
          <div key={stat.label} className="glass" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{stat.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

        {/* Deliveries Board */}
        <div className="glass" style={{ flex: '1 1 500px', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--color-earth-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={22} style={{ color: 'var(--color-forest-500)' }} />
            Active Deliveries
          </h2>

          {isLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading routes...</p>
          ) : deliveries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Truck size={48} style={{ margin: '0 auto 1rem', opacity: 0.2, display: 'block' }} />
              <p style={{ fontWeight: 600 }}>No deliveries yet.</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Deliveries appear here automatically once a buyer completes payment in the Marketplace.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {deliveries.map(delivery => {
                const colors = getStatusStyle(delivery.status);
                return (
                  <div key={delivery.id} style={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', padding: '1.5rem', backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* Top row: buyer + status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-earth-900)', fontWeight: 700 }}>
                          {delivery.buyer_name}
                        </h3>
                        {delivery.buyer_email && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{delivery.buyer_email}</div>
                        )}
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, backgroundColor: colors.bg, color: colors.text, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {colors.icon} {delivery.status}
                      </span>
                    </div>

                    {/* Order details */}
                    {(delivery.product_type || delivery.quantity_kg) && (
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {delivery.product_type && (
                          <span style={{ backgroundColor: delivery.product_type === 'DRY' ? 'var(--color-earth-100)' : '#e0f2fe', color: delivery.product_type === 'DRY' ? 'var(--color-earth-700)' : '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                            {delivery.product_type === 'DRY' ? '🍂 Dry Mushrooms' : '💧 Fresh Mushrooms'}
                          </span>
                        )}
                        {delivery.quantity_kg && (
                          <span style={{ backgroundColor: 'var(--color-forest-100)', color: 'var(--color-forest-700)', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                            {delivery.quantity_kg} kg
                          </span>
                        )}
                        {delivery.total_amount && (
                          <span style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                            {formatCurrency(delivery.total_amount, delivery.currency)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Address */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      <MapPin size={15} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{delivery.delivery_address}</span>
                    </div>

                    {/* Driver info + actions */}
                    <div style={{ padding: '1rem', backgroundColor: 'var(--color-earth-100)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      {delivery.driver_name ? (
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-earth-900)' }}>Driver: {delivery.driver_name}</div>
                          {delivery.driver_phone && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📞 {delivery.driver_phone}</div>}
                          {delivery.estimated_delivery_date && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              ETA: {new Date(delivery.estimated_delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No driver assigned yet.</div>
                      )}

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {delivery.status === 'Processing' && (
                          <button onClick={() => assignDriver(delivery.id)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <UserPlus size={15} /> Assign Driver
                          </button>
                        )}
                        {delivery.status === 'Dispatched' && (
                          <button onClick={() => markDelivered(delivery.id)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--color-forest-600)' }}>
                            <CheckCircle size={15} /> Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Map Panel */}
        <div className="glass" style={{ flex: '1 1 380px', padding: '2rem', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--color-earth-900)', marginBottom: '0.5rem' }}>Command Center Map</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Live active routes for dispatched drivers.</p>

          <div style={{ width: '100%', height: '380px', borderRadius: '12px', backgroundColor: '#e5e7eb', backgroundImage: 'url("https://www.transparenttextures.com/patterns/cartographer.png")', position: 'relative', overflow: 'hidden', border: '2px solid rgba(0,0,0,0.05)' }}>
            {deliveries.filter(d => d.status === 'Dispatched').map((delivery, index) => {
              const top = 20 + ((delivery.buyer_name.length * 7) % 55);
              const left = 15 + ((delivery.delivery_address.length * 5) % 65);
              return (
                <div key={delivery.id} style={{ position: 'absolute', top: `${top}%`, left: `${left}%`, transform: 'translate(-50%, -100%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ backgroundColor: 'white', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, boxShadow: '0 2px 6px rgba(0,0,0,0.15)', whiteSpace: 'nowrap', marginBottom: '4px', color: 'var(--color-earth-900)' }}>
                    {delivery.driver_name} → {delivery.buyer_name}
                  </div>
                  <MapPin size={28} style={{ color: 'var(--color-forest-600)', filter: 'drop-shadow(0px 3px 2px rgba(0,0,0,0.25))' }} />
                </div>
              );
            })}

            {deliveries.filter(d => d.status === 'Dispatched').length === 0 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.65)', gap: '0.5rem' }}>
                <Truck size={32} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>No drivers currently en-route.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
