import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const appUrl = 'http://localhost:3000';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Lomstel Mobile App Sync API Test                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  const testEmail = `farm-worker-test-${Date.now()}@lomstel.com`;
  const testPassword = 'TestPassword123!';
  let userId: string | null = null;
  let testProductId: string | null = null;
  let originalQuantity: number = 0;

  try {
    // 1. Create a dummy test product to harvest against
    console.log('  1️⃣  Creating temporary mushroom product...');
    const { data: product, error: prodErr } = await supabaseAdmin
      .from('mushroom_products')
      .insert({
        name: 'Test Oyster Batch',
        farm: 'Test Farm Hub',
        price: '$1000',
        available: '0kg',
        quantity_kg: 0,
        product_type: 'WET',
        grade: 'A',
        drying_method: 'N/A'
      })
      .select('id, quantity_kg')
      .single();

    if (prodErr) throw new Error(`Product creation failed: ${prodErr.message}`);
    testProductId = product.id;
    originalQuantity = product.quantity_kg;
    console.log(`  ✅  Created product ID: ${testProductId}`);

    // 2. Create a temporary user via Admin API
    console.log('  2️⃣  Creating temporary farm worker user...');
    const { data: { user }, error: userErr } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });
    
    if (userErr || !user) throw new Error(`User creation failed: ${userErr?.message}`);
    userId = user.id;

    // Assign FARM_WORKER role (update instead of insert because trigger creates it)
    await supabaseAdmin.from('profiles').update({
      full_name: 'Test Worker',
      role: 'FARM_WORKER'
    }).eq('id', userId);
    console.log(`  ✅  Created user & assigned FARM_WORKER role`);

    // 3. Sign in to get JWT token
    console.log('  3️⃣  Signing in to obtain JWT access token...');
    // We use the anon key client to sign in
    const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false }
    });
    const { data: sessionData, error: signInErr } = await supabaseAnon.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInErr || !sessionData.session) throw new Error(`Sign in failed: ${signInErr?.message}`);
    const accessToken = sessionData.session.access_token;
    console.log(`  ✅  Token obtained`);

    // 4. Test the Sync API
    console.log('  4️⃣  POSTing offline harvest batch to /api/mobile/sync...');
    const payload = {
      harvests: [
        {
          weight: 15.5,
          moisture: 85.0,
          grade: 'A',
          location: 'Hub 1',
          status: 'logged',
          timestamp: new Date().toISOString(),
          harvest_type: 'WET',
          product_id: testProductId
        },
        {
          weight: 20.0,
          moisture: 84.5,
          grade: 'A',
          location: 'Hub 2',
          status: 'logged',
          timestamp: new Date().toISOString(),
          harvest_type: 'WET',
          product_id: testProductId
        }
      ]
    };

    const res = await fetch(`${appUrl}/api/mobile/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`Sync API failed HTTP ${res.status}: ${await res.text()}`);
    const result = await res.json();
    console.log(`  ✅  Sync response: ${JSON.stringify(result)}`);

    // 5. Verify database changes
    console.log('  5️⃣  Verifying database state (inventory increments)...');
    const { data: updatedProduct } = await supabaseAdmin
      .from('mushroom_products')
      .select('quantity_kg, available')
      .eq('id', testProductId)
      .single();

    if (!updatedProduct) throw new Error('Product not found after sync');
    
    // Total added = 15.5 + 20.0 = 35.5
    const expectedQuantity = originalQuantity + 35.5;
    if (updatedProduct.quantity_kg !== expectedQuantity) {
      throw new Error(`Inventory mismatch: Expected ${expectedQuantity}, got ${updatedProduct.quantity_kg}`);
    }
    console.log(`  ✅  Inventory properly incremented to ${updatedProduct.quantity_kg}kg (${updatedProduct.available})`);
    console.log('\n🏆 ALL TESTS PASSED — Offline sync to inventory pipeline is verified!\n');

  } catch (err: any) {
    console.error(`\n❌ FAILED: ${err.message}\n`);
    process.exit(1);
  } finally {
    console.log('  🧹  Cleaning up temporary test data...');
    if (userId) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    }
    if (testProductId) {
      await supabaseAdmin.from('mushroom_products').delete().eq('id', testProductId);
      // Cascading deletes usually handle harvests, but let's be sure
      await supabaseAdmin.from('harvests').delete().eq('product_id', testProductId);
    }
    console.log('  ✅  Cleanup complete');
  }
}

main();
