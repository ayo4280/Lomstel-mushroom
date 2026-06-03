import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// POST /api/payments/request-quote
// Used for international (USD/EUR) bulk orders that require SWIFT/escrow negotiation.
// Creates a pending payment_orders row and emails the Lomstel admin team.
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const { product_name, quantity_kg, price_per_kg, total_amount, currency, notes } = body;

    if (!product_name || !quantity_kg || !total_amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create a pending order in the database
    const { data: order, error: dbError } = await supabase
      .from('payment_orders')
      .insert({
        buyer_id: user.id,
        buyer_email: user.email,
        buyer_name: user.user_metadata?.full_name || 'International Buyer',
        product_type: product_name.toLowerCase().includes('dry') ? 'DRY' : 'WET',
        quantity_kg: Number(quantity_kg),
        price_per_kg: Number(price_per_kg),
        total_amount: Number(total_amount),
        currency: currency || 'USD',
        payment_provider: 'swift',
        payment_status: 'quote_requested',
        notes: notes || null,
      })
      .select('id')
      .single();

    if (dbError || !order) {
      console.error('DB Insert Error (Quote):', dbError);
      return NextResponse.json({ error: 'Failed to create quote in database' }, { status: 500 });
    }

    // Fire admin notification email via Resend (non-blocking)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Lomstel Trade Portal <onboarding@resend.dev>',
          to: ['delivered@resend.dev'], // Replace with admin email in production
          subject: `🌿 New Bulk Quote Request — ${product_name}`,
          html: `
            <h2>New International Bulk Quote Request</h2>
            <table cellpadding="8" style="border-collapse:collapse;width:100%">
              <tr><td><strong>Order ID</strong></td><td>${order.id}</td></tr>
              <tr><td><strong>Buyer</strong></td><td>${user.user_metadata?.full_name || 'Unknown'} (${user.email})</td></tr>
              <tr><td><strong>Product</strong></td><td>${product_name}</td></tr>
              <tr><td><strong>Quantity</strong></td><td>${quantity_kg} kg</td></tr>
              <tr><td><strong>Price/kg</strong></td><td>${currency || 'USD'} ${price_per_kg}</td></tr>
              <tr><td><strong>Total Value</strong></td><td>${currency || 'USD'} ${total_amount}</td></tr>
              <tr><td><strong>Payment Method</strong></td><td>SWIFT / International Escrow</td></tr>
              ${notes ? `<tr><td><strong>Notes</strong></td><td>${notes}</td></tr>` : ''}
            </table>
            <br/>
            <p>Please contact the buyer within 24 hours to confirm terms and initiate the SWIFT transfer process.</p>
            <p><em>Lomstel Trade Portal — Automated Notification</em></p>
          `,
        }),
      }).catch(err => console.error('Admin email failed (non-blocking):', err));
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: any) {
    console.error('Request quote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
