import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Use service role key to securely bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST /api/payments/paystack/webhook
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // Verify the webhook is from Paystack
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === 'charge.success') {
      const { reference, amount, currency } = event.data;

      // 1. Mark order as paid
      const { data: updatedOrder, error: updateError } = await supabase
        .from('payment_orders')
        .update({
          payment_status: 'paid',
          payment_provider: 'paystack',
          currency: currency || 'NGN',
          notes: `Webhook verified reference: ${reference}`
        })
        .eq('id', reference)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update order:', updateError);
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
      }

      // 2. Create a delivery record if one doesn't exist yet
      // (the DB trigger handles this too, but this is a safety net for webhook-first scenarios)
      if (updatedOrder) {
        const { data: existingDelivery } = await supabase
          .from('deliveries')
          .select('id')
          .eq('order_id', updatedOrder.id)
          .single();

        if (!existingDelivery) {
          const { error: deliveryError } = await supabase
            .from('deliveries')
            .insert({
              order_id: updatedOrder.id,
              buyer_name: updatedOrder.buyer_name || 'Unknown Buyer',
              buyer_email: updatedOrder.buyer_email,
              delivery_address: 'Pending — Buyer to confirm address',
              product_type: updatedOrder.product_type,
              quantity_kg: updatedOrder.quantity_kg,
              total_amount: updatedOrder.total_amount,
              currency: updatedOrder.currency || 'NGN',
              status: 'Processing',
            });

          if (deliveryError) {
            console.error('Failed to create delivery record:', deliveryError);
          } else {
            console.log(`📦 Delivery created for order: ${updatedOrder.id}`);
          }
        }
      }

      console.log(`✅ Paystack payment verified: ${reference} - ${currency} ${amount / 100}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
