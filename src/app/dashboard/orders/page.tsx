"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';
import { ShoppingBag, CheckCircle, Clock, XCircle, TrendingUp, RefreshCw, Trash2, BadgeCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

type Order = {
  id: string;
  buyer_name: string;
  buyer_email: string;
  product_type: 'WET' | 'DRY';
  quantity_kg: number;
  price_per_kg: number;
  total_amount: number;
  currency: string;
  payment_provider: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  notes: string;
  created_at: string;
};

const statusConfig = {
  paid:     { color: '#16a34a', bg: '#dcfce7', label: 'Paid',     icon: CheckCircle },
  pending:  { color: '#d97706', bg: '#fef9c3', label: 'Pending',  icon: Clock },
  failed:   { color: '#dc2626', bg: '#fee2e2', label: 'Failed',   icon: XCircle },
  refunded: { color: '#6b7280', bg: '#f3f4f6', label: 'Refunded', icon: RefreshCw },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState({ ngn: 0, usd: 0 });
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('payment');

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('payment_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else if (data) {
      setOrders(data);
      const ngn = data.filter(o => o.payment_status === 'paid' && o.currency === 'NGN').reduce((sum, o) => sum + o.total_amount, 0);
      const usd = data.filter(o => o.payment_status === 'paid' && o.currency === 'USD').reduce((sum, o) => sum + o.total_amount, 0);
      setTotalRevenue({ ngn, usd });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Manually mark a pending order as paid (e.g. bank transfer received)
  const handleMarkPaid = async (order: Order) => {
    const confirm = window.confirm(
      `Mark this order as PAID?\n\n` +
      `Buyer: ${order.buyer_name || order.buyer_email}\n` +
      `Product: ${order.product_type === 'DRY' ? 'Dry Mushrooms' : 'Fresh Mushrooms'}\n` +
      `Qty: ${order.quantity_kg} kg\n` +
      `Amount: ${order.currency === 'NGN' ? '₦' : '$'}${order.total_amount.toLocaleString()}\n\n` +
      `This will also create a delivery in Logistics.`
    );
    if (!confirm) return;

    setActionLoading(order.id + '_pay');
    const { error } = await supabase
      .from('payment_orders')
      .update({
        payment_status: 'paid',
        notes: `Manually marked as paid by admin on ${new Date().toLocaleDateString('en-GB')}`
      })
      .eq('id', order.id);

    if (error) {
      alert('Failed to update order: ' + error.message);
    } else {
      await fetchOrders();
    }
    setActionLoading(null);
  };

  // Delete an abandoned/cancelled order
  const handleDelete = async (order: Order) => {
    const confirm = window.confirm(
      `Delete this order permanently?\n\n` +
      `Buyer: ${order.buyer_name || order.buyer_email}\n` +
      `Product: ${order.product_type === 'DRY' ? 'Dry Mushrooms' : 'Fresh Mushrooms'}\n` +
      `Amount: ${order.currency === 'NGN' ? '₦' : '$'}${order.total_amount.toLocaleString()}\n\n` +
      `This cannot be undone.`
    );
    if (!confirm) return;

    setActionLoading(order.id + '_del');
    const { error } = await supabase
      .from('payment_orders')
      .delete()
      .eq('id', order.id);

    if (error) {
      alert('Failed to delete order: ' + error.message);
    } else {
      await fetchOrders();
    }
    setActionLoading(null);
  };

  const paidOrders    = orders.filter(o => o.payment_status === 'paid').length;
  const pendingOrders = orders.filter(o => o.payment_status === 'pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }} className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingBag size={40} style={{ color: 'var(--color-forest-500)' }} />
            Orders
          </h1>
          <p style={{ fontSize: '1.1rem' }}>Track all buyer orders and payment statuses in real time.</p>
        </div>
        <button onClick={fetchOrders} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-forest-600)', color: 'white', border: 'none', borderRadius: '10px', padding: '0.75rem 1.25rem', cursor: 'pointer', fontWeight: 700 }}>
          <RefreshCw size={18} /> Refresh
        </button>
      </header>

      {/* Payment success banner */}
      {paymentStatus === 'success' && (
        <div style={{ backgroundColor: '#dcfce7', border: '1px solid #16a34a', borderRadius: '12px', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#15803d' }}>
          <CheckCircle size={24} />
          <div>
            <strong>Payment Received!</strong> Your order has been placed successfully. It will appear below momentarily.
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {[
          { label: 'Total Orders',  value: orders.length,                                    icon: ShoppingBag, color: '#6366f1', bg: '#eef2ff' },
          { label: 'Paid Orders',   value: paidOrders,                                        icon: CheckCircle, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Pending',       value: pendingOrders,                                     icon: Clock,       color: '#d97706', bg: '#fef9c3' },
          { label: 'Revenue (NGN)', value: `₦${totalRevenue.ngn.toLocaleString()}`,           icon: TrendingUp,  color: '#0f766e', bg: '#ccfbf1' },
          { label: 'Revenue (USD)', value: `$${totalRevenue.usd.toLocaleString()}`,           icon: TrendingUp,  color: '#1d4ed8', bg: '#dbeafe' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: stat.bg, borderRadius: '12px', padding: '0.75rem', flexShrink: 0 }}>
                <Icon size={24} style={{ color: stat.color }} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{stat.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-earth-900)' }}>{stat.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="glass" style={{ padding: '2rem', overflowX: 'auto' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--color-earth-900)', marginBottom: '1.5rem' }}>All Orders</h2>

        {isLoading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.3, display: 'block' }} />
            <p>No orders yet. Share the Marketplace with buyers to get started!</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.06)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Buyer</th>
                <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                <th style={{ padding: '0.75rem 1rem' }}>Qty (kg)</th>
                <th style={{ padding: '0.75rem 1rem' }}>Total</th>
                <th style={{ padding: '0.75rem 1rem' }}>Provider</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const status = statusConfig[order.payment_status] || statusConfig.pending;
                const StatusIcon = status.icon;
                const isPending = order.payment_status === 'pending';
                const isPayLoading = actionLoading === order.id + '_pay';
                const isDelLoading = actionLoading === order.id + '_del';

                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', backgroundColor: isPending ? 'rgba(253,246,178,0.15)' : 'transparent' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-earth-900)', fontSize: '0.95rem' }}>{order.buyer_name || 'Buyer'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.buyer_email}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '1.1rem', marginRight: '0.4rem' }}>{order.product_type === 'DRY' ? '🍂' : '💧'}</span>
                      <span style={{ fontWeight: 500 }}>{order.product_type === 'DRY' ? 'Dry Mushrooms' : 'Fresh Mushrooms'}</span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{order.quantity_kg} kg</td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-forest-700)' }}>
                      {order.currency === 'NGN' ? '₦' : '$'}{order.total_amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, backgroundColor: order.payment_provider === 'paystack' ? '#e0f2fe' : '#fef3c7', color: order.payment_provider === 'paystack' ? '#0369a1' : '#92400e', textTransform: 'capitalize' }}>
                        {order.payment_provider || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, backgroundColor: status.bg, color: status.color }}>
                        <StatusIcon size={13} /> {status.label}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Action buttons — only shown on pending orders */}
                    <td style={{ padding: '1rem' }}>
                      {isPending ? (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap' }}>
                          {/* Mark as Paid */}
                          <button
                            onClick={() => handleMarkPaid(order)}
                            disabled={!!actionLoading}
                            title="Mark as Paid — creates a delivery in Logistics"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                              backgroundColor: '#dcfce7', color: '#16a34a',
                              border: '1px solid #86efac', borderRadius: '8px',
                              padding: '0.4rem 0.75rem', fontSize: '0.8rem', fontWeight: 700,
                              cursor: actionLoading ? 'not-allowed' : 'pointer',
                              opacity: actionLoading ? 0.6 : 1,
                              whiteSpace: 'nowrap', transition: 'all 0.15s'
                            }}
                          >
                            <BadgeCheck size={14} />
                            {isPayLoading ? 'Saving…' : 'Mark Paid'}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(order)}
                            disabled={!!actionLoading}
                            title="Delete abandoned order"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                              backgroundColor: '#fee2e2', color: '#dc2626',
                              border: '1px solid #fca5a5', borderRadius: '8px',
                              padding: '0.4rem 0.75rem', fontSize: '0.8rem', fontWeight: 700,
                              cursor: actionLoading ? 'not-allowed' : 'pointer',
                              opacity: actionLoading ? 0.6 : 1,
                              whiteSpace: 'nowrap', transition: 'all 0.15s'
                            }}
                          >
                            <Trash2 size={14} />
                            {isDelLoading ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
