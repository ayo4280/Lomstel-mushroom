import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';

// POST /api/admin/create-user
export async function POST(req: NextRequest) {
  try {
    // 1. Verify caller is an authenticated ADMIN via user_metadata (authoritative role source)
    const supabaseServer = await createServerClient();
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const callerRole = user.user_metadata?.role;
    if (callerRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Requires ADMIN role' }, { status: 403 });
    }

    // 2. Parse request body
    const body = await req.json();
    const { email, full_name, role } = body;

    if (!email || !full_name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (role !== 'ADMIN' && role !== 'FARM_WORKER') {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    // 3. Create the user using Service Role Key (bypasses email confirmation)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const tempPassword = 'LomstelTemp123!';

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: full_name,
        role: role
      }
    });

    if (createError) {
      console.error('Error creating user via admin API:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    // 4. Role is already set in user_metadata above — no profiles table update needed
    // (The profiles table has a different schema and is not used for role management)

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      password: tempPassword,
      user: {
        id: newUser.user?.id,
        email: email,
        role: role
      }
    });

  } catch (error: any) {
    console.error('Admin create-user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
