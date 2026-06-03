import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// POST /api/payments/flutterwave/initialize
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, currency, metadata } = body;

    if (!amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const quantityKg = metadata?.quantity_kg ? Number(metadata.quantity_kg) : 10;
    const productType = metadata?.product?.toLowerCase().includes('dry') ? 'DRY' : 'WET';

    // Insert order into DB securely on the server
    const { data: order, error: dbError } = await supabase
      .from('payment_orders')
      .insert({
        buyer_id: user.id,
        buyer_email: user.email,
        buyer_name: user.user_metadata?.full_name || 'Buyer',
        product_type: productType,
        quantity_kg: quantityKg,
        price_per_kg: amount / quantityKg,
        total_amount: amount,
        payment_provider: 'flutterwave',
        payment_status: 'pending'
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('DB Insert Error (Flutterwave):', dbError);
      return NextResponse.json({ error: 'Failed to create order in database' }, { status: 500 });
    }

    const orderId = order.id;

    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: orderId,
        amount,
        currency: currency || 'USD',
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/orders?payment=success`,
        customer: {
          email: user.email,
          name: user.user_metadata?.full_name || 'Customer',
        },
        customizations: {
          title: 'Lomstel Limited',
          description: 'Mushroom Order Payment',
          logo: 'https://ejmaotssmwjslvpuseny.supabase.co/storage/v1/object/public/certificates/lomstel-logo.png',
        },
        meta: {
          order_id: orderId,
          ...metadata,
        },
      }),
    });

    const data = await response.json();

    if (data.status !== 'success') {
      return NextResponse.json({ error: data.message || 'Flutterwave initialization failed' }, { status: 400 });
    }

    return NextResponse.json({
      payment_link: data.data.link,
    });
  } catch (error: any) {
    console.error('Flutterwave init error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
