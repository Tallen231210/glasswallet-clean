import { NextRequest, NextResponse } from 'next/server';

// Development middleware - bypass all authentication
export default function middleware(request: NextRequest) {
  // In development mode, just pass through without any authentication
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }
  
  // In production, import and use Clerk middleware
  // This will only be executed in production builds
  throw new Error('Production middleware not implemented yet - Clerk setup required');
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};