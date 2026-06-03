import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use SSR-aware browser client so session cookies are set correctly
// for the server-side middleware to read (required for Next.js App Router)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
