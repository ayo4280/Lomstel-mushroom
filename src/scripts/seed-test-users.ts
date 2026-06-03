import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

const testUsers = [
  { email: 'admin@lomstel.com', role: 'ADMIN', name: 'Admin User' },
  { email: 'worker@lomstel.com', role: 'FARM_WORKER', name: 'Farm Worker' },
  { email: 'buyer@lomstel.com', role: 'BUYER', name: 'Buyer User' }
];

const password = '123456';

async function seed() {
  console.log('Seeding test users...');
  
  for (const tu of testUsers) {
    // Check if user exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const exists = existingUsers.users.find(u => u.email === tu.email);
    
    let userId;
    if (!exists) {
      const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
        email: tu.email,
        password: password,
        email_confirm: true
      });
      if (error) {
        console.error(`Failed to create ${tu.email}:`, error);
        continue;
      }
      userId = user!.id;
      console.log(`✅ Created user: ${tu.email}`);
    } else {
      userId = exists.id;
      console.log(`ℹ️ User already exists: ${tu.email}`);
    }

    // Update profile role
    const { error: profileError } = await supabaseAdmin.from('profiles').update({
      full_name: tu.name,
      role: tu.role
    }).eq('id', userId);
    
    if (profileError) {
      console.error(`Failed to update profile for ${tu.email}:`, profileError);
    } else {
      console.log(`✅ Assigned role ${tu.role} to ${tu.email}`);
    }
  }
  console.log('\nAll done! Passwords are:', password);
}

seed();
