"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { UserStories, MOCK_STORIES, getStoriesByUser } from "@/lib/stories";
import { MOCK_USERS } from "@/lib/mock-users";
import { StoryViewer } from "./StoryViewer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getChannelId } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

type StoriesBarProps = {
  filterByMatches?: boolean; // If true, only show stories from matched users
};

export function StoriesBar({ filterByMatches = true }: StoriesBarProps) {
  const { language } = useLanguage();
  const { user, sendMessageRequest, matchUser } = useUser();
  const { showToast } = useToast();
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);
  const sendMessageMutation = useMutation(api.messages.send);

  // Get all user stories
  let allUserStories = getStoriesByUser(MOCK_STORIES, MOCK_USERS);

  // Filter by opposite gender (based on user's lookingFor preference)
  if (user?.lookingFor) {
    allUserStories = allUserStories.filter(us => {
      const storyUser = MOCK_USERS.find(u => u.id === us.userId);
      return storyUser?.gender === user.lookingFor;
    });
  }

  // Filter by matches if needed
  if (filterByMatches && user?.matches) {
    allUserStories = allUserStories.filter(us => user.matches.includes(us.userId));
  }

  const handleStoryClick = (index: number) => {
    setSelectedUserIndex(index);
  };

  const handleAddStory = () => {
    showToast({
      type: "info",
      title: language === "az" ? "Tezliklə" : "Coming Soon",
      message: language === "az" ? "Hekayə əlavə etmə funksiyası tezliklə əlavə olunacaq!" : "Story creation feature coming soon!",
    });
  };

  const handleReply = async (userId: string, message: string, storyUrl?: string) => {
    if (!user) return;

    const isMatched = user.matches?.includes(userId);
    const targetUser = MOCK_USERS.find(u => u.id === userId);
    
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
      <div className="px-4 py-3">
        <h2 className="text-sm text-muted-foreground mb-3">
          {language === "az" ? "Hekayələr" : "Stories"}
        </h2>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {/* Add Story Button (Your Story) */}
          <button
            onClick={handleAddStory}
            className="flex flex-col items-center shrink-0"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-card border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
            <span className="text-xs mt-1 text-muted-foreground">
              {language === "az" ? "Əlavə et" : "Add"}
            </span>
          </button>

          {/* User Stories */}
          {allUserStories.map((userStory, index) => (
            <button
              key={userStory.userId}
              onClick={() => handleStoryClick(index)}
              className="flex flex-col items-center shrink-0"
            >
              <div className="relative">
                {/* Gradient Ring for unviewed stories */}
                <div 
                  className={`w-[68px] h-[68px] rounded-full p-[3px] ${
                    userStory.hasUnviewed 
                      ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" 
                      : "bg-muted"
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-background p-[2px]">
                    <img 
                      src={userStory.userAvatar}
                      alt={userStory.userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
                {/* Story count badge */}
                {userStory.stories.length > 1 && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center border-2 border-background">
                    {userStory.stories.length}
                  </div>
                )}
              </div>
              <span className="text-xs mt-1 font-medium truncate max-w-[64px]">
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
    </>
  );
}
