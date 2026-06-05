import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const junkNames = [
  'The Realities of Running a Food Business in Nigeria',
  '09133443380 DM',
  'Vendease wants to be the Amazon for Nigeria\'s food vendors',
  'Olo',
  'Business Solutions',
  'Comparing Food Delivery Apps in Lagos',
  'Which food delivery app delivers the fastest in Lagos?',
  'Glovo vs. Chowdeck',
  'Nigerian Agritech Solutions for Market Access',
  'Africa\'s agribusiness transformation will be led by countries that can ...',
  'NIGERIA\'S AGRITECH BOOM',
  'Agritech startups aim to lift Nigerian smallholder farmers out of poverty',
  'Dissecting Nigeria\'s Agritech Industry'
];

async function main() {
  console.log('Deleting junk aggregators from the database...');
  for (const name of junkNames) {
    const { error } = await s
      .from('leads')
      .delete()
      .eq('business_name', name);
    
    if (error) {
      console.error(`Error deleting ${name}:`, error.message);
    } else {
      console.log(`Deleted: ${name}`);
    }
  }
  console.log('✅ Cleanup complete!');
}

main().catch(console.error);
