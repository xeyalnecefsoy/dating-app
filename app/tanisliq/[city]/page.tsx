import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, ChevronRight, CheckCircle, ArrowLeft, Users, Shield, Star } from "lucide-react";
import type { Metadata } from "next";
import { cities, getCityBySlug, getAllCitySlugs } from "@/lib/cities";
import { notFound } from "next/navigation";

// Generate static pages at build time for all cities
export function generateStaticParams() {
  return getAllCitySlugs().map((city) => ({
    city,
  }));
}

// Dynamic metadata for each city
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ city: string }> 
}): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  
  if (!city) {
    return {
      title: "Səhifə Tapılmadı | Danyeri",
    };
  }

  return {
    title: city.metaTitle,
    description: city.metaDescription,
    alternates: {
      canonical: `https://www.danyeri.az/tanisliq/${city.slug}`,
    },
    openGraph: {
      title: city.metaTitle,
      description: city.metaDescription,
      url: `https://www.danyeri.az/tanisliq/${city.slug}`,
      type: "website",
      locale: "az_AZ",
      siteName: "Danyeri",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `${city.nameLocative} Tanışlıq - Danyeri`,
        },
      ],
    },
    keywords: [
      `${city.nameLocative} tanışlıq`,
      `${city.name} tanışlıq`,
      `${city.nameLocative} evlilik`,
      `${city.nameLocative} ciddi münasibət`,
      `${city.name} tanışlıq tətbiqi`,
      `${city.name} tanışlıq saytı`,
      "Danyeri",
      "Azərbaycanda tanışlıq",
      "ciddi tanışlıq",
      "evlilik üçün tanışlıq",
    ],
  };
}

export default async function CityPage({ 
  params 
}: { 
  params: Promise<{ city: string }> 
}) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);

  if (!city) {
    notFound();
  }

  // Get other cities for internal linking
  const otherCities = cities.filter(c => c.slug !== city.slug);

  // JSON-LD structured data for this city page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": city.metaTitle,
    "description": city.metaDescription,
    "url": `https://www.danyeri.az/tanisliq/${city.slug}`,
    "inLanguage": "az",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Danyeri",
      "url": "https://www.danyeri.az"
    },
    "about": {
      "@type": "City",
      "name": city.name,
      "containedInPlace": {
        "@type": "Country",
        "name": "Azərbaycan"
      }
    },
    "mainEntity": {
      "@type": "MobileApplication",
      "name": "Danyeri",
      "applicationCategory": "SocialNetworkingApplication",
      "operatingSystem": "Android, iOS, Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "AZN"
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="w-full max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/tanisliq" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Bütün Şəhərlər</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 relative rounded-full overflow-hidden">
              <Image src="/logo.jpg" alt="Danyeri" fill className="object-cover" />
            </div>
            <span className="font-bold">Danyeri</span>
          </Link>
          <Link 
            href="/sign-up"
            className="gradient-brand text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Qeydiyyat
          </Link>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Ana Səhifə</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/tanisliq" className="hover:text-foreground transition-colors">Tanışlıq</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{city.nameLocative}</span>
        </nav>

        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">{city.name}, Azərbaycan</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent leading-tight">
            {city.nameLocative} Tanışlıq
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            {city.description}
          </p>

          <Link 
            href="/sign-up"
            className="gradient-brand text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
          >
            <Heart className="w-5 h-5" />
            {city.nameLocative} Tanışlığa Başla
          </Link>
        </section>

        {/* City Info */}
        <section className="mb-16 bg-card rounded-2xl p-8 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{city.name} Haqqında</h2>
              <p className="text-sm text-muted-foreground">Əhali: {city.population}</p>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {city.longDescription}
          </p>
        </section>

        {/* Features for this city */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">{city.nameLocative} Danyeri-nin Üstünlükləri</h2>
          <div className="space-y-3">
            {city.features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border">
                <CheckCircle className="w-5 h-5 text-[#20D5A0] shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">{city.nameLocative} Niyə Danyeri Seçməlisiniz?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-card rounded-2xl border border-border">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Təhlükəsiz</h3>
              <p className="text-sm text-muted-foreground">
                {city.nameLocative} bütün profillər yoxlanılır və təhlükəsiz mühit təmin edilir.
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-2xl border border-border">
              <div className="w-14 h-14 rounded-full bg-[#20D5A0]/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-[#20D5A0]" />
              </div>
              <h3 className="font-bold mb-2">Yerli İstifadəçilər</h3>
              <p className="text-sm text-muted-foreground">
                {city.name} və ətraf rayonlardan real, yoxlanılmış profillər.
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-2xl border border-border">
              <div className="w-14 h-14 rounded-full bg-[#FFB800]/10 flex items-center justify-center mx-auto mb-4">
                <Star className="w-7 h-7 text-[#FFB800]" />
              </div>
              <h3 className="font-bold mb-2">Pulsuz</h3>
              <p className="text-sm text-muted-foreground">
                Qeydiyyat və əsas funksiyalar tamamilə pulsuzdur. Heç bir gizli ödəniş yoxdur.
              </p>
            </div>
          </div>
        </section>

        {/* How to Start */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">{city.nameLocative} Tanışlığa Necə Başlamaq Olar?</h2>
          <div className="space-y-4">
            {[
              { step: "1", title: "Pulsuz qeydiyyatdan keçin", desc: `Danyeri-də qeydiyyat tamamilə pulsuzdur. ${city.name} şəhərini profil məlumatlarınızda göstərin.` },
              { step: "2", title: "Profilinizi doldurun", desc: "Şəkil əlavə edin, maraqlarınız və dəyərləriniz haqqında yazın. Tam profillər daha çox diqqət çəkir." },
              { step: "3", title: `${city.nameLocative} axtarış edin`, desc: `${city.name} və ətraf ərazilərdəki istifadəçiləri kəşf edin. Filtrasiya ilə ən uyğun insanları tapın.` },
              { step: "4", title: "Söhbətə başlayın", desc: "Qarşılıqlı maraq olduqda mesaj göndərin. Təhlükəsiz mühitdə bir-birinizi tanıyın." },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4 bg-card rounded-2xl p-5 border border-border">
                <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-3xl p-8 md:p-12 border border-primary/30 mb-16">
          <h2 className="text-2xl font-bold mb-4">{city.nameLocative} Həyat Yoldaşınızı Tapın</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {city.name} şəhərində minlərlə insan Danyeri-də ciddi münasibət axtarır. Bu gün qoşulun!
          </p>
          <Link 
            href="/sign-up"
            className="gradient-brand text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
          >
            <Heart className="w-5 h-5" />
            Pulsuz Qeydiyyat
          </Link>
        </section>

        {/* Other Cities - Internal Linking */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">Digər Şəhərlərdə Tanışlıq</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {otherCities.map((otherCity) => (
              <Link 
                key={otherCity.slug}
                href={`/tanisliq/${otherCity.slug}`}
                className="group"
              >
                <div className="bg-card rounded-xl p-3 border border-border hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span className="text-sm font-medium">{otherCity.nameLocative}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/tanisliq" className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1">
              Bütün şəhərlərə bax <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* SEO Footer */}
        <footer className="pt-8 border-t border-border">
          <div className="text-center space-y-4">
            <h3 className="font-semibold">{city.nameLocative} Tanışlıq - Danyeri</h3>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {city.nameLocative} ciddi tanışlıq və evlilik üçün Danyeri tətbiqinə qoşulun. 
              {city.name}, Azərbaycanın ən gözəl şəhərlərindən biridir və burada yaşayan insanlar üçün 
              Danyeri ən etibarlı tanışlıq platformasıdır. Pulsuz qeydiyyat olun, 
              {city.nameLocative.toLowerCase()} həyat yoldaşınızı tapın.
            </p>
            <nav className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/" className="text-primary hover:underline">Ana Səhifə</Link>
              <Link href="/tanisliq" className="text-primary hover:underline">Tanışlıq</Link>
              <Link href="/about" className="text-primary hover:underline">Haqqımızda</Link>
              <Link href="/sign-up" className="text-primary hover:underline">Qeydiyyat</Link>
            </nav>
          </div>
        </footer>
      </main>
    </div>
  );
}
