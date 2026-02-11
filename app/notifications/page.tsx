"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Heart, MessageCircle, Star, Mail, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { BottomNav } from "@/components/Navigation";

import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type Notification = {
  _id: string;
  type: string;
  userId?: string;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  _creationTime: number;
};

export default function NotificationsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const dbNotifications = useQuery(api.notifications.get) || [];
  const markAsRead = useMutation(api.notifications.markAllAsRead);

  // Mark all as read when leaving the page
  React.useEffect(() => {
    return () => {
      markAsRead();
    };
  }, [markAsRead]);

  const txt = {
    title: language === 'az' ? 'Bildirişlər' : 'Notifications',
    noNotifications: language === 'az' ? 'Hələ ki, bildiriş yoxdur' : 'No notifications yet',
    goldOffer: language === 'az' ? 'Danyeri Premium 50% endirimdə!' : '50% off Danyeri Premium!',
    now: language === 'az' ? 'İndi' : 'Just now',
    recently: language === 'az' ? 'Bu yaxınlarda' : 'Recently',
  };

  // Helper to format time
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return txt.now;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return txt.recently;
  };

  // Combine real notifications with system ones if needed
  const notifications = useMemo(() => {
    const list = [...dbNotifications];
    
    // Add system notification if list is empty or just as a promo
    if (list.length === 0) {
       // Optional: keep system notification logic
    }
    
    return list;
  }, [dbNotifications]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg">{txt.title}</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{txt.noNotifications}</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((notif) => {
              // Fetch related user for avatar if available
              // In a real app we might want to include this data in snapshot or fetch in bulk
              // For now, let's just use generic icon or fetch in separate component
              
              return (
                <motion.div 
                  key={notif._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
                    notif.read 
                      ? "bg-card border-border" 
                      : "bg-primary/5 border-primary/20"
                  }`}
                  onClick={() => notif.data?.url && router.push(notif.data.url)}
                >
                  <div className="relative shrink-0">
                    {notif.type === "system" ? (
                      <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
                        <Star className="w-6 h-6 fill-current" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                         <User className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    {notif.type === "like" && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center">
                         <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                           <Heart className="w-2.5 h-2.5 text-white fill-current" />
                         </div>
                      </div>
                    )}
                    {notif.type === "match" && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center">
                         <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                           <Heart className="w-2.5 h-2.5 text-white fill-current" />
                         </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                     <p className="font-medium text-sm">{notif.title}</p>
                     <p className="text-sm text-muted-foreground line-clamp-2">{notif.body}</p>
                     <p className="text-xs text-muted-foreground mt-1">{formatTime(notif._creationTime)}</p>
                  </div>

                  {!notif.read && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
