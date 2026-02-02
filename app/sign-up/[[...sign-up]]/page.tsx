"use client";

import { SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Heart, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-900/20 via-background to-pink-900/20 px-4 py-8">
      {/* Logo & Branding */}
      <Link href="/" className="absolute top-8 left-8 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/80 hover:text-white">
        <ArrowLeft className="w-6 h-6" />
      </Link>

      {/* Sign Up Component */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-card/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl",
              headerTitle: "text-foreground text-2xl font-bold font-serif",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "flex items-center justify-center gap-3 w-full min-h-[52px] px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all duration-200",
              socialButtonsBlockButtonText: "text-white font-medium text-base",
              socialButtonsBlockButtonArrow: "text-white",
              socialButtonsProviderIcon: "w-5 h-5",
              dividerLine: "bg-white/10",
              dividerText: "text-muted-foreground uppercase text-[10px] tracking-widest font-bold",
              formFieldLabel: "text-foreground font-medium mb-1.5",
              formFieldInput: "bg-white/5 border-white/10 h-12 text-foreground focus:border-rose-500 focus:ring-rose-500/20 rounded-xl transition-all",
              formButtonPrimary: "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 h-12 text-white font-bold text-base transition-all duration-200 shadow-lg shadow-rose-500/25 rounded-xl",
              footerActionLink: "text-rose-400 hover:text-rose-300 font-semibold",
              identityPreviewEditButton: "text-rose-400 hover:text-rose-300",
            },
            variables: {
              colorPrimary: "#f43f5e",
              colorBackground: "transparent",
              colorText: "#ffffff",
              colorTextSecondary: "#a1a1aa",
              colorInputBackground: "rgba(255, 255, 255, 0.05)",
              colorInputText: "#ffffff",
              borderRadius: "1rem",
            },
            layout: {
              socialButtonsVariant: "blockButton",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/onboarding"
        />
      </motion.div>
    </div>
  );
}
