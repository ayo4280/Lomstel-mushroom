import { NextRequest, NextResponse } from 'next/server';

// This route is called automatically by Vercel Cron every Monday at 08:00 UTC
// Config is defined in vercel.json
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron (security check)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Call the main scrape endpoint to reuse all existing logic
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/ai-agent/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Scrape failed');
    }

    console.log('[CRON] Weekly scrape triggered successfully:', data);
    return NextResponse.json({ success: true, message: 'Weekly scrape started', taskId: data.taskId });
  } catch (error: any) {
    console.error('[CRON] Weekly scrape failed:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
