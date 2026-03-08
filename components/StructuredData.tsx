export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    "name": "Danyeri",
    "alternateName": ["Danyeri.az", "Danyeri Tanışlıq"],
    "operatingSystem": "Android, iOS, Web",
    "applicationCategory": "SocialNetworkingApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "AZN"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "500",
      "bestRating": "5",
      "worstRating": "1"
    },
    "description": "Azərbaycanda ən etibarlı tanışlıq tətbiqi. Ciddi münasibət və evlilik üçün Bakı, Gəncə, Sumqayıt və digər şəhərlərdə həyat yoldaşınızı tapın.",
    "url": "https://www.danyeri.az",
    "inLanguage": "az",
    "author": {
      "@type": "Organization",
      "name": "Danyeri"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Danyeri",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.danyeri.az/logo.jpg"
      }
    }
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Danyeri",
    "alternateName": "Danyeri.az",
    "url": "https://www.danyeri.az",
    "logo": "https://www.danyeri.az/logo.jpg",
    "description": "Azərbaycanda ən etibarlı ciddi tanışlıq və evlilik tətbiqi.",
    "foundingDate": "2024",
    "areaServed": {
      "@type": "Country",
      "name": "Azərbaycan"
    },
    "sameAs": [
      "https://instagram.com/danyeri.az",
      "https://facebook.com/danyeri.az",
      "https://twitter.com/danyeri_az"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "support@danyeri.az",
      "availableLanguage": ["az", "en"]
    }
  };

  // WebSite schema - helps with sitelinks and brand recognition in search
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Danyeri",
    "alternateName": ["Danyeri.az", "Danyeri Tanışlıq", "Danyeri Tətbiqi"],
    "url": "https://www.danyeri.az",
    "description": "Azərbaycanda ciddi tanışlıq və evlilik tətbiqi",
    "inLanguage": "az",
    "publisher": {
      "@type": "Organization",
      "name": "Danyeri"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.danyeri.az/tanisliq/{search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
    </>
  );
}
