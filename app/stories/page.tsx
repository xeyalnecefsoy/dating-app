"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Quote, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function StoriesPage() {
  const { language } = useLanguage();

  const successStories = [
    {
      id: 1,
      names: language === "az" ? "Aysel və Rəşad" : "Aysel & Rashad",
      quote:
        language === "az"
          ? "Biz ailə və dürüstlük kimi ortaq dəyərlər ətrafında birləşdik. Ünsiyyət Simulyatoru mənə ilk görüşümüzdə özümə inamlı olmağa kömək etdi!"
          : "We bonded over our shared values of family and honesty. The conversation simulator helped me feel confident during our first real date!",
      matchedOn:
        language === "az" ? "Ailə, Dürüstlük" : "Shared core values: Family, Authenticity",
      location: "Bakı",
      duration: language === "az" ? "8 aydır birlikdə" : "Together for 8 months",
      featured: true,
    },
    {
      id: 2,
      names: language === "az" ? "Leyla və Emil" : "Leyla & Emil",
      quote:
        language === "az"
          ? "Sadəcə bir tətbiq olduğunu düşündüyümüz yer, ən yaxın dostumu tapdığım yerə çevrildi. Şəkillərdən çox şəxsiyyətə önəm verilməsi hər şeyi dəyişdi."
          : "What we thought was just an app turned into finding my best friend. The focus on personality over photos made all the difference.",
      matchedOn:
        language === "az" ? "Sevgi Dili: Keyfiyyətli Zaman" : "Love Language: Quality Time",
      location: "Sumqayıt",
      duration: language === "az" ? "1 ildir birlikdə" : "Engaged!",
      featured: false,
    },
    {
      id: 3,
      names: language === "az" ? "Nigar və Kamran" : "Nigar & Kamran",
      quote:
        language === "az"
          ? "Onlayn tanışlıqdan çəkinirdim, amma bacarıq inkişaf etdirmə xüsusiyyətləri mənə özümü ifadə etməyə kömək etdi. Məni həqiqətən anlayan birini tapdım."
          : "I was nervous about online dating, but the skill-building features helped me find my voice. Found someone who truly understands me.",
      matchedOn:
        language === "az" ? "Ünsiyyət Tərzi: Empatik" : "Communication Style: Empathetic",
      location: "Gəncə",
      duration: language === "az" ? "1 ildir birlikdə" : "Together for 1 year",
      featured: false,
    },
    {
      id: 4,
      names: language === "az" ? "Fidan və Tural" : "Fidan & Tural",
      quote:
        language === "az"
          ? "Şəxsi inkişaf həvəsimi paylaşan biri ilə tanış olmaq xəyal idi. 'Buzqıran' suallar söhbətə başlamağı o qədər təbii etdi ki!"
          : "Meeting someone who shares my passion for personal growth was a dream. The icebreakers made starting conversations so natural!",
      matchedOn:
        language === "az" ? "Maraq: Şəxsi İnkişaf" : "Interest: Personal Development",
      location: "Bakı",
      duration: language === "az" ? "6 aydır birlikdə" : "Together for 6 months",
      featured: false,
    },
  ];

  const featured = successStories.find((s) => s.featured) ?? successStories[0];
  const rest = successStories.filter((s) => s.id !== featured.id);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Subtle background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-primary/[0.03] rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full shrink-0"
            aria-label={language === "az" ? "Geri" : "Back"}
          >
            <Link href="/">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <Heart className="w-5 h-5 text-primary fill-primary shrink-0" />
            <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
              {language === "az" ? "Uğur Hekayələri" : "Success Stories"}
            </h1>
          </div>
          <div className="w-10 shrink-0" />
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground mb-3">
            {language === "az" ? "Real " : "Real "}
            <span className="text-primary">
              {language === "az" ? "əlaqələr" : "connections"}
            </span>
            {language === "az" ? ", real hekayələr" : ", real stories"}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {language === "az"
              ? "Danyeri hər gün insanlara ortaq dəyərlər ətrafında mənalı münasibətlər qurmağa kömək edir."
              : "Every day Danyeri helps people build meaningful relationships around shared values."}
          </p>
        </motion.section>

        {/* Featured story */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 sm:mb-10"
        >
          <div className="rounded-2xl sm:rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden shadow-lg">
            <div className="p-6 sm:p-8 md:p-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Quote className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <blockquote className="text-base sm:text-lg text-foreground/90 leading-relaxed italic">
                    &ldquo;{featured.quote}&rdquo;
                  </blockquote>
                  <div className="mt-5 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-semibold text-foreground">{featured.names}</span>
                    </div>
                    <span className="text-sm text-primary font-medium">{featured.duration}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>📍 {featured.location}</span>
                    <span>💕 {featured.matchedOn}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.article>

        {/* More stories grid */}
        <section className="space-y-4 sm:space-y-5">
          {rest.map((story, index) => (
            <motion.article
              key={story.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 + index * 0.06 }}
              className="rounded-xl sm:rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden hover:border-primary/20 hover:bg-card/80 transition-colors"
            >
              <div className="flex gap-3 sm:gap-4 p-4 sm:p-5">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Quote className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base text-foreground/85 leading-relaxed line-clamp-3">
                    &ldquo;{story.quote}&rdquo;
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-foreground text-sm">{story.names}</span>
                    <span className="text-xs text-primary">{story.duration}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    📍 {story.location} · {story.matchedOn}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-12 sm:mt-16 text-center"
        >
          <p className="text-foreground font-medium mb-6">
            {language === "az" ? "Öz hekayəni yazmağa hazırsan?" : "Ready to write your own story?"}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-12 px-8 rounded-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              <Link href="/discovery">
                {language === "az" ? "Kəşf etməyə başla" : "Start discovering"}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 px-8 rounded-full border-border bg-background/50"
            >
              <Link href="/simulator">
                {language === "az" ? "Əvvəlcə məşq et" : "Practice first"}
              </Link>
            </Button>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
