"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, MapPin, BadgeCheck, Crown, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";

export default function LikesPage() {
  const router = useRouter();
  const { user, isOnboarded } = useUser();
  const { language } = useLanguage();

  const txt = {
    title: language === 'az' ? 'Göndərilən Bəyənmələr' : 'Likes Sent',
    noLikes: language === 'az' ? 'Hələ heç kimi bəyənməmisiniz' : "You haven't liked anyone yet",
    noLikesDesc: language === 'az' ? 'Kəşf etməyə başlayın və xoşunuza gələn insanları bəyənin!' : 'Start discovering and like people you find interesting!',
    startDiscovering: language === 'az' ? 'Kəşf Et' : 'Discover',
    waitingResponse: language === 'az' ? 'Cavab gözləyir' : 'Waiting for response',
    matched: language === 'az' ? 'Uyğunlaşdınız!' : 'Matched!',
    viewProfile: language === 'az' ? 'Profilə bax' : 'View Profile',
  };

  if (!isOnboarded) {
    router.push("/onboarding");
    return null;
  }

  // Get profiles that user has liked
  // Get profiles that user has liked
  const likeIds = user?.likes || [];
  const dbLikes = useQuery(api.users.getUsersByIds, { ids: likeIds });

  const likedUsers = React.useMemo(() => {
    if (!dbLikes) return [];
    
    return dbLikes.map((u: any) => ({
      id: u.clerkId || u._id,
      name: u.name,
      age: u.age || 25,
      gender: u.gender,
      location: u.location || "Bakı",
      avatar: u.avatar || '/placeholder-avatar.svg',
      isVerified: u.role === "admin" || u.role === "superadmin" || u.isVerified,
      isPremium: u.isPremium || false,
    }));
  }, [dbLikes]);

  // Check if they've matched
  const isMatched = (userId: string) => user?.matches.includes(userId);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="w-full max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg">{txt.title}</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto px-4 py-6">
        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-2xl p-4 mb-6 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{likedUsers.length}</div>
              <div className="text-sm text-muted-foreground">
                {language === 'az' ? 'nəfəri bəyəndiniz' : 'people liked'}
              </div>
            </div>
          </div>
        </div>

        {likedUsers.length > 0 ? (
          <div className="space-y-3">
            {likedUsers.map((likedUser, index) => {
              const matched = isMatched(likedUser.id);
              
              return (
                <motion.div
                  key={likedUser.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
                    matched 
                      ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30' 
                      : 'bg-card border-border hover:border-primary/30'
                  }`}
                >
                  {/* Avatar */}
                  <Link href={`/user/${(likedUser as any).username || likedUser.id}`} className="relative shrink-0">
                    <img 
                      src={likedUser.avatar} 
                      alt={likedUser.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
                    />
                    {matched && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center border-2 border-background">
                        <Heart className="w-3 h-3 text-white fill-white" />
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{likedUser.name}, {likedUser.age}</h3>
                      {likedUser.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                      {likedUser.isPremium && <Crown className="w-4 h-4 text-yellow-500" />}
                    </div>
                    
                    <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{likedUser.location}</span>
                    </div>

                    {/* Status */}
                    {matched ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium">
                        <Sparkles className="w-3 h-3" />
                        {txt.matched}
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-medium">
                        <RotateCcw className="w-3 h-3" />
                        {txt.waitingResponse}
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <Link href={matched ? `/messages?userId=${likedUser.id}` : `/user/${(likedUser as any).username || likedUser.id}`}>
                    <Button 
                      size="sm" 
                      variant={matched ? "default" : "outline"}
                      className={`rounded-full ${matched ? 'gradient-brand border-0' : ''}`}
                    >
                      {matched ? (language === 'az' ? 'Mesaj' : 'Message') : txt.viewProfile}
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">{txt.noLikes}</h2>
            <p className="text-muted-foreground mb-8 max-w-xs">{txt.noLikesDesc}</p>
            <Link href="/discovery">
              <Button className="rounded-full gradient-brand px-8 h-12 text-lg">
                {txt.startDiscovering}
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
