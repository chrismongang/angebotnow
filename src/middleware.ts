import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/auth/signin", "/auth/error", "/api/auth", "/api/placeholder"]
  
  // Static assets and API routes that should always be accessible
  const staticRoutes = ["/_next", "/favicon", "/api"]
  
  // Check if the current path is public or static
  if (publicRoutes.some(route => pathname.startsWith(route)) || 
      staticRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Add security headers for better chunk loading
  const response = NextResponse.next()
  
  // Security headers to prevent chunk loading issues
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Cache control for better performance
  if (pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
