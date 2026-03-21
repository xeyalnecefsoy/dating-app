"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Heart, Send, Pause, Play, Eye } from "lucide-react";
import Image from "next/image";
import { UserStories, Story, getTimeAgo } from "@/lib/stories";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@/contexts/UserContext";

type StoryViewerProps = {
  userStories: UserStories[];
  initialUserIndex: number;
  onClose: () => void;
  onReply?: (userId: string, message: string, storyUrl?: string) => void;
};

export function StoryViewer({ userStories, initialUserIndex, onClose, onReply }: StoryViewerProps) {
  const { language } = useLanguage();
  const { user } = useUser();
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [showViewersPanel, setShowViewersPanel] = useState(false);

  const currentUserStories = userStories[currentUserIndex];
  const currentStory = currentUserStories?.stories[currentStoryIndex];
  const STORY_DURATION = 5000; // 5 seconds per story

  const handleLike = () => {
    if (!currentStory) return;
    
    const isLiked = likedStories.has(currentStory.id);
    if (isLiked) {
      // Unlike
      const newSet = new Set(likedStories);
      newSet.delete(currentStory.id);
      setLikedStories(newSet);
    } else {
      // Like
    const newSet = new Set(likedStories);
      newSet.add(currentStory.id);
      setLikedStories(newSet);
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 1000);
      
      if (onReply) {
        onReply(currentUserStories.userId, "❤️", currentStory.mediaUrl);
      }
    }
  };

  const markViewed = useMutation(api.stories.markViewed);

  // Mark story as viewed when it becomes active
  useEffect(() => {
    if (currentStory && currentStory.id && !currentStory.id.includes("story-")) {
      // Don't call on mock data which has "story-" prefix
      markViewed({ storyId: currentStory.id as any }).catch(console.error);
    }
  }, [currentStory, markViewed]);

  const goToNextStory = useCallback(() => {
    if (currentStoryIndex < currentUserStories.stories.length - 1) {
      // Next story of same user
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else if (currentUserIndex < userStories.length - 1) {
      // Next user's stories
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      // End of all stories
      onClose();
    }
  }, [currentStoryIndex, currentUserIndex, currentUserStories, userStories.length, onClose]);

  const goToPrevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      // Previous story of same user
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    } else if (currentUserIndex > 0) {
      // Previous user's last story
      const prevUserStories = userStories[currentUserIndex - 1];
      setCurrentUserIndex(prev => prev - 1);
      setCurrentStoryIndex(prevUserStories.stories.length - 1);
      setProgress(0);
    }
  }, [currentStoryIndex, currentUserIndex, userStories]);

  // Progress bar animation
  useEffect(() => {
    if (isPaused || !currentStory) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 100;
        }
        return prev + (100 / (STORY_DURATION / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, currentStoryIndex, currentUserIndex]);

  // Handle automatic transition when progress completes
  useEffect(() => {
    if (progress >= 100) {
      goToNextStory();
    }
  }, [progress, goToNextStory]);

  // Reset reply text when story changes
  useEffect(() => {
    setReplyText("");
  }, [currentStoryIndex, currentUserIndex]);



  const handleSendReply = () => {
    if (replyText.trim() && onReply && currentStory) {
      onReply(currentUserStories.userId, replyText, currentStory.mediaUrl);
      setReplyText("");
      setShowReplyInput(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") {
        return;
      }

      if (e.key === "ArrowRight") goToNextStory();
      if (e.key === "ArrowLeft") goToPrevStory();
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextStory, goToPrevStory, onClose]);

  // Pause when viewers panel is open
  useEffect(() => {
    if (showViewersPanel) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  }, [showViewersPanel]);

  if (!currentStory) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
    >
      {/* Story Container */}
      <div className="relative w-full max-w-md h-full max-h-[90vh] m-auto flex flex-col">
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
          {currentUserStories.stories.map((_, index) => (
            <div key={index} className="flex-1 h-0.5 bg-white/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-75 ease-linear"
                style={{
                  width:
                    index < currentStoryIndex
                      ? "100%"
                      : index === currentStoryIndex
                        ? `${progress}%`
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-9 h-9 rounded-full border-2 border-white/90 overflow-hidden shrink-0">
              <Image
                src={currentUserStories.userAvatar}
                alt={currentUserStories.userName}
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{currentUserStories.userName}</p>
              <p className="text-white/70 text-xs">{getTimeAgo(currentStory.createdAt, language as "en" | "az")}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={isPaused ? (language === "az" ? "Davam et" : "Play") : (language === "az" ? "Dayandır" : "Pause")}
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={language === "az" ? "Bağla" : "Close"}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Story Image */}
        <motion.img
          key={currentStory.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          src={currentStory.mediaUrl}
          alt={currentStory.caption || "Story"}
          className="w-full flex-1 min-h-0 object-contain bg-black rounded-none"
          onClick={() => setIsPaused(!isPaused)}
        />

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-28 left-4 right-4 z-20">
            <p className="text-white text-center text-sm sm:text-base font-medium drop-shadow-md px-3 py-2 rounded-xl bg-black/50 backdrop-blur-sm max-w-full">
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Navigation Areas */}
        <div 
          className="absolute inset-y-0 left-0 w-1/3 z-10" 
          onClick={goToPrevStory}
        />
        <div 
          className="absolute inset-y-0 right-0 w-1/3 z-10" 
          onClick={goToNextStory}
        />

        {/* Viewers (own story) OR Reply Input */}
        {currentUserStories.userId === user?.id || currentUserStories.userId === "current-user" ? (
          <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-center">
            <button
              type="button"
              onClick={() => setShowViewersPanel(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-sm font-medium transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>{currentStory.viewedBy?.length || 0} {language === "az" ? "baxış" : "views"}</span>
            </button>
          </div>
        ) : (
          <div className="absolute bottom-4 left-4 right-4 z-20 space-y-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder={language === "az" ? "Cavab yaz..." : "Reply..."}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => !replyText && setIsPaused(false)}
                onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                className="flex-1 h-11 bg-white/15 border-white/25 text-white placeholder:text-white/60 rounded-full text-sm focus-visible:ring-white/30"
              />
              <Button
                size="icon"
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
              <button
                type="button"
                onClick={handleLike}
                className="h-11 w-11 rounded-full flex items-center justify-center text-white/90 hover:bg-white/10 transition-colors shrink-0"
                aria-label={language === "az" ? "Bəyən" : "Like"}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    currentStory && likedStories.has(currentStory.id) ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </button>
            </div>
            {/* Quick reactions */}
            <div className="flex items-center justify-center gap-1.5 overflow-x-auto hide-scrollbar">
              {["🔥", "❤️", "😍", "😂", "😢", "👏"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    if (onReply && currentStory) {
                      onReply(currentUserStories.userId, emoji, currentStory.mediaUrl);
                      setReplyText("");
                    }
                  }}
                  className="text-xl hover:scale-110 active:scale-95 transition-transform w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 shrink-0"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Heart Animation Overlay */}
        <AnimatePresence>
          {showHeartAnimation && (
            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1, y: -50 }}
                exit={{ scale: 2, opacity: 0, y: -100 }}
                transition={{ duration: 0.8 }}
              >
                <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-lg" />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Viewers Sliding Panel */}
        <AnimatePresence>
          {showViewersPanel && (
             <motion.div
               initial={{ y: "100%" }}
               animate={{ y: 0 }}
               exit={{ y: "100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl min-h-[40%] max-h-[75%] z-[60] flex flex-col shadow-[0_-8px_32px_rgba(0,0,0,0.25)] border-t border-border"
             >
               <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                 <h3 className="text-foreground font-semibold flex items-center gap-2 text-sm">
                   <Eye className="w-4 h-4 text-muted-foreground" />
                   {language === "az" ? "Baxışlar" : "Views"} ({currentStory.viewedBy?.length || 0})
                 </h3>
                 <button
                   type="button"
                   onClick={() => setShowViewersPanel(false)}
                   className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                   aria-label={language === "az" ? "Bağla" : "Close"}
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>
               <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                 {currentStory.viewedByDetails && currentStory.viewedByDetails.length > 0 ? (
                   currentStory.viewedByDetails.map((viewer: any) => (
                     <div
                       key={viewer.clerkId}
                       className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                     >
                       <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                         <Image src={viewer.avatar} fill sizes="40px" className="object-cover" alt={viewer.name} />
                       </div>
                       <span className="text-foreground font-medium text-sm">{viewer.name}</span>
                     </div>
                   ))
                 ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12">
                     <Eye className="w-10 h-10 mb-2 opacity-50" />
                     <p className="text-sm">{language === "az" ? "Hələ heç kim baxmayıb." : "No views yet."}</p>
                   </div>
                 )}
               </div>
             </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation arrows */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); goToPrevStory(); }}
          className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-all z-30 ${
            currentStoryIndex === 0 && currentUserIndex === 0 ? "invisible" : ""
          }`}
          aria-label={language === "az" ? "Əvvəlki" : "Previous"}
        >
          <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); goToNextStory(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-all z-30"
          aria-label={language === "az" ? "Növbəti" : "Next"}
        >
          <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>
      </div>
    </motion.div>
  );
}
