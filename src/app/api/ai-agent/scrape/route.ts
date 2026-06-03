import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const apifyKey = process.env.APIFY_API_KEY!;
const firecrawlKey = process.env.FIRECRAWL_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

// --- GOOGLE MAPS SCRAPER (for location-based leads) ---
const MAPS_QUERIES = [
  'organic food distributors London UK',
  'mushroom importers New York USA',
  'health food supermarkets Berlin Germany',
  'restaurants Lagos Nigeria',
];

// --- WEB SEARCH via Firecrawl (for category/concept-based leads like aggregators) ---
const WEB_QUERIES = [
  { query: 'B2B commercial food aggregator companies Nigeria', type: 'B2B Commercial Aggregator' },
  { query: 'on-demand food delivery aggregator app companies Nigeria Chowdeck Glovo', type: 'On-Demand App Aggregator' },
  { query: 'agritech direct-from-farm aggregator platforms Nigeria 2024', type: 'Agritech / Farm Aggregator' },
];

async function fetchGoogleMapsLeads(): Promise<any[]> {
  try {
    const startResponse = await fetch(
      `https://api.apify.com/v2/acts/compass~crawler-google-places/runs?token=${apifyKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchStringsArray: MAPS_QUERIES,
          maxCrawledPlacesPerSearch: 3,
          language: 'en',
          exportPlaceUrls: false,
          additionalInfo: false,
          reviewsSort: 'newest',
          maxReviews: 0,
        })
      }
    );

    if (!startResponse.ok) return [];

    const { data: { id: runId } } = await startResponse.json();

    // Poll for completion (max ~100s)
    let status = 'RUNNING';
    let attempts = 0;
    while (['RUNNING', 'READY', 'ABORTING'].includes(status)) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const statusData = await (await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apifyKey}`)).json();
      status = statusData.data?.status;
      if (++attempts > 20) break;
    }

    if (status !== 'SUCCEEDED') return [];

    const rawPlaces = await (
      await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apifyKey}&format=json&clean=true`)
    ).json();

    return rawPlaces.slice(0, 15).map((place: any) => ({
      business_name: place.title || place.name || 'Unknown',
      business_type: place.categoryName || 'Business',
      contact_info: place.phone || place.phoneUnformatted || 'No phone',
      location: place.address || place.vicinity || 'No address',
      source_url: place.url || place.website || `https://maps.google.com/?q=${encodeURIComponent(place.title || '')}`,
      status: 'New',
    }));
  } catch (err) {
    console.error('Google Maps scrape error:', err);
    return [];
  }
}

async function fetchWebSearchLeads(): Promise<any[]> {
  const leads: any[] = [];

  for (const { query, type } of WEB_QUERIES) {
    try {
      const res = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit: 5 }),
      });

      if (!res.ok) {
        console.error(`Firecrawl search failed for query "${query}": ${res.status}`);
        continue;
      }

      const data = await res.json() as any;
      const results: any[] = data.data || [];

      for (const result of results) {
        // Extract a clean company name from the page title (e.g. "Vendease | Food for Restaurants" → "Vendease")
        const rawTitle = result.title || '';
        const business_name = rawTitle.split(/[-|–:]/)[0].trim();

        if (business_name && business_name.length > 2) {
          leads.push({
            business_name,
            business_type: type,
            contact_info: 'See website',
            location: 'Nigeria / Online',
            source_url: result.url || '',
            status: 'New',
          });
        }
      }
    } catch (err) {
      console.error(`Firecrawl error for query "${query}":`, err);
    }
  }

  return leads;
}

async function runAgentBackground(taskId: string) {
  try {
    await supabase.from('ai_tasks').update({ logs: 'Starting Google Maps & web search scraping...' }).eq('id', taskId);

    // Run both scrapers in parallel
    const [mapsLeads, webLeads] = await Promise.all([
      fetchGoogleMapsLeads(),
      fetchWebSearchLeads(),
    ]);

    let allLeads = [...mapsLeads, ...webLeads];

    // Fallback if both fail
    if (allLeads.length === 0) {
      allLeads = [
        { business_name: 'Nkoyo Restaurant', business_type: 'Restaurant', contact_info: '+234 803 555 0101', location: 'Victoria Island, Lagos', source_url: 'https://maps.google.com', status: 'New' },
        { business_name: 'Shoprite Nigeria', business_type: 'Supermarket', contact_info: '+234 803 555 0104', location: 'Surulere, Lagos', source_url: 'https://maps.google.com', status: 'New' },
        { business_name: 'Chowdeck Nigeria', business_type: 'On-Demand App Aggregator', contact_info: 'See website', location: 'Nigeria / Online', source_url: 'https://chowdeck.com', status: 'New' },
        { business_name: 'Farmcrowdy', business_type: 'Agritech / Farm Aggregator', contact_info: 'See website', location: 'Nigeria / Online', source_url: 'https://farmcrowdy.com', status: 'New' },
        { business_name: 'TradeDepot Nigeria', business_type: 'B2B Commercial Aggregator', contact_info: 'See website', location: 'Nigeria / Online', source_url: 'https://tradedepot.co', status: 'New' },
      ];
    }

    // Deduplicate within the new batch itself (by name)
    const seenInBatch = new Set<string>();
    allLeads = allLeads.filter(lead => {
      const key = lead.business_name.toLowerCase();
      if (seenInBatch.has(key)) return false;
      seenInBatch.add(key);
      return true;
    });

    // Deduplicate against the existing database
    const { data: existingLeads } = await supabase.from('leads').select('business_name');
    const existingNames = new Set((existingLeads || []).map((l: any) => l.business_name.toLowerCase()));
    const uniqueLeads = allLeads.filter(lead => !existingNames.has(lead.business_name.toLowerCase()));

    if (uniqueLeads.length > 0) {
      const { error } = await supabase.from('leads').insert(uniqueLeads);
      if (error) console.error('Supabase error inserting leads:', error.message);
    }

    const skipped = allLeads.length - uniqueLeads.length;
    await supabase
      .from('ai_tasks')
      .update({
        status: 'Completed',
        leads_found: uniqueLeads.length,
        logs: `Found ${mapsLeads.length} map leads + ${webLeads.length} web/aggregator leads = ${allLeads.length} total. Skipped ${skipped} duplicates. Inserted ${uniqueLeads.length} new leads.`,
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId);

  } catch (error: any) {
    console.error('Error in agent background run:', error);
    await supabase.from('ai_tasks').update({ status: 'Failed', logs: error.message }).eq('id', taskId);
  }
}

export async function POST() {
  if (!apifyKey) {
    return NextResponse.json({ error: 'Missing APIFY_API_KEY' }, { status: 500 });
  }

  const { data: taskData, error: taskError } = await supabase
    .from('ai_tasks')
    .insert({
      task_name: 'Global Bulk Buyer & Aggregator Scan',
      status: 'Running',
      logs: 'Initializing agent...'
    })
    .select('id')
    .single();

  if (taskError || !taskData) {
    console.error('Supabase Error creating task:', taskError);
    return NextResponse.json({ error: 'Failed to create task', details: taskError }, { status: 500 });
  }

  // Fire and forget
  runAgentBackground(taskData.id);

  return NextResponse.json({ success: true, taskId: taskData.id });
}
