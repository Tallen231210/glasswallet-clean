import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/leads(.*)',
  '/analytics(.*)',
  '/settings(.*)',
  '/admin(.*)',
  '/pixels(.*)',
  '/integrations(.*)',
  '/billing(.*)',
  '/crm(.*)',
  '/ai-intelligence(.*)',
  '/performance(.*)',
  '/activity(.*)',
  '/quick-actions(.*)',
  '/api/((?!test|simple).*)', // Protect all API routes except test and simple
]);

export default clerkMiddleware((auth, req) => {
  // Temporarily disable route protection until proper Clerk keys are configured
  // This prevents MIDDLEWARE_INVOCATION_FAILED errors with placeholder keys
  
  // TODO: Re-enable when actual Clerk keys are added to .env
  // if (isProtectedRoute(req)) {
  //   auth().protect();
  // }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};