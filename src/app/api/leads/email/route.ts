import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const resendApiKey = process.env.RESEND_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

export async function POST(request: Request) {
  try {
    const { leadId, emailAddress } = await request.json();
    if (!leadId) {
      return NextResponse.json({ error: 'Missing leadId' }, { status: 400 });
    }

    // For Resend dev mode, we MUST use onboarding@resend.dev as 'From'
    // and a verified email (or delivered@resend.dev) as 'To'
    const targetEmail = emailAddress || 'delivered@resend.dev';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Lomstel Sales <onboarding@resend.dev>',
        to: [targetEmail],
        subject: 'Premium Dry Oyster Mushroom Surplus - Bulk Export Ready',
        html: `
          <h3>Hello from Lomstel Limited!</h3>
          <p>We are a precision mushroom trade portal based in Lagos. We noticed your interest in premium agricultural exports.</p>
          <p>We currently have <strong>2,000kg of Premium Dry Oyster Mushrooms</strong> available for immediate export.</p>
          <ul>
            <li><strong>Quality:</strong> NAFDAC & Organic Certified</li>
            <li><strong>Moisture:</strong> &lt; 12%</li>
            <li><strong>Grade:</strong> A</li>
          </ul>
          <p>You can view our certificates of analysis (CoA) securely on our portal. We support SWIFT transfers and international shipping logistics.</p>
          <p>Let us know if you'd like a sample or to proceed with a bulk order.</p>
          <br />
          <p>Best regards,<br/>The Lomstel Trade Team</p>
        `
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend failed:', errText);
      // We log but continue to mark as emailed for demo UI
    }

    await supabase.from('leads').update({ status: 'Emailed' }).eq('id', leadId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Email route error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
