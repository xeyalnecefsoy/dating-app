# SEO Optimization Skill

> Next.js Metadata API, sitemap, robots.txt və axtarış sistemləri üçün optimallaşdırma qaydaları.

## Triggers
Bu skill aşağıdakı sözlər istifadə olunanda aktivləşir:
- seo, metadata, title, description
- google search, indexing, axtarış
- robots.txt, robots, sitemap, sitemap.xml
- open graph, og:image, twitter card
- canonical, json-ld, structured data

---

## 🎯 Metadata API (Next.js 14)

### Static Metadata
```tsx
// layout.tsx və ya page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Danyeri',
    default: 'Danyeri - Ciddi Tanışlıq Platforması', // Fallback title
  },
  description: 'Azərbaycanın ən ciddi tanışlıq platforması. Həyat yoldaşınızı tapın.',
  metadataBase: new URL('https://danyeri.az'),
  openGraph: {
    title: 'Danyeri',
    description: 'Ciddi tanışlıq platforması',
    url: 'https://danyeri.az',
    siteName: 'Danyeri',
    images: [
      {
        url: '/og.png', // public folder-də olmalıdır
        width: 1200,
        height: 630,
      },
    ],
    locale: 'az_AZ',
    type: 'website',
  },
}
```

### Dynamic Metadata
```tsx
// app/profile/[username]/page.tsx
import { Metadata } from 'next'

type Props = {
  params: { username: string }
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  // Verilənləri gətir
  const user = await fetchUser(params.username)
 
  return {
    title: `${user.name} - Profil`,
    description: `${user.name} haqqında məlumat və maraqları soxun.`,
    openGraph: {
      images: [user.avatarUrl || '/default-avatar.png'],
    },
  }
}
```

---

## 🤖 Crawling & Indexing

### robots.ts
```ts
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/settings/'], // Gizli səhifələr
    },
    sitemap: 'https://danyeri.az/sitemap.xml',
  }
}
```

### sitemap.ts
```ts
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Statik səhifələr
  const routes = [
    '',
    '/about',
    '/contact',
  ].map((route) => ({
    url: `https://danyeri.az${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }))

  // Dinamik səhifələr (məsələn, istifadəçilər)
  // Diqqət: Çox sayda istifadəçi varsa hamısını bura yığmaq olmaz!
  // Google limiti: 50,000 URL
  
  return [...routes]
}
```

---

## 🏗 Structured Data (JSON-LD)

Axtarış nəticələrində zəngin görünüş (rich snippets) üçün.

```tsx
// components/JsonLd.tsx
export default function JsonLd({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// İstifadəsi
<JsonLd data={{
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Xəyal Nəcəfsoy',
  url: 'https://danyeri.az/profile/xeyalnecefsoy',
  image: 'https://danyeri.az/avatars/xeyal.jpg'
}} />
```

---

## ⚠️ SEO Checklist

Yeni səhifə yaradarkən yoxla:

- [ ] `metadata` obyekti və ya `generateMetadata` funksiyası var?
- [ ] `description` və `title` unikal və cəlbedicidir?
- [ ] `openGraph` şəkli (og:image) düzgün qeyd olunub?
- [ ] `canonical` URL ehtiyac varsa təyin edilib?
- [ ] H1 başlığı (səhifədə yalnız bir dənə) açar sözləri ehtiva edir?
- [ ] Şəkillərdə `alt` atributu var?
- [ ] Linklərdə `href` düzgündür və mənalı mətn (anchor text) var?
