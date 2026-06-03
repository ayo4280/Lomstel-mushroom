import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  try {
    // 1. Validate user token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized token' }, { status: 401 });
    }

    // 2. Verify Role (RBAC)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['ADMIN', 'FARM_WORKER'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    // 3. Parse Payload
    const body = await request.json();
    if (!body.harvests || !Array.isArray(body.harvests)) {
      return NextResponse.json({ error: 'Invalid payload: expected harvests array' }, { status: 400 });
    }

    // 4. Call RPC to atomically insert harvests and update inventory stock
    const { data, error } = await supabase.rpc('process_harvest_sync', { payload: body.harvests });

    if (error) {
      console.error('RPC Error:', error);
      return NextResponse.json({ error: 'Sync failed to process', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: body.harvests.length, result: data });
  } catch (err: any) {
    console.error('Sync error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
