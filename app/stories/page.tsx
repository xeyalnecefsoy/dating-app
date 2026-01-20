"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Quote, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export default function StoriesPage() {
  const { language } = useLanguage();

  const successStories = [
    {
      id: 1,
      names: language === 'az' ? "Aysel və Rəşad" : "Aysel & Rashad",
      quote: language === 'az' 
        ? "Biz ailə və dürüstlük kimi ortaq dəyərlərimiz ətrafında birləşdik. Ünsiyyət Simulyatoru mənə ilk görüşümüzdə özümə inamlı olmağa kömək etdi!" 
        : "We bonded over our shared values of family and honesty. The conversation simulator helped me feel confident during our first real date!",
      matchedOn: language === 'az' ? "Ailə, Dürüstlük" : "Shared core values: Family, Authenticity",
      location: "Bakı",
      duration: language === 'az' ? "8 aydır birlikdə" : "Together for 8 months"
    },
    {
      id: 2,
      names: language === 'az' ? "Leyla və Emil" : "Leyla & Emil",
      quote: language === 'az' 
        ? "Sadəcə bir tətbiq olduğunu düşündüyümüz yer, ən yaxın dostumu tapdığım yerə çevrildi. Şəkillərdən çox şəxsiyyətə önəm verilməsi hər şeyi dəyişdi."
        : "What we thought was just an app turned into finding my best friend. The focus on personality over photos made all the difference.",
      matchedOn: language === 'az' ? "Sevgi Dili: Keyfiyyətli Zaman" : "Love Language: Quality Time",
      location: "Sumqayıt",
      duration: language === 'az' ? "1 ildir birlikdə" : "Engaged!"
    },
    {
      id: 3,
      names: language === 'az' ? "Nigar və Kamran" : "Nigar & Kamran",
      quote: language === 'az'
        ? "Onlayn tanışlıqdan çəkinirdim, amma bacarıq inkişaf etdirmə xüsusiyyətləri mənə özümü ifadə etməyə kömək etdi. Məni həqiqətən anlayan birini tapdım."
        : "I was nervous about online dating, but the skill-building features helped me find my voice. Found someone who truly understands me.",
      matchedOn: language === 'az' ? "Ünsiyyət Tərzi: Empatik" : "Communication Style: Empathetic",
      location: "Gəncə",
      duration: language === 'az' ? "1 ildir birlikdə" : "Together for 1 year"
    },
    {
      id: 4,
      names: language === 'az' ? "Fidan və Tural" : "Fidan & Tural",
      quote: language === 'az'
        ? "Şəxsi inkişaf həvəsimi paylaşan biri ilə tanış olmaq xəyal idi. 'Buzqıran' suallar söhbətə başlamağı o qədər təbii etdi ki!"
        : "Meeting someone who shares my passion for personal growth was a dream. The icebreakers made starting conversations so natural!",
      matchedOn: language === 'az' ? "Maraq: Şəxsi İnkişaf" : "Interest: Personal Development",
      location: "Bakı",
      duration: language === 'az' ? "6 aydır birlikdə" : "Together for 6 months"
    }
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Background Gradient */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-5%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-[5%] left-[-5%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[90px]" 
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="hover:bg-secondary/40 rounded-full">
              <Link href="/">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary fill-primary" />
              <h1 className="text-xl font-serif font-semibold text-foreground">
                {language === 'az' ? 'Uğur Hekayələri' : 'Success Stories'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-medium text-foreground mb-6">
            {language === 'az' ? 'Real' : 'Real'} <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary font-bold">{language === 'az' ? 'Əlaqələr' : 'Connections'}</span>, {language === 'az' ? 'Real Hekayələr' : 'Real Stories'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {language === 'az' 
              ? 'Aura hər gün insanlara ortaq dəyərlər, anlayış və səmimi əlaqələrə əsaslanan mənalı münasibətlər qurmağa kömək edir.'
              : 'Every day, Aura Connect helps Azerbaijanis find meaningful relationships based on shared values, understanding, and genuine connection.'}
          </p>
        </motion.div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {successStories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden bg-card/60 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300 group h-full">
                <CardContent className="p-8 flex flex-col h-full">
                  {/* Quote Icon */}
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Quote className="w-5 h-5 text-primary" />
                  </div>
                  
                  {/* Quote */}
                  <blockquote className="text-lg text-foreground/80 leading-relaxed mb-6 italic flex-1">
                    "{story.quote}"
                  </blockquote>
                  
                  {/* Names */}
                  <div className="flex items-center justify-between mb-4 pt-4 border-t border-border">
                    <h3 className="text-xl font-serif font-semibold text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-secondary" />
                      {story.names}
                    </h3>
                    <span className="text-sm text-primary font-medium">{story.duration}</span>
                  </div>
                  
                  {/* Details */}
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><span className="font-medium">📍</span> {story.location}</p>
                    <p><span className="font-medium">💕</span> {story.matchedOn}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <h2 className="text-2xl font-serif font-medium text-foreground mb-4">
            {language === 'az' ? 'Öz hekayəni yazmağa hazırsan?' : 'Ready to write your own story?'}
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-0 transition-all hover:scale-105">
              <Link href="/discovery">
                {language === 'az' ? 'Kəşf etməyə başla' : 'Start Discovering'}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-primary/30 bg-background/40 backdrop-blur-sm text-foreground hover:bg-background/60">
              <Link href="/simulator">
                {language === 'az' ? 'Əvvəlcə Məşq Et' : 'Practice First'}
              </Link>
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
