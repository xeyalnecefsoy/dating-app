import { MetadataRoute } from 'next';
import { getAllCitySlugs } from '@/lib/cities';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.danyeri.az';
  const now = new Date();

  // Core static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tanisliq`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // City-specific tanışlıq pages
  const citySlugs = getAllCitySlugs();
  const cityRoutes: MetadataRoute.Sitemap = citySlugs.map((slug) => ({
    url: `${baseUrl}/tanisliq/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Blog Routes
  const blogRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...[
      "az/tehlukesiz-online-tanisliq",
      "az/tanisliq-tetbiqlerinde-mexfilik",
      "az/ilk-gorus-ucun-tehlukesizlik-checklist",
      "az/red-flags-yazismada-riskli-davranislar",
      "az/saglam-munasibete-aparan-tanisliq-qaydalari",
      "az/ilk-mesaji-nece-yazmali",
      "az/ciddi-munasibet-axtararken-edilen-sehvler",
      "az/ideal-profil-sekli-nec-olmalidir",
      "az/evliliyeye-psixoloji-hazirliq",
      "az/ilk-gorusde-ugur-qazanmagin-yollari",
      "az/sevgi-yoxsa-manipulyasiya-gaslighting",
      "az/qarsi-terefin-ciddi-oldugunu-gosteren-elametler",
      "az/kisi-ve-qadinlarin-munasibetden-gozlentileri",
      "az/ghosting-nedir-ve-nece-qorunmali",
    ].map((slug) => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  ];

  return [...staticRoutes, ...cityRoutes, ...blogRoutes];
}
