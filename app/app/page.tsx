"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Smartphone, Sparkles, Bell, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MobileAppLandingPage() {
  const { language } = useLanguage();

  const txt = {
    title: language === 'az' ? 'Danyeri İndi Cibinizdə' : 'Danyeri in Your Pocket',
    subtitle: language === 'az' ? 'Yaxında Google Play Store-da' : 'Coming Soon to Google Play Store',
    description: language === 'az' 
      ? 'Azərbaycanın qabaqcıl tanışlıq platforması danyeri mobil cihazlara gəlir. Yeni insanlarla tanış olmaq heç vaxt bu qədər asan və əyləncəli olmamışdı. Qaranlıq rejim, mükəmməl sürüşdürmə animasiyaları və canlı mesajlaşma ilə tanışlığın yeni səviyyəsinə hazır olun.'
      : 'Azerbaijan\'s premier dating platform is coming to mobile. Meeting new people has never been this easy and fun. Get ready for a new level of dating with dark mode, perfect swipe animations, and live messaging.',
    cta: language === 'az' ? 'Çox Yaxında' : 'Coming Very Soon',
    featuresTitle: language === 'az' ? 'Niyə Mobile?' : 'Why Mobile?',
    featuresSubtitle: language === 'az' ? 'Mobil tətbiqimizlə daha sürətli və daha immersiv təcrübə' : 'A faster, more immersive experience with our mobile app',
    feat1Title: language === 'az' ? 'Axıcı Sürüşdürmə' : 'Fluid Swiping',
    feat1Desc: language === 'az' ? 'Mükəmməl idarəetmə və animasiyalarla daha əyləncəli və sürətli kəşf təcrübəsi.' : 'A more fun and faster discovery experience with perfect controls and animations.',
    feat2Title: language === 'az' ? 'Canlı Mesajlaşma' : 'Live Messaging',
    feat2Desc: language === 'az' ? 'Dərhal gələn bildirişlərlə (Push) heç bir önəmli mesajı qaçırmayın.' : 'Never miss an important message with instant push notifications.',
    feat3Title: language === 'az' ? 'Premium Təcrübə' : 'Premium Experience',
    feat3Desc: language === 'az' ? 'Qaranlıq rejim və göz yormayan xüsusi rəng palitrası ilə uzun müddətli istifadə.' : 'Long-term usage comfort with dark mode and an eye-catching custom color palette.',
  };

  return (
    <div className="min-h-screen flex flex-col items-center overflow-x-hidden pt-4 sm:pt-10 bg-background text-foreground">
      <main className="flex-1 w-full flex flex-col relative pb-20">
        
        {/* Abstract Background Elements (Matching Native Colors) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#FD267A]/10 blur-[150px]" />
        </div>

        {/* Hero Section */}
        <div className="w-full max-w-6xl mx-auto px-6 py-12 md:py-24 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 flex flex-col gap-6 text-center lg:text-left z-10 w-full"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit mx-auto lg:mx-0 border border-border bg-card shadow-sm">
              <Smartphone className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{txt.subtitle}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black drop-shadow-sm leading-tight">
              {txt.title}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {txt.description}
            </p>

            {/* Simple static CTA badge instead of a form */}
            <div className="mt-4 flex justify-center lg:justify-start">
               <div className="inline-flex items-center justify-center gap-3 h-14 px-8 rounded-2xl font-bold bg-muted text-muted-foreground border border-border cursor-default select-none shadow-sm">
                 <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                 </span>
                 {txt.cta}
               </div>
            </div>
          </motion.div>

          {/* Device Mockups */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 relative w-full aspect-square md:aspect-[4/3] lg:aspect-square z-10 hidden md:block"
          >
            {/* Background Glow behind phones */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-[#FD267A]/20 blur-[80px] rounded-full" />
            
            <div className="relative w-full h-full flex items-center justify-center">
               <Image 
                 src="/app-mockup-1.png"
                 alt="Danyeri App Mockup"
                 fill
                 className="object-contain drop-shadow-2xl z-20 scale-100 lg:scale-105"
                 priority
               />
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="w-full bg-card/50 border-y border-border py-20 mt-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FF4458] to-[#FD267A] bg-clip-text text-transparent">
                {txt.featuresTitle}
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">{txt.featuresSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-card p-8 rounded-3xl border border-border shadow-sm flex flex-col items-center text-center transition-all hover:border-primary/50">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{txt.feat1Title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{txt.feat1Desc}</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-card p-8 rounded-3xl border border-border shadow-sm flex flex-col items-center text-center transition-all hover:border-primary/50">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Bell className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{txt.feat2Title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{txt.feat2Desc}</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-card p-8 rounded-3xl border border-border shadow-sm flex flex-col items-center text-center transition-all hover:border-primary/50">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{txt.feat3Title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{txt.feat3Desc}</p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
