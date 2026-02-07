"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useUser as useClerkUser, useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { getAvatarByGender } from "@/lib/mock-users";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";

// Superadmin email - bypasses onboarding
const SUPERADMIN_EMAIL = "xeyalnecefsoy@gmail.com";

export type UserProfile = {
  id: string;
  clerkId?: string; // Clerk user ID
  name: string;
  email?: string;
  age: number;
  birthDay?: string;
  birthMonth?: string;
  birthYear?: string;
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
  status?: "active" | "waitlist" | "banned"; // Waitlist status
  role?: "user" | "moderator" | "admin" | "superadmin"; // Admin role
};

type UserContextType = {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isOnboarded: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
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
  id: "",
  clerkId: "",
  name: "",
  age: 0,
  birthDay: "",
  birthMonth: "",
  birthYear: "",
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
  status: "active",
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Clerk hooks
  const { user: clerkUser, isLoaded: isClerkLoaded } = useClerkUser();
  const { isSignedIn } = useAuth();

  // Convex Hooks
  const createMatchMutation = useMutation(api.matches.create);
  const sendRequestMutation = useMutation(api.matches.sendRequest);
  const acceptRequestMutation = useMutation(api.matches.acceptRequest);
  const declineRequestMutation = useMutation(api.matches.declineRequest);
  const createOrUpdateUserMutation = useMutation(api.users.createOrUpdateUser);
  
  // Query to get user from Convex DB
  const convexUser = useQuery(
    api.users.getUser, 
    isSignedIn && clerkUser ? { clerkId: clerkUser.id } : "skip"
  );
  
  const convexMatches = useQuery(api.matches.list, user ? { userId: user.id } : "skip");
  const convexRequests = useQuery(api.matches.getRequests, user ? { userId: user.id } : "skip");
  
  const ping = useMutation(api.presence.ping);

  // Generate storage key based on Clerk user ID
  const getStorageKey = useCallback((clerkId: string) => {
    return `danyeri-user-${clerkId}`;
  }, []);

  const storeSubscription = useMutation(api.subscriptions.store);

  // Auto-subscribe to push on mount/login (only when fully authenticated)
  useEffect(() => {
    // Only subscribe when user is loaded AND signed in with Clerk
    if (user && isSignedIn && "serviceWorker" in navigator) {
       // Longer delay to ensure Convex auth is fully propagated
       const timer = setTimeout(() => {
          import("@/lib/push-notifications").then(({ subscribeToPushNotifications }) => {
             subscribeToPushNotifications(storeSubscription).catch((err) => {
               console.log("Push subscription skipped (auth may not be ready):", err);
             });
          });
       }, 8000); // 8 seconds to ensure auth is ready
       return () => clearTimeout(timer);
    }
  }, [user, isSignedIn, storeSubscription]);

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
        
        // Also check message requests synching
        const remoteRequests = convexRequests ? convexRequests.map(id => String(id)) : [];
        const localRequests = user.messageRequests || [];
        const newRequests = remoteRequests.filter(id => !localRequests.includes(id));
        
        if (newMatches.length > 0 || (newRequests.length > 0 && convexRequests)) {
             console.log("Convex Sync:", { newMatches, newRequests });
             
             updateUser({
                ...user,
                matches: [...user.matches, ...newMatches],
                unreadMatches: [...(user.unreadMatches || []), ...newMatches],
                // Add new message requests
                messageRequests: [...localRequests, ...newRequests]
            });
        }
    }
  }, [convexMatches, convexRequests, user]);

  // Sync Local -> Convex (One way sync for legacy/local-first matches)
  const { isAuthenticated: isConvexAuthenticated } = useConvexAuth();

  // Sync Local -> Convex (One way sync for legacy/local-first matches)
  useEffect(() => {
    if (user && convexMatches !== undefined && isConvexAuthenticated) {
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

  // Load user profile when Clerk user changes
  useEffect(() => {
    if (!isClerkLoaded) return;

    if (isSignedIn && clerkUser) {
      const storageKey = getStorageKey(clerkUser.id);
      const savedUser = localStorage.getItem(storageKey);
      const clerkEmail = clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase();
      const isSuperadmin = clerkEmail === SUPERADMIN_EMAIL.toLowerCase();
      
      // SUPERADMIN (FOUNDER) - Always use correct data, bypass localStorage
      if (isSuperadmin) {
        // Clear any old localStorage data for superadmin
        localStorage.removeItem(storageKey);
        
        const founderProfile: UserProfile = {
          ...defaultUser,
          id: clerkUser.id,
          clerkId: clerkUser.id,
          email: clerkEmail,
          name: "Xəyal Nəcəfsoy",
          age: 21,
          birthDay: "28",
          birthMonth: "5",
          birthYear: "2004",
          gender: "male",
          lookingFor: "female",
          location: "Xankəndi",
          bio: "Danyeri platformasının qurucusu",
          avatar: clerkUser.imageUrl || getAvatarByGender("male"),
          role: "superadmin",
          status: "active",
          streak: 1,
          lastActiveDate: new Date().toDateString(),
        };
        
        updateUserInternal(founderProfile, storageKey);
        setIsOnboarded(true);
        setIsLoading(false);
        
        // Persist to Convex DB
        createOrUpdateUserMutation({
          clerkId: founderProfile.id,
          name: founderProfile.name,
          email: founderProfile.email,
          gender: founderProfile.gender,
          age: founderProfile.age,
          birthDay: founderProfile.birthDay,
          birthMonth: founderProfile.birthMonth,
          birthYear: founderProfile.birthYear,
          location: founderProfile.location,
          bio: founderProfile.bio,
          values: founderProfile.values,
          loveLanguage: founderProfile.loveLanguage,
          interests: founderProfile.interests,
          communicationStyle: founderProfile.communicationStyle,
          avatar: founderProfile.avatar,
          lookingFor: founderProfile.lookingFor,
        }).catch(err => console.error("Failed to save founder to DB:", err));
        
        return; // Exit early for superadmin
      }
      
      if (savedUser) {
        // Option 1: Restore from LocalStorage (for regular users)
        const parsed = JSON.parse(savedUser);
        
        // Merge Convex user data (role, etc.) if available
        const mergedUser = {
          ...parsed,
          email: clerkEmail || parsed.email,
          role: convexUser?.role || parsed.role,
        };
        
        setUser(mergedUser);
        setIsOnboarded(true);
        
        // Check streak
        const today = new Date().toDateString();
        if (parsed.lastActiveDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (parsed.lastActiveDate === yesterday.toDateString()) {
            // Continue streak
            updateUserInternal({ ...mergedUser, streak: mergedUser.streak + 1, lastActiveDate: today }, storageKey);
          } else if (parsed.lastActiveDate !== today) {
            // Reset streak
            updateUserInternal({ ...mergedUser, streak: 1, lastActiveDate: today }, storageKey);
          }
        }
        setIsLoading(false);
      } else {
        // Option 2: No LocalStorage. Check Convex DB.
        
        if (convexUser === undefined) {
          // DB query is still loading. Do not stop loading yet.
          return;
        }

        if (convexUser) {
          // User exists in DB! Restore session.
          console.log("Restoring user session from Convex DB...");
          
          const restoredUser: UserProfile = {
            ...defaultUser,
            id: clerkUser.id,
            clerkId: clerkUser.id,
            email: convexUser.email || clerkEmail,
            name: convexUser.name || clerkUser.firstName || "User",
            age: convexUser.age || 0,
            birthDay: convexUser.birthDay || "",
            birthMonth: convexUser.birthMonth || "",
            birthYear: convexUser.birthYear || "",
            gender: (convexUser.gender as "male" | "female") || "male",
            lookingFor: (convexUser.lookingFor as "male" | "female") || "female",
            location: convexUser.location || "",
            bio: convexUser.bio || "",
            values: convexUser.values || [],
            loveLanguage: convexUser.loveLanguage || "",
            interests: convexUser.interests || [],
            communicationStyle: (convexUser.communicationStyle as any) || "Empathetic",
            avatar: convexUser.avatar || "",
            // Use defaults for local-only/derived state
            badges: [], 
            streak: 0, 
            lastActiveDate: new Date().toDateString(),
            matches: [], 
            unreadMatches: [],
            likes: [], 
            messageRequests: [], 
            sentMessageRequests: [],
            seenMessageRequests: [],
            status: (convexUser.status as any) || "active",
            role: (convexUser.role as any) || (isSuperadmin ? 'superadmin' : 'user'),
          };

          updateUserInternal(restoredUser, storageKey);
          setIsOnboarded(true);
        } else {
          // Truly new user - Proceed to Onboarding
          setUser(null);
          setIsOnboarded(false);
        }
        setIsLoading(false);
      }
    } else {
      // Not signed in
      setUser(null);
      setIsOnboarded(false);
      setIsLoading(false);
    }
  }, [isClerkLoaded, isSignedIn, clerkUser, getStorageKey, convexUser]);

  // Route Protection for Waitlisted Users
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // List of paths allowed for waitlisted users
    const allowedPaths = ["/", "/profile", "/settings", "/premium", "/sign-in", "/sign-up", "/onboarding"]; // onboarding is handled separately but good to include
    
    // Check if user is fully loaded and has waitlist status
    if (!isLoading && isOnboarded && user?.status === "waitlist") {
      // If current path is not allowed, redirect to home
      if (!allowedPaths.includes(pathname)) {
        router.replace("/");
      }
    }
  }, [user, pathname, isLoading, isOnboarded, router]);

  const updateUserInternal = useCallback((newUser: UserProfile | null, storageKey: string) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem(storageKey, JSON.stringify(newUser));
      setIsOnboarded(true);
    } else {
      localStorage.removeItem(storageKey);
      setIsOnboarded(false);
    }
  }, []);

  const updateUser = useCallback((newUser: UserProfile | null) => {
    if (!clerkUser) return;
    const storageKey = getStorageKey(clerkUser.id);
    updateUserInternal(newUser, storageKey);
  }, [clerkUser, getStorageKey, updateUserInternal]);

  const completeOnboarding = useCallback(async (profile: Partial<UserProfile>) => {
    if (!clerkUser) return;
    
    const storageKey = getStorageKey(clerkUser.id);
    
    // Generate appropriate avatar based on gender
    const gender = profile.gender || "male";
    const avatar = profile.avatar || getAvatarByGender(gender, Math.floor(Math.random() * 5));
    
    // Use Clerk ID as unique identifier
    const id = clerkUser.id;
    const email = clerkUser.emailAddresses?.[0]?.emailAddress;

    // Save to Convex DB first - it handles waitlist logic including staff bypass
    try {
      const result = await createOrUpdateUserMutation({
        clerkId: clerkUser.id,
        email: email,
        name: profile.name || clerkUser.firstName || clerkUser.username || "",
        gender: gender,
        age: profile.age,
        birthDay: profile.birthDay,
        birthMonth: profile.birthMonth,
        birthYear: profile.birthYear,
        location: profile.location || "",
        bio: profile.bio || "",
        values: profile.values || [],
        loveLanguage: profile.loveLanguage || "",
        interests: profile.interests || [],
        communicationStyle: profile.communicationStyle || "Empathetic",
        avatar: avatar,
        lookingFor: gender === "male" ? "female" : "male",
      });
      
      // Use the status returned from Convex (handles staff bypass)
      const status = result.status as "active" | "waitlist" | "banned";
      
      const newUser: UserProfile = {
        ...defaultUser,
        ...profile,
        avatar,
        id,
        clerkId: clerkUser.id,
        email: email,
        name: profile.name || clerkUser.firstName || clerkUser.username || "",
        streak: 1,
        lastActiveDate: new Date().toDateString(),
        badges: ["Early Adopter"],
        status: status,
      };
      
      updateUserInternal(newUser, storageKey);
      setIsOnboarded(true);
    } catch (error) {
      console.error("Failed to save user to Convex:", error);
      // Fall back to local-only (old behavior)
      const status = gender === "female" ? "active" : "waitlist";
      const newUser: UserProfile = {
        ...defaultUser,
        ...profile,
        avatar,
        id,
        clerkId: clerkUser.id,
        name: profile.name || clerkUser.firstName || clerkUser.username || "",
        streak: 1,
        lastActiveDate: new Date().toDateString(),
        badges: ["Early Adopter"],
        status: status as "active" | "waitlist",
      };
      updateUserInternal(newUser, storageKey);
      setIsOnboarded(true);
    }
  }, [clerkUser, getStorageKey, updateUserInternal, createOrUpdateUserMutation]);

  // Auto-heal: Sync Local User to DB if missing (Placed here to avoid ReferenceError)
  useEffect(() => {
     // If we have a local user, are signed in, but Convex returns null (user deleted or not synced),
     // trigger a re-sync to restore the user in the backend.
     if (isSignedIn && isClerkLoaded && user && convexUser === null) {
         console.log("User exists locally but not in DB. Triggering auto-sync...");
         // We pass the current local user data to re-populate the DB
         completeOnboarding(user);
     }
  }, [isSignedIn, isClerkLoaded, user, convexUser, completeOnboarding]);

  const addBadge = useCallback((badge: string) => {
    setUser(prev => {
      if (prev && !prev.badges.includes(badge)) {
        const updated = { ...prev, badges: [...prev.badges, badge] };
        if (clerkUser) {
          localStorage.setItem(getStorageKey(clerkUser.id), JSON.stringify(updated));
        }
        return updated;
      }
      return prev;
    });
  }, [clerkUser, getStorageKey]);

  const incrementStreak = useCallback(() => {
    setUser(prev => {
      if (prev) {
        const updated = { ...prev, streak: prev.streak + 1 };
        if (clerkUser) {
          localStorage.setItem(getStorageKey(clerkUser.id), JSON.stringify(updated));
        }
        return updated;
      }
      return prev;
    });
  }, [clerkUser, getStorageKey]);

  const likeUser = useCallback((userId: string) => {
    setUser(prev => {
      if (prev && !prev.likes.includes(userId)) {
        const updated = { ...prev, likes: [...prev.likes, userId] };
        if (clerkUser) {
          localStorage.setItem(getStorageKey(clerkUser.id), JSON.stringify(updated));
        }
        return updated;
      }
      return prev;
    });
  }, [clerkUser, getStorageKey]);

  const matchUser = useCallback(async (userId: string) => {
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
        if (clerkUser) {
          localStorage.setItem(getStorageKey(clerkUser.id), JSON.stringify(updated));
        }
        return updated;
      }
      return prev;
    });

    if (shouldMutate && currentUserId) {
        // Sync with DB
         await createMatchMutation({ user1Id: currentUserId, user2Id: userId }); 
    }
  }, [createMatchMutation, clerkUser, getStorageKey]);

  const markMatchAsRead = useCallback((userId: string) => {
    setUser(prev => {
      if (prev && prev.unreadMatches?.includes(userId)) {
        const updated = {
          ...prev,
          unreadMatches: prev.unreadMatches.filter(id => id !== userId)
        };
        if (clerkUser) {
          localStorage.setItem(getStorageKey(clerkUser.id), JSON.stringify(updated));
        }
        return updated;
      }
      return prev;
    });
  }, [clerkUser, getStorageKey]);

  const markAllNotificationsAsRead = useCallback(() => {
    setUser(prev => {
      if (prev) {
        const updated = {
          ...prev,
          unreadMatches: [],
          seenMessageRequests: prev.messageRequests || []
        };
        if (clerkUser) {
          localStorage.setItem(getStorageKey(clerkUser.id), JSON.stringify(updated));
        }
        return updated;
      }
      return prev;
    });
  }, [clerkUser, getStorageKey]);

  const sendMessageRequest = useCallback(async (userId: string) => {
    let currentUserId = "";
    setUser(prev => {
      if (prev && !prev.sentMessageRequests?.includes(userId)) {
        currentUserId = prev.id;
        const updated = {
          ...prev,
          sentMessageRequests: [...(prev.sentMessageRequests || []), userId]
        };
        if (clerkUser) {
          localStorage.setItem(getStorageKey(clerkUser.id), JSON.stringify(updated));
        }
        return updated;
      }
      return prev;
    });

    if (currentUserId) {
        await sendRequestMutation({ senderId: currentUserId, receiverId: userId });
    }
  }, [sendRequestMutation, clerkUser, getStorageKey]);

  const cancelMessageRequest = useCallback((userId: string) => {
     // TODO: Implement cancel implementation in backend if needed
    setUser(prev => {
      if (prev && prev.sentMessageRequests?.includes(userId)) {
        const updated = {
          ...prev,
          sentMessageRequests: prev.sentMessageRequests.filter(id => id !== userId)
        };
        if (clerkUser) {
          localStorage.setItem(getStorageKey(clerkUser.id), JSON.stringify(updated));
        }
        return updated;
      }
      return prev;
    });
  }, [clerkUser, getStorageKey]);

  const acceptMessageRequest = useCallback(async (userId: string) => {
    let currentUserId = "";
    setUser(prev => {
      if (prev && prev.messageRequests?.includes(userId)) {
         currentUserId = prev.id;
         const updated = {
          ...prev,
          messageRequests: prev.messageRequests.filter(id => id !== userId),
          matches: [...prev.matches, userId],
          unreadMatches: [...(prev.unreadMatches || []), userId]
        };
        if (clerkUser) {
          localStorage.setItem(getStorageKey(clerkUser.id), JSON.stringify(updated));
        }
        return updated;
      }
      return prev;
    });

    if (currentUserId) {
        await acceptRequestMutation({ userId: currentUserId, targetId: userId });
    }
  }, [acceptRequestMutation, clerkUser, getStorageKey]);

  const declineMessageRequest = useCallback(async (userId: string) => {
    let currentUserId = "";
    setUser(prev => {
      if (prev && prev.messageRequests?.includes(userId)) {
        currentUserId = prev.id;
        const updated = {
          ...prev,
          messageRequests: prev.messageRequests.filter(id => id !== userId)
        };
        if (clerkUser) {
          localStorage.setItem(getStorageKey(clerkUser.id), JSON.stringify(updated));
        }
        return updated;
      }
      return prev;
    });

    if (currentUserId) {
        await declineRequestMutation({ userId: currentUserId, targetId: userId });
    }
  }, [declineRequestMutation, clerkUser, getStorageKey]);

  const logout = useCallback(() => {
    // Prevent redirect flash by setting loading state
    setIsLoading(true);
    
    // Note: This just clears local user data
    // Actual sign out is handled by Clerk's signOut
    if (clerkUser) {
      localStorage.removeItem(getStorageKey(clerkUser.id));
    }
    setUser(null);
    setIsOnboarded(false);
    
    // isLoading will be reset to false by the main useEffect when isSignedIn becomes false
  }, [clerkUser, getStorageKey]);

  return (
    <UserContext.Provider value={{
      user,
      setUser: updateUser,
      isOnboarded,
      isLoading,
      isAuthenticated: isSignedIn ?? false,
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
