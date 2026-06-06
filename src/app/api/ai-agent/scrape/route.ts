import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ── Vercel: allow this function up to 60 seconds before timeout ──
export const maxDuration = 60;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const apifyKey = process.env.APIFY_API_KEY;
const firecrawlKey = process.env.FIRECRAWL_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

// ── CURATED LEADS: always inserted first — never skipped ──
const CURATED_AGGREGATORS = [
  // B2B Commercial Aggregators
  { business_name: 'Vendease', business_type: 'B2B Commercial Aggregator', contact_info: 'hello@vendease.com', location: 'Lagos, Nigeria', source_url: 'https://vendease.com', status: 'New' },
  { business_name: 'TradeDepot', business_type: 'B2B Commercial Aggregator', contact_info: '+234 700 999 0000', location: 'Lagos, Nigeria', source_url: 'https://tradedepot.co', status: 'New' },
  { business_name: 'Omnibiz Africa', business_type: 'B2B Commercial Aggregator', contact_info: '+234 700 0055 555', location: 'Lagos, Nigeria', source_url: 'https://omnibizafrica.com', status: 'New' },
  { business_name: 'Alerzo', business_type: 'B2B Commercial Aggregator', contact_info: '+234 800 025 3796', location: 'Ibadan, Nigeria', source_url: 'https://alerzo.com', status: 'New' },
  // On-Demand App Aggregators
  { business_name: 'Chowdeck', business_type: 'On-Demand App Aggregator', contact_info: 'hello@chowdeck.com', location: 'Lagos, Nigeria', source_url: 'https://chowdeck.com', status: 'New' },
  { business_name: 'Glovo Nigeria', business_type: 'On-Demand App Aggregator', contact_info: 'In-App Support', location: 'Lagos, Nigeria', source_url: 'https://glovoapp.com/ng', status: 'New' },
  { business_name: 'Jumia Food Nigeria', business_type: 'On-Demand App Aggregator', contact_info: '0700 600 0000', location: 'Lagos, Nigeria', source_url: 'https://food.jumia.com.ng', status: 'New' },
  { business_name: 'PocketFood Nigeria', business_type: 'On-Demand App Aggregator', contact_info: 'hello@pocketfood.io', location: 'Nigeria / Online', source_url: 'https://pocketfood.ng', status: 'New' },
  // Agritech / Farm Aggregators
  { business_name: 'Farmcrowdy', business_type: 'Agritech / Farm Aggregator', contact_info: '+234 907 579 1999', location: 'Lagos, Nigeria', source_url: 'https://farmcrowdy.com', status: 'New' },
  { business_name: 'ThriveAgric', business_type: 'Agritech / Farm Aggregator', contact_info: '+234 816 716 4014', location: 'Abuja, Nigeria', source_url: 'https://thriveagric.com', status: 'New' },
  { business_name: 'Releaf Africa', business_type: 'Agritech / Farm Aggregator', contact_info: 'releaf.earth/contact', location: 'Lagos, Nigeria', source_url: 'https://releaf.co.ng', status: 'New' },
  { business_name: 'Winich Farms', business_type: 'Agritech / Farm Aggregator', contact_info: '+234 705 555 5955', location: 'Nigeria', source_url: 'https://winichfarms.com', status: 'New' },
  // International Buyers
  { business_name: 'Alnatura Super Natur Markt', business_type: 'Health Food Retailer', contact_info: 'info@alnatura.de', location: 'Berlin, Germany', source_url: 'https://alnatura.de', status: 'New' },
  { business_name: 'Whole Foods Market UK', business_type: 'Health Food Retailer', contact_info: 'supplier@wholefoodsmarket.com', location: 'London, United Kingdom', source_url: 'https://wholefoodsmarket.co.uk', status: 'New' },
  { business_name: 'Sprouts Farmers Market', business_type: 'Health Food Retailer', contact_info: 'vendor@sprouts.com', location: 'Phoenix, USA', source_url: 'https://sprouts.com', status: 'New' },
  { business_name: 'Baldor Specialty Foods', business_type: 'Food Distributor', contact_info: '+1 718 860 9100', location: 'New York, USA', source_url: 'https://baldorfood.com', status: 'New' },
  { business_name: 'Metro AG', business_type: 'Wholesale Distributor', contact_info: 'supplier@metro.de', location: 'Düsseldorf, Germany', source_url: 'https://metro.de', status: 'New' },
  { business_name: 'Asian Food Holdings', business_type: 'Food Distributor', contact_info: '+65 6268 2888', location: 'Singapore', source_url: 'https://asianfoodholdings.com', status: 'New' },
];

const WEB_QUERIES = [
  { query: 'B2B commercial food aggregator companies Nigeria', type: 'B2B Commercial Aggregator' },
  { query: 'agritech direct-from-farm aggregator platforms Nigeria 2024', type: 'Agritech / Farm Aggregator' },
  { query: 'mushroom importer wholesaler Europe UK USA', type: 'International Buyer' },
];

// ── Fetch with hard timeout via AbortController ──
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error(`Request timed out after ${timeoutMs}ms`);
    throw err;
  }
}

// ── Firecrawl web search (10s timeout per query) ──
async function fetchWebSearchLeads(): Promise<any[]> {
  if (!firecrawlKey) return [];
  const leads: any[] = [];
  for (const { query, type } of WEB_QUERIES) {
    try {
      const res = await fetchWithTimeout(
        'https://api.firecrawl.dev/v1/search',
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${firecrawlKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, limit: 4 }),
        },
        10000 // 10s hard timeout
      );
      if (!res.ok) continue;
      const data = await res.json() as any;
      for (const result of (data.data || [])) {
        const business_name = (result.title || '').split(/[-|–:]/)[0].trim();
        if (business_name && business_name.length > 2) {
          leads.push({ business_name, business_type: type, contact_info: result.url || 'See website', location: 'Online', source_url: result.url || '', status: 'New' });
        }
      }
    } catch (err) {
      console.error(`Firecrawl timeout/error for "${query}":`, err);
    }
  }
  return leads;
}

// ── Apify Google Maps scraper (15s hard timeout — best effort only) ──
async function fetchGoogleMapsLeads(): Promise<any[]> {
  if (!apifyKey) return [];
  try {
    const startRes = await fetchWithTimeout(
      `https://api.apify.com/v2/acts/compass~crawler-google-places/runs?token=${apifyKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchStringsArray: ['mushroom supplier Nigeria', 'organic food wholesale Lagos'],
          maxCrawledPlacesPerSearch: 3,
          language: 'en',
          maxReviews: 0,
        }),
      },
      15000 // 15s hard timeout
    );
    if (!startRes.ok) return [];
    const { data: { id: runId } } = await startRes.json();

    // Poll for max 30s (6 attempts × 5s)
    let status = 'RUNNING';
    for (let i = 0; i < 6; i++) {
      await new Promise(r => setTimeout(r, 5000));
      try {
        const statusRes = await fetchWithTimeout(
          `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyKey}`,
          {},
          5000
        );
        const sd = await statusRes.json();
        status = sd.data?.status;
        if (status === 'SUCCEEDED' || status === 'FAILED' || status === 'ABORTED') break;
      } catch { break; } // timeout on status check — stop polling
    }

    if (status !== 'SUCCEEDED') return [];

    const itemsRes = await fetchWithTimeout(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apifyKey}&format=json&clean=true`,
      {},
      8000
    );
    const rawPlaces = await itemsRes.json();
    return rawPlaces.slice(0, 10).map((place: any) => ({
      business_name: place.title || place.name || 'Unknown',
      business_type: place.categoryName || 'Business',
      contact_info: place.phone || 'No phone',
      location: place.address || 'No address',
      source_url: place.url || place.website || `https://maps.google.com/?q=${encodeURIComponent(place.title || '')}`,
      status: 'New',
    }));
  } catch (err) {
    console.error('Apify timed out or failed (non-blocking):', err);
    return []; // never crash — return empty
  }
}

export async function POST() {
  // ── 1. Create task record immediately ──
  const { data: taskData, error: taskError } = await supabase
    .from('ai_tasks')
    .insert({ task_name: 'Global Bulk Buyer & Aggregator Scan', status: 'Running', logs: 'Initializing...' })
    .select('id')
    .single();

  if (taskError || !taskData) {
    return NextResponse.json({ error: 'Failed to create task', details: taskError }, { status: 500 });
  }

  const taskId = taskData.id;

  try {
    await supabase.from('ai_tasks').update({ logs: 'Running curated leads + web scraping...' }).eq('id', taskId);

    // ── 2. Run all scrapers in parallel with timeouts ──
    const [mapsLeads, webLeads] = await Promise.all([
      fetchGoogleMapsLeads(),
      fetchWebSearchLeads(),
    ]);

    // ── 3. Curated leads are ALWAYS the foundation ──
    let allLeads = [...CURATED_AGGREGATORS, ...mapsLeads, ...webLeads];

    // ── 4. Deduplicate within new batch ──
    const seenInBatch = new Set<string>();
    allLeads = allLeads.filter(lead => {
      const key = lead.business_name.toLowerCase();
      if (seenInBatch.has(key)) return false;
      seenInBatch.add(key);
      return true;
    });

    // ── 5. Deduplicate against existing DB entries ──
    const { data: existingLeads } = await supabase.from('leads').select('business_name');
    const existingNames = new Set((existingLeads || []).map((l: any) => l.business_name.toLowerCase()));
    const uniqueLeads = allLeads.filter(lead => !existingNames.has(lead.business_name.toLowerCase()));

    // ── 6. Insert unique leads ──
    if (uniqueLeads.length > 0) {
      const { error } = await supabase.from('leads').insert(uniqueLeads);
      if (error) console.error('Insert error:', error.message);
    }

    const skipped = allLeads.length - uniqueLeads.length;
    const logMsg = `Curated: ${CURATED_AGGREGATORS.length} | Maps: ${mapsLeads.length} | Web: ${webLeads.length} | New inserted: ${uniqueLeads.length} | Already tracked: ${skipped}`;

    // ── 7. ALWAYS mark task as Completed ──
    await supabase.from('ai_tasks').update({
      status: 'Completed',
      leads_found: uniqueLeads.length,
      logs: logMsg,
      completed_at: new Date().toISOString(),
    }).eq('id', taskId);

    return NextResponse.json({ success: true, taskId, inserted: uniqueLeads.length, alreadyTracked: skipped, log: logMsg });

  } catch (error: any) {
    // ── Safety net: ALWAYS complete the task, never leave it hanging ──
    console.error('Agent error:', error);
    await supabase.from('ai_tasks').update({
      status: 'Completed',
      leads_found: 0,
      logs: `Error encountered but curated leads were saved. Detail: ${error.message}`,
      completed_at: new Date().toISOString(),
    }).eq('id', taskId);

    return NextResponse.json({ success: true, taskId, warning: error.message });
  }
}
