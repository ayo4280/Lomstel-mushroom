import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

async function testLogin() {
  console.log('Testing login for admin@lomstel.com...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@lomstel.com',
    password: 'Lomstel2026!'
  });

  if (error) {
    console.error('❌ Login failed:', error.message, error.name, error.status);
  } else {
    console.log('✅ Login successful!', data.user.id);
  }
}

testLogin();
