// Uses native fetch (Node 18+)
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const firecrawlKey = process.env.FIRECRAWL_API_KEY!;
const geminiKey = process.env.GOOGLE_GEMINI_API_KEY!;

async function testFirecrawl() {
  console.log('--- Testing Firecrawl Search ---');
  try {
    const res = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${firecrawlKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'B2B food aggregator companies Nigeria', limit: 3 }),
    });
    const data = await res.json() as any;
    console.log('Firecrawl status:', res.status);
    console.log('Firecrawl result:', JSON.stringify(data).slice(0, 500));
  } catch(e) { console.error('Firecrawl error:', e); }
}

async function testGemini() {
  console.log('\n--- Testing Gemini Grounding Search ---');
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'List 5 real B2B food aggregator companies in Nigeria with their website URLs. Format as: Name | Type | Website' }] }],
          tools: [{ google_search: {} }],
        }),
      }
    );
    const data = await res.json() as any;
    console.log('Gemini status:', res.status);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('Gemini result:', text?.slice(0, 800) || JSON.stringify(data).slice(0, 500));
  } catch(e) { console.error('Gemini error:', e); }
}

testFirecrawl().then(testGemini);
