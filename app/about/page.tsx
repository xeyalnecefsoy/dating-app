import React from "react";
import Link from "next/link";
import { Heart, Shield, Users, Sparkles, Home, BookOpen, Lock, Target, Handshake } from "lucide-react";
import { FadeInSection, FadeInDiv, SlideInDiv, ScaleInDiv, FadeInP } from "@/components/AboutAnimations";
import { AboutBackButton, AboutCTAButton } from "./client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Haqqımızda - Danyeri | Azərbaycanda Ciddi Tanışlıq Tətbiqi",
  description: "Danyeri Azərbaycanda ciddi tanışlıq və evlilik üçün yaradılmış etibarlı platformadır. Missiyamız, dəyərlərimiz və Azərbaycan ailəsinə töhfəmiz haqqında ətraflı oxuyun.",
  alternates: {
    canonical: "https://www.danyeri.az/about",
  },
  openGraph: {
    title: "Haqqımızda - Danyeri",
    description: "Azərbaycanda ciddi tanışlıq və evlilik platforması. Missiyamız və dəyərlərimiz.",
    url: "https://www.danyeri.az/about",
  },
};

const values = [
  {
    Icon: Shield,
    title: "Təhlükəsizlik və Hörmət",
    desc: "Hər bir istifadəçinin rahatlığı və təhlükəsizliyi bizim üçün önəmlidir. Ədəbsiz davranışlara qarşı sıfır tolerantlıq siyasəti tətbiq edirik."
  },
  {
    Icon: Heart,
    title: "Səmimi Münasibətlər",
    desc: "Səthi tanışlıqlar yox, dərin, mənalı əlaqələr qurmağa kömək edirik. Dəyərləriniz, maraqlarınız və ünsiyyət tərziniz əsasında uyğunluq tapırıq."
  },
  {
    Icon: Home,
    title: "Ailə Dəyərləri",
    desc: "Azərbaycan ailəsinin möhkəmliyinə inanırıq. Məqsədimiz, gələcəkdə sağlam ailələr quracaq insanları bir araya gətirməkdir."
  },
  {
    Icon: Lock,
    title: "Məxfilik",
    desc: "Şəxsi məlumatlarınız bizimlə təhlükəsizdir. Heç vaxt üçüncü tərəflərlə paylaşılmır və tam nəzarət sizdədir."
  }
];

const commitments = [
  {
    Icon: Target,
    title: "Ciddi Niyyətlər",
    desc: "Platformamız ciddi münasibət axtaran insanlar üçündür. Səthi əyləncə yox, gələcək qurmaq istəyənlər üçün."
  },
  {
    Icon: Users,
    title: "İcma Dəstəyi",
    desc: "Münasibət bacarıqlarını inkişaf etdirmək üçün resurslar, məsləhətlər və dəstək təmin edirik."
  },
  {
    Icon: Handshake,
    title: "Kültürümüzə Hörmət",
    desc: "Azərbaycan mədəniyyəti və ənənələrinə hörmətlə yanaşırıq. Danyeri, müasirlik və ənənə arasında körpü qurur."
  }
];

const stats = [
  { value: "100+", label: "Uğurlu Cütlük" },
  { value: "5K+", label: "Aktiv İstifadəçi" },
  { value: "98%", label: "Müsbət Rəy" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="w-full max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <AboutBackButton />
          <h1 className="font-bold text-lg">Danyeri haqqında</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* Hero Section */}
        <FadeInSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Missiyamız</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
            Sevgi üçün təhlükəsiz bir məkan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Biz inanırıq ki, hər kəs səmimi, hörmətli və mənalı münasibətlərə layiqdir. 
            Danyeri, Azərbaycan cəmiyyətinin dəyərlərinə hörmət edərək, insanları bir-birinə yaxınlaşdırmaq üçün yaradılıb.
          </p>
        </FadeInSection>

        {/* Problem Section */}
        <FadeInSection delay={0.1} className="mb-16 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl p-8 border border-orange-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Problemi Anlayırıq</h3>
              <p className="text-muted-foreground leading-relaxed">
                Müasir Azərbaycanda gənclər arasında tanışlıq, evlilik və sağlam münasibət qurmaq getdikcə çətinləşir. 
                Sosial təzyiqlər, iş tempi, və ənənəvi tanışlıq yollarının azalması insanları tənha qoyur. 
                Biz bu boşluğu doldurmaq üçün buradayıq.
              </p>
            </div>
          </div>
        </FadeInSection>

        {/* Values Section */}
        <FadeInSection delay={0.2} className="mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center">Dəyərlərimiz</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <FadeInDiv
                key={value.title}
                delay={0.1 * index}
                className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <value.Icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold text-lg mb-2">{value.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.desc}</p>
              </FadeInDiv>
            ))}
          </div>
        </FadeInSection>

        {/* Commitment Section */}
        <FadeInSection delay={0.3} className="mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center">Cəmiyyətə Öhdəliyimiz</h3>
          <div className="space-y-4">
            {commitments.map((commitment, index) => (
              <SlideInDiv
                key={commitment.title}
                delay={0.1 * index}
                className="flex items-start gap-4 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl p-5 border border-primary/10"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <commitment.Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{commitment.title}</h4>
                  <p className="text-muted-foreground text-sm">{commitment.desc}</p>
                </div>
              </SlideInDiv>
            ))}
          </div>
        </FadeInSection>

        {/* Stats Section */}
        <FadeInSection delay={0.4} className="mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center">Təsir</h3>
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <ScaleInDiv
                key={stat.label}
                delay={0.1 * index}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-pink-500/10 border border-primary/20"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </ScaleInDiv>
            ))}
          </div>
        </FadeInSection>

        {/* Quote Section */}
        <FadeInSection delay={0.5} className="mb-16 text-center">
          <h3 className="text-xl font-bold mb-6">Fəlsəfəmiz</h3>
          <blockquote className="text-xl md:text-2xl font-medium italic text-muted-foreground max-w-2xl mx-auto mb-4">
            &quot;Güclü cəmiyyət güclü ailələrdən başlayır. Biz sadəcə bir tanışlıq tətbiqi deyilik – biz Azərbaycanın gələcəyinə investisiya edən bir hərəkatıq.&quot;
          </blockquote>
          <cite className="text-sm text-primary font-medium not-italic">— Danyeri Komandası</cite>
        </FadeInSection>

        {/* CTA Section */}
        <FadeInSection delay={0.6} className="text-center bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-3xl p-8 md:p-12 border border-primary/30">
          <h3 className="text-2xl font-bold mb-4">Bizə Qoşulun</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Sağlam, hörmətli və mənalı münasibətlər üçün ilk addımı atın.
          </p>
          <AboutCTAButton />
        </FadeInSection>

        {/* Footer Note */}
        <FadeInP delay={0.7} className="text-center text-sm text-muted-foreground mt-12">
          Danyeri, Azərbaycanda yaradılıb və Azərbaycan üçün işləyir.
        </FadeInP>

        {/* SEO Hidden Content */}
        <div className="sr-only">
          <p>
            Danyeri, Azərbaycanda ciddi tanışlıq və evlilik üçün yaradılmış platformadır. 
            Bakı, Gəncə, Sumqayıt, Mingəçevir, Lənkəran, Şəki, Naxçıvan və digər şəhərlərdə 
            tanışlıq imkanları təqdim edirik. Azərbaycanda ən etibarlı tanışlıq tətbiqi olaraq, 
            pulsuz qeydiyyat və təhlükəsiz mühit təmin edirik.
          </p>
        </div>
      </main>
    </div>
  );
}
