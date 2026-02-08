import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/push(.*)',
  '/sitemap.xml',
  '/robots.txt',
]);

// Define auth routes (sign-in, sign-up) - should redirect away if already signed in
const isAuthRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  
  // If user is signed in and trying to access auth pages, redirect to discovery
  if (userId && isAuthRoute(req)) {
    const url = new URL('/discovery', req.url);
    return NextResponse.redirect(url);
  }
  
  // If the route is not public, protect it
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
