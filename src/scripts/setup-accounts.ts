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
  console.log('║  Lomstel Account Setup Tool                                  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  // 1. Fix Admin Account
  console.log('\n  1️⃣  Fixing admin@lomstel.com...');
  const { data: usersData, error: usersErr } = await supabaseAdmin.auth.admin.listUsers();
  if (usersErr) throw new Error(`Failed to list users: ${usersErr.message}`);

  let adminUser = usersData.users.find(u => u.email === 'admin@lomstel.com');
  if (adminUser) {
    // Update user metadata in auth.users
    await supabaseAdmin.auth.admin.updateUserById(adminUser.id, {
      user_metadata: { ...adminUser.user_metadata, role: 'ADMIN' }
    });
    // Update profile
    await supabaseAdmin.from('profiles').update({ role: 'ADMIN' }).eq('id', adminUser.id);
    console.log('  ✅  admin@lomstel.com has been successfully upgraded to ADMIN.');
  } else {
    console.log('  ⚠️  admin@lomstel.com not found. Let us create it.');
    const { data: newAdmin, error: createAdminErr } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@lomstel.com',
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { role: 'ADMIN', full_name: 'System Admin' }
    });
    if (createAdminErr) throw new Error(`Create admin error: ${createAdminErr.message}`);
    await supabaseAdmin.from('profiles').update({ role: 'ADMIN', full_name: 'System Admin' }).eq('id', newAdmin.user.id);
    console.log('  ✅  admin@lomstel.com created with ADMIN role.');
  }

  // 2. Create/Fix Buyer Account
  console.log('\n  2️⃣  Setting up buyer@lomstel.com...');
  let buyerUser = usersData.users.find(u => u.email === 'buyer@lomstel.com');
  if (buyerUser) {
    // Ensure buyer is BUYER
    await supabaseAdmin.auth.admin.updateUserById(buyerUser.id, {
      user_metadata: { ...buyerUser.user_metadata, role: 'BUYER' }
    });
    await supabaseAdmin.from('profiles').update({ role: 'BUYER' }).eq('id', buyerUser.id);
    console.log('  ✅  buyer@lomstel.com exists and is confirmed as BUYER.');
  } else {
    const { data: newBuyer, error: createBuyerErr } = await supabaseAdmin.auth.admin.createUser({
      email: 'buyer@lomstel.com',
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { role: 'BUYER', full_name: 'Test Buyer' }
    });
    if (createBuyerErr) throw new Error(`Create buyer error: ${createBuyerErr.message}`);
    await supabaseAdmin.from('profiles').update({ role: 'BUYER', full_name: 'Test Buyer' }).eq('id', newBuyer.user.id);
    console.log('  ✅  buyer@lomstel.com created with BUYER role.');
  }

  // 3. Create/Fix Sales Account
  console.log('\n  3️⃣  Setting up sales@lomstel.com...');
  let salesUser = usersData.users.find(u => u.email === 'sales@lomstel.com');
  if (salesUser) {
    await supabaseAdmin.auth.admin.updateUserById(salesUser.id, {
      user_metadata: { ...salesUser.user_metadata, role: 'ADMIN' }
    });
    await supabaseAdmin.from('profiles').update({ role: 'ADMIN' }).eq('id', salesUser.id);
    console.log('  ✅  sales@lomstel.com exists and is confirmed as ADMIN.');
  } else {
    const { data: newSales, error: createSalesErr } = await supabaseAdmin.auth.admin.createUser({
      email: 'sales@lomstel.com',
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { role: 'ADMIN', full_name: 'Sales Team' }
    });
    if (createSalesErr) throw new Error(`Create sales error: ${createSalesErr.message}`);
    await supabaseAdmin.from('profiles').update({ role: 'ADMIN', full_name: 'Sales Team' }).eq('id', newSales.user.id);
    console.log('  ✅  sales@lomstel.com created with ADMIN role.');
  }

  console.log('\n🏆 Account setup complete!\n');
}

main().catch(err => {
  console.error(`❌ FAILED: ${err.message}`);
  process.exit(1);
});
