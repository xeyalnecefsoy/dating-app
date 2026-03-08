import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.danyeri.az';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/tanisliq', '/tanisliq/'],
        disallow: [
          '/api/', 
          '/convex-test/', 
          '/admin/', 
          '/private/',
          '/discovery',
          '/messages',
          '/matches',
          '/profile',
          '/settings',
          '/likes',
          '/notifications',
          '/simulator',
          '/onboarding',
          '/blocked',
          '/badges',
          '/stories',
          '/search',
          '/verify',
          '/venues',
          '/user/',
        ],
      },
      {
        userAgent: ['facebookexternalhit', 'Twitterbot', 'LinkedInBot'],
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
