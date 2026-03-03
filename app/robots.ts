import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.danyeri.az';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about'],
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
          '/onboarding'
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
