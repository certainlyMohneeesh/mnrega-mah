import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple proxy that doesn't interfere with routing
// i18n will be handled at the component level for now
export function proxy(request: NextRequest) {
  // Allow all requests to pass through
  return NextResponse.next();
}

export const config = {
  // Only match non-API routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
