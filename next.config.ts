import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the development indicator (N button) in bottom left
  devIndicators: false,
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex'
          }
        ]
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex'
          }
        ]
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY' // Prevents clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff' // Prevents MIME type sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
             key: 'Permissions-Policy',
             value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' // Limit browser features
          }
        ],
      },
    ];
  },
};

export default nextConfig;
