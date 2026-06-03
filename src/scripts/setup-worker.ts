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

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Creating Farm Worker Account                                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  const email = 'manager@lomstel.com';
  
  const { data: usersData, error: usersErr } = await supabaseAdmin.auth.admin.listUsers();
  if (usersErr) throw new Error(`Failed to list users: ${usersErr.message}`);

  let workerUser = usersData.users.find(u => u.email === email);
  if (workerUser) {
    console.log(`  ⚠️  ${email} already exists! Enforcing FARM_WORKER role...`);
    await supabaseAdmin.auth.admin.updateUserById(workerUser.id, {
      user_metadata: { ...workerUser.user_metadata, role: 'FARM_WORKER' }
    });
    await supabaseAdmin.from('profiles').update({ role: 'FARM_WORKER' }).eq('id', workerUser.id);
    console.log(`  ✅  ${email} updated to FARM_WORKER.`);
  } else {
    console.log(`  ⏳  Creating ${email}...`);
    const { data: newWorker, error: createWorkerErr } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { role: 'FARM_WORKER', full_name: 'Farm Manager' }
    });
    if (createWorkerErr) throw new Error(`Create worker error: ${createWorkerErr.message}`);
    
    await supabaseAdmin.from('profiles').update({ role: 'FARM_WORKER', full_name: 'Farm Manager' }).eq('id', newWorker.user.id);
    console.log(`  ✅  ${email} successfully created with FARM_WORKER role!`);
  }

  console.log('\n🏆 Done!\n');
}

main().catch(err => {
  console.error(`❌ FAILED: ${err.message}`);
  process.exit(1);
});
