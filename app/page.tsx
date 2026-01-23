"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, Heart, MessageCircle, User, Compass, Sparkles, ChevronRight, Star, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { BottomNav } from "@/components/Navigation";

export default function HomePage() {
  const { user, isOnboarded } = useUser();
  const { t, language } = useLanguage();

  // Text translations
  const txt = {
    welcome: language === 'az' ? 'Xoş Gəldiniz' : 'Welcome',
    findPeople: language === 'az' ? 'Yeni insanlar tap' : 'Find new people',
    matches: language === 'az' ? 'uyğunluq' : 'matches',
    likesSent: language === 'az' ? 'Göndərilən Bəyənmə' : 'Likes Sent',
    matchesLabel: language === 'az' ? 'Uyğunluqlar' : 'Matches',
    badges: language === 'az' ? 'Nişanlar' : 'Badges',
    improveSkills: language === 'az' ? 'Bacarıqlarını İnkişaf Etdir' : 'Improve Your Skills',
    seeAll: language === 'az' ? 'Hamısını gör' : 'See all',
    commSimulator: language === 'az' ? 'Ünsiyyət Simulyatoru' : 'Communication Simulator',
    practiceAI: language === 'az' ? 'AI ilə söhbət bacarıqlarını məşq et' : 'Practice conversation skills with AI',
    successStories: language === 'az' ? 'Uğur Hekayələri' : 'Success Stories',
    togetherMonths: language === 'az' ? 'Birlikdə 8 ay' : 'Together 8 months',
    todaysQuestion: language === 'az' ? 'Günün Sualı' : "Today's question",
    dailyTitle: language === 'az' ? 'Günün Sualı' : 'Question of the Day',
  };

  // If not onboarded, show welcome screen
  if (!isOnboarded) {
    return <WelcomeScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="w-full max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="md:hidden flex items-center gap-2"> {/* Only show logo strictly on mobile if sidebar is hidden, or show always but hide on desktop if sidebar handles it? Sidebar handles it on desktop. */}
             <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
               <Flame className="w-5 h-5 text-white" />
             </div>
             <span className="font-bold text-lg">Danyeri</span>
          </div>
          <div className="hidden md:block text-xl font-bold">{txt.welcome}</div> {/* Show Welcome on desktop header */}
          
          <div className="flex items-center gap-3 ml-auto">
             {user && user.streak > 0 && (
              <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-full mr-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold">{user.streak}</span>
              </div>
            )}
            
            <Link href="/notifications" className="relative mr-2">
              <div className="w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
                <div className="relative">
                  <Bell className="w-5 h-5 text-foreground" />
                  {((user?.unreadMatches?.length || 0) + (user?.messageRequests?.filter(id => !user?.seenMessageRequests?.includes(id)).length || 0)) > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center border-2 border-background">
                      {((user?.unreadMatches?.length || 0) + (user?.messageRequests?.filter(id => !user?.seenMessageRequests?.includes(id)).length || 0))}
                    </span>
                  )}
                </div>
              </div>
            </Link>


          </div>
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto px-4 py-6 pb-24">
        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-3 mb-8">
          <Link href="/discovery">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden rounded-2xl bg-card border border-border p-5 h-32"
            >
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full gradient-brand flex items-center justify-center opacity-90">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div className="absolute bottom-4 left-4">
                <h3 className="font-bold text-lg">{language === 'az' ? 'Kəşf Et' : 'Discover'}</h3>
                <p className="text-sm text-muted-foreground">{txt.findPeople}</p>
              </div>
            </motion.div>
          </Link>
          
          <Link href="/messages">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden rounded-2xl bg-card border border-border p-5 h-32"
            >
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-[#20D5A0] flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              {user && user.matches.length > 0 && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center">
                  {user.matches.length}
                </div>
              )}
              <div className="absolute bottom-4 left-4">
                <h3 className="font-bold text-lg">{language === 'az' ? 'Mesajlar' : 'Messages'}</h3>
                <p className="text-sm text-muted-foreground">{user?.matches.length || 0} {txt.matches}</p>
              </div>
            </motion.div>
          </Link>
        </section>

        {/* Stats Row */}
        <section className="flex items-center justify-between bg-card rounded-2xl border border-border p-2 mb-8">
          <Link href="/likes" className="flex-1">
            <div className="text-center py-2 rounded-xl transition-colors hover:bg-secondary/50 active:scale-95 cursor-pointer">
              <div className="text-2xl font-bold text-primary">{user?.likes.length || 0}</div>
              <div className="text-xs text-muted-foreground">{txt.likesSent}</div>
            </div>
          </Link>
          <div className="w-px h-8 bg-border mx-1" />
          <Link href="/matches" className="flex-1">
            <div className="text-center py-2 rounded-xl transition-colors hover:bg-secondary/50 active:scale-95 cursor-pointer">
              <div className="text-2xl font-bold text-[#20D5A0]">{user?.matches.length || 0}</div>
              <div className="text-xs text-muted-foreground">{txt.matchesLabel}</div>
            </div>
          </Link>
          <div className="w-px h-8 bg-border mx-1" />
          <Link href="/profile" className="flex-1">
            <div className="text-center py-2 rounded-xl transition-colors hover:bg-secondary/50 active:scale-95 cursor-pointer">
              <div className="text-2xl font-bold text-[#FFB800]">{user?.badges.length || 0}</div>
              <div className="text-xs text-muted-foreground">{txt.badges}</div>
            </div>
          </Link>
        </section>

        {/* Practice Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">{txt.improveSkills}</h2>
            <Link href="/simulator" className="text-sm text-primary flex items-center">
              {txt.seeAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <Link href="/simulator">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="rounded-2xl bg-card border border-border p-5 flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{txt.commSimulator}</h3>
                <p className="text-sm text-muted-foreground">{txt.practiceAI}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </Link>
        </section>

        {/* Daily Question */}
        <section className="mb-8">
          <h2 className="font-bold text-lg mb-4">{txt.dailyTitle}</h2>
          <DailyQuestionMini language={language} />
        </section>

        {/* Success Stories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">{txt.successStories}</h2>
            <Link href="/stories" className="text-sm text-primary flex items-center">
              {txt.seeAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
            {[
              { id: 1, names: language === 'az' ? "Aysel və Rəşad" : "Aysel & Rashad", duration: language === 'az' ? "8 ay birlikdə" : "Together 8 months", img1: "Aysel", img2: "Rashad" },
              { id: 2, names: language === 'az' ? "Nərmin və Tural" : "Narmin & Tural", duration: language === 'az' ? "Nişanlı" : "Engaged", img1: "Narmin", img2: "Tural" },
              { id: 3, names: language === 'az' ? "Leyla və Emil" : "Leyla & Emil", duration: language === 'az' ? "1 il birlikdə" : "Together 1 year", img1: "Leyla", img2: "Emil" },
            ].map((story) => (
              <Link href="/stories" key={story.id}>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="shrink-0 w-48 rounded-2xl bg-card border border-border p-4"
                >
                  <div className="flex -space-x-4 mb-3">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${story.img1}`} 
                      className="w-12 h-12 rounded-full border-2 border-background bg-secondary"
                      alt={story.names.split(' ')[0]}
                    />
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${story.img2}`} 
                      className="w-12 h-12 rounded-full border-2 border-background bg-secondary"
                      alt={story.names.split(' ')[2]}
                    />
                  </div>
                  <h3 className="font-semibold text-sm mb-0.5">{story.names}</h3>
                  <p className="text-xs text-muted-foreground">{story.duration}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* Mission Banner */}
        <section className="mt-8">
          <Link href="/about">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-pink-500/10 to-primary/10 border border-primary/20 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base mb-1">
                    {language === 'az' ? 'Missiyamız' : 'Our Mission'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'az' 
                      ? 'Danyeri niyə yaradıldı? Dəyərlərimiz haqqında' 
                      : 'Why was Danyeri created? About our values'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-primary" />
              </div>
            </motion.div>
          </Link>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function WelcomeScreen() {
  const { language } = useLanguage();
  
  const content = {
    hero: {
      title: language === 'az' ? 'Danyeri ilə Tanış Olun' : 'Find Your Spark with Danyeri',
      subtitle: language === 'az' 
        ? 'Dəyərlərinizə uyğun insanlarla tanış olun.' 
        : 'Meet people who share your values and vibe.',
    },
    desc: language === 'az' 
      ? 'Azərbaycanlılar üçün anlayış, ortaq dəyərlər və səmimi əlaqə üzərində qurulan münasibətlər üçün müasir məkan.'
      : 'A modern space for Azerbaijanis to build relationships rooted in understanding, shared values, and authentic connection.',
    getStarted: language === 'az' ? 'Başla' : 'Get Started',
    haveAccount: language === 'az' ? 'Hesabınız var?' : 'Have an account?',
    signIn: language === 'az' ? 'Daxil ol' : 'Sign In',
    secureSpace: language === 'az' ? 'Təhlükəsiz və Məxfi' : 'Secure & Confidential',
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Image Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-10" />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Main logo */}
            <div className="w-32 h-32 rounded-full gradient-brand flex items-center justify-center shadow-2xl shadow-primary/30">
              <Flame className="w-16 h-16 text-white" />
            </div>
            
            {/* Floating icons */}
            <motion.div 
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-[#20D5A0] flex items-center justify-center shadow-lg"
            >
              <Heart className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div 
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 3.5, repeat: Infinity }}
              className="absolute -bottom-2 -left-6 w-10 h-10 rounded-full bg-[#FFB800] flex items-center justify-center shadow-lg"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 px-6 pb-12 w-full max-w-md mx-auto">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold mb-3">{content.hero.title}</h1>
          <p className="text-primary font-medium mb-4">{content.hero.subtitle}</p>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            {content.desc}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <Link href="/onboarding" className="block">
            <Button 
              size="lg" 
              className="w-full h-12 flex items-center justify-center gap-2 text-base font-bold rounded-xl gradient-brand shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="mt-[-1px]">{content.getStarted}</span>
              <ChevronRight className="w-5 h-5 shrink-0 translate-y-[0.5px]" />
            </Button>
          </Link>
          
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5 opacity-80">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              {content.secureSpace}
            </p>
            <p className="text-center text-sm text-muted-foreground">
              {content.haveAccount}{" "}
              <Link href="/sign-in" className="text-primary font-semibold hover:underline">
                {content.signIn}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function DailyQuestionMini({ language }: { language: string }) {
  const questions = [
    { en: "What does your ideal date look like?", az: "İdeal görüşünüz necə olardı?" },
    { en: "What's your love language?", az: "Sizin sevgi diliniz nədir?" },
    { en: "What values matter most to you?", az: "Sizin üçün hansı dəyərlər ən vacibdir?" },
  ];
  const question = questions[0];

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="rounded-2xl bg-card border border-border p-5"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            {language === 'az' ? 'Günün sualı' : "Today's question"}
          </p>
          <p className="font-medium">
            {language === 'az' ? question.az : question.en}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
