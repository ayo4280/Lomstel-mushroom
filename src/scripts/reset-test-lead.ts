import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data, error } = await s
    .from('leads')
    .update({ status: 'New' })
    .eq('business_name', 'Naturewins')
    .select();

  if (error) {
    console.error('Error updating lead status:', error.message);
  } else {
    console.log('✅ Test lead status reset to New!');
  }
}

main().catch(console.error);
