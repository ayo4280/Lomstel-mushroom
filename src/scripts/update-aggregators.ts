import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const updates = [
  { name: 'Vendease', info: 'hello@vendease.com' },
  { name: 'TradeDepot', info: '+234 700 999 0000' },
  { name: 'Omnibiz Africa', info: '+234 700 0055 555' },
  { name: 'Alerzo', info: '+234 800 025 3796' },
  { name: 'Chowdeck', info: 'hello@chowdeck.com' },
  { name: 'Glovo Nigeria', info: 'In-App Support' },
  { name: 'Jumia Food Nigeria', info: '0700 600 0000' },
  { name: 'PocketFood Nigeria', info: 'hello@pocketfood.io' },
  { name: 'Farmcrowdy', info: '+234 907 579 1999' },
  { name: 'ThriveAgric', info: '+234 816 716 4014' },
  { name: 'Releaf Africa', info: 'releaf.earth/contact' },
  { name: 'Winich Farms', info: '+234 705 555 5955' }
];

async function main() {
  console.log('Starting updates...');
  for (const { name, info } of updates) {
    const { error } = await s
      .from('leads')
      .update({ contact_info: info })
      .eq('business_name', name);
    
    if (error) {
      console.error(`Error updating ${name}:`, error.message);
    } else {
      console.log(`Updated ${name} -> ${info}`);
    }
  }
  console.log('✅ All aggregators updated!');
}

main().catch(console.error);
