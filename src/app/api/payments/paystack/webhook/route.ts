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

      // Direct update using service role key (bypasses RLS)
      const { error } = await supabase
        .from('payment_orders')
        .update({
          payment_status: 'paid',
          payment_provider: 'paystack',
          notes: `Webhook verified reference: ${reference}`
        })
        .eq('id', reference);

      if (error) {
        console.error('Failed to update order:', error);
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
      }

      console.log(`✅ Paystack payment verified: ${reference} - ${currency} ${amount / 100}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

