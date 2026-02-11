"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { BADGES, getBadgeIcon } from "@/lib/badges";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function BadgesPage() {
  const { user } = useUser();
  const { language } = useLanguage();
  const badgeProgress = useQuery(api.badges.getProgress) as Record<string, { current: number; target: number }> | undefined;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg">{language === 'az' ? 'Nişanlarınız' : 'Your Badges'}</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          {BADGES.map((badge) => {
            const isEarned = user.badges.some(b => b.toLowerCase().replace(/ /g, "-") === badge.id);
            const IconComponent = getBadgeIcon(badge.icon);
            const progress = badgeProgress?.[badge.id];
            const progressPercent = progress
              ? Math.min(100, Math.round((progress.current / progress.target) * 100))
              : 0;
            
            return (
              <div 
                key={badge.id}
                className={`relative overflow-hidden rounded-2xl border p-4 transition-all ${
                  isEarned 
                    ? "bg-card border-border shadow-sm" 
                    : "bg-muted/30 border-border/50 opacity-70"
                }`}
              >
                {/* Status Indicator */}
                <div className="absolute top-3 right-3">
                  {isEarned ? (
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Badge Icon */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                  isEarned ? badge.color : "bg-muted text-muted-foreground grayscale"
                }`}>
                  <IconComponent className="w-7 h-7" />
                </div>

                {/* Badge Details */}
                <div>
                  <h3 className="font-bold text-sm mb-1">
                    {language === 'az' ? badge.name.az : badge.name.en}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {language === 'az' ? badge.description.az : badge.description.en}
                  </p>
                </div>

                {/* Progress Bar */}
                {!isEarned && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-muted-foreground">
                        {progress ? `${progress.current}/${progress.target}` : ""}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {progressPercent}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary/70 rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercent}%` }} 
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
