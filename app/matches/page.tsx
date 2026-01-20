"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, MoreVertical, Heart, MapPin, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { MOCK_USERS } from "@/lib/mock-users";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function MatchesPage() {
  const router = useRouter();
  const { user, isOnboarded } = useUser();
  const { language } = useLanguage();

  const txt = {
    matches: language === 'az' ? 'Uyğunluqlar' : 'Matches',
    noMatches: language === 'az' ? 'Hələ uyğunluq yoxdur' : 'No matches yet',
    noMatchesDesc: language === 'az' ? 'Uyğunluq tapmaq üçün kəşf etməyə davam edin!' : 'Keep swiping to find your match!',
    startDiscovering: language === 'az' ? 'Kəşf Etməyə Başla' : 'Start Discovering',
    message: language === 'az' ? 'Mesaj yaz' : 'Message',
    age: language === 'az' ? 'yaş' : 'y.o',
  };

  if (!isOnboarded) {
    router.push("/onboarding");
    return null;
  }

  const matchedUsers = MOCK_USERS.filter(u => user?.matches.includes(u.id));

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
          <h1 className="font-bold text-lg">{txt.matches}</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto px-4 py-6">
        {matchedUsers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {matchedUsers.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-3xl aspect-[3/4] bg-muted"
              >
                <img 
                  src={match.avatar} 
                  alt={match.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute top-3 right-3">
                   {/* Online indicator or other badge could go here */}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold text-lg">{match.name}, {match.age}</h3>
                    {match.isVerified && <BadgeCheck className="w-4 h-4 text-[#20D5A0]" />}
                  </div>
                  
                  <div className="flex items-center gap-1 text-white/70 text-xs mb-3">
                    <MapPin className="w-3 h-3" />
                    <span>{match.location}</span>
                  </div>

                  <Link href={`/messages?userId=${match.id}`} className="block w-full">
                    <Button className="w-full rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white gap-2 h-10">
                      <MessageCircle className="w-4 h-4" />
                      {txt.message}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
           <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold mb-2">{txt.noMatches}</h2>
              <p className="text-muted-foreground mb-8 max-w-xs">{txt.noMatchesDesc}</p>
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
