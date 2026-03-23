import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Users, Shield, ChevronRight, Star, CheckCircle, HelpCircle } from "lucide-react";
import type { Metadata } from "next";
import { cities } from "@/lib/cities";
import { FAQStructuredData } from "@/components/StructuredData";

const faqItems = [
  {
    question: "Danyeri tətbiqində qeydiyyatdan keçmək ödənişlidirmi?",
    answer: "Xeyr, Danyeri tətbiqində qeydiyyatdan keçmək, profil yaratmaq və əsas funksiyalardan istifadə etmək tamamilə pulsuzdur. Bizim məqsədimiz Azərbaycanda ciddi münasibət qurmaq istəyən insanları bir araya gətirməkdir."
  },
  {
    question: "Danyeri necə ciddi tanışlıq tətbiqidir?",
    answer: "Bəli, tamamilə. Danyeri məhz Azərbaycanda ciddi münasibət və evlilik məqsədilə yaradılmış tətbiqdir. Sistemimiz sizin dəyərlərinizə və maraqlarınıza uyğun insanları qarşınıza çıxarması üçün xüsusi olaraq dizayn edilib."
  },
  {
    question: "Məxfilik və təhlükəsizlik necə qorunur?",
    answer: "Danyeri-də bütün profillər yoxlanışdan keçir. Təhqiramiz davranışlara qarşı sıfır tolerantlıq siyasətimiz var. Şəxsi məlumatlarınız və mesajlarınız tam olaraq qorunur."
  },
  {
    question: "Hansı şəhərlərdə tanışlıq mümkündür?",
    answer: "Danyeri bütün Azərbaycan ərazisində fəaliyyət göstərir. Bakı, Sumqayıt, Gəncə, Naxçıvan, Şəki, Lənkəran, Mingəçevir və digər bölgələrdən olan istifadəçilərlə tanış ola bilərsiniz."
  }
];

export const metadata: Metadata = {
  title: "Azərbaycanda Tanışlıq - Ciddi Münasibət və Evlilik Tətbiqi | Danyeri",
  description: "Azərbaycanda ən etibarlı online tanışlıq tətbiqi. Bakı, Gəncə, Sumqayıt və digər şəhərlərdə ciddi münasibət və evlilik üçün həyat yoldaşınızı tapın. Pulsuz qeydiyyat!",
  alternates: {
    canonical: "https://www.danyeri.az/tanisliq",
  },
  openGraph: {
    title: "Azərbaycanda Tanışlıq - Danyeri",
    description: "Azərbaycanda ciddi tanışlıq və evlilik üçün ən etibarlı tətbiq. Pulsuz qeydiyyat!",
    url: "https://www.danyeri.az/tanisliq",
    type: "website",
    locale: "az_AZ",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Danyeri - Azərbaycanda Tanışlıq",
      },
    ],
  },
  keywords: [
    "tanışlıq",
    "Azərbaycanda tanışlıq",
    "online tanışlıq",
    "tanışlıq tətbiqi",
    "tanışlıq saytı",
    "evlilik üçün tanışlıq",
    "ciddi münasibət",
    "pulsuz tanışlıq",
    "Azərbaycan tanışlıq proqramı",
    "həyat yoldaşı tapmaq",
    "evlənmək istəyirəm",
    "qız axtarıram",
    "oğlan axtarıram",
  ],
};

export default function TanisliqPage() {
  return (
    <div className="min-h-screen bg-background">
      <FAQStructuredData faq={faqItems} />
      
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="w-full max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 relative rounded-full overflow-hidden">
              <Image src="/logo.png" alt="Danyeri" fill className="object-cover" />
            </div>
            <span className="font-bold text-lg">Danyeri</span>
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
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Azərbaycanda #1 Tanışlıq Tətbiqi</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent leading-tight">
            Azərbaycanda Ciddi Tanışlıq və Evlilik
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Danyeri, Azərbaycanda ciddi münasibət və evlilik üçün yaradılmış ən etibarlı tanışlıq tətbiqidir. 
            Bakı, Gəncə, Sumqayıt və digər şəhərlərdə həyat yoldaşınızı tapın.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/sign-up"
              className="gradient-brand text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center gap-2"
            >
              Pulsuz Başla
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/about"
              className="bg-card border border-border px-8 py-4 rounded-xl text-lg font-semibold hover:bg-secondary transition-all inline-flex items-center justify-center gap-2"
            >
              Haqqımızda
            </Link>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-3 gap-4 mb-16">
          <div className="text-center p-6 rounded-2xl bg-card border border-border">
            <div className="text-3xl font-bold text-primary mb-1">5K+</div>
            <div className="text-sm text-muted-foreground">Aktiv İstifadəçi</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-card border border-border">
            <div className="text-3xl font-bold text-[#20D5A0] mb-1">100+</div>
            <div className="text-sm text-muted-foreground">Uğurlu Cütlük</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-card border border-border">
            <div className="text-3xl font-bold text-[#FFB800] mb-1">98%</div>
            <div className="text-sm text-muted-foreground">Müsbət Rəy</div>
          </div>
        </section>

        {/* Why Danyeri Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Niyə Danyeri?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Təhlükəsiz Mühit</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Bütün profillər yoxlanılır. Ədəbsiz davranışlara qarşı sıfır tolerantlıq siyasəti ilə 
                tam təhlükəsiz tanışlıq mühiti təmin edirik.
              </p>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="w-12 h-12 rounded-xl bg-[#20D5A0]/10 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-[#20D5A0]" />
              </div>
              <h3 className="font-bold text-lg mb-2">Ciddi Münasibətlər</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Danyeri, səthi tanışlıqlar üçün deyil. Ciddi münasibət və evlilik üçün 
                dəyərlərinizə uyğun insanları tapırsınız.
              </p>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="w-12 h-12 rounded-xl bg-[#FFB800]/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[#FFB800]" />
              </div>
              <h3 className="font-bold text-lg mb-2">Azərbaycan Üçün</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Azərbaycan mədəniyyətinə və ailə dəyərlərinə hörmət edən, yerli insanlar üçün 
                xüsusi hazırlanmış platform.
              </p>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">Ağıllı Uyğunlaşdırma</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Maraqlarınız, dəyərləriniz və ünsiyyət tərziniz əsasında ən uyğun insanları 
                sizə təqdim edirik.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Necə İşləyir?</h2>
          <div className="space-y-6">
            {[
              { step: "1", title: "Pulsuz Qeydiyyat", desc: "Bir neçə dəqiqə ərzində profilinizi yaradın. E-poçt və ya telefon nömrənizlə qeydiyyatdan keçin." },
              { step: "2", title: "Profilinizi Doldurun", desc: "Maraqlarınız, dəyərləriniz və gözləntiləriniz haqqında məlumat əlavə edin. Şəkillərinizi yükləyin." },
              { step: "3", title: "Kəşf Edin", desc: "Sizə uyğun insanları kəşf edin, bəyənin və qarşılıqlı maraq olduqda söhbətə başlayın." },
              { step: "4", title: "Tanış Olun", desc: "Mesajlaşın, bir-birinizi tanıyın və mənalı münasibət qurun." },
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

        {/* Features Checklist */}
        <section className="mb-16 bg-gradient-to-br from-primary/10 to-pink-500/10 rounded-3xl p-8 border border-primary/20">
          <h2 className="text-2xl font-bold mb-6 text-center">Danyeri-nin Xüsusiyyətləri</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "Pulsuz qeydiyyat və istifadə",
              "Yoxlanılmış profillər",
              "Təhlükəsiz mesajlaşma",
              "Ağıllı uyğunlaşdırma sistemi",
              "AI ünsiyyət simulyatoru",
              "Azərbaycan dilində tam dəstək",
              "Bütün şəhərlərdə mövcud",
              "Ciddi münasibət fokuslu",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 py-2">
                <CheckCircle className="w-5 h-5 text-[#20D5A0] shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </section>

        {/* City Links Section - Critical for SEO */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4 text-center">Şəhərlər Üzrə Tanışlıq</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-lg mx-auto">
            Azərbaycanın bütün böyük şəhərlərində aktiv istifadəçilərimiz var. 
            Sizə ən yaxın şəhəri seçin:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {cities.map((city) => (
              <Link 
                key={city.slug} 
                href={`/tanisliq/${city.slug}`}
                className="group"
              >
                <div className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-all group-hover:shadow-lg group-hover:shadow-primary/5">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">{city.nameLocative}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{city.nameLocative} tanışlıq</p>
                  <div className="flex items-center gap-1 mt-2 text-primary">
                    <span className="text-xs font-medium">Daha ətraflı</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Tez-tez Verilən Suallar</h2>
            <p className="text-muted-foreground">Azərbaycanda ciddi tanışlıq tətbiqi haqqında maraqlandıran suallar.</p>
          </div>
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqItems.map((faq, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-bold flex items-start gap-3 mb-2">
                  <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed pl-8">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-3xl p-8 md:p-12 border border-primary/30">
          <h2 className="text-2xl font-bold mb-4">Həyat Yoldaşınızı Bu Gün Tapın</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Azərbaycanda minlərlə insan Danyeri-də ciddi münasibət axtarır. Siz də qoşulun!
          </p>
          <Link 
            href="/sign-up"
            className="gradient-brand text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
          >
            <Heart className="w-5 h-5" />
            Pulsuz Qeydiyyat
          </Link>
        </section>

        {/* SEO Footer Content */}
        <footer className="mt-16 pt-8 border-t border-border">
          <div className="text-center space-y-4">
            <h3 className="font-semibold text-lg">Azərbaycanda Tanışlıq - Danyeri</h3>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Danyeri, Azərbaycanda ciddi tanışlıq və evlilik üçün yaradılmış platformadır. 
              Online tanışlıq saytı olaraq, Bakıda tanışlıq, Gəncədə tanışlıq, Sumqayıtda tanışlıq, 
              Xankəndidə tanışlıq, Mingəçevirdə tanışlıq, Lənkəranda tanışlıq, Şəkidə tanışlıq 
              və Naxçıvanda tanışlıq imkanları təqdim edirik. Pulsuz qeydiyyat olun və 
              Azərbaycanda ən etibarlı tanışlıq tətbiqi ilə həyat yoldaşınızı tapın.
            </p>
            <nav className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/" className="text-primary hover:underline">Ana Səhifə</Link>
              <Link href="/about" className="text-primary hover:underline">Haqqımızda</Link>
              <Link href="/sign-up" className="text-primary hover:underline">Qeydiyyat</Link>
              <Link href="/sign-in" className="text-primary hover:underline">Daxil Ol</Link>
            </nav>
            <p className="text-xs text-muted-foreground">
              Danyeri - Azərbaycanda yaradılıb, Azərbaycan üçün işləyir.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
