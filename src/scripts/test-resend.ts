import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testResend() {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.log("No RESEND_API_KEY found in .env.local");
    return;
  }
  
  console.log("Sending test email using Resend API key:", resendApiKey.substring(0, 10) + "...");
  
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Lomstel Sales <onboarding@resend.dev>', 
        to: ['naturewinsfarm@gmail.com'], 
        subject: "Test from Lomstel Development",
        html: "<p>This is a test email to verify Resend setup.</p>"
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log("SUCCESS! Email sent. Resend response:", data);
    } else {
      const errorData = await res.text();
      console.error("FAILED to send email. Resend Error:", errorData);
    }
  } catch (err) {
    console.error("Network error:", err);
  }
}

testResend();
