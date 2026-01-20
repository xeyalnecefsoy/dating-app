"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Heart, MessageCircle, Star, Mail, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { BottomNav } from "@/components/Navigation";
import { MOCK_USERS } from "@/lib/mock-users";
import { motion, AnimatePresence } from "framer-motion";

type Notification = {
  id: string;
  type: "match" | "like" | "message_request" | "system";
  userId?: string;
  text: string;
  time: string;
  read: boolean;
};

export default function NotificationsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user, acceptMessageRequest, declineMessageRequest, markAllNotificationsAsRead } = useUser();

  // Mark all as read when leaving the page
  React.useEffect(() => {
    return () => {
      markAllNotificationsAsRead();
    };
  }, [markAllNotificationsAsRead]);

  const txt = {
    title: language === 'az' ? 'Bildirişlər' : 'Notifications',
    noNotifications: language === 'az' ? 'Hələ ki, bildiriş yoxdur' : 'No notifications yet',
    viewedProfile: language === 'az' ? 'profilinizə baxdı' : 'viewed your profile',
    likedYou: language === 'az' ? 'sizi bəyəndi' : 'liked you',
    newMatch: language === 'az' ? 'ilə uyğunluq tapdınız!' : 'You matched!',
    messageRequest: language === 'az' ? 'sizinlə söhbət etmək istəyir' : 'wants to chat with you',
    goldOffer: language === 'az' ? 'Danyeri Premium 50% endirimdə!' : '50% off Danyeri Premium!',
    now: language === 'az' ? 'İndi' : 'Just now',
    recently: language === 'az' ? 'Bu yaxınlarda' : 'Recently',
    accept: language === 'az' ? 'Qəbul Et' : 'Accept',
    decline: language === 'az' ? 'Rədd Et' : 'Decline',
    sendMessage: language === 'az' ? 'Mesaj Göndər' : 'Send Message',
  };

  // Generate notifications from real user data
  const notifications = useMemo(() => {
    const notifs: Notification[] = [];
    
    // New matches (unread)
    user?.unreadMatches?.forEach((matchId, index) => {
      const matchedUser = MOCK_USERS.find(u => u.id === matchId);
      if (matchedUser) {
        notifs.push({
          id: `match-${matchId}`,
          type: "match",
          userId: matchId,
          text: `${matchedUser.name} ${txt.newMatch}`,
          time: txt.now,
          read: false,
        });
      }
    });

    // Message requests
    user?.messageRequests?.forEach((requesterId) => {
      const requester = MOCK_USERS.find(u => u.id === requesterId);
      if (requester) {
        notifs.push({
          id: `request-${requesterId}`,
          type: "message_request",
          userId: requesterId,
          text: `${requester.name} ${txt.messageRequest}`,
          time: txt.recently,
          read: user.seenMessageRequests?.includes(requesterId) || false,
        });
      }
    });

    // Read matches (already seen)
    user?.matches?.filter(id => !user?.unreadMatches?.includes(id)).forEach((matchId) => {
      const matchedUser = MOCK_USERS.find(u => u.id === matchId);
      if (matchedUser) {
        notifs.push({
          id: `match-read-${matchId}`,
          type: "match",
          userId: matchId,
          text: `${matchedUser.name} ${txt.newMatch}`,
          time: txt.recently,
          read: true,
        });
      }
    });

    // System notification (always show one)
    notifs.push({
      id: "system-premium",
      type: "system",
      text: txt.goldOffer,
      time: txt.recently,
      read: true,
    });

    return notifs;
  }, [user, txt]);

  const getUser = (userId?: string) => MOCK_USERS.find(u => u.id === userId);

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
              const notifUser = getUser(notif.userId);
              
              return (
                <motion.div 
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
                    notif.read 
                      ? "bg-card border-border" 
                      : "bg-primary/5 border-primary/20"
                  }`}
                >
                  <div className="relative shrink-0">
                    {notif.type === "system" ? (
                      <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
                        <Star className="w-6 h-6 fill-current" />
                      </div>
                    ) : (
                      <img 
                        src={notifUser?.avatar || "/avatars/default.png"} 
                        className="w-12 h-12 rounded-full object-cover" 
                        alt="User"
                      />
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
                    {notif.type === "message_request" && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center">
                         <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                           <Mail className="w-2 h-2 text-white" />
                         </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                     <p className="text-sm">{notif.text}</p>
                     <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                  </div>

                  {/* Action Buttons */}
                  {notif.type === "match" && notif.userId && (
                    <Button 
                      size="sm" 
                      className="shrink-0 rounded-full"
                      onClick={() => router.push(`/messages?chat=${notif.userId}`)}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {txt.sendMessage}
                    </Button>
                  )}

                  {notif.type === "message_request" && notif.userId && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => declineMessageRequest(notif.userId!)}
                        className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                        title={txt.decline}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                      <button
                        onClick={() => acceptMessageRequest(notif.userId!)}
                        className="w-8 h-8 rounded-full bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center transition-colors"
                        title={txt.accept}
                      >
                        <Check className="w-4 h-4 text-green-500" />
                      </button>
                    </div>
                  )}

                  {!notif.read && notif.type !== "match" && notif.type !== "message_request" && (
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
