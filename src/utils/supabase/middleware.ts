import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect /dashboard routes
  if (
    !user &&
    request.nextUrl.pathname.startsWith('/dashboard')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Enforce Role-Based Access Control (RBAC)
  if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const role = user.user_metadata?.role || 'BUYER';
    const isBuyer = role === 'BUYER';
    
    // Protected admin/worker routes
    const adminRoutes = ['/dashboard/inventory', '/dashboard/certificates', '/dashboard/logistics', '/dashboard/ai-agent', '/dashboard/harvest', '/dashboard/tracking'];
    const isTryingToAccessAdminRoute = adminRoutes.some(route => request.nextUrl.pathname.startsWith(route));
    
    // Check if the user is visiting the home dashboard overview exactly
    const isOverviewRoute = request.nextUrl.pathname === '/dashboard' || request.nextUrl.pathname === '/dashboard/';

    if (isBuyer && (isTryingToAccessAdminRoute || isOverviewRoute)) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard/marketplace'; // Redirect unauthorized buyers to marketplace
      return NextResponse.redirect(url);
    }
  }

  // If user is logged in and tries to access /login, redirect to dashboard
  if (
    user &&
    request.nextUrl.pathname === '/login'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
