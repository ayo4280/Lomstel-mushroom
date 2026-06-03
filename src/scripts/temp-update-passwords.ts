import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

async function run() {
  const emails = ['admin@lomstel.com', 'worker@lomstel.com', 'buyer@lomstel.com'];
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  
  for (const email of emails) {
    const user = users.find(u => u.email === email);
    if (user) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password: 'Password123!' });
      if (error) {
        console.error(`Error for ${email}:`, error);
      } else {
        console.log(`Successfully updated password to Password123! for ${email}`);
      }
    }
  }
}

run();
