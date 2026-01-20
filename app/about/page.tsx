"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Shield, Users, Sparkles, Home, BookOpen, Lock, MessageCircle, Award, Target, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutPage() {
  const { language } = useLanguage();

  const content = {
    az: {
      title: "Missiyamız",
      subtitle: "Danyeri haqqında",
      heroTitle: "Sevgi üçün təhlükəsiz bir məkan",
      heroDesc: "Biz inanırıq ki, hər kəs səmimi, hörmətli və mənalı münasibətlərə layiqdir. Danyeri, Azərbaycan cəmiyyətinin dəyərlərinə hörmət edərək, insanları bir-birinə yaxınlaşdırmaq üçün yaradılıb.",
      
      problemTitle: "Problemi Anlayırıq",
      problemDesc: "Müasir Azərbaycanda gənclər arasında tanışlıq, evlilik və sağlam münasibət qurmaq getdikcə çətinləşir. Sosial təzyiqlər, iş tempi, və ənənəvi tanışlıq yollarının azalması insanları tənha qoyur. Biz bu boşluğu doldurmaq üçün buradayıq.",
      
      valuesTitle: "Dəyərlərimiz",
      values: [
        {
          icon: Shield,
          title: "Təhlükəsizlik və Hörmət",
          desc: "Hər bir istifadəçinin rahatlığı və təhlükəsizliyi bizim üçün önəmlidir. Ədəbsiz davranışlara qarşı sıfır tolerantlıq siyasəti tətbiq edirik."
        },
        {
          icon: Heart,
          title: "Səmimi Münasibətlər",
          desc: "Səthi tanışlıqlar yox, dərin, mənalı əlaqələr qurmağa kömək edirik. Dəyərləriniz, maraqlarınız və ünsiyyət tərziniz əsasında uyğunluq tapırıq."
        },
        {
          icon: Home,
          title: "Ailə Dəyərləri",
          desc: "Azərbaycan ailəsinin möhkəmliyinə inanırıq. Məqsədimiz, gələcəkdə sağlam ailələr quracaq insanları bir araya gətirməkdir."
        },
        {
          icon: Lock,
          title: "Məxfilik",
          desc: "Şəxsi məlumatlarınız bizimlə təhlükəsizdir. Heç vaxt üçüncü tərəflərlə paylaşılmır və tam nəzarət sizdədir."
        }
      ],

      commitmentTitle: "Cəmiyyətə Öhdəliyimiz",
      commitments: [
        {
          icon: Target,
          title: "Ciddi Niyyətlər",
          desc: "Platformamız ciddi münasibət axtaran insanlar üçündür. Səthi əyləncə yox, gələcək qurmaq istəyənlər üçün."
        },
        {
          icon: Users,
          title: "İcma Dəstəyi",
          desc: "Münasibət bacarıqlarını inkişaf etdirmək üçün resurslar, məsləhətlər və dəstək təmin edirik."
        },
        {
          icon: Handshake,
          title: "Kültürümüzə Hörmət",
          desc: "Azərbaycan mədəniyyəti və ənənələrinə hörmətlə yanaşırıq. Danyeri, müasirlik və ənənə arasında körpü qurur."
        }
      ],

      statsTitle: "Təsir",
      stats: [
        { value: "100+", label: "Uğurlu Cütlük" },
        { value: "5K+", label: "Aktiv İstifadəçi" },
        { value: "98%", label: "Müsbət Rəy" },
      ],

      quoteTitle: "Fəlsəfəmiz",
      quote: "\"Güclü cəmiyyət güclü ailələrdən başlayır. Biz sadəcə bir tanışlıq tətbiqi deyilik – biz Azərbaycanın gələcəyinə investisiya edən bir hərəkatıq.\"",
      quoteAuthor: "— Danyeri Komandası",

      ctaTitle: "Bizə Qoşulun",
      ctaDesc: "Sağlam, hörmətli və mənalı münasibətlər üçün ilk addımı atın.",
      ctaButton: "Başla",
      
      footerNote: "Danyeri, Azərbaycanda yaradılıb və Azərbaycan üçün işləyir. 🇦🇿"
    },
    en: {
      title: "Our Mission",
      subtitle: "About Danyeri",
      heroTitle: "A safe space for love",
      heroDesc: "We believe everyone deserves sincere, respectful, and meaningful relationships. Danyeri was created to bring people closer while respecting the values of Azerbaijani society.",
      
      problemTitle: "Understanding the Problem",
      problemDesc: "In modern Azerbaijan, building friendships, marriages, and healthy relationships is becoming increasingly difficult for young people. Social pressures, work pace, and the decline of traditional meeting paths leave people feeling isolated. We're here to fill that gap.",
      
      valuesTitle: "Our Values",
      values: [
        {
          icon: Shield,
          title: "Safety and Respect",
          desc: "The comfort and safety of every user matters to us. We have zero tolerance for inappropriate behavior."
        },
        {
          icon: Heart,
          title: "Genuine Connections",
          desc: "Not superficial encounters, but deep, meaningful relationships. We match based on your values, interests, and communication style."
        },
        {
          icon: Home,
          title: "Family Values",
          desc: "We believe in the strength of the Azerbaijani family. Our goal is to bring together people who will build healthy families."
        },
        {
          icon: Lock,
          title: "Privacy",
          desc: "Your personal information is safe with us. Never shared with third parties, and you're always in control."
        }
      ],

      commitmentTitle: "Our Commitment to Society",
      commitments: [
        {
          icon: Target,
          title: "Serious Intentions",
          desc: "Our platform is for those seeking serious relationships. For building futures, not superficial entertainment."
        },
        {
          icon: Users,
          title: "Community Support",
          desc: "We provide resources, advice, and support for developing relationship skills."
        },
        {
          icon: Handshake,
          title: "Respecting Our Culture",
          desc: "We approach Azerbaijani culture and traditions with respect. Danyeri bridges modernity and tradition."
        }
      ],

      statsTitle: "Impact",
      stats: [
        { value: "100+", label: "Successful Couples" },
        { value: "5K+", label: "Active Users" },
        { value: "98%", label: "Positive Reviews" },
      ],

      quoteTitle: "Our Philosophy",
      quote: "\"Strong societies begin with strong families. We're not just a dating app – we're a movement investing in Azerbaijan's future.\"",
      quoteAuthor: "— The Danyeri Team",

      ctaTitle: "Join Us",
      ctaDesc: "Take the first step towards healthy, respectful, and meaningful relationships.",
      ctaButton: "Get Started",
      
      footerNote: "Danyeri is created in Azerbaijan, for Azerbaijan. 🇦🇿"
    }
  };

  const txt = content[language as "az" | "en"] || content.az;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="w-full max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg">{txt.subtitle}</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">{txt.title}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
            {txt.heroTitle}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {txt.heroDesc}
          </p>
        </motion.section>

        {/* Problem Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl p-8 border border-orange-500/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">{txt.problemTitle}</h2>
              <p className="text-muted-foreground leading-relaxed">{txt.problemDesc}</p>
            </div>
          </div>
        </motion.section>

        {/* Values Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-8 text-center">{txt.valuesTitle}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {txt.values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Commitment Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-8 text-center">{txt.commitmentTitle}</h2>
          <div className="space-y-4">
            {txt.commitments.map((commitment, index) => (
              <motion.div
                key={commitment.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-start gap-4 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl p-5 border border-primary/10"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <commitment.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{commitment.title}</h3>
                  <p className="text-muted-foreground text-sm">{commitment.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-8 text-center">{txt.statsTitle}</h2>
          <div className="grid grid-cols-3 gap-4">
            {txt.stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-pink-500/10 border border-primary/20"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Quote Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="text-xl font-bold mb-6">{txt.quoteTitle}</h2>
          <blockquote className="text-xl md:text-2xl font-medium italic text-muted-foreground max-w-2xl mx-auto mb-4">
            {txt.quote}
          </blockquote>
          <cite className="text-sm text-primary font-medium">{txt.quoteAuthor}</cite>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-3xl p-8 md:p-12 border border-primary/30"
        >
          <h2 className="text-2xl font-bold mb-4">{txt.ctaTitle}</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">{txt.ctaDesc}</p>
          <Link href="/discovery">
            <Button className="gradient-brand text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all">
              <Heart className="w-5 h-5 mr-2" />
              {txt.ctaButton}
            </Button>
          </Link>
        </motion.section>

        {/* Footer Note */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          {txt.footerNote}
        </motion.p>
      </main>
    </div>
  );
}
