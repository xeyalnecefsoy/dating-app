"use client";

export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    "name": "Danyeri",
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
    "description": "Azərbaycanda ən etibarlı tanışlıq tətbiqi. Ciddi münasibət və evlilik üçün həyat yoldaşınızı tapın.",
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
    "url": "https://www.danyeri.az",
    "logo": "https://www.danyeri.az/logo.jpg",
    "description": "Azərbaycanda ən etibarlı tanışlıq tətbiqi.",
    "foundingDate": "2024",
    "sameAs": [
      "https://instagram.com/danyeri.az",
      "https://facebook.com/danyeri.az",
      "https://twitter.com/danyeri_az"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "support@danyeri.az"
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
    </>
  );
}
