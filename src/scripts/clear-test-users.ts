import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function clearTestUsers() {
  console.log('Clearing test users...');
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  
  const testEmails = ['admin@lomstel.com', 'worker@lomstel.com', 'buyer@lomstel.com'];
  
  for (const email of testEmails) {
    const user = existingUsers.users.find(u => u.email === email);
    if (user) {
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      console.log(`Deleted ${email}`);
    }
  }
  console.log('Done!');
}

clearTestUsers();
