"use client";

import React, { useState } from 'react';
import { supabase } from '@/utils/supabase/client';

type ActionType = 'wet_harvest' | 'dry_harvest' | 'wet_sale' | 'dry_sale';

export default function InventoryForm({ onSuccess }: { onSuccess: () => void }) {
  const [actionType, setActionType] = useState<ActionType>('wet_harvest');
  const [weight, setWeight] = useState('');
  const [grade, setGrade] = useState('A');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const isHarvest = actionType === 'wet_harvest' || actionType === 'dry_harvest';
  const isSale = !isHarvest;
  const isWet = actionType === 'wet_harvest' || actionType === 'wet_sale';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    if (isHarvest) {
      // ADD: Log a new harvest (wet or dry)
      await supabase.from('harvests').insert([{
        weight: Number(weight),
        grade,
        moisture: isWet ? 85 : 10,
        location: 'Main Hub',
        status: 'SYNCED',
        harvest_type: isWet ? 'WET' : 'DRY',
      }]);
      setSuccessMsg(`✓ ${isWet ? 'Wet' : 'Dry'} harvest of ${weight}kg recorded and added to stock.`);
    } else {
      // SUBTRACT: Log a sale (wet or dry)
      await supabase.from('mushroom_products').insert([{
        quantity_kg: -Math.abs(Number(weight)),
        grade,
        product_type: isWet ? 'WET' : 'DRY',
        drying_method: isSale ? 'Sale Deduction' : 'N/A',
      }]);
      setSuccessMsg(`✓ ${isWet ? 'Wet' : 'Dry'} sale of ${weight}kg deducted from stock automatically.`);
    }

    setLoading(false);
    setWeight('');
    onSuccess();
  };

  const btnStyle = (active: boolean, color: string) => ({
    flex: 1,
    padding: '0.7rem 0.5rem',
    borderRadius: '10px',
    border: `2px solid ${active ? color : 'var(--color-earth-200)'}`,
    backgroundColor: 'transparent',
    color: active ? color : 'var(--color-earth-700)',
    fontFamily: 'inherit',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  return (
    <div className="glass" style={{ padding: '2rem' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--color-earth-700)' }}>Record Activity</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Harvest Section */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-forest-500)' }}>
            🌿 Harvests (Add to Stock)
          </label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" style={btnStyle(actionType === 'wet_harvest', 'var(--color-forest-500)')} onClick={() => setActionType('wet_harvest')}>
              Wet Harvest
            </button>
            <button type="button" style={btnStyle(actionType === 'dry_harvest', 'var(--color-earth-700)')} onClick={() => setActionType('dry_harvest')}>
              Dry Harvest
            </button>
          </div>
        </div>

        {/* Sales Section */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
            🛒 Sales (Subtract from Stock)
          </label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" style={btnStyle(actionType === 'wet_sale', '#1a6db5')} onClick={() => setActionType('wet_sale')}>
              Wet Sale
            </button>
            <button type="button" style={btnStyle(actionType === 'dry_sale', 'var(--color-accent)')} onClick={() => setActionType('dry_sale')}>
              Dry Sale
            </button>
          </div>
        </div>

        {/* Weight */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-earth-700)' }}>
            Weight (kg)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            min="0.1"
            step="0.1"
            placeholder="e.g. 50"
            style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '2px solid var(--color-earth-200)', outline: 'none', fontFamily: 'inherit', fontSize: '1rem', boxSizing: 'border-box' }}
          />
        </div>

        {/* Grade */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-earth-700)' }}>Grade</label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '2px solid var(--color-earth-200)', outline: 'none', fontFamily: 'inherit', fontSize: '1rem', backgroundColor: 'white' }}
          >
            <option value="A">Grade A (Premium)</option>
            <option value="B">Grade B (Standard)</option>
            <option value="C">Grade C (Industrial/Bulk)</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          style={{
            marginTop: '0.5rem',
            backgroundColor: actionType === 'wet_harvest' ? 'var(--color-forest-500)' :
                             actionType === 'dry_harvest' ? 'var(--color-earth-700)' :
                             actionType === 'wet_sale' ? '#1a6db5' :
                             'var(--color-accent)',
            boxShadow: isSale ? '0 4px 14px rgba(200,90,60,0.25)' : undefined
          }}
        >
          {loading ? 'Processing...' : `Record ${isWet ? 'Wet' : 'Dry'} ${isHarvest ? 'Harvest' : 'Sale'}`}
        </button>

        {/* Success Message */}
        {successMsg && (
          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            backgroundColor: actionType === 'wet_harvest' ? 'var(--color-forest-100)' :
                             actionType === 'dry_harvest' ? 'var(--color-earth-200)' :
                             actionType === 'wet_sale' ? '#eef2ff' :
                             '#FDECEA',
            color: actionType === 'wet_harvest' ? 'var(--color-forest-700)' :
                   actionType === 'dry_harvest' ? 'var(--color-earth-900)' :
                   actionType === 'wet_sale' ? '#1a6db5' :
                   'var(--color-accent)',
            fontWeight: 600,
            fontSize: '0.95rem'
          }}>
            {successMsg}
          </div>
        )}
      </form>
    </div>
  );
}
