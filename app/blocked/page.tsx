"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Ban, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";

export default function BlockedUsersPage() {
  const { language } = useLanguage();
  const { isSignedIn } = useAuth();
  const { showToast } = useToast();

  const blockedUsers = useQuery(
    api.blocks.getBlockedUsers,
    isSignedIn ? {} : "skip"
  );
  const unblockUser = useMutation(api.blocks.unblockUser);

  const isLoading = blockedUsers === undefined;

  const texts = {
    title: language === 'az' ? 'Əngəllənən İstifadəçilər' : 'Blocked Users',
    empty: language === 'az' ? 'Heç bir istifadəçi əngəllənməyib' : 'No blocked users',
    emptyDesc: language === 'az' ? 'Əngəllədiyiniz istifadəçilər burada görünəcək' : 'Users you block will appear here',
    unblock: language === 'az' ? 'Əngəli Götür' : 'Unblock',
    unblocked: language === 'az' ? 'Əngəl götürüldü' : 'User unblocked',
  };

  const handleUnblock = async (targetUserId: string, name: string) => {
    try {
      await unblockUser({ targetUserId });
      showToast({ 
        type: "success", 
        title: texts.unblocked, 
        message: name 
      });
    } catch (error) {
      console.error("Unblock error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/settings">
            <button className="w-8 h-8 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          </Link>
          <h1 className="font-bold text-lg text-foreground">{texts.title}</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          </div>
        ) : !blockedUsers || blockedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Ban className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">{texts.empty}</h2>
            <p className="text-sm text-muted-foreground">{texts.emptyDesc}</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <AnimatePresence>
              {blockedUsers.map((user: any, index: number) => (
                <motion.div
                  key={user.clerkId}
                  initial={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {index > 0 && <div className="h-px bg-border mx-4" />}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                        <img 
                          src={user.avatar || '/placeholder-avatar.svg'} 
                          alt={user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }}
                        />
                      </div>
                      <span className="text-foreground font-medium">{user.name}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-full"
                      onClick={() => handleUnblock(user.clerkId, user.name)}
                    >
                      <UserX className="w-3.5 h-3.5 mr-1" />
                      {texts.unblock}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
