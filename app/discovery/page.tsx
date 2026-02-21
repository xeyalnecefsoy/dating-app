"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ArrowLeft, X, Heart, Star, 
  MapPin, Sparkles, SlidersHorizontal, RotateCcw, Info, Search, CheckCircle2, Crown, MessageCircle, Ban
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile, translateValue, translateLoveLanguage, translateStyle, translateInterest } from "@/lib/mock-users";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { calculateCompatibility } from "@/lib/compatibility";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";


export default function DiscoveryPage() {
  const router = useRouter();
  const { user: currentUser, isOnboarded, likeUser, matchUser } = useUser();
  const { t, language } = useLanguage();
  const { isSignedIn, getToken } = useAuth();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | "up" | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<UserProfile | null>(null);
  const [filters, setFilters] = useState({ 
    minAge: 18, 
    maxAge: 50, 
    location: "all",
    communicationStyle: "all"
  });
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [profileToBlock, setProfileToBlock] = useState<UserProfile | null>(null);
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);

  // Restore state from sessionStorage on mount
  React.useEffect(() => {
    const savedIndex = sessionStorage.getItem("discovery_currentIndex");
    const savedFilters = sessionStorage.getItem("discovery_filters");
    
    let savedSeed = sessionStorage.getItem("discovery_shuffle_seed");
    if (!savedSeed) {
       savedSeed = Math.random().toString();
       sessionStorage.setItem("discovery_shuffle_seed", savedSeed);
    }
    setShuffleSeed(parseFloat(savedSeed));

    if (savedIndex) {
      setCurrentIndex(parseInt(savedIndex, 10));
    }
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch (e) {
        console.error("Failed to parse saved filters", e);
      }
    }
  }, []);

  // Save state to sessionStorage when changed
  React.useEffect(() => {
    sessionStorage.setItem("discovery_currentIndex", currentIndex.toString());
  }, [currentIndex]);

  React.useEffect(() => {
    sessionStorage.setItem("discovery_filters", JSON.stringify(filters));
  }, [filters]);
  
  // Relationship tips that rotate
  const [tipIndex, setTipIndex] = useState(0);
  const tips = useMemo(() => language === 'az' ? [
    "💡 Mükəmməl insan yoxdur, mükəmməl sevgi qura bilən insanlar var",
    "❤️ Daxili gözəllik, xarici gözəllikdən daha uzun ömürlüdür",
    "🤝 Qarşılıqlı hörmət, hər sağlam münasibətin təməlidir",
    "🌱 Doğru insanı tapmaq üçün əvvəlcə özün doğru insan ol",
    "💬 Açıq ünsiyyət, hər problemin həllidir",
    "🎯 Realist gözləntilər, xoşbəxt münasibətlərin açarıdır",
    "💕 Sevgi, verməkdən başlayır, almaqdan deyil",
    "🌟 Status deyil, xarakter önəmlidir",
    "🏠 Ailə qurmaq, birlikdə böyüməkdir",
    "⚖️ Yoldaşını dəyişdirmək deyil, onu başa düşmək lazımdır",
  ] : [
    "💡 There's no perfect person, only people who build perfect love",
    "❤️ Inner beauty lasts longer than outer beauty",
    "🤝 Mutual respect is the foundation of every healthy relationship",
    "🌱 To find the right person, first be the right person",
    "💬 Open communication solves every problem",
    "🎯 Realistic expectations are the key to happy relationships",
    "💕 Love starts with giving, not taking",
    "🌟 Character matters, not status",
    "🏠 Building a family means growing together",
    "⚖️ Understand your partner, don't try to change them",
  ], [language]);

  // Rotate tips every 10 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [tips.length]);
  


  // Fetch real users from Convex
  const convexUsers = useQuery(
    api.users.getActiveUsers,
    currentUser && isOnboarded ? { 
      currentUserGender: currentUser.gender,
      currentUserId: currentUser.id 
    } : "skip"
  );
  
  const isLoading = convexUsers === undefined;

  const availableUsers = useMemo(() => {
    // If loading or seed not ready, don't return anything yet to prevent flash of mock content
    if (isLoading || shuffleSeed === 0) return [];

    // Convert Convex users to UserProfile format
    const realUsers: UserProfile[] = (convexUsers || []).map((u: any) => ({
      id: u.clerkId || u._id,
      username: u.username,
      name: u.name,
      age: u.age || 25,
      gender: u.gender as "male" | "female",
      lookingFor: u.lookingFor as "male" | "female",
      location: u.location || "Bakı",
      bio: u.bio ? { en: u.bio, az: u.bio } : { en: "", az: "" },
      values: u.values || [],
      loveLanguage: u.loveLanguage || "Quality Time",
      interests: u.interests || [],
      communicationStyle: (u.communicationStyle || "Empathetic") as "Direct" | "Empathetic" | "Analytical" | "Playful",
      avatar: u.avatar || '/placeholder-avatar.svg',
      badges: [],
      isVerified: u.role === "admin" || u.role === "superadmin" || u.isVerified,
      isPremium: u.isPremium || false,
      iceBreaker: { en: "", az: "" },
    }));

    // Use shuffled real users
    let uniqueUsers = [...realUsers];

    // Deterministic shuffle using seed to keep order stable when navigating back
    const seededHash = (str: string, seed: number) => {
        let h = seed * 0x811c9dc5;
        for (let i = 0; i < str.length; i++) {
           h ^= str.charCodeAt(i);
           h = (h * 16777619) >>> 0;
        }
        return h;
    };
    uniqueUsers.sort((a, b) => seededHash(a.id, shuffleSeed) - seededHash(b.id, shuffleSeed));

    return uniqueUsers.filter(u => {
      if (currentUser?.likes.includes(u.id)) return false;
      if (currentUser && isOnboarded && u.gender !== currentUser.lookingFor) return false;
      if (u.age < filters.minAge || u.age > filters.maxAge) return false;
      if (filters.location !== "all" && u.location !== filters.location) return false;
      if (filters.communicationStyle !== "all" && u.communicationStyle !== filters.communicationStyle) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, isOnboarded, currentUser?.lookingFor, convexUsers, isLoading, shuffleSeed]);

  const currentProfile = availableUsers[currentIndex];

  const compatibility = useMemo(() => {
    if (!currentUser || !isOnboarded || !currentProfile) return null;
    return calculateCompatibility(
      {
        values: currentUser.values,
        interests: currentUser.interests,
        loveLanguage: currentUser.loveLanguage,
        communicationStyle: currentUser.communicationStyle
      },
      currentProfile
    );
  }, [currentUser, isOnboarded, currentProfile]);

  const [isSwiping, setIsSwiping] = useState(false);
  
  // Convex mutation for likes
  const likeMutation = useMutation(api.likes.like);
  const blockMutation = useMutation(api.blocks.blockUser);

  const handleBlock = async () => {
    if (!profileToBlock || !isSignedIn) return;
    try {
      await blockMutation({ targetUserId: profileToBlock.id });
      // Auto-skip if the person we blocked is the current one
      if (currentProfile?.id === profileToBlock.id) {
        setCurrentIndex(prev => prev + 1);
        setShowDetails(false);
      }
      setShowBlockModal(false);
      setProfileToBlock(null);
    } catch (error) {
      console.error("Block error:", error);
    }
  };

  const handleSwipe = async (dir: "left" | "right" | "up") => {
    if (!currentProfile || isSwiping || !currentUser) return;
    
    setIsSwiping(true);
    setSwipeDirection(dir);
    
    // Right = Like, Up = Super Like
    if (dir === "right" || dir === "up") {
      likeUser(currentProfile.id); // Local state update
      
      const likeType = dir === "up" ? "super" : "like";

      if (isSignedIn) {
        try {
          const result = await likeMutation({
            likerId: currentUser.id,
            likedId: currentProfile.id,
            type: likeType,
          });
          
          // Check if match occurred (ignore errors gracefully)
          const isMatch = !result.error && result.isMatch;
          
          if (isMatch) {
            matchUser(currentProfile.id);
            setMatchedProfile(currentProfile);
            setShowMatchModal(true);
          }
        } catch (err) {
          console.warn("Like mutation failed:", err);
          // Silently fail - local state is already updated
        }
      }
    }

    setTimeout(() => {
      setSwipeDirection(null);
      setCurrentIndex(prev => prev + 1);
      setShowDetails(false);
      setDragX(0);
      setIsSwiping(false);
    }, 250);
  };
  
  const handleSuperLike = () => {
     handleSwipe("up");
  };

  const handleDrag = (event: any, info: PanInfo) => {
    setDragX(info.offset.x);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x > 80) {
      handleSwipe("right");
    } else if (info.offset.x < -80) {
      handleSwipe("left");
    } else {
      setDragX(0);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center w-full">
        <Header onFilterClick={() => {}} t={t} />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground animate-pulse">
            {language === 'az' ? 'Axtarılır...' : 'Searching...'}
          </p>
        </div>
      </div>
    );
  }

  // No more profiles
  if (!currentProfile) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden items-center justify-center w-full">
        <Header onFilterClick={() => setShowFilters(true)} t={t} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md w-full text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75" />
            <div className="relative w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center border-2 border-primary/20">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">
            {language === 'az' ? 'Hələlik bu qədər!' : "That's everyone!"}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
            {language === 'az' 
              ? 'Yaxınlıqdakı bütün profillərə baxdınız. Daha çox insan tapmaq üçün filtrləri genişləndirin.' 
              : "You've seen everyone nearby. Widen your filters to see more people."}
          </p>
          
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button 
              onClick={() => setShowFilters(true)} 
              className="w-full rounded-2xl h-12 gradient-brand font-semibold text-lg hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              {language === 'az' ? 'Filtrləri Dəyiş' : 'Change Filters'}
            </Button>
            
            <Button 
              onClick={() => setCurrentIndex(0)} 
              variant="outline" 
              className="w-full rounded-2xl h-12 border-2 hover:bg-secondary/50 font-medium"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> 
              {language === 'az' ? 'Keçdiklərimə Yenidən Bax' : 'Review Skipped'}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <FilterModal 
              filters={filters} 
              onFiltersChange={(newFilters: any) => {
                setFilters(newFilters);
                setCurrentIndex(0); // Reset stack when filters change manually
              }} 
              onClose={() => setShowFilters(false)} 
              language={language}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Swipe indicators (calculate before return)
  const swipeOpacityRight = Math.min(dragX / 100, 1);
  const swipeOpacityLeft = Math.min(-dragX / 100, 1);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden w-full items-center pb-20">
      <Header onFilterClick={() => setShowFilters(true)} t={t} />

      <main className="flex-1 w-full max-w-md flex flex-col relative overflow-hidden">
        
          {/* Swipe Indicators - Absolute Positioned */}
          <div className="absolute top-24 left-6 z-20 pointer-events-none" style={{ opacity: swipeOpacityRight }}>
            <div className="border-4 border-[#20D5A0] text-[#20D5A0] px-3 py-1 rounded-xl text-2xl font-bold -rotate-12 bg-black/20 backdrop-blur-sm">
              {language === 'az' ? 'BƏYƏN' : 'LIKE'}
            </div>
          </div>
          <div className="absolute top-24 right-6 z-20 pointer-events-none" style={{ opacity: swipeOpacityLeft }}>
            <div className="border-4 border-red-500 text-red-500 px-3 py-1 rounded-xl text-2xl font-bold rotate-12 bg-black/20 backdrop-blur-sm">
              {language === 'az' ? 'KEÇ' : 'NOPE'}
            </div>
          </div>

          {/* Swipe Hints - Top Center */}
          <div className="absolute top-4 left-0 right-0 z-10 flex justify-between px-6 pointer-events-none text-white/40 text-xs font-medium">
            <div className="flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> {language === 'az' ? 'Sola sürüşdür' : 'Swipe Left'} <X className="w-3 h-3 text-red-400" />
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-green-400" /> {language === 'az' ? 'Sağa sürüşdür' : 'Swipe Right'} <ArrowLeft className="w-3 h-3 rotate-180" />
            </div>
          </div>

          {/* Card Stack */}
          <div className="flex-1 px-3 py-2 flex items-center justify-center relative w-full">
            <div className="relative w-full h-[calc(100%-60px)] max-h-[500px]">
              <AnimatePresence>
                {currentProfile && (
                <motion.div
                  key={currentProfile.id}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, x: dragX, rotate: dragX * 0.05 }}
                  exit={{ 
                    x: swipeDirection === "right" ? 500 : -500, 
                    opacity: 0,
                    rotate: swipeDirection === "right" ? 20 : -20,
                    transition: { duration: 0.2 }
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }} // Stiffer spring for less wobble
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragMomentum={false} // Prevents card from sliding away after release
                  dragElastic={0.7} // Adds resistance to the drag
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing w-full h-full"
                >
                  <div className="relative w-full h-full rounded-3xl overflow-hidden bg-card border border-border shadow-xl">
                    {/* Full Background Image */}
                    <img 
                      src={currentProfile.avatar}
                      alt={currentProfile.name}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                    
                    {/* Gradient Overlay - Adjusted to show more of the image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                    {/* Compatibility Badge - Moved to Top Left */}
                    {compatibility && (
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10 shadow-lg z-20">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="text-white text-xs font-bold">{compatibility.score}%</span>
                      </div>
                    )}

                    {/* Content Overlay - Compact for mobile */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-white z-20">
                      {/* Clickable name/location area - taps navigate to profile */}
                      <Link
                        href={`/user/${currentProfile.username || currentProfile.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block active:opacity-80 transition-opacity"
                      >
                        <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                          <h2 className="text-2xl sm:text-3xl font-bold shadow-black drop-shadow-md">{currentProfile.name}, {currentProfile.age}</h2>
                          {currentProfile.isVerified && (
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </div>
                          )}
                          {currentProfile.isPremium && (
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                              <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-white/90 mb-2 sm:mb-3 text-xs sm:text-sm shadow-black drop-shadow-md">
                          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>{currentProfile.location}</span>
                          <span className="ml-1 text-white/60">•</span>
                          <span className="text-white/60 underline underline-offset-2">{language === 'az' ? 'Profilə bax' : 'View profile'}</span>
                        </div>
                      </Link>

                      {/* Values Tags - Hidden on very small screens, shown on tap/info */}
                      <div className="hidden sm:flex flex-wrap gap-2 mb-3">
                        {currentProfile.values.slice(0, 3).map(value => (
                          <span key={value} className="px-2.5 py-1 rounded-lg bg-[#FF4458] text-white text-xs font-semibold shadow-sm">
                            {translateValue(value, language as "en" | "az")}
                          </span>
                        ))}
                      </div>

                      {/* Mobile-only: Compact value indicators */}
                      <div className="flex sm:hidden flex-wrap gap-1.5 mb-2">
                        {currentProfile.values.slice(0, 2).map(value => (
                          <span key={value} className="px-2 py-0.5 rounded-md bg-[#FF4458]/90 text-white text-[10px] font-semibold">
                            {translateValue(value, language as "en" | "az")}
                          </span>
                        ))}
                        {currentProfile.values.length > 2 && (
                          <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-medium">
                            +{currentProfile.values.length - 2}
                          </span>
                        )}
                      </div>
                      
                      <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex gap-2">
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            e.preventDefault(); 
                            setProfileToBlock(currentProfile);
                            setShowBlockModal(true); 
                          }}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-500/30 backdrop-blur-sm flex items-center justify-center border border-red-400/20 hover:bg-red-500/50 transition-colors"
                          title={language === 'az' ? 'Əngəllə' : 'Block'}
                        >
                          <Ban className="w-4 h-4 text-white" />
                        </button>
                        <Link
                          href={`/user/${currentProfile.username || currentProfile.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/40 transition-colors"
                        >
                          <Info className="w-4 h-4 text-white" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Relationship Tips Banner - Fixed height to prevent layout shifts */}
          <div className="px-4 pb-2 shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={tipIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-2xl px-4 py-2.5 text-center h-[52px] flex items-center justify-center"
              >
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed line-clamp-2">
                  {tips[tipIndex]}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6 py-3 pb-4 shrink-0 relative z-30">
            <div className="flex flex-col items-center gap-1">
              <button disabled={isSwiping} onClick={() => handleSwipe("left")} className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center active:scale-95 transition-transform hover:bg-red-500/10 disabled:opacity-50 disabled:pointer-events-none">
                <X className="w-5 h-5 text-red-500" />
              </button>
              <span className="text-[10px] text-muted-foreground">{language === 'az' ? 'Keç' : 'Skip'}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button disabled={isSwiping} onClick={() => handleSwipe("right")} className="w-14 h-14 rounded-full gradient-brand flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-primary/30 disabled:opacity-50 disabled:pointer-events-none">
                <Heart className="w-6 h-6 text-white" />
              </button>
              <span className="text-[10px] text-muted-foreground">{language === 'az' ? 'Bəyən' : 'Like'}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button disabled={isSwiping} onClick={handleSuperLike} className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center active:scale-95 transition-transform hover:bg-yellow-500/10 disabled:opacity-50 disabled:pointer-events-none">
                <Star className="w-5 h-5 text-yellow-500" />
              </button>
              <span className="text-[10px] text-muted-foreground">{language === 'az' ? 'Super' : 'Super'}</span>
            </div>
          </div>
      
      </main>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <FilterModal 
            filters={filters} 
            onFiltersChange={(newFilters: any) => {
              setFilters(newFilters);
              setCurrentIndex(0); // Reset stack when filters change manually
            }} 
            onClose={() => setShowFilters(false)} 
            language={language}
          />
        )}
      </AnimatePresence>

      {/* Match Modal */}
      <AnimatePresence>
        {showMatchModal && matchedProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowMatchModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Hearts Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <img 
                    src={currentUser?.avatar || "/avatars/default.png"} 
                    className="w-24 h-24 rounded-full border-4 border-primary object-cover"
                  />
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white fill-white" />
                  </div>
                </div>
                <div className="relative -ml-4">
                  <img 
                    src={matchedProfile.avatar} 
                    className="w-24 h-24 rounded-full border-4 border-primary object-cover"
                  />
                </div>
              </motion.div>

              {/* Text */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-3xl font-bold text-white mb-2">
                  {language === 'az' ? "Uyğunluq!" : "It's a Match!"}
                </h2>
                <p className="text-white/70 mb-6">
                  {language === 'az' 
                    ? `Siz və ${matchedProfile.name} bir-birinizi bəyəndiniz` 
                    : `You and ${matchedProfile.name} liked each other`}
                </p>
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-3 max-w-xs mx-auto"
              >
                <Button 
                  onClick={() => {
                    setShowMatchModal(false);
                    router.push(`/messages?chat=${matchedProfile.id}`);
                  }}
                  className="w-full gradient-brand text-white rounded-full py-6 text-lg font-semibold"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {language === 'az' ? 'Mesaj Göndər' : 'Send Message'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowMatchModal(false)}
                  className="w-full rounded-full py-6 text-lg"
                >
                  {language === 'az' ? 'Kəşf Etməyə Davam Et' : 'Keep Swiping'}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Block Confirmation Modal */}
      <AnimatePresence>
        {showBlockModal && profileToBlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowBlockModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                  <Ban className="w-8 h-8 text-red-500" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {language === 'az' ? 'Əngəlləmək istədiyinizə əminsiniz?' : 'Are you sure you want to block?'}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-6">
                  {language === 'az' 
                    ? `Bu şəxs (${profileToBlock.name}) artıq qarşınıza çıxmayacaq və sizi görə bilməyəcək.`
                    : `This person (${profileToBlock.name}) will no longer appear to you and won't be able to see you.`}
                </p>
                
                <div className="bg-muted/50 rounded-2xl p-4 mb-6 w-full text-xs text-muted-foreground text-left flex gap-3 italic">
                  <Info className="w-4 h-4 shrink-0 text-primary" />
                  <p>
                    {language === 'az'
                      ? 'Əngəllədiyiniz şəxsləri istədiyiniz vaxt Parametrlər -> Məxfilik -> Əngəllənən İstifadəçilər bölməsindən idarə edə bilərsiniz.'
                      : 'You can manage blocked users anytime from Settings -> Privacy -> Blocked Users.'}
                  </p>
                </div>
                
                <div className="flex flex-col gap-3 w-full">
                  <Button
                    className="w-full h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold"
                    onClick={handleBlock}
                  >
                    {language === 'az' ? 'Bəli, əngəllə' : 'Yes, block'}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full h-12 rounded-2xl font-medium"
                    onClick={() => setShowBlockModal(false)}
                  >
                    {language === 'az' ? 'Ləğv et' : 'Cancel'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function Header({ onFilterClick, t }: { 
  onFilterClick: () => void, 
  t: any
}) {
  return (
    <header className="px-4 h-14 flex items-center justify-between w-full max-w-md sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
      <Link href="/">
        <Button variant="ghost" size="icon" className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </Link>
      
      <h1 className="font-bold text-lg">{t("nav.discover")}</h1>
      
      <Button 
        onClick={onFilterClick}
        variant="ghost" 
        size="icon" 
        className="rounded-full"
      >
        <SlidersHorizontal className="w-5 h-5" />
      </Button>
    </header>
  );
}

import { AZERBAIJAN_REGIONS } from "@/lib/locations";

function FilterModal({ filters, onFiltersChange, onClose, language }: any) {
  const [localFilters, setLocalFilters] = useState(filters);
  const commStyles = ["Direct", "Empathetic", "Analytical", "Playful"];

  const handleApply = () => {
    const finalFilters = { ...localFilters };
    
    // Validate minAge
    if (finalFilters.minAge === '' || finalFilters.minAge < 18) {
      finalFilters.minAge = 18;
    }
    // Validate maxAge
    if (finalFilters.maxAge === '' || finalFilters.maxAge < 18) {
      finalFilters.maxAge = 18;
    }
    
    onFiltersChange(finalFilters);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card rounded-3xl p-6 w-full max-w-xs border border-border max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">{language === 'az' ? 'Filtrlər' : 'Filters'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Age Range */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">{language === 'az' ? 'Yaş Aralığı' : 'Age Range'}</label>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                min="18"
                value={localFilters.minAge}
                onClick={e => e.stopPropagation()}
                onChange={e => setLocalFilters({...localFilters, minAge: e.target.value === '' ? '' : parseInt(e.target.value)})}
                className="w-full bg-muted border border-border rounded-xl p-3 text-center"
              />
              <span className="text-muted-foreground">-</span>
              <input 
                type="number" 
                min="18"
                value={localFilters.maxAge}
                onClick={e => e.stopPropagation()}
                onChange={e => setLocalFilters({...localFilters, maxAge: e.target.value === '' ? '' : parseInt(e.target.value)})}
                className="w-full bg-muted border border-border rounded-xl p-3 text-center"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">{language === 'az' ? 'Məkan' : 'Location'}</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
              <button
                onClick={() => setLocalFilters({...localFilters, location: "all"})}
                className={`p-2 rounded-xl text-sm border transition-colors ${
                  localFilters.location === "all" 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                }`}
              >
                {language === 'az' ? 'Hamısı' : 'All'}
              </button>
              {AZERBAIJAN_REGIONS.map(loc => (
                <button
                  key={loc}
                  onClick={() => setLocalFilters({...localFilters, location: loc})}
                  className={`p-2 rounded-xl text-sm border transition-colors ${
                    localFilters.location === loc 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Communication Style */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">{language === 'az' ? 'Ünsiyyət Üslubu' : 'Communication Style'}</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLocalFilters({...localFilters, communicationStyle: "all"})}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  localFilters.communicationStyle === "all" 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                }`}
              >
                {language === 'az' ? 'Hamısı' : 'All'}
              </button>
              {commStyles.map(style => (
                <button
                  key={style}
                  onClick={() => setLocalFilters({...localFilters, communicationStyle: style})}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    localFilters.communicationStyle === style 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                  }`}
                >
                  {translateStyle(style, language)}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleApply} className="w-full rounded-xl gradient-brand border-0 h-12 font-semibold">
            {language === 'az' ? 'Tətbiq Et' : 'Apply Filters'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
