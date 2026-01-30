"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile } from "@/lib/mock-users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, MessageCircle, MapPin, Wind, Sparkles, TrendingUp, Check } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { calculateCompatibility, getCompatibilityLabel } from "@/lib/compatibility";
import { useRouter } from "next/navigation";

interface UserCardProps {
  user: UserProfile;
}

export function UserCard({ user }: UserCardProps) {
  const router = useRouter();
  const { user: currentUser, isOnboarded, likeUser, matchUser } = useUser();
  const { language, t } = useLanguage();
  const [showIceBreaker, setShowIceBreaker] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);

  // Check for Founder/Superadmin
  const isFounder = user.role === 'superadmin' || user.role === 'admin' || (user as any).email === 'xeyalnecefsoy@gmail.com';

  // Calculate compatibility if user is onboarded
  const compatibility = useMemo(() => {
    if (!currentUser || !isOnboarded) return null;
    return calculateCompatibility(
      {
        values: currentUser.values,
        interests: currentUser.interests,
        loveLanguage: currentUser.loveLanguage,
        communicationStyle: currentUser.communicationStyle
      },
      user
    );
  }, [currentUser, isOnboarded, user]);

  const compatibilityLabel = compatibility ? getCompatibilityLabel(compatibility.score) : null;

  const handleLike = () => {
    if (!isOnboarded) {
      router.push("/onboarding");
      return;
    }
    
    setIsLiked(true);
    likeUser(user.id);

    // Simulate mutual match (50% chance for demo)
    if (Math.random() > 0.5) {
      setShowMatchAnimation(true);
      matchUser(user.id);
      setTimeout(() => setShowMatchAnimation(false), 3000);
    }
  };

  const handleMessage = () => {
    if (!isOnboarded) {
      router.push("/onboarding");
      return;
    }
    
    // If not matched, like first
    if (!currentUser?.matches.includes(user.id)) {
      handleLike();
    } else {
      router.push("/messages");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full relative"
    >
      {/* Match Animation Overlay */}
      <AnimatePresence>
        {showMatchAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-50 bg-gradient-to-br from-rose-500/90 to-indigo-600/90 rounded-3xl flex flex-col items-center justify-center text-white"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              <Heart className="w-16 h-16 fill-white" />
            </motion.div>
            <h3 className="text-2xl font-bold mt-4">It's a Match!</h3>
            <p className="text-white/80 mt-2">You and {user.name} liked each other</p>
            <Button 
              variant="outline" 
              className="mt-6 bg-white/20 border-white/40 hover:bg-white/30"
              onClick={() => router.push("/messages")}
            >
              Send a Message
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="h-full overflow-hidden border-none shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col bg-white dark:bg-slate-800">
        {/* Compatibility Score Banner */}
        {compatibility && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-white" />
              <span className="text-white font-medium text-sm">{t("card.compatibility")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-xs">
                {language === "az" ? compatibilityLabel?.labelAz : compatibilityLabel?.label}
              </span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-white font-bold text-sm">
                {compatibility.score}%
              </span>
            </div>
          </div>
        )}

        {/* Header Section: Values Priority */}
        <div className="p-6 pb-2">
            <div className="flex justify-between items-start mb-4">
                <div>
                   <h3 className="text-xl font-bold text-charcoal dark:text-white flex items-center gap-2">
                     {user.name}, {user.age}
                     {isFounder && (
                       <Badge variant="outline" className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-none gap-1 px-1.5 py-0">
                         <Crown className="w-3 h-3 fill-current" />
                         <span className="text-[10px] uppercase font-bold tracking-wide">Qurucu</span>
                       </Badge>
                     )}
                   </h3>
                   <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {user.location}
                   </div>
                </div>
                {/* Small/Blurred Avatar Area */}
                <div className="relative group">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-600 shadow-sm">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-full h-full object-cover filter blur-[2px] hover:blur-none transition-all duration-500 scale-110" 
                        />
                    </div>
                    {/* Hover hint */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                       <span className="text-[8px] bg-black/50 text-white px-1 rounded">View</span>
                    </div>
                </div>
            </div>

            {/* Core Values - Prioritized */}
            <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{t("card.coreValues")}</p>
                <div className="flex flex-wrap gap-2">
                    {user.values.map(val => {
                      const isShared = currentUser?.values.includes(val);
                      return (
                        <Badge 
                          key={val} 
                          variant="secondary" 
                          className={`border-0 font-medium ${
                            isShared 
                              ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" 
                              : "bg-lavender/30 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 hover:bg-lavender/50"
                          }`}
                        >
                            {isShared && <Check className="w-3 h-3 mr-1" />}
                            {val}
                        </Badge>
                      );
                    })}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">{t("card.loveLanguage")}</p>
                    <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300 font-medium">
                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                        {user.loveLanguage}
                    </div>
                </div>
                <div>
                     <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">{t("card.commStyle")}</p>
                    <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300 font-medium">
                        <Wind className="w-3.5 h-3.5 text-blue-400" />
                        {user.communicationStyle}
                    </div>
                </div>
            </div>
        </div>

        <CardContent className="flex-1 pt-0 px-6">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-2 border-lavender pl-3 my-2">
                "{language === 'az' ? user.bio.az : user.bio.en}"
            </p>
            
            <div className="mt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{t("card.interests")}</p>
                <div className="flex flex-wrap gap-1.5">
                    {user.interests.map(interest => {
                      const isShared = currentUser?.interests.includes(interest);
                      return (
                        <span 
                          key={interest} 
                          className={`text-xs px-2 py-1 rounded-md border ${
                            isShared 
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700" 
                              : "text-slate-600 bg-slate-50 border-slate-100 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
                          }`}
                        >
                            {isShared && "✓ "}{interest}
                        </span>
                      );
                    })}
                </div>
            </div>
        </CardContent>

        <CardFooter className="px-6 pb-6 pt-2 flex flex-col gap-3">
             {/* Action Buttons */}
             <div className="flex gap-2 w-full">
               <Button 
                  variant={isLiked ? "default" : "outline"}
                  className={`flex-1 transition-all ${
                    isLiked 
                      ? "bg-rose-500 hover:bg-rose-600 text-white" 
                      : "hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-900/30"
                  }`}
                  onClick={handleLike}
                  disabled={isLiked}
               >
                  <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-white" : ""}`} />
                  {isLiked ? "Liked!" : t("card.like")}
               </Button>
               <Button 
                  variant="outline"
                  className="flex-1 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:hover:bg-indigo-900/30"
                  onClick={handleMessage}
               >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t("card.message")}
               </Button>
             </div>

             {/* Icebreaker */}
             <Button 
                variant="outline" 
                className="w-full bg-cream dark:bg-slate-700 border-indigo-100 dark:border-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:hover:bg-indigo-900/30 transition-colors group relative overflow-hidden"
                onClick={() => setShowIceBreaker(!showIceBreaker)}
             >
                <span className="flex items-center gap-2 relative z-10">
                    <Sparkles className="w-4 h-4" />
                    {showIceBreaker ? t("card.hideIcebreaker") : t("card.revealIcebreaker")}
                </span>
                {showIceBreaker && (
                   <motion.div 
                     layoutId="highlight"
                     className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/30 z-0" 
                     initial={{ opacity: 0 }} 
                     animate={{ opacity: 1 }}
                   />
                )}
             </Button>

             <AnimatePresence>
                {showIceBreaker && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="w-full"
                    >
                         <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-800 shadow-inner">
                            <div className="flex gap-3">
                                <MessageCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-indigo-900 dark:text-indigo-200 font-medium italic">
                                    "{language === 'az' ? user.iceBreaker.az : user.iceBreaker.en}"
                                </p>
                            </div>
                         </div>
                    </motion.div>
                )}
             </AnimatePresence>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
