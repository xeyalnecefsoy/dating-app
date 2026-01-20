"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Search as SearchIcon, MapPin, Heart, X, SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_USERS, UserProfile, translateValue, translateInterest, translateStyle } from "@/lib/mock-users";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchPage() {
  const { user: currentUser, isOnboarded, likeUser } = useUser();
  const { t, language } = useLanguage();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ 
    minAge: 18, 
    maxAge: 50, 
    location: "all",
    communicationStyle: "all"
  });

  const availableUsers = useMemo(() => {
    return MOCK_USERS.filter(u => {
      // Basic filtering
      if (currentUser && isOnboarded && u.gender !== currentUser.lookingFor) return false;
      if (u.age < filters.minAge || u.age > filters.maxAge) return false;
      if (filters.location !== "all" && u.location !== filters.location) return false;
      if (filters.communicationStyle !== "all" && u.communicationStyle !== filters.communicationStyle) return false;
      if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [currentUser?.lookingFor, isOnboarded, filters, searchQuery]);

  return (
    <div className="min-h-screen bg-background flex flex-col w-full items-center">
      {/* Header */}
      <header className="px-4 h-14 flex items-center justify-between w-full max-w-md sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <Link href="/">
           <Button variant="ghost" size="icon" className="rounded-full">
             <ArrowLeft className="w-5 h-5" />
           </Button>
        </Link>
        <h1 className="font-bold text-lg">
          {language === 'az' ? 'Axtarış' : 'Search'}
        </h1>
        <Button 
          onClick={() => setShowFilters(true)}
          variant="ghost" 
          size="icon" 
          className="rounded-full"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
      </header>

      <main className="flex-1 w-full max-w-md p-4 pb-24">
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
              <SearchIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <input 
            type="text"
            placeholder={language === 'az' ? "Adla axtar..." : "Search by name..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-full py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Results Grid */}
        {availableUsers.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              {language === 'az' ? 'İstifadəçi tapılmadı' : 'No users found'}
            </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {availableUsers.map((u, i) => (
              <motion.div 
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-card border border-border group cursor-pointer"
              >
                <img src={u.avatar} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-bold text-lg leading-tight">{u.name}, {u.age}</h3>
                  <div className="flex items-center gap-1 text-xs text-white/70 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{u.location}</span>
                  </div>
                  
                  {/* Tags (Mini) */}
                  <div className="flex flex-wrap gap-1">
                     {u.interests.slice(0, 2).map((inte) => (
                       <span key={inte} className="text-[9px] px-1.5 py-0.5 bg-white/10 rounded-md backdrop-blur-sm">
                         {translateInterest(inte, language as any)}
                       </span>
                     ))}
                  </div>
                </div>
                
                {/* Like Button overlay */}
                <button 
                    onClick={(e) => { e.stopPropagation(); likeUser(u.id); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-primary transition-colors z-20"
                >
                  <Heart className={`w-4 h-4 ${currentUser?.likes.includes(u.id) ? "fill-white" : "text-white"}`} />
                </button>
                
                <Link href={`/user/${u.id}`} className="absolute inset-0 z-10" />
              </motion.div>
            ))}
          </div>
        )}
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
    </div>
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
