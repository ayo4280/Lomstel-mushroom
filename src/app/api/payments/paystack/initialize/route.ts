import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// POST /api/payments/paystack/initialize
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

    const quantityKg = metadata?.quantity_kg ? Number(metadata.quantity_kg) : 1;
    const productType = metadata?.product?.toLowerCase().includes('dry') ? 'DRY' : 'WET';

    // Insert order into DB
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
        payment_provider: 'paystack',
        payment_status: 'pending'
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('DB Insert Error:', dbError);
      return NextResponse.json({ error: 'Failed to create order in database' }, { status: 500 });
    }

    const orderId = order.id;

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(amount * 100), // Paystack uses kobo (smallest unit)
        currency: currency || 'NGN',
        reference: orderId,
        metadata: {
          order_id: orderId,
          ...metadata,
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://lomstel-mushroom.vercel.app'}/dashboard/orders?payment=success`,
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message || 'Paystack initialization failed' }, { status: 400 });
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
      access_code: data.data.access_code,
    });
  } catch (error: any) {
    console.error('Paystack init error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
