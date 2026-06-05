import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data, error } = await s
    .from('leads')
    .select('business_name, business_type, contact_info')
    .ilike('business_type', '%Aggregator%');

  if (error) {
    console.error('Error fetching leads:', error.message);
    return;
  }
  
  const missing = data.filter(l => l.contact_info === 'See website' || l.contact_info === 'N/A' || l.contact_info.trim() === '');
  console.log('Aggregators with missing contact info:', missing.length);
  missing.forEach(m => console.log(`- ${m.business_name}`));
}

main().catch(console.error);
