import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@lomstel.com',
    password: '123456'
  });

  if (error) {
    console.error('Login Failed:', error.message);
  } else {
    console.log('Login Succeeded! Session token:', data.session?.access_token.substring(0, 20) + '...');
  }
}

testLogin();
