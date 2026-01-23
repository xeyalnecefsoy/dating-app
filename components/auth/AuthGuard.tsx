"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

interface AuthGuardProps {
  children: ReactNode;
  requireOnboarding?: boolean;
}

export function AuthGuard({ children, requireOnboarding = false }: AuthGuardProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-4"
        >
          <Heart className="w-16 h-16 text-rose-500 fill-rose-500" />
          <p className="text-muted-foreground">Yüklənir...</p>
        </motion.div>
      </div>
    );
  }

  // If not signed in, show nothing (will redirect)
  if (!isSignedIn) {
    return null;
  }

  return <>{children}</>;
}
