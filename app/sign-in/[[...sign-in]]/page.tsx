"use client";

import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-900/20 via-background to-pink-900/20 px-4">
      {/* Logo & Branding */}
      {/* Logo & Branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative">
            <Heart className="w-12 h-12 text-rose-500 fill-rose-500" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0"
            >
              <Heart className="w-12 h-12 text-rose-400/50 fill-rose-400/50" />
            </motion.div>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent font-serif">
              Danyeri
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              Hesabınıza daxil olun
            </p>
          </div>
        </div>
      </motion.div>

      {/* Sign In Component */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md"
      >
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-card/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl",
              headerTitle: "text-foreground text-2xl font-bold",
              headerSubtitle: "text-muted-foreground",
              // Social buttons - explicit styling for visibility
              socialButtonsBlockButton: "flex items-center justify-center gap-3 w-full min-h-[44px] px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-all duration-200",
              socialButtonsBlockButtonText: "text-white font-medium text-sm",
              socialButtonsBlockButtonArrow: "text-white",
              socialButtonsProviderIcon: "w-5 h-5",
              dividerLine: "bg-white/20",
              dividerText: "text-muted-foreground",
              formFieldLabel: "text-foreground",
              formFieldInput: "bg-white/5 border-white/20 text-foreground focus:border-rose-500 focus:ring-rose-500/20",
              formButtonPrimary: "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold transition-all duration-200 shadow-lg shadow-rose-500/25",
              footerActionLink: "text-rose-400 hover:text-rose-300",
              identityPreviewEditButton: "text-rose-400 hover:text-rose-300",
            },
            variables: {
              colorPrimary: "#f43f5e",
              colorBackground: "transparent",
              colorText: "#ffffff",
              colorTextSecondary: "#a1a1aa",
              colorInputBackground: "rgba(255, 255, 255, 0.05)",
              colorInputText: "#ffffff",
              borderRadius: "0.75rem",
            },
            layout: {
              socialButtonsVariant: "blockButton",
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          forceRedirectUrl="/discovery"
        />
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 text-muted-foreground text-sm"
      >
        Hesabınız yoxdur?{" "}
        <a href="/sign-up" className="text-rose-400 hover:text-rose-300 font-medium">
          Qeydiyyatdan keçin
        </a>
      </motion.p>
    </div>
  );
}
