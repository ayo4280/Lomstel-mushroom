"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import MetricCard from '@/components/MetricCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, Droplets, TrendingUp, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DashboardPage() {
  const [totalDry, setTotalDry] = useState(0);
  const [totalWet, setTotalWet] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    async function fetchData() {
      const { data: harvests } = await supabase.from('harvests').select('*').order('id', { ascending: false });
      const { data: products } = await supabase.from('mushroom_products').select('*').order('id', { ascending: false });

      let dry = 0;
      let wet = 0;
      let salesKg = 0;

      // 1. Calculate Stocks & Sales
      if (harvests) {
        harvests.forEach((h: any) => {
          if (h.harvest_type === 'DRY') {
            dry += Number(h.weight);
          } else {
            wet += Number(h.weight);
          }
        });
      }

      if (products) {
        products.forEach((p: any) => {
          const qty = Number(p.quantity_kg);
          if (qty < 0) {
            salesKg += Math.abs(qty);
          }

          if (p.product_type === 'WET') {
            wet += qty;
          } else {
            dry += qty;
          }
        });
      }

      // Seed dry stock with 2000kg surplus if no dry harvests exist
      const hasDryHarvest = (harvests || []).some((h: any) => h.harvest_type === 'DRY');
      if (!hasDryHarvest) dry += 2000;
      const finalDry = Math.max(0, dry);
      const finalWet = Math.max(0, wet);

      setTotalDry(finalDry);
      setTotalWet(finalWet);
      setTotalSales(salesKg);

      // 2. Trend Chart Data
      setChartData([
        { name: 'Jan', dry: 1200, wet: 300 },
        { name: 'Feb', dry: 1500, wet: 450 },
        { name: 'Mar', dry: 1800, wet: 200 },
        { name: 'Apr', dry: 1950, wet: 600 },
        { name: 'May', dry: finalDry, wet: finalWet },
      ]);

      // 3. Compile unified recent activities
      const activities: any[] = [];
      
      if (harvests) {
        harvests.slice(0, 4).forEach((h: any) => {
          activities.push({
            id: `h-${h.id}`,
            type: 'HARVEST',
            isWet: h.harvest_type !== 'DRY',
            title: `Grade ${h.grade} ${h.harvest_type === 'DRY' ? 'Dry' : 'Wet'} Harvest`,
            desc: `Logged at ${h.location || 'Main Hub'}`,
            amount: `+${h.weight} kg`,
            time: new Date(h.created_at || Date.now()).toLocaleDateString()
          });
        });
      }

      if (products) {
        products.slice(0, 4).forEach((p: any) => {
          const qty = Number(p.quantity_kg);
          const isSale = qty < 0;
          activities.push({
            id: `p-${p.id}`,
            type: isSale ? 'SALE' : 'ADJUST',
            isWet: p.product_type === 'WET',
            title: isSale 
              ? `Grade ${p.grade} ${p.product_type === 'WET' ? 'Wet' : 'Dry'} Sale`
              : `Stock Adjustment (${p.grade})`,
            desc: isSale ? 'Deducted from stock' : p.drying_method || 'System manual change',
            amount: `${qty > 0 ? '+' : ''}${qty} kg`,
            time: new Date(p.created_at || Date.now()).toLocaleDateString()
          });
        });
      }

      // Sort by id / structure
      activities.sort((a, b) => b.id.localeCompare(a.id));
      setRecentActivity(activities.slice(0, 5));
    }

    fetchData();
  }, []);

  // 20% of 2-ton surplus = 400kg marketing target
  const salesGoal = 400;
  const progressPercent = Math.min(100, Math.round((totalSales / salesGoal) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header className="animate-fade-in">
        <h1 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem', letterSpacing: '-1px' }}>Overview</h1>
        <p style={{ fontSize: '1.1rem' }}>Monitor your mushroom inventory, active sales metrics, and trade analytics.</p>
      </header>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <MetricCard
          title="Total Dry Stock (kg)"
          value={totalDry.toLocaleString()}
          trend={{ value: 12, isPositive: true }}
          icon={<Package size={28} />}
        />
        <MetricCard
          title="Total Wet Stock (kg)"
          value={totalWet.toLocaleString()}
          icon={<Droplets size={28} />}
        />
        <MetricCard
          title="Sales / Marketing Progress"
          value={`${totalSales.toLocaleString()} kg`}
          trend={{ value: progressPercent, isPositive: true }}
          icon={<TrendingUp size={28} />}
          description={`Target: ${salesGoal}kg (20% of 2-ton Surplus)`}
        />
      </div>

      {/* Layout for chart and activity side-by-side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        
        {/* Trend Chart */}
        {mounted && (
          <div className="glass animate-fade-in" style={{ padding: '2rem', flex: 2 }}>
            <h3 style={{ marginTop: 0, marginBottom: '2rem', color: 'var(--color-earth-700)', fontSize: '1.25rem' }}>
              Inventory Volume Trend
            </h3>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-earth-200)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-earth-500)" axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="var(--color-earth-500)" axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderRadius: '12px',
                      border: '1px solid var(--color-earth-200)',
                      boxShadow: 'var(--glass-shadow)',
                    }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="dry"
                    name="Dry Stock (kg)"
                    stroke="var(--color-forest-500)"
                    strokeWidth={3}
                    dot={{ r: 5, fill: 'white', stroke: 'var(--color-forest-500)', strokeWidth: 2 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="wet"
                    name="Wet Stock (kg)"
                    stroke="#2980B9"
                    strokeWidth={3}
                    dot={{ r: 5, fill: 'white', stroke: '#2980B9', strokeWidth: 2 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Unified Activity Feed */}
        <div className="glass animate-fade-in" style={{ padding: '2rem', flex: 1, animationDelay: '0.1s' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--color-earth-700)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}>
            <Activity size={22} color="var(--color-forest-500)" />
            Recent Activity Log
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentActivity.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No activities logged in system yet.</p>
            ) : (
              recentActivity.map((act) => {
                const isAddition = act.type === 'HARVEST' || (act.type === 'ADJUST' && !act.amount.startsWith('-'));
                return (
                  <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.85rem', borderBottom: '1px solid var(--glass-border)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {isAddition ? (
                          <ArrowUpRight size={16} color="var(--color-forest-500)" />
                        ) : (
                          <ArrowDownRight size={16} color="var(--color-accent)" />
                        )}
                        <strong style={{ color: 'var(--color-earth-900)', fontSize: '0.95rem' }}>{act.title}</strong>
                      </div>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{act.desc}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: isAddition ? 'var(--color-forest-700)' : 'var(--color-accent)',
                        backgroundColor: isAddition ? 'var(--color-forest-100)' : '#FDECEA',
                        padding: '2px 10px',
                        borderRadius: '12px'
                      }}>
                        {act.amount}
                      </span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{act.time}</div>
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
