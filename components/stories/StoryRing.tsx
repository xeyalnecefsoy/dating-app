"use client";

import React from "react";
import { MOCK_STORIES, userHasStories } from "@/lib/stories";

type StoryRingProps = {
  userId: string;
  avatar: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
};

export function StoryRing({ userId, avatar, size = "md", onClick, className = "" }: StoryRingProps) {
  const hasStories = userHasStories(userId, MOCK_STORIES);
  
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const ringPadding = {
    sm: "p-[2px]",
    md: "p-[3px]",
    lg: "p-[3px]",
  };

  const innerPadding = {
    sm: "p-[1px]",
    md: "p-[2px]",
    lg: "p-[2px]",
  };

  if (!hasStories) {
    // No story ring, just the avatar
    return (
      <img 
        src={avatar}
        alt="Avatar"
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        onClick={onClick}
      />
    );
  }

  return (
    <button
      onClick={onClick}
      className={`relative ${className}`}
    >
      {/* Gradient Ring */}
      <div 
        className={`${sizeClasses[size]} rounded-full ${ringPadding[size]} bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 animate-pulse`}
        style={{ 
          animation: "none",
          background: "linear-gradient(135deg, #fbbf24, #ec4899, #8b5cf6)" 
        }}
      >
        {/* Inner white ring */}
        <div className={`w-full h-full rounded-full bg-background ${innerPadding[size]}`}>
          {/* Avatar */}
          <img 
            src={avatar}
            alt="Avatar"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </div>

      {/* Pulsing indicator */}
      <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-primary border-2 border-background animate-pulse" />
    </button>
  );
}
