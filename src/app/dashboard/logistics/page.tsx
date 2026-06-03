"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Truck, MapPin, CheckCircle, Package, UserPlus } from 'lucide-react';

type Delivery = {
  id: string;
  order_id: string;
  buyer_name: string;
  delivery_address: string;
  status: 'Processing' | 'Dispatched' | 'Delivered';
  driver_name: string | null;
  driver_phone: string | null;
  estimated_delivery_date: string | null;
};

export default function LogisticsPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock a new delivery for demo purposes if the database is empty
  const populateMockDelivery = async () => {
    const { data: existing } = await supabase.from('deliveries').select('*');
    if (existing && existing.length === 0) {
      const mockOrder = {
        order_id: '123e4567-e89b-12d3-a456-426614174000',
        buyer_name: 'Prince Ebeano Supermarket',
        delivery_address: '14 Isaac John St, Ikeja GRA, Lagos',
        status: 'Processing'
      };
      await supabase.from('deliveries').insert([mockOrder]);
      fetchDeliveries();
    }
  };

  const fetchDeliveries = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setDeliveries(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    populateMockDelivery().then(() => fetchDeliveries());

    const channel = supabase
      .channel('deliveries_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, () => {
        fetchDeliveries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const assignDriver = async (id: string) => {
    const driverName = prompt("Enter Farm Worker / Driver Name:");
    if (!driverName) return;
    const driverPhone = prompt("Enter Driver Phone Number:");
    
    await supabase
      .from('deliveries')
      .update({ 
        driver_name: driverName, 
        driver_phone: driverPhone || '',
        status: 'Dispatched',
        estimated_delivery_date: new Date(Date.now() + 86400000).toISOString() // Tomorrow
      })
      .eq('id', id);
  };

  const markDelivered = async (id: string) => {
    await supabase
      .from('deliveries')
      .update({ status: 'Delivered' })
      .eq('id', id);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Processing': return { bg: '#fef3c7', text: '#92400e', icon: <Package size={16} /> };
      case 'Dispatched': return { bg: '#e0f2fe', text: '#0369a1', icon: <Truck size={16} /> };
      case 'Delivered': return { bg: '#dcfce7', text: '#16a34a', icon: <CheckCircle size={16} /> };
      default: return { bg: '#f3f4f6', text: '#374151', icon: <Package size={16} /> };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }} className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Truck size={40} style={{ color: 'var(--color-forest-500)' }} />
            Logistics & Tracking
          </h1>
          <p style={{ fontSize: '1.1rem' }}>Assign farm workers to routes and track active deliveries.</p>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Active Deliveries Board */}
        <div className="glass" style={{ flex: '1 1 500px', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-earth-900)', marginBottom: '1.5rem' }}>Active Deliveries</h2>
          
          {isLoading ? (
            <p>Loading routes...</p>
          ) : deliveries.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No deliveries found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {deliveries.map(delivery => {
                const colors = getStatusColor(delivery.status);
                return (
                  <div key={delivery.id} style={{ border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-earth-900)' }}>{delivery.buyer_name}</h3>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, backgroundColor: colors.bg, color: colors.text }}>
                        {colors.icon} {delivery.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <MapPin size={16} style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                      <span>{delivery.delivery_address}</span>
                    </div>

                    <div style={{ padding: '1rem', backgroundColor: 'var(--color-earth-50)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {delivery.driver_name ? (
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Driver: {delivery.driver_name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone: {delivery.driver_phone}</div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No driver assigned yet.</div>
                      )}

                      {delivery.status === 'Processing' && (
                        <button onClick={() => assignDriver(delivery.id)} className="btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <UserPlus size={16} /> Assign Driver
                        </button>
                      )}
                      {delivery.status === 'Dispatched' && (
                        <button onClick={() => markDelivered(delivery.id)} className="btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-forest-600)' }}>
                          <CheckCircle size={16} /> Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Command Center Map (Visual Representation) */}
        <div className="glass" style={{ flex: '1 1 400px', padding: '2rem', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-earth-900)' }}>Command Center Map</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Visualizing live active routes across the region.</p>
          
          <div style={{ 
            width: '100%', 
            height: '400px', 
            borderRadius: '12px', 
            backgroundColor: '#e5e7eb',
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/cartographer.png")', // Creates a subtle map-like texture
            position: 'relative',
            overflow: 'hidden',
            border: '2px solid rgba(0,0,0,0.05)'
          }}>
            {/* Render pins for dispatched deliveries */}
            {deliveries.filter(d => d.status === 'Dispatched').map((delivery, index) => {
              // Generate pseudo-random coordinates for visual effect based on string length
              const top = 20 + ((delivery.buyer_name.length * 7) % 60);
              const left = 20 + ((delivery.delivery_address.length * 5) % 60);
              
              return (
                <div key={delivery.id} style={{
                  position: 'absolute',
                  top: `${top}%`,
                  left: `${left}%`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  animation: 'bounce 2s infinite'
                }}>
                  <div style={{ backgroundColor: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', whiteSpace: 'nowrap', marginBottom: '4px' }}>
                    {delivery.driver_name} ➔ {delivery.buyer_name}
                  </div>
                  <MapPin size={32} style={{ color: 'var(--color-forest-600)', filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.3))' }} />
                </div>
              )
            })}

            {/* Empty state overlay if no active drivers */}
            {deliveries.filter(d => d.status === 'Dispatched').length === 0 && (
               <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.7)' }}>
                 <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No drivers currently en-route.</p>
               </div>
            )}
            
            <style jsx>{`
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
              }
            `}</style>
          </div>
        </div>

      </div>
    </div>
  );
}
