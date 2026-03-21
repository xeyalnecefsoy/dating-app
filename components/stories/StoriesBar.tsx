"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { UserStories } from "@/lib/stories";
import Image from "next/image";

import { StoryViewer } from "./StoryViewer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AddStoryDialog } from "./AddStoryDialog";
import { useToast } from "@/components/ui/toast";
import { getChannelId } from "@/lib/utils";

type StoriesBarProps = {
  filterByMatches?: boolean; // If true, only show stories from matched users
};

export function StoriesBar({ filterByMatches = true }: StoriesBarProps) {
  const { language } = useLanguage();
  const { user, sendMessageRequest } = useUser();
  const { showToast } = useToast();
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const sendMessageMutation = useMutation(api.messages.send);

  // Get all user stories from backend
  const storiesFromApi = useQuery(api.stories.getFeed) || [];

  // Map backend raw data to the structure StoryViewer expects
  const allUserStories: UserStories[] = storiesFromApi.map(u => ({
    userId: u.userId,
    userName: u.userName,
    userAvatar: u.userAvatar,
    hasUnviewed: u.hasUnviewed,
    stories: u.stories.map((s: any) => ({
      id: s.id,
      userId: s.userId,
      mediaUrl: s.mediaUrl,
      mediaType: s.mediaType,
      caption: s.caption,
      createdAt: new Date(s.createdAt),
      expiresAt: new Date(s.expiresAt),
      viewedBy: s.viewedBy,
    }))
  }));

  const handleStoryClick = (index: number) => {
    setSelectedUserIndex(index);
  };

  const handleAddStory = () => {
    setIsAddOpen(true);
  };

  const handleReply = async (userId: string, message: string, storyUrl?: string) => {
    if (!user) return;

    const isMatched = user.matches?.includes(userId);
    const targetUser = { name: "User" }; // Placeholder until we have real user data fetching here
    
    if (isMatched) {
      // Send direct message via Convex
      try {
        const channelId = getChannelId(user.id, userId);
        // We embed the story URL in the message body using a special tag
        const messageBody = storyUrl 
          ? `[STORY:${storyUrl}] ${message}` 
          : message;
          
        await sendMessageMutation({
          body: messageBody,
          userId: user.name || "Anonymous",
          channelId: channelId,
        });
        showToast({
          type: "message",
          title: language === "az" ? "Mesaj göndərildi!" : "Message sent!",
          message: `"${message}" → ${targetUser?.name || "User"}`,
        });
      } catch (error) {
        console.error("Failed to send message:", error);
        showToast({
          type: "error",
          title: language === "az" ? "Xəta" : "Error",
          message: language === "az" ? "Mesaj göndərilə bilmədi" : "Failed to send message",
        });
      }
    } else {
      // Send as message request
      sendMessageRequest(userId);
      showToast({
        type: "message",
        title: language === "az" ? "Mesaj istəyi göndərildi!" : "Message request sent!",
        message: language === "az" 
          ? `${targetUser?.name || "User"} qəbul edəndə söhbət başlayacaq` 
          : `Chat will start when ${targetUser?.name || "they"} accept`,
        duration: 4000,
      });
    }
  };


  if (allUserStories.length === 0 && !user) {
    return null;
  }

  return (
    <>
      <div className="px-4 py-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          {language === "az" ? "Hekayələr" : "Stories"}
        </h2>
        <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-1 scroll-smooth snap-x snap-mandatory">
          {/* Add Story Button (Your Story) */}
          <button
            onClick={handleAddStory}
            className="flex flex-col items-center shrink-0 snap-start group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full"
            aria-label={language === "az" ? "Hekayə əlavə et" : "Add story"}
          >
            <div className="w-14 h-14 rounded-full bg-muted/80 border-2 border-dashed border-muted-foreground/40 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-colors">
              <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-[11px] mt-1.5 text-muted-foreground group-hover:text-foreground/80 truncate max-w-[56px]">
              {language === "az" ? "Əlavə et" : "Add"}
            </span>
          </button>

          {/* User Stories */}
          {allUserStories.map((userStory, index) => (
            <button
              key={userStory.userId}
              onClick={() => handleStoryClick(index)}
              className="flex flex-col items-center shrink-0 snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full"
            >
              <div className="relative w-14 h-14">
                <div
                  className={`w-full h-full rounded-full p-[2.5px] ${
                    userStory.hasUnviewed
                      ? "bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-500"
                      : "bg-muted"
                  }`}
                >
                  <div className="relative w-full h-full rounded-full bg-background p-[2px] overflow-hidden">
                    <Image
                      src={userStory.userAvatar}
                      alt={userStory.userName}
                      fill
                      sizes="56px"
                      className="rounded-full object-cover"
                    />
                  </div>
                </div>
                {userStory.stories.length > 1 && (
                  <span className="absolute -bottom-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center border-2 border-background">
                    {userStory.stories.length}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1.5 font-medium text-foreground/90 truncate max-w-[64px]">
                {userStory.userName}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {selectedUserIndex !== null && (
          <StoryViewer
            key={selectedUserIndex} // Force re-mount on user change
            userStories={allUserStories}
            initialUserIndex={selectedUserIndex}
            onClose={() => setSelectedUserIndex(null)}
            onReply={handleReply}
          />
        )}
      </AnimatePresence>

      <AddStoryDialog 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
      />
    </>
  );
}
