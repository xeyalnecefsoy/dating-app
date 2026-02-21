"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Heart, MessageCircle, Star, Mail, Check, X, AtSign, CheckCheck } from "lucide-react";
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
  partner?: {
    name: string;
    username?: string;
    image?: string;
    avatar?: string;
  } | null;
};

export default function NotificationsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { dbNotifications, markAllNotificationsAsRead } = useUser();
  const markAsRead = useMutation(api.notifications.markAllAsRead);

  // Mark all as read when opening the page
  React.useEffect(() => {
    // Only mark as read if we actually have notifications loaded
    if (dbNotifications !== undefined) {
      markAsRead();
    }
  }, [markAsRead, dbNotifications]);

  const txt = {
    title: language === 'az' ? 'Bildirişlər' : 'Notifications',
    noNotifications: language === 'az' ? 'Hələ ki, bildiriş yoxdur' : 'No notifications yet',
    goldOffer: language === 'az' ? 'Danyeri Premium 50% endirimdə!' : '50% off Danyeri Premium!',
    now: language === 'az' ? 'İndi' : 'Just now',
    recently: language === 'az' ? 'Bu yaxınlarda' : 'Recently',
    markAsReadTitle: language === 'az' ? 'Hamısını oxunmuş kimi işarələ' : 'Mark all as read',
  };

  const handleMarkAsRead = async () => {
    markAllNotificationsAsRead();
    await markAsRead();
  };

  // Helper to format time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const timeOptions: Intl.DateTimeFormatOptions = { 
        hour: '2-digit', minute: '2-digit' 
    };
    const dateOptions: Intl.DateTimeFormatOptions = { 
        day: 'numeric', month: 'long', year: 'numeric' 
    };
    
    // Fallbacks just in case language is not set
    const locale = language === 'az' ? 'az-AZ' : 'en-US';
    const timeStr = date.toLocaleTimeString(locale, timeOptions);
    const dateStr = date.toLocaleDateString(locale, dateOptions);
    
    return `${timeStr}, ${dateStr}`;
  };

  // Combine real notifications with system ones if needed
  const notifications = useMemo(() => {
    const list = dbNotifications ? [...dbNotifications] : [];
    
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
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleMarkAsRead} title={txt.markAsReadTitle}>
            <CheckCheck className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-2">
        {dbNotifications === undefined ? (
          <div className="space-y-3 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border bg-card animate-pulse">
                <div className="w-12 h-12 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
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
                    ) : notif.type === "mention" ? (
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center">
                        <AtSign className="w-6 h-6" />
                      </div>
                    ) : notif.partner?.avatar || notif.partner?.image ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden relative border border-border">
                          <Image src={notif.partner.avatar || notif.partner.image || ""} alt="Avatar" fill className="object-cover" />
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
                    <div className="flex justify-between items-start gap-2">
                       <p className="font-semibold text-sm text-foreground">
                         {notif.partner ? notif.partner.name : notif.title}
                       </p>
                       <p className="text-[11px] text-muted-foreground whitespace-nowrap pt-0.5">
                         {formatTime(notif._creationTime)}
                       </p>
                    </div>
                     
                     <p className="text-sm font-medium text-foreground/90 mt-1">
                       {notif.partner ? notif.title : notif.body}
                     </p>
                     
                     {notif.partner && (
                       <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                         {notif.body}
                       </p>
                     )}
                     
                     {notif.partner?.username && (
                       <div className="mt-3">
                         <Button 
                           variant="secondary" 
                           size="sm" 
                           className="h-7 text-xs rounded-full px-4 w-fit bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                           onClick={(e) => {
                             e.stopPropagation();
                             router.push(`/user/${notif.partner?.username}`);
                           }}
                         >
                           {language === 'az' ? 'Profilinə bax' : 'View profile'}
                         </Button>
                       </div>
                     )}
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
