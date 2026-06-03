import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to securely bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST /api/payments/flutterwave/webhook
export async function POST(req: NextRequest) {
  try {
    const secretHash = process.env.FLUTTERWAVE_ENCRYPTION_KEY!;
    const signature = req.headers.get('verif-hash');

    if (!signature || signature !== secretHash) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = await req.json();

    if (event.event === 'charge.completed' && event.data.status === 'successful') {
      const { tx_ref, flw_ref, amount, currency } = event.data;

      // Direct update using service role key (bypasses RLS)
      const { error } = await supabase
        .from('payment_orders')
        .update({
          payment_status: 'paid',
          payment_provider: 'flutterwave',
          notes: `Webhook verified reference: ${flw_ref}`
        })
        .eq('id', tx_ref);

      if (error) {
        console.error('Failed to update order:', error);
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
      }

      console.log(`✅ Flutterwave payment verified: ${tx_ref} - ${currency} ${amount}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Flutterwave webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
