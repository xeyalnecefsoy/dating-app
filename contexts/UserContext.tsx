"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { useUser as useClerkUser, useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { getAvatarByGender } from "@/lib/mock-users";
import { useQuery, useMutation, useAction, useConvexAuth } from "convex/react";
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
  generalLastSeenAt?: number;
  status?: "active" | "waitlist" | "banned" | "rejected" | "needs_revision";
  profileModerationNote?: string;
  role?: "user" | "moderator" | "admin" | "superadmin"; // Admin role
  isPremium?: boolean;
};

type UserContextType = {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isOnboarded: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  completeOnboarding: (profile: Partial<UserProfile>) => Promise<
    | { ok: true; status: UserProfile["status"] }
    | { ok: false; error: unknown }
  >;
  addBadge: (badge: string) => void;
  incrementStreak: () => void;
  likeUser: (userId: string) => void;
  matchUser: (userId: string) => void;
  markMatchAsRead: (userId: string) => void;
  markAllNotificationsAsRead: () => void;
  sendMessageRequest: (userId: string) => Promise<string | null>;
  cancelMessageRequest: (userId: string) => void;
  acceptMessageRequest: (userId: string) => void;
  declineMessageRequest: (userId: string) => void;
  markMessageRequestsAsSeen: () => void;
  dbNotifications: any[] | undefined;
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
  generalLastSeenAt: 0,
  profileModerationNote: undefined,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Track whether we already loaded from localStorage (fast path)
  const hasLoadedFromLocalStorage = useRef(false);
  // Track whether Convex data has been merged
  const hasConvexMerged = useRef(false);

  // Clerk hooks
  const { user: clerkUser, isLoaded: isClerkLoaded } = useClerkUser();
  const { isSignedIn } = useAuth();
  const { isAuthenticated } = useConvexAuth();

  // Convex Hooks
  const createMatchMutation = useMutation(api.matches.create);
  const sendRequestMutation = useMutation(api.matches.sendRequest);
  const acceptRequestMutation = useMutation(api.matches.acceptRequest);
  const declineRequestMutation = useMutation(api.matches.declineRequest);
  const createOrUpdateUserMutation = useMutation(api.users.createOrUpdateUser);
  const checkAvatarModerationAction = useAction(
    api.imageModeration.checkAndStoreAvatarModeration
  );
  const pingPresence = useMutation(api.presence.ping);
  const setOfflinePresence = useMutation(api.presence.setOffline);

  // Query to get user from Convex DB
  const convexUser = useQuery(
    api.users.getUser, 
    isSignedIn && clerkUser ? { clerkId: clerkUser.id } : "skip"
  );
  
  // Cache notifications globally to prevent loading delay when switching pages
  const dbNotifications = useQuery(api.notifications.getEnriched, isAuthenticated ? undefined : "skip");
  
  const convexMatches = useQuery(api.matches.list, user ? { userId: user.id } : "skip");
  const convexRequests = useQuery(api.matches.getRequests, user ? { userId: user.id } : "skip");

  // Presence: heartbeat hər 12 saniyədə bir (online pəncərə 25 saniyə sayılır)
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    pingPresence({ userId: user.id }).catch(() => {});
    const interval = setInterval(() => {
      pingPresence({ userId: user.id }).catch(() => {});
    }, 12_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id, pingPresence]);

  // Brauzer/pəncərə bağlananda dərhal offline göstər (yaşıl nöqtə getsin)
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const handleOffline = () => {
      setOfflinePresence().catch(() => {});
    };
    window.addEventListener("beforeunload", handleOffline);
    window.addEventListener("pagehide", handleOffline);
    return () => {
      window.removeEventListener("beforeunload", handleOffline);
      window.removeEventListener("pagehide", handleOffline);
    };
  }, [isAuthenticated, user?.id, setOfflinePresence]);

  // Badge check — run once when user is authenticated
  const checkBadges = useMutation(api.badges.checkAndAwardBadges);
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    checkBadges({}).catch(() => {});
  }, [isAuthenticated, user?.id, checkBadges]);
  

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
               // console.log("Push subscription skipped (auth may not be ready):", err);
             });
          });
       }, 8000); // 8 seconds to ensure auth is ready
       return () => clearTimeout(timer);
    }
  }, [user, isSignedIn, storeSubscription]);



  const hasInitializedMatches = useRef(false);

  // Convex = source of truth for matches: siyahı həmişə Convex ilə uyğunlaşır (Dashboard-dan siləndə yenidən yaranmır)
  useEffect(() => {
    if (!user || convexMatches === undefined || convexRequests === undefined) return;

    const remoteMatchIds = convexMatches.map((id) => String(id));
    const remoteRequestIds = convexRequests.map((id) => String(id));
    const localMatchIds = user.matches.map((id) => String(id));
    const localRequestIds = (user.messageRequests || []).map((id) => String(id));

    const matchesEqual =
      remoteMatchIds.length === localMatchIds.length &&
      remoteMatchIds.every((id, i) => id === localMatchIds[i]);
    const requestsEqual =
      remoteRequestIds.length === localRequestIds.length &&
      remoteRequestIds.every((id, i) => id === localRequestIds[i]);

    if (matchesEqual && requestsEqual) return;

    hasInitializedMatches.current = true;

    const newMatchIds = remoteMatchIds.filter((id) => !localMatchIds.includes(id));
    const unreadStillValid = (user.unreadMatches || []).filter((id) => remoteMatchIds.includes(id));
    const unreadMatches = [...unreadStillValid, ...newMatchIds];

    updateUser({
      ...user,
      matches: remoteMatchIds,
      messageRequests: remoteRequestIds,
      unreadMatches,
    });
  }, [convexMatches, convexRequests, user]);

  // Local -> Convex push SÖNDÜRÜLDÜ: Dashboard-dan uyğunluq siləndə lokal köhnə siyahı Convex-a yenidən yazılmır
  // (Uyğunluqlar normal flow-da createMatchMutation ilə yaranır; Convex artıq tək mənbədir.)

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

  // FAST PATH: Load from localStorage immediately when Clerk is loaded (no Convex wait)
  useEffect(() => {
    if (!isClerkLoaded || hasLoadedFromLocalStorage.current) return;

    if (isSignedIn && clerkUser) {
      const storageKey = getStorageKey(clerkUser.id);
      const savedUser = localStorage.getItem(storageKey);
      const clerkEmail = clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase();
      const isSuperadmin = clerkEmail === SUPERADMIN_EMAIL.toLowerCase();

      if (savedUser) {
        hasLoadedFromLocalStorage.current = true;
        const parsed = JSON.parse(savedUser);
        let quickUser = {
          ...parsed,
          email: clerkEmail || parsed.email,
        };

        if (isSuperadmin) {
          quickUser = {
            ...quickUser,
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
          };
        }

        setUser(quickUser);
        setIsOnboarded(true);
        setIsLoading(false); // Instantly unblock UI

        // Streak update
        const today = new Date().toDateString();
        if (parsed.lastActiveDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (parsed.lastActiveDate === yesterday.toDateString()) {
            updateUserInternal({ ...quickUser, streak: quickUser.streak + 1, lastActiveDate: today }, storageKey);
          } else {
            updateUserInternal({ ...quickUser, streak: 1, lastActiveDate: today }, storageKey);
          }
        }
      }
    } else {
      // Not signed in — unblock immediately
      setUser(null);
      setIsOnboarded(false);
      setIsLoading(false);
    }
  }, [isClerkLoaded, isSignedIn, clerkUser, getStorageKey, updateUserInternal]);

  // SLOW PATH: Merge Convex data when it arrives (role, status, premium, etc.)
  useEffect(() => {
    if (!isClerkLoaded || !isSignedIn || !clerkUser) return;
    if (convexUser === undefined) return; // Still loading from Convex
    if (hasConvexMerged.current) return; // Already merged
    hasConvexMerged.current = true;

    const storageKey = getStorageKey(clerkUser.id);
    const savedUser = localStorage.getItem(storageKey);
    const clerkEmail = clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase();
    const isSuperadmin = clerkEmail === SUPERADMIN_EMAIL.toLowerCase();

    if (savedUser) {
      if (convexUser === null) {
        console.log("localStorage has stale user data but DB record is gone. Clearing...");
        localStorage.removeItem(storageKey);
        setUser(null);
        setIsOnboarded(false);
        setIsLoading(false);
        return;
      }

      const parsed = JSON.parse(savedUser);
      // matches və messageRequests həmişə Convex-dan gəlir; localStorage-dakı köhnə siyahı merge-da istifadə edilmir (superadmin daxil)
      let mergedUser = {
        ...parsed,
        email: clerkEmail || parsed.email,
        role: convexUser.role || parsed.role,
        status: convexUser.status || parsed.status,
        profileModerationNote: (convexUser as any)?.profileModerationNote,
        isPremium: (convexUser as any)?.isPremium || false,
        matches: [], // Sync effect Convex-dan dolduracaq
        messageRequests: [], // Sync effect Convex-dan dolduracaq
        unreadMatches: [], // sync effect Convex siyahısına görə yenidən hesablayacaq
        seenMessageRequests: convexUser.seenMessageRequests !== undefined ? convexUser.seenMessageRequests : (parsed.seenMessageRequests || []),
        generalLastSeenAt: (convexUser as any)?.generalLastSeenAt ?? parsed.generalLastSeenAt ?? 0,
        badges: (convexUser as any)?.badges || parsed.badges || [],
      };

      if (isSuperadmin) {
        mergedUser = {
          ...mergedUser,
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
        };

        // Background sync to Convex for superadmin hardcodes if they drifted
        createOrUpdateUserMutation({
          clerkId: mergedUser.id,
          name: mergedUser.name,
          email: mergedUser.email,
          gender: mergedUser.gender,
          age: mergedUser.age,
          birthDay: mergedUser.birthDay,
          birthMonth: mergedUser.birthMonth,
          birthYear: mergedUser.birthYear,
          location: mergedUser.location,
          bio: mergedUser.bio,
          values: mergedUser.values,
          loveLanguage: mergedUser.loveLanguage,
          interests: mergedUser.interests,
          communicationStyle: mergedUser.communicationStyle,
          avatar: mergedUser.avatar,
          lookingFor: mergedUser.lookingFor,
        }).catch(() => {});
      }

      // Silently update user with fresh Convex data (no loading flash)
      updateUserInternal(mergedUser, storageKey);
      setIsOnboarded(true);
      setIsLoading(false);
    } else {
      // No localStorage — fully depends on Convex
      if (convexUser) {
        console.log("Restoring user session from Convex DB...");
        let restoredUser: UserProfile = {
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
          avatar: convexUser.avatar || clerkUser.imageUrl || "",
          badges: (convexUser as any)?.badges || [], 
          streak: 0, 
          lastActiveDate: new Date().toDateString(),
          matches: [], 
          unreadMatches: convexUser.unreadMatches || [],
          likes: [], 
          messageRequests: [], 
          sentMessageRequests: [],
          seenMessageRequests: convexUser.seenMessageRequests || [],
          generalLastSeenAt: (convexUser as any).generalLastSeenAt ?? 0,
          status: (convexUser.status as any) || "active",
          profileModerationNote: (convexUser as any)?.profileModerationNote,
          role: (convexUser.role as any) || (isSuperadmin ? 'superadmin' : 'user'),
          isPremium: (convexUser as any).isPremium || false,
        };

        if (isSuperadmin) {
          restoredUser = {
            ...restoredUser,
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
          };
        }

        updateUserInternal(restoredUser, storageKey);
        setIsOnboarded(true);
      } else if (isSuperadmin) {
        // Auto-register superadmin without onboarding
        console.log("Auto-registering superadmin user...");
        const superadminProfile: UserProfile = {
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
          values: ["Ehrlichkeit", "Empathie", "Humor"],
          loveLanguage: "Quality Time",
          interests: ["Tech", "Music", "Travel"],
          communicationStyle: "Direct",
          avatar: clerkUser.imageUrl || getAvatarByGender("male"),
          role: "superadmin",
          status: "active",
          lastActiveDate: new Date().toDateString(),
        };
        
        // Create the user in Convex DB
        createOrUpdateUserMutation({
          clerkId: clerkUser.id,
          name: superadminProfile.name,
          email: superadminProfile.email,
          gender: superadminProfile.gender,
          age: superadminProfile.age,
          birthDay: superadminProfile.birthDay,
          birthMonth: superadminProfile.birthMonth,
          birthYear: superadminProfile.birthYear,
          location: superadminProfile.location,
          bio: superadminProfile.bio,
          values: superadminProfile.values,
          loveLanguage: superadminProfile.loveLanguage,
          interests: superadminProfile.interests,
          communicationStyle: superadminProfile.communicationStyle,
          avatar: superadminProfile.avatar,
          lookingFor: superadminProfile.lookingFor,
        }).catch((err) => console.error("Failed to auto-register superadmin:", err));
        
        updateUserInternal(superadminProfile, storageKey);
        setIsOnboarded(true);
      } else {
        setUser(null);
        setIsOnboarded(false);
      }
      setIsLoading(false);
    }
  }, [isClerkLoaded, isSignedIn, clerkUser, getStorageKey, convexUser, updateUserInternal, createOrUpdateUserMutation]);

  // Keep generalLastSeenAt in sync when Convex value changes (for Söhbətgah unread badge)
  useEffect(() => {
    if (!user) return;
    if (!convexUser) return;
    const remoteSeen = (convexUser as any).generalLastSeenAt;
    if (typeof remoteSeen !== "number") return;
    if (remoteSeen === user.generalLastSeenAt) return;
    updateUser({
      ...user,
      generalLastSeenAt: remoteSeen,
    });
  }, [convexUser, user, updateUser]);

  // Status / moderator note from Convex (waitlist, needs_revision, etc.)
  useEffect(() => {
    if (!user || !convexUser) return;
    const remoteStatus = (convexUser as any).status as string | undefined;
    const remoteNote = (convexUser as any).profileModerationNote as string | undefined;
    if (remoteStatus === user.status && remoteNote === user.profileModerationNote) return;
    updateUser({
      ...user,
      status: (remoteStatus as UserProfile["status"]) || user.status,
      profileModerationNote: remoteNote,
    });
  }, [convexUser, user, updateUser]);

  // If avatar is missing in DB/local state, hydrate from Clerk profile image.
  useEffect(() => {
    if (!isSignedIn || !clerkUser || !user) return;
    if ((user.avatar || "").trim().length > 0) return;
    if (!clerkUser.imageUrl) return;

    const hydratedUser = {
      ...user,
      avatar: clerkUser.imageUrl,
    };
    const storageKey = getStorageKey(clerkUser.id);
    updateUserInternal(hydratedUser, storageKey);

    createOrUpdateUserMutation({
      clerkId: clerkUser.id,
      name: hydratedUser.name || clerkUser.firstName || clerkUser.username || "User",
      avatar: clerkUser.imageUrl,
    }).catch(() => {});
  }, [
    clerkUser,
    createOrUpdateUserMutation,
    getStorageKey,
    isSignedIn,
    updateUserInternal,
    user,
  ]);

  // Reset merge flag when clerk user changes (e.g. sign-out then sign-in as different user)
  useEffect(() => {
    hasLoadedFromLocalStorage.current = false;
    hasConvexMerged.current = false;
  }, [clerkUser?.id]);

  // Route Protection for Waitlisted Users
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const allowedPaths = [
      "/",
      "/profile",
      "/settings",
      "/premium",
      "/sign-in",
      "/sign-up",
      "/onboarding",
      "/icma-qaydalari",
      "/account-rejected",
    ];
    const isStaffUser =
      ["moderator", "admin", "superadmin"].includes((user?.role || "").toLowerCase()) ||
      (user?.email || "").toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();

    if (isLoading || !isOnboarded || !user || isStaffUser) return;

    if (user.status === "rejected" && pathname !== "/account-rejected") {
      router.replace("/account-rejected");
      return;
    }

    if (user.status === "needs_revision" && pathname !== "/onboarding") {
      router.replace("/onboarding");
      return;
    }

    if (user.status === "waitlist" && !allowedPaths.includes(pathname)) {
      router.replace("/");
    }
  }, [user, pathname, isLoading, isOnboarded, router]);


  const completeOnboarding = useCallback(async (profile: Partial<UserProfile>) => {
    if (!clerkUser) return { ok: false as const, error: new Error("No clerk user") };

    const storageKey = getStorageKey(clerkUser.id);

    const gender = profile.gender || "male";
    const avatar = profile.avatar || getAvatarByGender(gender, Math.floor(Math.random() * 5));

    const id = clerkUser.id;
    const email = clerkUser.emailAddresses?.[0]?.emailAddress;

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

      const status = result.status as UserProfile["status"];

      if (typeof avatar === "string" && /^https?:\/\//i.test(avatar)) {
        void checkAvatarModerationAction({ imageUrl: avatar }).catch(() => {});
      }

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
      return { ok: true as const, status };
    } catch (error) {
      console.error("Failed to save user to Convex:", error);
      return { ok: false as const, error };
    }
  }, [
    clerkUser,
    getStorageKey,
    updateUserInternal,
    createOrUpdateUserMutation,
    checkAvatarModerationAction,
  ]);


  // NOTE: Auto-heal removed. The main loading effect (above) now validates
  // localStorage against Convex DB and clears stale data if the user was deleted.

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

  const clearSingleMatchMutation = useMutation(api.users.clearSingleUnreadMatch);

  const markMatchAsRead = useCallback(async (userId: string) => {
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

    if (clerkUser) {
      try {
        await clearSingleMatchMutation({ clerkId: clerkUser.id, matchIdToClear: userId });
      } catch (e) {
        console.error("Failed to clear single unread match in DB", e);
      }
    }
  }, [clerkUser, getStorageKey, clearSingleMatchMutation]);

  const clearUnreadMatchesMutation = useMutation(api.users.clearUnreadMatches);

  const markAllNotificationsAsRead = useCallback(async () => {
    setUser(prev => {
      if (prev) {
        const updated = {
          ...prev,
          unreadMatches: [],
        };
        if (clerkUser) {
          localStorage.setItem(getStorageKey(clerkUser.id), JSON.stringify(updated));
        }
        return updated;
      }
      return prev;
    });

    if (clerkUser) {
      try {
        await clearUnreadMatchesMutation({ clerkId: clerkUser.id });
      } catch (e) {
        console.error("Failed to clear unread matches in DB", e);
      }
    }
  }, [clerkUser, getStorageKey, clearUnreadMatchesMutation]);

  const markSeenMessageRequestsMutation = useMutation(api.users.markSeenMessageRequests);

  const markMessageRequestsAsSeen = useCallback(async () => {
    let currentRequests: string[] = [];
    setUser(prev => {
      if (prev && prev.messageRequests) {
        currentRequests = prev.messageRequests;
        const updated = {
          ...prev,
          seenMessageRequests: [...prev.messageRequests]
        };
        if (clerkUser) {
          localStorage.setItem(getStorageKey(clerkUser.id), JSON.stringify(updated));
        }
        return updated;
      }
      return prev;
    });

    if (clerkUser && currentRequests.length > 0) {
      try {
        await markSeenMessageRequestsMutation({ 
             clerkId: clerkUser.id, 
             requestIds: currentRequests 
        });
      } catch (e) {
        console.error("Failed to mark message requests as seen in DB", e);
      }
    }
  }, [clerkUser, getStorageKey, markSeenMessageRequestsMutation]);

  const sendMessageRequest = useCallback(async (userId: string) => {
    let currentUserId = "";
    setUser(prev => {
      if (!prev) return prev;
      
      currentUserId = prev.id;

      // Superadmins bypass the sentMessageRequest queue
      if (prev.role === "superadmin") {
         if (!prev.matches.includes(userId)) {
           const updated = {
             ...prev,
             matches: [...prev.matches, userId]
           };
           if (clerkUser) {
             localStorage.setItem(getStorageKey(clerkUser.id), JSON.stringify(updated));
           }
           return updated;
         }
         return prev;
      }
      
      if (!prev.sentMessageRequests?.includes(userId)) {
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

    if (currentUserId && clerkUser) {
        // Ensure Convex is authenticated
        if (!isAuthenticated) {
           console.log("Convex not authenticated yet, cannot send request.");
           return null;
        }

        try {
          const result = await sendRequestMutation({ senderId: currentUserId, receiverId: userId });
          return result;
        } catch (error) {
          console.error("Failed to send request:", error);
          return null;
        }
    }
    return null;
  }, [sendRequestMutation, clerkUser, getStorageKey, isAuthenticated]);

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
      markMessageRequestsAsSeen,
      sendMessageRequest,
      cancelMessageRequest,
      acceptMessageRequest,
      declineMessageRequest,
      dbNotifications,
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
