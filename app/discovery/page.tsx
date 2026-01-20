"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { 
  ArrowLeft, X, Heart, Star, 
  MapPin, Sparkles, SlidersHorizontal, RotateCcw, Info, Search, CheckCircle2, Crown, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_USERS, UserProfile, translateValue, translateLoveLanguage, translateStyle, translateInterest } from "@/lib/mock-users";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { calculateCompatibility } from "@/lib/compatibility";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";


export default function DiscoveryPage() {
  const router = useRouter();
  const { user: currentUser, isOnboarded, likeUser, matchUser } = useUser();
  const { t, language } = useLanguage();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
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
  


  const availableUsers = useMemo(() => {
    return MOCK_USERS.filter(u => {
      if (currentUser?.likes.includes(u.id)) return false;
      if (currentUser && isOnboarded && u.gender !== currentUser.lookingFor) return false;
      if (u.age < filters.minAge || u.age > filters.maxAge) return false;
      if (filters.location !== "all" && u.location !== filters.location) return false;
      if (filters.communicationStyle !== "all" && u.communicationStyle !== filters.communicationStyle) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, isOnboarded, currentUser?.lookingFor]);

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

  const handleSwipe = async (dir: "left" | "right") => {
    if (!currentProfile || isSwiping || !currentUser) return; // Prevent double trigger
    
    setIsSwiping(true);
    setSwipeDirection(dir);
    
    if (dir === "right") {
      likeUser(currentProfile.id); // Local state update
      
      // Try Convex for mutual match, with fallback
      let matchResult = false;
      try {
        const result = await likeMutation({
          likerId: currentUser.id,
          likedId: currentProfile.id,
        });
        matchResult = result.isMatch;
      } catch (error) {
        console.warn("Convex like failed, using random match:", error);
        // Fallback: 30% match chance when Convex unavailable
        matchResult = Math.random() > 0.7;
      }
      
      if (matchResult) {
        matchUser(currentProfile.id);
        setMatchedProfile(currentProfile);
        setShowMatchModal(true);
      }
    }

    setTimeout(() => {
      setSwipeDirection(null);
      setCurrentIndex(prev => prev + 1);
      setShowDetails(false);
      setDragX(0);
      setIsSwiping(false); // Reset flag
    }, 250); // increased slightly to match exit animation
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
              onFiltersChange={setFilters} 
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
    <div className="h-screen bg-background flex flex-col overflow-hidden w-full items-center">
      <Header onFilterClick={() => setShowFilters(true)} t={t} />

      <main className="flex-1 w-full max-w-md flex flex-col relative h-full overflow-hidden">
        
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
          <div className="flex-1 px-3 py-2 flex items-center justify-center relative w-full h-full">
            <div className="relative w-full h-[calc(100%-80px)]">
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
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* Compatibility Badge - Moved to Top Left */}
                    {compatibility && (
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10 shadow-lg z-20">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="text-white text-xs font-bold">{compatibility.score}%</span>
                      </div>
                    )}

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 pb-20 text-white z-20">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-3xl font-bold shadow-black drop-shadow-md">{currentProfile.name}, {currentProfile.age}</h2>
                        {currentProfile.isVerified && (
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        )}
                        {currentProfile.isPremium && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                            <Crown className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-white/90 mb-3 text-sm shadow-black drop-shadow-md">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{currentProfile.location}</span>
                      </div>

                      {/* Values Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {currentProfile.values.slice(0, 3).map(value => (
                          <span key={value} className="px-2.5 py-1 rounded-lg bg-[#FF4458] text-white text-xs font-semibold shadow-sm">
                            {translateValue(value, language as "en" | "az")}
                          </span>
                        ))}
                      </div>

                      {/* Interests Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-2 opacity-90">
                        {currentProfile.interests.slice(0, 3).map(interest => (
                          <span key={interest} className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
                            {translateInterest(interest, language as "en" | "az")}
                          </span>
                        ))}
                      </div>
                      
                      <Link
                        href={`/user/${currentProfile.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/40 transition-colors"
                      >
                        <Info className="w-4 h-4 text-white" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6 py-3 pb-20 shrink-0">
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
              <button disabled={isSwiping} onClick={() => handleSwipe("right")} className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center active:scale-95 transition-transform hover:bg-yellow-500/10 disabled:opacity-50 disabled:pointer-events-none">
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
            onFiltersChange={setFilters} 
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
