"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Camera } from "lucide-react";
import { getChannelId, cn } from "@/lib/utils";
import { MOCK_USERS } from "@/lib/mock-users";

import { useLanguage } from "@/contexts/LanguageContext";

interface ConversationRowProps {
  participantId: string;
  currentUserId: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function ConversationRow({ participantId, currentUserId, isSelected, onSelect }: ConversationRowProps) {
  const { language } = useLanguage();
  // Try finding in static mocks first (for speed/legacy), then DB
  let participant = MOCK_USERS.find((u) => u.id === participantId);
  const channelId = getChannelId(currentUserId, participantId);
  
  // Fetch real last message from Convex
  const lastMessage = useQuery(api.messages.last, { channelId });
  const presence = useQuery(api.presence.getStatus, { userId: participantId });
  
  // If not in static mocks, fetch from DB
  const dbUser = useQuery(api.users.getUser, { clerkId: participantId });
  
  if (!participant && dbUser) {
    participant = {
      id: dbUser.clerkId || dbUser._id,
      name: dbUser.name,
      avatar: dbUser.avatar || "/placeholder-avatar.svg",
      // ... map other fields if needed, but for row we only need name/avatar
    } as any;
  }

  if (!participant) return null;

  // Fallback / Initial State (if no message in DB yet)
  // We can show the default "match" message or empty
  let displayMessage = lastMessage?.body;
  
  // Clean up special message types for preview
  let isStoryReply = false;
  let prefix = "";

  if (lastMessage && displayMessage) {
    const isMe = lastMessage.userId === currentUserId || lastMessage.userId === "current-user";
    if (isMe) {
        prefix = language === 'az' ? 'Siz: ' : 'You: ';
    }
  }

  if (displayMessage) {
    // Story replies
    const storyMatch = displayMessage.match(/^\[STORY:[^\]]+\]\s*(.*)/);
    if (storyMatch) {
      isStoryReply = true;
      displayMessage = storyMatch[1] || (language === 'az' ? 'Şəkil' : 'Image');
    }
  }

  const displayTime = lastMessage?._creationTime 
    ? new Date(lastMessage._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "";

  const placeholderText = language === 'az' ? "Söhbətə başla..." : "Start conversation...";

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-left",
        isSelected ? "bg-card border border-border" : "hover:bg-card/50"
      )}
    >
      <div className="relative">
        <img 
          src={participant.avatar}
          alt={participant.name}
          className="w-14 h-14 rounded-full object-cover"
        />
        {/* Helper: Online indicator */}
        {presence?.isOnline && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#20D5A0] border-2 border-background" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold">{participant.name}</span>
          <span className="text-xs text-muted-foreground">{displayTime}</span>
        </div>
        <div className={cn(
            "text-sm truncate flex items-center gap-1",
            !displayMessage ? "text-muted-foreground italic opacity-70" : "text-muted-foreground"
          )}>
          {isStoryReply && <Camera className="w-3 h-3 shrink-0" />}
          <span className="truncate">
            <span className="font-medium mr-1">{prefix}</span>
            {displayMessage || placeholderText}
          </span>
        </div>
      </div>
    </button>
  );
}
