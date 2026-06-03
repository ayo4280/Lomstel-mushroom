import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function run() {
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) { console.error(error); return; }

  console.log(`Found ${users.length} users. Confirming all unconfirmed...`);

  for (const user of users) {
    if (!user.email_confirmed_at) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });
      if (updateError) {
        console.error(`  ❌ Failed to confirm ${user.email}:`, updateError.message);
      } else {
        console.log(`  ✅ Confirmed: ${user.email}`);
      }
    } else {
      console.log(`  ✓ Already confirmed: ${user.email}`);
    }
  }

  // Also make naturewinsfarm@gmail.com an ADMIN in profiles
  const nature = users.find(u => u.email === 'naturewinsfarm@gmail.com');
  if (nature) {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ id: nature.id, full_name: 'Nature Wins Farm', role: 'ADMIN' });
    if (profileError) {
      console.error('  ❌ Failed to set ADMIN role:', profileError.message);
    } else {
      console.log('  ✅ Set naturewinsfarm@gmail.com as ADMIN');
    }
  }

  // Reset passwords for asodiya99 and ayodelesodiya so you can log in
  const targetEmails = ['asodiya99@gmail.com', 'ayodelesodiya@gmail.com', 'naturewinsfarm@gmail.com'];
  for (const email of targetEmails) {
    const user = users.find(u => u.email === email);
    if (user) {
      const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: '123456'
      });
      if (pwError) {
        console.error(`  ❌ Failed to reset password for ${email}:`, pwError.message);
      } else {
        console.log(`  ✅ Password reset to 123456 for ${email}`);
      }
    }
  }

  console.log('\nDone! All accounts are now confirmed and ready to use.');
}

run();
