"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { MOCK_USERS } from "@/lib/mock-users";
import { getChannelId } from "@/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";

type MessageData = {
  _id: string;
  body: string;
  userId: string;
  channelId: string;
  _creationTime: number;
};

export function NotificationHandler() {
  const { user } = useUser();
  const { language } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousMessagesRef = useRef<Map<string, string[]>>(new Map());
  const hasPermissionRef = useRef(false);
  const isInitializedRef = useRef(false);
  const initializationTimeRef = useRef(Date.now());

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        hasPermissionRef.current = true;
      } else if (Notification.permission !== "denied") {
        // Delay permission request to avoid blocking
        const timeout = setTimeout(() => {
          Notification.requestPermission().then((permission) => {
            hasPermissionRef.current = permission === "granted";
          });
        }, 3000);
        return () => clearTimeout(timeout);
      }
    }
  }, []);

  // Get channel IDs for all matches
  const channelIds = user?.matches?.map((matchId) => 
    getChannelId(user.id, matchId)
  ) || [];

  // Query messages for the first 5 matched channels (to avoid too many queries)
  const channel1 = useQuery(api.messages.list, channelIds[0] ? { channelId: channelIds[0] } : "skip");
  const channel2 = useQuery(api.messages.list, channelIds[1] ? { channelId: channelIds[1] } : "skip");
  const channel3 = useQuery(api.messages.list, channelIds[2] ? { channelId: channelIds[2] } : "skip");
  const channel4 = useQuery(api.messages.list, channelIds[3] ? { channelId: channelIds[3] } : "skip");
  const channel5 = useQuery(api.messages.list, channelIds[4] ? { channelId: channelIds[4] } : "skip");
  
  // General channel
  const generalMessages = useQuery(api.messages.list, { channelId: "general" });

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!hasPermissionRef.current) return;
    
    try {
      // Try to use Service Worker notification (works in background)
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            ...options,
            requireInteraction: false,
          });
        });
      } else {
        // Fallback to regular notification
        new Notification(title, options);
      }
    } catch (e) {
      console.error("Failed to show notification:", e);
    }
  }, []);

  const checkAndNotify = useCallback((
    messages: MessageData[] | undefined, 
    channelId: string,
    matchUserId?: string
  ) => {
    if (!messages || !user) return;
    
    // Skip if we're viewing this specific chat
    const isViewingThisChat = pathname === "/messages" && 
      searchParams?.get("userId") === matchUserId;
    
    if (isViewingThisChat) return;
    
    const currentIds = messages.map(m => m._id);
    const prevIds = previousMessagesRef.current.get(channelId) || [];
    
    // Find new messages (not in previous list)
    const newMessages = messages.filter(m => 
      !prevIds.includes(m._id) && 
      m.userId !== user.name && // Not from current user
      m._creationTime > initializationTimeRef.current // Only messages after page load
    );
    
    // Show notification for each new message
    newMessages.forEach(msg => {
      const senderName = msg.userId;
      const matchUser = matchUserId ? MOCK_USERS.find(u => u.id === matchUserId) : null;
      
      // Clean message text (remove STORY tags etc)
      let messageText = msg.body;
      const storyMatch = messageText.match(/^\[STORY:[^\]]+\]\s*(.*)/);
      if (storyMatch) {
        messageText = `📷 ${storyMatch[1] || (language === 'az' ? 'Şəkil' : 'Image')}`;
      }
      
      showNotification(
        matchUser?.name || senderName,
        {
          body: messageText.substring(0, 100),
          icon: matchUser?.avatar || "/icons/icon-192x192.png",
          tag: `msg-${channelId}`,
        }
      );
    });
    
    // Update previous messages
    previousMessagesRef.current.set(channelId, currentIds);
  }, [user, pathname, searchParams, language, showNotification]);

  // Check for new messages in all channels
  useEffect(() => {
    if (!isInitializedRef.current) {
      // First run - just store current state, don't notify
      if (generalMessages) previousMessagesRef.current.set("general", generalMessages.map(m => m._id));
      if (channel1 && channelIds[0]) previousMessagesRef.current.set(channelIds[0], channel1.map(m => m._id));
      if (channel2 && channelIds[1]) previousMessagesRef.current.set(channelIds[1], channel2.map(m => m._id));
      if (channel3 && channelIds[2]) previousMessagesRef.current.set(channelIds[2], channel3.map(m => m._id));
      if (channel4 && channelIds[3]) previousMessagesRef.current.set(channelIds[3], channel4.map(m => m._id));
      if (channel5 && channelIds[4]) previousMessagesRef.current.set(channelIds[4], channel5.map(m => m._id));
      
      if (generalMessages || channel1 || channel2) {
        isInitializedRef.current = true;
      }
      return;
    }
    
    // Skip if on messages page viewing messages list
    const isOnMessagesPage = pathname === "/messages" && !searchParams?.get("userId");
    if (isOnMessagesPage) return;
    
    // Check each channel
    if (generalMessages) checkAndNotify(generalMessages as MessageData[], "general");
    if (channel1 && channelIds[0]) checkAndNotify(channel1 as MessageData[], channelIds[0], user?.matches?.[0]);
    if (channel2 && channelIds[1]) checkAndNotify(channel2 as MessageData[], channelIds[1], user?.matches?.[1]);
    if (channel3 && channelIds[2]) checkAndNotify(channel3 as MessageData[], channelIds[2], user?.matches?.[2]);
    if (channel4 && channelIds[3]) checkAndNotify(channel4 as MessageData[], channelIds[3], user?.matches?.[3]);
    if (channel5 && channelIds[4]) checkAndNotify(channel5 as MessageData[], channelIds[4], user?.matches?.[4]);
    
  }, [generalMessages, channel1, channel2, channel3, channel4, channel5, channelIds, user, pathname, searchParams, checkAndNotify]);

  return null; // This component doesn't render anything
}
