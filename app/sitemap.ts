import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.danyeri.az';

  // Core static routes - Only including verified existing routes
  const routes = [
    '',
    '/about',
    '/sign-in',
    '/sign-up',
    // '/contact', // TODO: Create contact page
    // '/privacy', // TODO: Create privacy policy
    // '/terms',   // TODO: Create terms of service
    // '/faq',     // TODO: Create FAQ
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
