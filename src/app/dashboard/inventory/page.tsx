"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';
import InventoryForm from '@/components/InventoryForm';
import { Activity, Droplets, Wind } from 'lucide-react';

export default function InventoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [totalWet, setTotalWet] = useState(0);
  const [totalDry, setTotalDry] = useState(0);

  const fetchAll = useCallback(async () => {
    // Fetch harvest additions
    const { data: harvests } = await supabase
      .from('harvests')
      .select('*')
      .order('id', { ascending: false });

    // Fetch product records (includes sale deductions as negative values)
    const { data: products } = await supabase
      .from('mushroom_products')
      .select('*');

    let wet = 0;
    let dry = 0;

    if (harvests) {
      harvests.forEach((h: any) => {
        if (h.harvest_type === 'DRY') {
          dry += Number(h.weight);
        } else {
          // WET or legacy records without type
          wet += Number(h.weight);
        }
      });
    }

    if (products) {
      products.forEach((p: any) => {
        if (p.product_type === 'WET') {
          wet += Number(p.quantity_kg); // negative for sales
        } else {
          dry += Number(p.quantity_kg); // negative for sales
        }
      });
    }

    // Seed dry stock with the 2000kg PRD surplus if no dry harvests exist
    const hasDryHarvest = (harvests || []).some((h: any) => h.harvest_type === 'DRY');
    if (!hasDryHarvest) {
      dry += 2000;
    }

    setTotalWet(Math.max(0, wet));
    setTotalDry(Math.max(0, dry));

    // Recent activity = last 8 harvests
    if (harvests) setHistory(harvests.slice(0, 8));
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }} className="animate-fade-in">
      <header>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem', letterSpacing: '-1px' }}>
          Inventory Management
        </h1>
        <p style={{ fontSize: '1.1rem' }}>
          Log harvests or sales. Stock totals update automatically — no manual math needed.
        </p>
      </header>

      {/* Total Stock Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Total Wet Stock */}
        <div className="glass animate-fade-in" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ backgroundColor: '#E8F4FD', borderRadius: '14px', padding: '1rem', color: '#2980B9', flexShrink: 0 }}>
            <Droplets size={32} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-earth-500)' }}>
              Total Wet Stock
            </p>
            <h2 style={{ margin: '4px 0 0', fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-1px', color: '#2980B9' }}>
              {totalWet.toLocaleString()} <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>kg</span>
            </h2>
          </div>
        </div>

        {/* Total Dry Stock */}
        <div className="glass animate-fade-in" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem', animationDelay: '0.1s' }}>
          <div style={{ backgroundColor: 'var(--color-forest-100)', borderRadius: '14px', padding: '1rem', color: 'var(--color-forest-700)', flexShrink: 0 }}>
            <Wind size={32} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-earth-500)' }}>
              Total Dry Stock
            </p>
            <h2 style={{ margin: '4px 0 0', fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-1px', color: 'var(--color-forest-700)' }}>
              {totalDry.toLocaleString()} <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>kg</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Form + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
        <InventoryForm onSuccess={fetchAll} />

        <div className="glass" style={{ padding: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--color-earth-700)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={22} color="var(--color-forest-500)" />
            Recent Activity
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {history.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No recent activity. Log your first harvest above!</p>
            ) : (
              history.map((item: any, i: number) => {
                const isWet = item.harvest_type !== 'DRY';
                return (
                  <div key={i} style={{ padding: '1rem 0', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{isWet ? '💧' : '🍂'}</span>
                      <div>
                        <strong style={{ color: 'var(--color-earth-900)' }}>
                          Grade {item.grade} — {isWet ? 'Wet' : 'Dry'} Harvest
                        </strong>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {item.location || 'Main Hub'}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      backgroundColor: isWet ? '#E8F4FD' : 'var(--color-forest-100)',
                      color: isWet ? '#2980B9' : 'var(--color-forest-700)',
                      padding: '4px 14px',
                      borderRadius: '20px'
                    }}>
                      +{item.weight} kg
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
