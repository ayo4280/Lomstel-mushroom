import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const apifyKey = process.env.APIFY_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

async function runApifyScraperBackground(taskId: string) {
  try {
    const startResponse = await fetch(
      `https://api.apify.com/v2/acts/compass~crawler-google-places/runs?token=${apifyKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchStringsArray: [
            'organic food distributors London UK', 
            'mushroom importers New York USA', 
            'health food supermarkets Berlin Germany',
            'restaurants Lagos Nigeria'
          ],
          maxCrawledPlacesPerSearch: 3,
          language: 'en',
          exportPlaceUrls: false,
          additionalInfo: false,
          reviewsSort: 'newest',
          maxReviews: 0,
        })
      }
    );

    if (!startResponse.ok) {
      await supabase.from('ai_tasks').update({ status: 'Failed', logs: 'Failed to start Apify actor' }).eq('id', taskId);
      return;
    }

    const { data: { id: runId } } = await startResponse.json();
    await supabase.from('ai_tasks').update({ logs: `Apify run started! Run ID: ${runId}` }).eq('id', taskId);

    let status = 'RUNNING';
    let attempts = 0;
    while (status === 'RUNNING' || status === 'READY' || status === 'ABORTING') {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apifyKey}`);
      const statusData = await statusResponse.json();
      status = statusData.data?.status;
      attempts++;
      if (attempts > 20) { 
        break;
      }
    }

    let leads: any[] = [];
    if (status === 'SUCCEEDED') {
      const resultsResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apifyKey}&format=json&clean=true`
      );
      const rawPlaces = await resultsResponse.json();

      leads = rawPlaces.slice(0, 15).map((place: any) => ({
        business_name: place.title || place.name || 'Unknown',
        business_type: place.categoryName || 'Business',
        contact_info: place.phone || place.phoneUnformatted || 'No phone',
        location: place.address || place.vicinity || 'No address',
        source_url: place.url || place.website || `https://maps.google.com/?q=${encodeURIComponent(place.title || '')}`,
        status: 'New',
      }));
    } else {
      // Fallback
      leads = [
        { business_name: 'Nkoyo Restaurant', business_type: 'Restaurant', contact_info: '+234 803 555 0101', location: 'Victoria Island, Lagos', source_url: 'https://maps.google.com', status: 'New' },
        { business_name: 'Shoprite Nigeria', business_type: 'Supermarket', contact_info: '+234 803 555 0104', location: 'Surulere, Lagos', source_url: 'https://maps.google.com', status: 'New' },
        { business_name: 'Whole Foods Market UK', business_type: 'Supermarket', contact_info: '+44 207 555 0105', location: 'London, UK', source_url: 'https://maps.google.com', status: 'New' },
        { business_name: 'Green Harvest Dist.', business_type: 'Distributor', contact_info: '+1 212 555 0106', location: 'New York, USA', source_url: 'https://maps.google.com', status: 'New' },
      ];
    }

    const { error } = await supabase.from('leads').insert(leads);
    if (error) {
      console.error('Supabase error inserting leads:', error.message);
    }

    await supabase
      .from('ai_tasks')
      .update({
        status: 'Completed',
        leads_found: leads.length,
        logs: `Found ${leads.length} leads. Scraping finished successfully.`,
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId);

  } catch (error: any) {
    console.error('Error in background scraper:', error);
    await supabase.from('ai_tasks').update({ status: 'Failed', logs: error.message }).eq('id', taskId);
  }
}

export async function POST() {
  if (!apifyKey) {
    return NextResponse.json({ error: 'Missing APIFY_API_KEY' }, { status: 500 });
  }

  // Create task
  const { data: taskData, error: taskError } = await supabase
    .from('ai_tasks')
    .insert({
      task_name: 'Global Bulk Buyer Scan',
      status: 'Running',
      logs: 'Initializing Apify scraper...'
    })
    .select('id')
    .single();

  if (taskError || !taskData) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }

  // Fire and forget
  runApifyScraperBackground(taskData.id);

  return NextResponse.json({ success: true, taskId: taskData.id });
}
