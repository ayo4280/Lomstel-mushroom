import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data, error } = await s.from('leads').insert({
    business_name: 'Naturewins',
    business_type: 'Test Lead',
    contact_info: 'naturewinsfarm@gmail.com',
    location: '6, God Glory Street, Ikorodu, Lagos',
    source_url: 'mailto:naturewinsfarm@gmail.com',
    status: 'New',
  }).select().single();

  if (error) {
    console.error('Error inserting lead:', error.message);
  } else {
    console.log('✅ Test lead inserted successfully!');
    console.log('   ID:', data.id);
    console.log('   Name:', data.business_name);
    console.log('   Email:', data.contact_info);
    console.log('   Location:', data.location);
  }
}

main().catch(console.error);
