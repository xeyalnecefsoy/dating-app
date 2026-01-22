"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Heart, MessageCircle, MapPin, X, Star, 
  Sparkles, Share2, CheckCircle2, Crown, Image, ChevronLeft, ChevronRight, Mail, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_USERS, translateValue, translateLoveLanguage, translateStyle, translateInterest } from "@/lib/mock-users";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { calculateCompatibility } from "@/lib/compatibility";

import { useToast } from "@/components/ui/toast";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, isOnboarded, likeUser, matchUser, sendMessageRequest } = useUser();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex === null || !profile?.gallery) return;
    setSelectedImageIndex((prev) => 
      prev === (profile.gallery!.length - 1) ? 0 : prev! + 1
    );
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex === null || !profile?.gallery) return;
    setSelectedImageIndex((prev) => 
      prev === 0 ? (profile.gallery!.length - 1) : prev! - 1
    );
  };

  // Keyboard navigation
  React.useEffect(() => {
    if (selectedImageIndex === null) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNextImage();
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "Escape") setSelectedImageIndex(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex]);
  
  const userId = params.id as string;
  const profile = MOCK_USERS.find(u => u.id === userId);

  const txt = {
    back: language === 'az' ? 'Geri' : 'Back',
    about: language === 'az' ? 'Haqqında' : 'About',
    values: language === 'az' ? 'Dəyərlər' : 'Values',
    loveLanguage: language === 'az' ? 'Sevgi Dili' : 'Love Language',
    communication: language === 'az' ? 'Ünsiyyət Üslubu' : 'Communication Style',
    interests: language === 'az' ? 'Maraqlar' : 'Interests',
    iceBreaker: language === 'az' ? 'Söhbət Başlatıcı' : 'Ice Breaker',
    compatibility: language === 'az' ? 'Uyğunluq' : 'Compatibility',
    notFound: language === 'az' ? 'İstifadəçi tapılmadı' : 'User not found',
    sendMessage: language === 'az' ? 'Mesaj Göndər' : 'Send Message',
    like: language === 'az' ? 'Bəyən' : 'Like',
    superLike: language === 'az' ? 'Super Bəyən' : 'Super Like',
    gallery: language === 'az' ? 'Qalereya' : 'Gallery',
    message: language === 'az' ? 'Mesaj' : 'Message',
    sendRequest: language === 'az' ? 'Mesaj İstəyi Göndər' : 'Send Message Request',
    requestSent: language === 'az' ? 'İstək Göndərildi' : 'Request Sent',
  };

  // Calculate compatibility
  const compatibility = useMemo(() => {
    if (!currentUser || !isOnboarded || !profile) return null;
    return calculateCompatibility(
      {
        values: currentUser.values,
        interests: currentUser.interests,
        loveLanguage: currentUser.loveLanguage,
        communicationStyle: currentUser.communicationStyle
      },
      profile
    );
  }, [currentUser, isOnboarded, profile]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">{txt.notFound}</p>
          <Button onClick={() => router.back()} variant="outline">
            {txt.back}
          </Button>
        </div>
      </div>
    );
  }

  const handleLike = () => {
    likeUser(profile.id);
    // Simulate match (50% chance)
    if (Math.random() > 0.5) {
      matchUser(profile.id);
    }
    router.push("/discovery");
  };

  const handleMessage = () => {
    // If already matched, go to messages
    if (currentUser?.matches.includes(profile.id)) {
      router.push(`/messages?chat=${profile.id}`);
    } else if (currentUser?.sentMessageRequests?.includes(profile.id)) {
      // Already sent a request
      showToast({
        type: "info",
        title: language === 'az' ? 'Məlumat' : 'Information',
        message: language === 'az' ? 'Mesaj istəyiniz artıq göndərilib!' : 'Message request already sent!'
      });
    } else {
      // Send a message request
      sendMessageRequest(profile.id);
      showToast({
        type: "success",
        title: language === 'az' ? 'Uğurlu!' : 'Success!',
        message: language === 'az' ? 'Mesaj istəyiniz göndərildi!' : 'Message request sent!'
      });
    }
  };

  const isMatched = currentUser?.matches.includes(profile.id);
  const isRequestSent = currentUser?.sentMessageRequests?.includes(profile.id);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full max-w-lg bg-background min-h-screen relative shadow-2xl">
        {/* Hero Image */}
        <div className="relative h-[50vh] min-h-[350px]">
          <img 
            src={profile.avatar} 
            alt={profile.name}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          
          {/* Back Button */}
          <button 
            onClick={() => router.back()}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* Share Button */}
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors">
            <Share2 className="w-5 h-5 text-white" />
          </button>

          {/* Compatibility Badge */}
          {compatibility && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-white font-semibold">{compatibility.score}% {txt.compatibility}</span>
            </div>
          )}

          {/* Name & Location */}
          <div className="absolute bottom-6 left-4 right-4">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold text-foreground drop-shadow-md">{profile.name}, {profile.age}</h1>
              {profile.isVerified && (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center" title="Verified">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
              {profile.isPremium && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center" title="Premium">
                  <Crown className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-foreground/80 drop-shadow-md">
              <MapPin className="w-4 h-4" />
              <span>{profile.location}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-6 pb-28">
          {/* Bio */}
          <section className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <h3 className="text-sm text-muted-foreground mb-2">{txt.about}</h3>
            <p className="text-foreground leading-relaxed">
              {language === 'az' ? profile.bio.az : profile.bio.en}
            </p>
          </section>

          {/* Values */}
          <section className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <h3 className="text-sm text-muted-foreground mb-3">{txt.values}</h3>
            <div className="flex flex-wrap gap-2">
              {profile.values.map(value => (
                <span 
                  key={value}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {translateValue(value, language as "en" | "az")}
                </span>
              ))}
            </div>
          </section>

          {/* Love Language & Communication */}
          <section className="bg-card rounded-2xl p-4 border border-border space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{txt.loveLanguage}</span>
              <span className="text-foreground font-medium">
                {translateLoveLanguage(profile.loveLanguage, language as "en" | "az")}
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{txt.communication}</span>
              <span className="text-foreground font-medium">
                {translateStyle(profile.communicationStyle, language as "en" | "az")}
              </span>
            </div>
          </section>

          {/* Interests */}
          <section className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <h3 className="text-sm text-muted-foreground mb-3">{txt.interests}</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map(interest => {
                const isShared = currentUser?.interests.includes(interest);
                return (
                  <span 
                    key={interest}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      isShared 
                        ? "bg-[#20D5A0]/20 text-[#20D5A0]" 
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {translateInterest(interest, language as "en" | "az")}
                    {isShared && " ✓"}
                  </span>
                );
              })}
            </div>
          </section>

          {/* Gallery */}
          {profile.gallery && profile.gallery.length > 0 && (
            <section className="bg-card rounded-2xl p-4 border border-border shadow-sm">
              <h3 className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <Image className="w-4 h-4" />
                {txt.gallery}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {profile.gallery.map((photo, index) => (
                  <div 
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className="aspect-square rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <img 
                      src={photo} 
                      alt={`${profile.name} gallery ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Ice Breaker */}
          <section className="bg-gradient-to-br from-[#FF4458]/10 to-[#FD267A]/10 rounded-2xl p-4 border border-[#FF4458]/20">
            <h3 className="text-sm text-primary mb-2 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              {txt.iceBreaker}
            </h3>
            <p className="text-foreground italic">
              "{language === 'az' ? profile.iceBreaker.az : profile.iceBreaker.en}"
            </p>
          </section>

          {/* Action Buttons at the end of content flow */}
          <div className="flex items-center justify-center gap-4 pt-8 pb-12">
            <button 
              onClick={() => router.push("/discovery")}
              className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
            >
              <X className="w-6 h-6 text-red-500" />
            </button>
            
            <button 
              onClick={handleLike}
              className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-transform"
            >
              <Heart className="w-7 h-7 text-white" />
            </button>
            
            <button 
              onClick={handleLike}
              className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
            >
              <Star className="w-6 h-6 text-yellow-500" />
            </button>
            
            <button 
              onClick={handleMessage}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                isMatched 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : isRequestSent 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-card border border-border hover:bg-blue-500/10'
              }`}
              disabled={isRequestSent}
              title={isMatched ? txt.message : isRequestSent ? txt.requestSent : txt.sendRequest}
            >
              {isMatched ? (
                <MessageCircle className="w-6 h-6 text-white" />
              ) : isRequestSent ? (
                <Send className="w-5 h-5 text-white/60" />
              ) : (
                <Mail className="w-6 h-6 text-blue-500" />
              )}
            </button>
          </div>
        </div>

        {/* Lightbox Overlay */}
        <AnimatePresence>
          {selectedImageIndex !== null && profile?.gallery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImageIndex(null)}
              className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedImageIndex(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors z-[70]"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation Buttons */}
              <button
                 onClick={handlePrevImage}
                 className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors z-[70] hidden md:flex"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <button
                 onClick={handleNextImage}
                 className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors z-[70] hidden md:flex"
              >
                <ChevronRight className="w-8 h-8" />
              </button>

              {/* Main Image */}
              <motion.div
                key={selectedImageIndex} // Key change triggers animation
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative max-w-full max-h-full flex flex-col items-center"
                onClick={(e) => e.stopPropagation()} 
                // Add swipe support for mobile here if desired
              >
                <div className="relative">
                    <img
                      src={profile.gallery[selectedImageIndex]}
                      alt={`Gallery ${selectedImageIndex + 1}`}
                      className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
                    />
                    
                    {/* Mobile Tap Areas for Navigation */}
                    <div className="absolute inset-y-0 left-0 w-1/4 z-10 md:hidden" onClick={handlePrevImage} />
                    <div className="absolute inset-y-0 right-0 w-1/4 z-10 md:hidden" onClick={handleNextImage} />
                </div>
                
                {/* Counter */}
                <div className="mt-4 text-white/80 font-medium bg-black/50 px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {profile.gallery.length}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
