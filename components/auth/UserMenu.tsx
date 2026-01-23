"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";

export function UserMenu() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3"
    >
      <div className="hidden sm:block text-right">
        <p className="text-sm font-medium text-foreground">
          {user.firstName || user.username || "İstifadəçi"}
        </p>
        <p className="text-xs text-muted-foreground">
          {user.primaryEmailAddress?.emailAddress}
        </p>
      </div>
      <UserButton
        appearance={{
          elements: {
            avatarBox: "w-10 h-10 ring-2 ring-rose-500/50 ring-offset-2 ring-offset-background",
            userButtonPopoverCard: "bg-card border border-white/10 shadow-xl",
            userButtonPopoverActionButton: "hover:bg-white/10",
            userButtonPopoverActionButtonText: "text-foreground",
            userButtonPopoverActionButtonIcon: "text-muted-foreground",
            userButtonPopoverFooter: "hidden",
          },
        }}
        afterSignOutUrl="/"
      />
    </motion.div>
  );
}
