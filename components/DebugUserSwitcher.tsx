"use client";

import React, { useState } from "react";
import { useUser, UserProfile } from "@/contexts/UserContext";
import { MOCK_USERS } from "@/lib/mock-users";
import { Button } from "@/components/ui/button";
import { Users, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function DebugUserSwitcher() {
  const { user, setUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const clearMatches = useMutation(api.matches.clearAll);

  // Development only check could go here
  // if (process.env.NODE_ENV !== 'development') return null;

  const handleSwitchUser = (mockUser: typeof MOCK_USERS[0]) => {
    // Convert MockUser to UserProfile format
    const newUser: UserProfile = {
      id: mockUser.id,
      name: mockUser.name,
      age: mockUser.age,
      gender: mockUser.gender, 
      lookingFor: mockUser.lookingFor,
      location: mockUser.location,
      bio: mockUser.bio.en, // Take English bio by default
      values: [],
      loveLanguage: mockUser.loveLanguage,
      interests: mockUser.interests,
      communicationStyle: mockUser.communicationStyle as any,
      avatar: mockUser.avatar,
      badges: [],
      streak: 0,
      lastActiveDate: new Date().toDateString(),
      matches: [], // Start fresh or implement mock matches if needed
      likes: [],
      unreadMatches: [],
    };
    
    // Save to local storage and reload to trigger proper hydration/onboarding check
    localStorage.setItem("aura-user", JSON.stringify(newUser));
    window.location.reload();
  };

  const handleReset = () => {
     localStorage.removeItem("aura-user");
     window.location.reload();
  };
  
  const handleClearMatches = async () => {
    if (!user?.id) return;
    
    await clearMatches({ userId: user.id });
    
    // Update local state and reload
    if (user) {
        const updatedUser = { ...user, matches: [], unreadMatches: [] };
        setUser(updatedUser);
        localStorage.setItem("aura-user", JSON.stringify(updatedUser));
    }
    setIsOpen(false);
    // Optional: reload to ensure comprehensive sync, though state update might suffice
    // window.location.reload(); 
    alert("Matches cleared!");
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 hidden md:flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="mb-2 bg-card border border-border rounded-lg shadow-xl p-3 w-64 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-2 pb-2 border-b">
              <span className="font-bold text-sm">Debug Switcher</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-1 max-h-60 overflow-y-auto">
              <p className="text-xs text-muted-foreground mb-1">Select User:</p>
              {MOCK_USERS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSwitchUser(u)}
                  className={`w-full flex items-center gap-2 p-2 rounded text-left text-sm hover:bg-muted ${user?.name === u.name ? "bg-primary/10 text-primary border border-primary/20" : ""}`}
                >
                  <img src={u.avatar} className="w-6 h-6 rounded-full" />
                  <span className="truncate">{u.name}</span>
                </button>
              ))}
              
              <div className="border-t my-2 pt-2 space-y-1">
                 <button 
                   onClick={handleClearMatches}
                   className="w-full text-xs text-orange-500 hover:bg-orange-50 p-2 rounded text-left font-medium"
                 >
                   Clear Matches (DB)
                 </button>
                 <button 
                   onClick={handleReset}
                   className="w-full text-xs text-red-500 hover:bg-red-50 p-2 rounded text-left font-medium"
                 >
                   Clear / Logout
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        className="rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white"
        onClick={() => setIsOpen(!isOpen)}
        title="Switch User (Debug)"
      >
        <Users className="h-5 w-5" />
      </Button>
    </div>
  );
}
