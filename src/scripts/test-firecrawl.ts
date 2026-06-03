// Uses native fetch (Node 18+)
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const firecrawlKey = process.env.FIRECRAWL_API_KEY!;

const WEB_QUERIES = [
  { query: 'B2B commercial food aggregator companies Nigeria', type: 'B2B Commercial Aggregator' },
  { query: 'on-demand food delivery aggregator app companies Nigeria Chowdeck Glovo', type: 'On-Demand App Aggregator' },
  { query: 'agritech direct-from-farm aggregator platforms Nigeria 2024', type: 'Agritech / Farm Aggregator' },
];

async function main() {
  console.log('Firecrawl Key:', firecrawlKey ? `${firecrawlKey.slice(0, 10)}...` : 'MISSING!');

  for (const { query, type } of WEB_QUERIES) {
    console.log(`\n--- Searching: "${query}" ---`);
    const res = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit: 5 }),
    });

    console.log('Status:', res.status);
    const data = await res.json() as any;
    
    if (!data.success) {
      console.log('Error:', JSON.stringify(data));
      continue;
    }

    const results: any[] = data.data || [];
    console.log(`Got ${results.length} results:`);
    
    for (const r of results) {
      const rawTitle = r.title || '';
      const business_name = rawTitle.split(/[-|–:]/)[0].trim();
      console.log(`  → "${business_name}" | ${type} | ${r.url}`);
    }
  }
}

main().catch(console.error);
