import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const resendApiKey = process.env.RESEND_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { leadId, customSubject, customHtml } = await req.json();

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    if (!resendApiKey) {
      console.warn("Missing RESEND_API_KEY. Simulating email send...");
    }

    // 1. Fetch the lead from Supabase
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (fetchError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (lead.status === 'Contacted') {
      return NextResponse.json({ error: 'Lead already contacted' }, { status: 400 });
    }

    // 2. Extract email address from contact_info
    const emailMatch = lead.contact_info?.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    const recipientEmail = emailMatch ? emailMatch[1] : null;

    if (!recipientEmail) {
      return NextResponse.json({ error: 'Lead does not have a valid email address' }, { status: 400 });
    }

    // 3. Send email via Resend (or simulate if missing API key)
    const defaultSubject = `Partnership Opportunity: Bulk Oyster Mushroom Supply for ${lead.business_name}`;
    const defaultHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2>Hello from Lomstel Limited!</h2>
        <p>We noticed that <strong>${lead.business_name}</strong> is a prominent player in the food industry.</p>
        <p>We are a premium supplier of high-quality White Oyster Mushrooms, and we currently have a <strong>2-ton (2,000kg) harvest of premium dry mushrooms</strong> available for immediate off-take.</p>
        <p>Our mushrooms are organically grown, NAFDAC certified, and perfect for industrial food processing, healthy retail, or institutional catering.</p>
        <p>Would you be interested in a sample or discussing a bulk supply contract?</p>
        <br/>
        <p>Best regards,<br/>
        <strong>Lomstel Limited Sales Team</strong><br/>
        <a href="mailto:sales@lomstel.com">sales@lomstel.com</a> | <a href="https://lomstel.com">lomstel.com</a></p>
      </div>
    `;

    const finalSubject = customSubject || defaultSubject;
    const finalHtml = customHtml || defaultHtml;

    if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Lomstel Sales <onboarding@resend.dev>', // Resend's default test domain (no verification needed)
          to: [recipientEmail], 
          subject: finalSubject,
          html: finalHtml
        })
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error("Resend Error:", errorData);
        return NextResponse.json({ error: `Resend API Error: ${errorData}` }, { status: 403 });
      }
    } else {
      console.log(`[SIMULATED EMAIL] To: ${recipientEmail} (${lead.business_name}) | Subject: ${finalSubject}`);
    }

    // 3. Update the lead status to 'Contacted'
    const { error: updateError } = await supabase
      .from('leads')
      .update({ status: 'Contacted' })
      .eq('id', leadId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, message: 'Email sent and status updated' });
  } catch (error: any) {
    console.error('Outreach error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
