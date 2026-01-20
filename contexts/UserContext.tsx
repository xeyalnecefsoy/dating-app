"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getAvatarByGender } from "@/lib/mock-users";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export type UserProfile = {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female";
  lookingFor: "female" | "male";
  location: string;
  bio: string;
  values: string[];
  loveLanguage: string;
  interests: string[];
  communicationStyle: "Direct" | "Empathetic" | "Analytical" | "Playful";
  avatar: string;
  badges: string[];
  streak: number;
  lastActiveDate: string;
  matches: string[];
  unreadMatches: string[]; // Track unread status
  likes: string[];
  messageRequests: string[]; // Incoming message requests from other users
  sentMessageRequests: string[]; // Sent message requests to other users
  seenMessageRequests: string[]; // Track seen message requests
};

type UserContextType = {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isOnboarded: boolean;
  isLoading: boolean;
  completeOnboarding: (profile: Partial<UserProfile>) => void;
  addBadge: (badge: string) => void;
  incrementStreak: () => void;
  likeUser: (userId: string) => void;
  matchUser: (userId: string) => void;
  markMatchAsRead: (userId: string) => void;
  markAllNotificationsAsRead: () => void;
  sendMessageRequest: (userId: string) => void;
  cancelMessageRequest: (userId: string) => void;
  acceptMessageRequest: (userId: string) => void;
  declineMessageRequest: (userId: string) => void;
  logout: () => void;
};

const defaultUser: UserProfile = {
  id: "current-user",
  name: "",
  age: 0,
  gender: "male",
  lookingFor: "female",
  location: "",
  bio: "",
  values: [],
  loveLanguage: "",
  interests: [],
  communicationStyle: "Empathetic",
  avatar: "",
  badges: [],
  streak: 0,
  lastActiveDate: "",
  matches: [],
  unreadMatches: [],
  likes: [],
  messageRequests: [],
  sentMessageRequests: [],
  seenMessageRequests: [],
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Convex Hooks
  const createMatchMutation = useMutation(api.matches.create);
  const convexMatches = useQuery(api.matches.list, user ? { userId: user.id } : "skip");
  const ping = useMutation(api.presence.ping);

  // Heartbeat to keep presence active
  useEffect(() => {
    if (user?.id) {
        // Ping immediately
        ping({ userId: user.id });
        
        // Ping every minute
        const interval = setInterval(() => {
            ping({ userId: user.id });
        }, 60000);
        return () => clearInterval(interval);
    }
  }, [user?.id, ping]);

  // Sync Convex matches with local matches
  useEffect(() => {
    if (user && convexMatches) {
        // convexMatches is an array of partner IDs
        // Ensure all IDs are strings and unique
        const remoteIds = convexMatches.map(id => String(id));
        const localIds = user.matches.map(id => String(id));
        
        const newMatches = remoteIds.filter(id => !localIds.includes(id));
        
        console.log("Convex Sync:", { remoteIds, localIds, newMatches });

        if (newMatches.length > 0) {
            updateUser({
                ...user,
                matches: [...user.matches, ...newMatches],
                // Add new remote matches as unread if not mostly already there
                unreadMatches: [...(user.unreadMatches || []), ...newMatches]
            });
        }
    }
  }, [convexMatches, user]);

  // Sync Local -> Convex (One way sync for legacy/local-first matches)
  useEffect(() => {
    if (user && convexMatches !== undefined) {
      const remoteIds = convexMatches.map(id => String(id));
      const localIds = user.matches.map(id => String(id));
      
      // Find matches that are in Local but NOT in Convex
      const missingInRemote = localIds.filter(id => !remoteIds.includes(id));
      
      if (missingInRemote.length > 0) {
        console.log("Pushing local matches to Convex:", missingInRemote);
        missingInRemote.forEach(id => {
           createMatchMutation({ user1Id: user.id, user2Id: id });
        });
      }
    }
  }, [user, convexMatches, createMatchMutation]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("aura-user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setIsOnboarded(true);
      
      // Check streak
      const today = new Date().toDateString();
      if (parsed.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (parsed.lastActiveDate === yesterday.toDateString()) {
          // Continue streak
          updateUser({ ...parsed, streak: parsed.streak + 1, lastActiveDate: today });
        } else if (parsed.lastActiveDate !== today) {
          // Reset streak
          updateUser({ ...parsed, streak: 1, lastActiveDate: today });
        }
      }
    } else if (process.env.NODE_ENV === 'development') {
      // Auto-onboard in development
      const devUser = {
        ...defaultUser,
        name: "Dev User",
        age: 25,
        location: "Bakı",
        avatar: "/avatars/aidan.png",
        bio: "Development user",
        values: ["Growth", "Honesty"],
        interests: ["Coding", "Coffee"],
        badges: ["Developer"],
        streak: 100,
        lastActiveDate: new Date().toDateString(),
      };
      setUser(devUser);
      setIsOnboarded(true);
      localStorage.setItem("aura-user", JSON.stringify(devUser));
    }
    setIsLoading(false);
  }, []);

  const updateUser = React.useCallback((newUser: UserProfile | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("aura-user", JSON.stringify(newUser));
      setIsOnboarded(true); // Automatically consider onboarded if user exists
    } else {
      localStorage.removeItem("aura-user");
      setIsOnboarded(false);
    }
  }, []);

  const completeOnboarding = React.useCallback((profile: Partial<UserProfile>) => {
    // Generate appropriate avatar based on gender
    const gender = profile.gender || "male";
    const avatar = profile.avatar || getAvatarByGender(gender, Math.floor(Math.random() * 5));
    
    const newUser: UserProfile = {
      ...defaultUser,
      ...profile,
      avatar,
      id: "current-user",
      streak: 1,
      lastActiveDate: new Date().toDateString(),
      badges: ["Early Adopter"],
    };
    updateUser(newUser);
    setIsOnboarded(true);
  }, [updateUser]);

  const addBadge = React.useCallback((badge: string) => {
    setUser(prev => {
      if (prev && !prev.badges.includes(badge)) {
        const updated = { ...prev, badges: [...prev.badges, badge] };
        localStorage.setItem("aura-user", JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, []);

  const incrementStreak = React.useCallback(() => {
    setUser(prev => {
      if (prev) {
        const updated = { ...prev, streak: prev.streak + 1 };
        localStorage.setItem("aura-user", JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, []);

  const likeUser = React.useCallback((userId: string) => {
    setUser(prev => {
      if (prev && !prev.likes.includes(userId)) {
        const updated = { ...prev, likes: [...prev.likes, userId] };
        localStorage.setItem("aura-user", JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, []);

  const matchUser = React.useCallback(async (userId: string) => {
    // We need to access the current user state for the optimistic update and check
    // Since we are inside a callback, let's use functional state update for safety
    // BUT we also need to trigger side effects (mutation) which shouldn't be in the setter.
    // However, for matchUser, it seems safe to just read 'user' from closure if 'user' is in dependency?
    // NO, if we put 'user' in dependency, this function changes every render, causing re-renders downstream if used in effects.
    // Better pattern: use a ref for current user or just standard functional updates where possible.
    // For the side effect (createMatchMutation), we can allow it to close over variables.
    // Wait, createMatchMutation is stable. User ID... 
    
    // Let's use the functional update pattern for local state to be safe, 
    // and for the mutation, we might need the ID. Ideally pass ID to this function or access from ref.
    // For simplicity given the infinite loop is primarily about `markAllNotificationsAsRead`, let's just use functional updates for state.
    
    let shouldMutate = false;
    let currentUserId = "";

    setUser(prev => {
      if (prev && !prev.matches.includes(userId)) {
        shouldMutate = true;
        currentUserId = prev.id;
        // Add badge 'First Match' if not present
        const newBadges = prev.badges.includes("First Match") ? prev.badges : [...prev.badges, "First Match"];
        
        const updated = { 
          ...prev, 
          matches: [...prev.matches, userId],
          unreadMatches: [...(prev.unreadMatches || []), userId],
          badges: newBadges
        };
        localStorage.setItem("aura-user", JSON.stringify(updated));
        return updated;
      }
      return prev;
    });

    if (shouldMutate && currentUserId) {
        // Sync with DB
         await createMatchMutation({ user1Id: "current-user", user2Id: userId }); // user1Id is usually auth'd user, but using "current-user" string from context for now as per simple auth
    }
  }, [createMatchMutation]);

  const markMatchAsRead = React.useCallback((userId: string) => {
    setUser(prev => {
      if (prev && prev.unreadMatches?.includes(userId)) {
        const updated = {
          ...prev,
          unreadMatches: prev.unreadMatches.filter(id => id !== userId)
        };
        localStorage.setItem("aura-user", JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, []);

  const markAllNotificationsAsRead = React.useCallback(() => {
    setUser(prev => {
      if (prev) {
        const updated = {
          ...prev,
          unreadMatches: [],
          seenMessageRequests: prev.messageRequests || []
        };
        localStorage.setItem("aura-user", JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, []);

  const sendMessageRequest = React.useCallback((userId: string) => {
    setUser(prev => {
      if (prev && !prev.sentMessageRequests?.includes(userId)) {
        const updated = {
          ...prev,
          sentMessageRequests: [...(prev.sentMessageRequests || []), userId]
        };
        localStorage.setItem("aura-user", JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, []);

  const cancelMessageRequest = React.useCallback((userId: string) => {
    setUser(prev => {
      if (prev && prev.sentMessageRequests?.includes(userId)) {
        const updated = {
          ...prev,
          sentMessageRequests: prev.sentMessageRequests.filter(id => id !== userId)
        };
        localStorage.setItem("aura-user", JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, []);

  const acceptMessageRequest = React.useCallback((userId: string) => {
    setUser(prev => {
      if (prev && prev.messageRequests?.includes(userId)) {
         const updated = {
          ...prev,
          messageRequests: prev.messageRequests.filter(id => id !== userId),
          matches: [...prev.matches, userId],
          unreadMatches: [...(prev.unreadMatches || []), userId]
        };
        localStorage.setItem("aura-user", JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, []);

  const declineMessageRequest = React.useCallback((userId: string) => {
    setUser(prev => {
      if (prev && prev.messageRequests?.includes(userId)) {
        const updated = {
          ...prev,
          messageRequests: prev.messageRequests.filter(id => id !== userId)
        };
        localStorage.setItem("aura-user", JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, []);

  const logout = React.useCallback(() => {
    updateUser(null);
  }, [updateUser]);

  return (
    <UserContext.Provider value={{
      user,
      setUser: updateUser,
      isOnboarded,
      isLoading,
      completeOnboarding,
      addBadge,
      incrementStreak,
      likeUser,
      matchUser,
      markMatchAsRead,
      markAllNotificationsAsRead,
      sendMessageRequest,
      cancelMessageRequest,
      acceptMessageRequest,
      declineMessageRequest,
      logout,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
