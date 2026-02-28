"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Crown, Sparkles, Filter, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";

export default function LikesPage() {
  const { user: currentUser } = useUser();
  const { language } = useLanguage();

  const rawLikes = useQuery(api.likes.getWhoLikedMe, currentUser ? { userId: currentUser.id } : "skip");
  const isPremium = currentUser?.isPremium || currentUser?.role === "superadmin";

  const likesCount = rawLikes?.length || 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 h-14 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="font-bold text-lg">{language === 'az' ? 'Səni Bəyənənlər' : 'Likes You'}</h1>
          <span className="text-[10px] text-muted-foreground font-medium">
            {likesCount} {language === 'az' ? 'nəfər' : 'people'}
          </span>
        </div>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </header>

      <main className="max-w-md mx-auto p-4">
        
        {!isPremium && likesCount > 0 && (
          <div className="mb-6 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-2xl p-4 border border-orange-500/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm mb-1">
                  {language === 'az' ? 'Gizli Bəyənmələri Gör' : 'See Hidden Likes'}
                </h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  {language === 'az' 
                    ? 'Premium alaraq səni kimlərin bəyəndiyini dərhal gör və onlarla eşləşmə şansını artır.' 
                    : 'Get Premium to see exactly who liked you and increase your match rate.'}
                </p>
                <Link href="/premium">
                  <Button size="sm" className="w-full rounded-xl gradient-brand font-semibold shadow-md shadow-primary/20">
                    {language === 'az' ? 'Premium Al' : 'Upgrade to Premium'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {rawLikes === undefined ? (
           <div className="grid grid-cols-2 gap-4">
             {[1,2,3,4].map(i => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-card animate-pulse border border-border" />
             ))}
           </div>
        ) : likesCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center mb-6 border-2 border-border border-dashed">
              <Sparkles className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              {language === 'az' ? 'Hələlik Bəyənən Yoxdur' : 'No Likes Yet'}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {language === 'az' 
                ? 'Profilini yenilə, daha çox şəkil əlavə et və kəşfə çıxaraq aktivliyini artır.' 
                : 'Update your profile, add more photos and start swiping to increase your visibility.'}
            </p>
            <Link href="/discovery">
              <Button className="rounded-full gradient-brand px-8">
                {language === 'az' ? 'Kəşf Et' : 'Discover Profiles'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {rawLikes.map((person: any, idx: number) => {
              const showClearly = isPremium;
              
              return (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer bg-card"
                >
                  {showClearly ? (
                    <Link href={`/user/${person.username || person.id}`} className="block w-full h-full relative">
                      <img 
                        src={person.avatar} 
                        alt="Profile" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h3 className="font-bold text-sm truncate">{person.name}, {person.age}</h3>
                          {person.isVerified && (
                             <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                               <Filter className="w-2 h-2 text-white" />
                             </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-white/80">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{person.location}</span>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <Link href="/premium" className="block w-full h-full relative border border-border">
                      <img 
                        src={person.avatar} 
                        alt="Hidden Profile" 
                        className="w-full h-full object-cover blur-xl scale-110 opacity-70"
                      />
                      <div className="absolute inset-0 bg-background/20" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center mb-2 border border-white/10">
                          <Lock className="w-5 h-5 text-white shadow-sm" />
                        </div>
                        <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-medium border border-white/10">
                          {language === 'az' ? 'Premiumla Gör' : 'Unlock to See'}
                        </div>
                      </div>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
