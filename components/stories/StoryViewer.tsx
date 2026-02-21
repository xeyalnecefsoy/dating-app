"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Heart, Send, Pause, Play } from "lucide-react";
import { UserStories, Story, getTimeAgo } from "@/lib/stories";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type StoryViewerProps = {
  userStories: UserStories[];
  initialUserIndex: number;
  onClose: () => void;
  onReply?: (userId: string, message: string, storyUrl?: string) => void;
};

export function StoryViewer({ userStories, initialUserIndex, onClose, onReply }: StoryViewerProps) {
  const { language } = useLanguage();
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

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

  // Progress bar animation
  useEffect(() => {
    if (isPaused || !currentStory) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next story
          goToNextStory();
          return 0;
        }
        return prev + (100 / (STORY_DURATION / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, currentStoryIndex, currentUserIndex]);

  // Reset reply text when story changes
  useEffect(() => {
    setReplyText("");
  }, [currentStoryIndex, currentUserIndex]);

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

  if (!currentStory) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
    >
      {/* Story Container */}
      <div className="relative w-full max-w-md h-full max-h-[90vh] m-auto">
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
          {currentUserStories.stories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-100"
                style={{ 
                  width: index < currentStoryIndex ? "100%" : 
                         index === currentStoryIndex ? `${progress}%` : "0%" 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={currentUserStories.userAvatar} 
              alt={currentUserStories.userName}
              className="w-10 h-10 rounded-full border-2 border-white object-cover"
            />
            <div>
              <p className="text-white font-semibold text-sm">{currentUserStories.userName}</p>
              <p className="text-white/60 text-xs">{getTimeAgo(currentStory.createdAt, language as "en" | "az")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 text-white/80 hover:text-white"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Story Image */}
        <motion.img
          key={currentStory.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          src={currentStory.mediaUrl}
          alt="Story"
          className="w-full h-full object-cover rounded-2xl"
          onClick={() => setIsPaused(!isPaused)}
        />

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-24 left-4 right-4 z-20">
            <p className="text-white text-center text-lg font-medium drop-shadow-lg">
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

        {/* Reply Input */}
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="flex items-center gap-2">
            <Input
              placeholder={language === "az" ? "Cavab yaz..." : "Reply..."}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => !replyText && setIsPaused(false)}
              onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full"
            />
            <Button
              size="icon"
              onClick={handleSendReply}
              disabled={!replyText.trim()}
              className="rounded-full bg-primary hover:bg-primary/80"
            >
              <Send className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost" 
              onClick={handleLike}
              className="rounded-full text-white hover:bg-white/10"
            >
              <Heart className={`w-5 h-5 ${currentStory && likedStories.has(currentStory.id) ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>
        </div>

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

        {/* Navigation Arrows (Smart visibility) */}
        <button
          onClick={(e) => { e.stopPropagation(); goToPrevStory(); }}
          className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/50 rounded-full text-white/80 hover:text-white transition-all hidden md:block z-30 ${
            (currentStoryIndex === 0 && currentUserIndex === 0) ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); goToNextStory(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/50 rounded-full text-white/80 hover:text-white transition-all hidden md:block z-30"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </motion.div>
  );
}
