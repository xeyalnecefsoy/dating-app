"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, MapPin, Star, Percent, Copy, Check, 
  Coffee, Utensils, Film, Gamepad2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { PARTNER_VENUES, VENUE_TYPES, PartnerVenue } from "@/lib/partner-venues";

const typeIcons: { [key: string]: any } = {
  restaurant: Utensils,
  cafe: Coffee,
  cinema: Film,
  entertainment: Gamepad2
};

export default function VenuesPage() {
  const { language } = useLanguage();
  const [selectedType, setSelectedType] = useState("all");
  const [selectedVenue, setSelectedVenue] = useState<PartnerVenue | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredVenues = selectedType === "all" 
    ? PARTNER_VENUES 
    : PARTNER_VENUES.filter(v => v.type === selectedType);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 h-14 flex items-center justify-between sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-bold text-lg">
          {language === 'az' ? 'İlk Görüş Məkanları' : 'Date Spots'}
        </h1>
        <div className="w-10" />
      </header>

      <main className="p-4 pb-24 max-w-lg mx-auto">
        {/* Intro */}
        <div className="text-center mb-6">
          <p className="text-muted-foreground text-sm">
            {language === 'az' 
              ? 'Romantik görüşlər üçün xüsusi endirimlər' 
              : 'Special discounts for romantic dates'}
          </p>
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {VENUE_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedType === type.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {language === 'az' ? type.nameAz : type.name}
            </button>
          ))}
        </div>

        {/* Venues List */}
        <div className="space-y-4">
          {filteredVenues.map((venue, index) => {
            const TypeIcon = typeIcons[venue.type] || Utensils;
            
            return (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedVenue(venue)}
                className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
              >
                {/* Image */}
                <div className="relative h-40">
                  <img 
                    src={venue.image} 
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Discount Badge */}
                  {venue.discount && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      {venue.discount}% OFF
                    </div>
                  )}
                  
                  {/* Type Badge */}
                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <TypeIcon className="w-3 h-3" />
                    {language === 'az' ? venue.typeAz : venue.type}
                  </div>
                  
                  {/* Rating */}
                  <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    {venue.rating}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{venue.name}</h3>
                    <div className="text-muted-foreground">
                      {"₼".repeat(venue.priceRange)}
                      <span className="opacity-30">{"₼".repeat(3 - venue.priceRange)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    {venue.address}, {venue.location}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {language === 'az' ? venue.descriptionAz : venue.description}
                  </p>
                  
                  {venue.specialOffer && (
                    <div className="bg-primary/10 text-primary text-xs font-medium px-3 py-2 rounded-lg">
                      🎁 {language === 'az' ? venue.specialOfferAz : venue.specialOffer}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Venue Detail Modal */}
      <AnimatePresence>
        {selectedVenue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center p-4"
            onClick={() => setSelectedVenue(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-card rounded-3xl w-full max-w-md max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header Image */}
              <div className="relative h-48">
                <img 
                  src={selectedVenue.image} 
                  alt={selectedVenue.name}
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => setSelectedVenue(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{selectedVenue.name}</h2>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {selectedVenue.rating}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {"₼".repeat(selectedVenue.priceRange)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'az' ? selectedVenue.typeAz : selectedVenue.type}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" />
                  {selectedVenue.address}, {selectedVenue.location}
                </div>
                
                <p className="text-muted-foreground mb-6">
                  {language === 'az' ? selectedVenue.descriptionAz : selectedVenue.description}
                </p>
                
                {/* Discount Code */}
                {selectedVenue.discountCode && (
                  <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-2xl p-4 mb-6">
                    <div className="text-sm text-primary font-medium mb-2">
                      {language === 'az' ? 'Endirim Kodu' : 'Discount Code'}
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="text-xl font-bold tracking-wider">
                        {selectedVenue.discountCode}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyCode(selectedVenue.discountCode!)}
                        className="rounded-full"
                      >
                        {copiedCode === selectedVenue.discountCode ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            {language === 'az' ? 'Kopyalandı' : 'Copied'}
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            {language === 'az' ? 'Kopyala' : 'Copy'}
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="text-xs text-primary/70 mt-2">
                      {selectedVenue.discount}% {language === 'az' ? 'endirim' : 'off'}
                    </div>
                  </div>
                )}
                
                {selectedVenue.specialOffer && (
                  <div className="bg-muted rounded-xl p-4 mb-6">
                    <div className="text-sm font-medium mb-1">
                      🎁 {language === 'az' ? 'Xüsusi Təklif' : 'Special Offer'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'az' ? selectedVenue.specialOfferAz : selectedVenue.specialOffer}
                    </div>
                  </div>
                )}
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {(language === 'az' ? selectedVenue.tagsAz : selectedVenue.tags).map(tag => (
                    <span key={tag} className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <Button className="w-full rounded-xl h-12 font-semibold gradient-brand border-0">
                  {language === 'az' ? 'Rezervasiya Et' : 'Make Reservation'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
