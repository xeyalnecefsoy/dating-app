"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Flame,
  Heart,
  MessageCircle,
  Compass,
  Sparkles,
  ChevronRight,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { BottomNav } from "@/components/Navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { HomeBannerSlider } from "@/components/ui/HomeBannerSlider";
import { useAuth } from "@clerk/nextjs";

export default function HomePage() {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Always render WelcomeScreen during SSR and initial client render to match server HTML
  if (!isClient) {
    return <WelcomeScreen />;
  }

  // After hydration, we can safely use client-only auth state
  if (!isAuthLoaded) {
    return <WelcomeScreen />;
  }

  return isSignedIn ? <DashboardContent /> : <WelcomeScreen />;
}

function DashboardContent() {
  const [mounted, setMounted] = React.useState(false);
  const { user, isOnboarded, isLoading, isAuthenticated } = useUser();
  const { language } = useLanguage();
  const router = useRouter();
  const notificationsCount = useQuery(api.notifications.getUnreadCount) || 0;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted || isLoading) return;
    if (isAuthenticated && !isOnboarded) {
      router.replace("/onboarding");
    }
  }, [mounted, isLoading, isAuthenticated, isOnboarded, router]);

  // Text translations
  const txt = {
    welcome: language === "az" ? "Xoş Gəldiniz" : "Welcome",
    findPeople: language === "az" ? "Yeni insanlar tap" : "Find new people",
    matches: language === "az" ? "uyğunluq" : "matches",
    likesSent: language === "az" ? "Göndərilən Bəyənmə" : "Likes Sent",
    matchesLabel: language === "az" ? "Uyğunluqlar" : "Matches",
    badges: language === "az" ? "Nişanlar" : "Badges",
    improveSkills:
      language === "az" ? "Bacarıqlarını İnkişaf Etdir" : "Improve Your Skills",
    seeAll: language === "az" ? "Hamısını gör" : "See all",
    commSimulator:
      language === "az" ? "Ünsiyyət Simulyatoru" : "Communication Simulator",
    practiceAI:
      language === "az"
        ? "AI ilə söhbət bacarıqlarını məşq et"
        : "Practice conversation skills with AI",
    successStories: language === "az" ? "Uğur Hekayələri" : "Success Stories",
    togetherMonths: language === "az" ? "Birlikdə 8 ay" : "Together 8 months",
    todaysQuestion: language === "az" ? "Günün Sualı" : "Today's question",
    dailyTitle: language === "az" ? "Günün Sualı" : "Question of the Day",
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  // If authenticated but not onboarded, show interim state while redirect effect runs
  if (isAuthenticated && !isOnboarded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  // Safety fallback: if auth context lags behind Clerk state, avoid rendering dashboard UI
  if (!isAuthenticated && !isLoading) {
    return null;
  }

  // Check for Waitlist Status
  if (user?.status === "waitlist") {
    return <WaitlistScreen user={user} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="w-full max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="md:hidden flex items-center gap-2">
            {" "}
            {/* Only show logo strictly on mobile if sidebar is hidden, or show always but hide on desktop if sidebar handles it? Sidebar handles it on desktop. */}
            <div className="w-8 h-8 flex items-center justify-center relative rounded-full overflow-hidden">
              <Image
                src="/logo.jpg"
                alt="Danyeri Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-lg">Danyeri</span>
          </div>
          <div className="hidden md:block text-xl font-bold">{txt.welcome}</div>{" "}
          {/* Show Welcome on desktop header */}
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
                  {notificationsCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center border-2 border-background">
                      {notificationsCount > 9 ? "9+" : notificationsCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto px-4 py-6 pb-24">
        {/* Banner Slider */}
        <HomeBannerSlider />

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
                <h3 className="font-bold text-lg">
                  {language === "az" ? "Kəşf Et" : "Discover"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {txt.findPeople}
                </p>
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
              {(user?.unreadMatches?.length || 0) +
                (user?.messageRequests?.filter(
                  (id) => !user?.seenMessageRequests?.includes(id),
                ).length || 0) >
                0 && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                  {(user?.unreadMatches?.length || 0) +
                    (user?.messageRequests?.filter(
                      (id) => !user?.seenMessageRequests?.includes(id),
                    ).length || 0)}
                </div>
              )}
              <div className="absolute bottom-4 left-4">
                <h3 className="font-bold text-lg">
                  {language === "az" ? "Mesajlar" : "Messages"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {user?.matches.length || 0} {txt.matches}
                </p>
              </div>
            </motion.div>
          </Link>
        </section>

        {/* Stats Row */}
        <section className="flex items-center justify-between bg-card rounded-2xl border border-border p-2 mb-8">
          <Link href="/likes" className="flex-1">
            <div className="text-center py-2 rounded-xl transition-colors hover:bg-secondary/50 active:scale-95 cursor-pointer">
              <div className="text-2xl font-bold text-primary">
                {user?.likes.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                {txt.likesSent}
              </div>
            </div>
          </Link>
          <div className="w-px h-8 bg-border mx-1" />
          <Link href="/matches" className="flex-1">
            <div className="text-center py-2 rounded-xl transition-colors hover:bg-secondary/50 active:scale-95 cursor-pointer">
              <div className="text-2xl font-bold text-[#20D5A0]">
                {user?.matches.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                {txt.matchesLabel}
              </div>
            </div>
          </Link>
          <div className="w-px h-8 bg-border mx-1" />
          <Link href="/profile" className="flex-1">
            <div className="text-center py-2 rounded-xl transition-colors hover:bg-secondary/50 active:scale-95 cursor-pointer">
              <div className="text-2xl font-bold text-[#FFB800]">
                {user?.badges.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">{txt.badges}</div>
            </div>
          </Link>
        </section>

        {/* Practice Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">{txt.improveSkills}</h2>
            <Link
              href="/simulator"
              className="text-sm text-primary flex items-center"
            >
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
                <p className="text-sm text-muted-foreground">
                  {txt.practiceAI}
                </p>
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
            <Link
              href="/stories"
              className="text-sm text-primary flex items-center"
            >
              {txt.seeAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
            {[
              {
                id: 1,
                names: language === "az" ? "Aysel və Rəşad" : "Aysel & Rashad",
                duration:
                  language === "az" ? "8 ay birlikdə" : "Together 8 months",
                img1: "Aysel",
                img2: "Rashad",
              },
              {
                id: 2,
                names: language === "az" ? "Nərmin və Tural" : "Narmin & Tural",
                duration: language === "az" ? "Adaqlı" : "Engaged",
                img1: "Narmin",
                img2: "Tural",
              },
              {
                id: 3,
                names: language === "az" ? "Leyla və Emil" : "Leyla & Emil",
                duration:
                  language === "az" ? "1 il birlikdə" : "Together 1 year",
                img1: "Leyla",
                img2: "Emil",
              },
            ].map((story) => (
              <Link href="/stories" key={story.id}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="shrink-0 w-48 rounded-2xl bg-card border border-border p-4"
                >
                  <div className="flex -space-x-4 mb-3">
                    <div className="relative w-12 h-12 rounded-full border-2 border-background bg-secondary overflow-hidden">
                      <Image
                        src="/placeholder-avatar.svg"
                        alt={story.names.split(" ")[0]}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="relative w-12 h-12 rounded-full border-2 border-background bg-secondary overflow-hidden">
                      <Image
                        src="/placeholder-avatar.svg"
                        alt={story.names.split(" ")[2]}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm mb-0.5">
                    {story.names}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {story.duration}
                  </p>
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
                    {language === "az" ? "Missiyamız" : "Our Mission"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === "az"
                      ? "Danyeri niyə yaradıldı? Dəyərlərimiz haqqında"
                      : "Why was Danyeri created? About our values"}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-primary" />
              </div>
            </motion.div>
          </Link>
        </section>
      </main>

      <React.Suspense fallback={null}>
        <BottomNav />
      </React.Suspense>
    </div>
  );
}

function WelcomeScreen() {
  const { language } = useLanguage();

  const content = {
    hero: {
      title:
        language === "az"
          ? "Danyeri ilə Tanış Olun"
          : "Find Your Spark with Danyeri",
      subtitle:
        language === "az"
          ? "Dəyərlərinizə uyğun insanlarla tanış olun."
          : "Meet people who share your values and vibe.",
    },
    desc:
      language === "az"
        ? "Azərbaycanlılar üçün anlayış, ortaq dəyərlər və səmimi əlaqə üzərində qurulan münasibətlər üçün müasir məkan."
        : "A modern space for Azerbaijanis to build relationships rooted in understanding, shared values, and authentic connection.",
    getStarted: language === "az" ? "Başla" : "Get Started",
    haveAccount: language === "az" ? "Hesabınız var?" : "Have an account?",
    signIn: language === "az" ? "Daxil ol" : "Sign In",
    secureSpace:
      language === "az" ? "Təhlükəsiz və Məxfi" : "Secure & Confidential",
  };

  return (
    <article className="h-[100dvh] bg-background flex flex-col items-center justify-between pt-10 pb-32 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 z-0 pointer-events-none" />

      {/* Top Graphic Section (Logo) - Flex grow to push content down but keep centered */}
      <header className="flex-1 flex items-center justify-center relative w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Main logo - slightly smaller for mobile fit */}
          <div className="w-28 h-28 rounded-full flex items-center justify-center shadow-2xl shadow-primary/30 bg-background/50 backdrop-blur-md overflow-hidden z-10 relative">
            <Image
              src="/logo.jpg"
              alt="Danyeri Logo"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Floating icons */}
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-[#20D5A0] flex items-center justify-center shadow-lg z-20"
          >
            <Heart className="w-5 h-5 text-white" />
          </motion.div>
          <motion.div
            animate={{ y: [5, -5, 5] }}
            transition={{ duration: 3.5, repeat: Infinity }}
            className="absolute -bottom-1 -left-5 w-9 h-9 rounded-full bg-[#FFB800] flex items-center justify-center shadow-lg z-20"
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>
      </header>

      {/* Bottom Content Section - Fixed at bottom */}
      <section className="w-full max-w-md px-6 z-10 flex flex-col gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-2"
        >
          <h1 className="text-2xl font-bold">{content.hero.title}</h1>
          <h2 className="sr-only">
            Danyeri - Azərbaycanda ciddi tanışlıq və evlilik tətbiqi. danyeri.az
          </h2>
          <p className="text-primary font-medium">{content.hero.subtitle}</p>
          <p className="text-muted-foreground text-xs leading-relaxed max-w-xs mx-auto opacity-90">
            {content.desc}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <Link href="/sign-up" className="block w-full">
            <Button
              size="lg"
              className="w-full h-12 flex items-center justify-center gap-2 text-base font-bold rounded-xl gradient-brand shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
              <span className="mt-[-1px]">{content.getStarted}</span>
              <ChevronRight className="w-5 h-5 shrink-0 translate-y-[0.5px]" />
            </Button>
          </Link>

          <div className="space-y-3 pb-2">
            <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1.5 opacity-70 uppercase tracking-wide">
              <ShieldCheck className="w-3 h-3 text-green-500" />
              {content.secureSpace}
            </p>
            <p className="text-center text-sm text-muted-foreground">
              {content.haveAccount}{" "}
              <Link
                href="/sign-in"
                className="text-primary font-semibold hover:underline"
              >
                {content.signIn}
              </Link>
            </p>
          </div>
        </motion.div>
      </section>

      {/* SEO Hidden Content - enriches page for search engines */}
      <div className="sr-only">
        <h2>Danyeri - Azərbaycanda Ciddi Tanışlıq və Evlilik Tətbiqi</h2>
        <p>
          Danyeri, Azərbaycanda ciddi tanışlıq və evlilik üçün yaradılmış ən
          etibarlı platformadır. Bakıda tanışlıq, Gəncədə tanışlıq, Sumqayıtda
          tanışlıq, Xankəndidə tanışlıq, Mingəçevirdə tanışlıq, Lənkəranda
          tanışlıq, Şəkidə tanışlıq, Naxçıvanda tanışlıq - bütün Azərbaycan
          şəhərlərində həyat yoldaşınızı tapın.
        </p>
        <p>
          Pulsuz qeydiyyat olun və Azərbaycan mədəniyyətinə hörmət edən,
          təhlükəsiz mühitdə ciddi münasibət qurmaq istəyən insanlarla tanış
          olun. Evlilik üçün tanışlıq, online tanışlıq, Azərbaycanda ən yaxşı
          tanışlıq saytı.
        </p>
        <nav>
          <Link href="/tanisliq">Azərbaycanda Tanışlıq</Link>
          <Link href="/tanisliq/bakida">Bakıda Tanışlıq</Link>
          <Link href="/tanisliq/gencede">Gəncədə Tanışlıq</Link>
          <Link href="/tanisliq/sumqayitda">Sumqayıtda Tanışlıq</Link>
          <Link href="/about">Haqqımızda</Link>
        </nav>
      </div>
    </article>
  );
}

function DailyQuestionMini({ language }: { language: string }) {
  const questions = [
    {
      en: "What does your ideal weekend look like?",
      az: "İdeal həftəsonunuz necə olardı?",
      enPurpose:
        "Reveals their lifestyle, energy levels, and how they recharge.",
      azPurpose:
        "Həyat tərzini, enerjisini və necə istirahət etmək istədiyini göstərir.",
    },
    {
      en: "What's the most spontaneous thing you've ever done?",
      az: "İndiyə qədər etdiyiniz ən spontan (anidən qərar verilmiş) şey nədir?",
      enPurpose: "Shows their adventurous side and willingness to take risks.",
      azPurpose: "Macəra ruhunu və risk alma ehtimalını göstərir.",
    },
    {
      en: "How do you usually handle stress or difficult days?",
      az: "Stresli və çətin günlərlə adətən necə başa çıxırsınız?",
      enPurpose: "Indicates emotional maturity and coping mechanisms.",
      azPurpose:
        "Emosional yetkinliyini və çətinliklərdən çıxış yollarını göstərir.",
    },
    {
      en: "What's a topic you could talk about for hours?",
      az: "Hansı mövzuda saatlarla danışa bilərsiniz?",
      enPurpose: "Reveals their true passions and intellectual interests.",
      azPurpose:
        "Əsl ehtiraslarını və intellektual maraqlarını kəşf etməyə kömək edir.",
    },
    {
      en: "What is your primary love language?",
      az: "Sevginizi ən çox hansı formada (sevgi dili) göstərirsiniz?",
      enPurpose: "Helps understand how they give and receive affection.",
      azPurpose:
        "Sevgini necə verib alacağını və sizə uyğunluğunu anlamağa kömək edir.",
    },
    {
      en: "What is a boundary that is absolutely non-negotiable for you?",
      az: "Sizin üçün heç vaxt güzəştə getməyəcəyiniz qırmızı xətt (sərhəd) nədir?",
      enPurpose: "Shows self-respect and basic relationship expectations.",
      azPurpose:
        "Özünə hörmətini və münasibətlərdəki əsas gözləntilərini göstərir.",
    },
    {
      en: "What does support look like to you when you are going through a hard time?",
      az: "Çətin vaxtlarınızda qarşı tərəfdən necə bir dəstək görmək istəyirsiniz?",
      enPurpose:
        "Essential for knowing how to be there for them during tough times.",
      azPurpose: "Çətin anlarda onun yanında necə olmalı olduğunuzu öyrədir.",
    },
  ];

  const [question, setQuestion] = React.useState<any>(null);

  React.useEffect(() => {
    // Rotate based on the day of the year so everyone sees the same question on a given day
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff =
      today.getTime() -
      start.getTime() +
      (start.getTimezoneOffset() - today.getTimezoneOffset()) * 60 * 1000;
    const oneDay = 1000 * 60 * 60 * 24;
    const currentDayOfYear = Math.floor(diff / oneDay);

    setQuestion(questions[currentDayOfYear % questions.length]);
  }, []);

  if (!question)
    return <div className="h-32 w-full animate-pulse bg-muted rounded-2xl" />;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="rounded-2xl bg-card border border-border p-5"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-primary mb-1">
            {language === "az" ? "Günün sualı" : "Today's question"}
          </p>
          <p className="font-medium text-foreground mb-2">
            {language === "az" ? question.az : question.en}
          </p>
          <div className="flex items-start gap-1.5 mt-2 bg-secondary/30 p-2.5 rounded-xl border border-border/50">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider shrink-0 mt-0.5">
              {language === "az" ? "Məqsəd:" : "Purpose:"}
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {language === "az" ? question.azPurpose : question.enPurpose}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function WaitlistScreen({ user }: { user: any }) {
  const { language } = useLanguage();

  // Real-time queue position
  const queuePosition = useQuery(api.users.getQueuePosition, {
    clerkId: user?.clerkId || "",
  });

  // Create a display number - if loading, show ..., if null (error), show fallback, otherwise show real position
  const displayPosition =
    queuePosition === undefined
      ? "..."
      : typeof queuePosition === "number"
        ? `#${queuePosition.toLocaleString()}`
        : "#1";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6 relative">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-[spin_10s_linear_infinite]" />
        <span className="text-3xl">⏳</span>
      </div>

      <h1 className="text-2xl font-bold mb-3">
        {language === "az" ? "Siz Növbədəsiniz" : "You're on the Waitlist"}
      </h1>

      <p className="text-muted-foreground mb-8 max-w-md">
        {language === "az"
          ? "Danyeri-də cinslərarası balansı qorumaq üçün bəyləri hissə-hissə qəbul edirik. Hazırda çox sayda müraciət var."
          : "To maintain a healthy gender balance on Danyeri, we accept gentlemen in batches. Demand is currently very high."}
      </p>

      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            {language === "az" ? "Sizin Sıranız" : "Your Position"}
          </span>
          <span className="font-bold font-mono text-primary text-xl">
            {displayPosition}
          </span>
        </div>
        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
          <div className="bg-primary h-full w-[15%] animate-pulse" />
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-left">
          {language === "az"
            ? "🚀 İpucu: Profil şəkliniz və məlumatlarınız tam olarsa, növbədə irəli keçə bilərsiniz."
            : "🚀 Tip: Complete profile with high quality photos to move up the list."}
        </p>
      </div>

      <Button
        variant="outline"
        className="gap-2"
        onClick={() => window.location.reload()}
      >
        {language === "az" ? "Statusu Yoxla" : "Check Status"}
      </Button>
    </div>
  );
}
