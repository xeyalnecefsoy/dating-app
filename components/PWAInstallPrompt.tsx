"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, Share } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "./ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const txt = {
    title: language === "az" ? "Danyeri-ni Yüklə" : "Install Danyeri",
    description: language === "az" 
      ? "Tətbiqi ana ekrana əlavə et və daha sürətli istifadə et" 
      : "Add to home screen for faster access",
    iosInstructions: language === "az"
      ? "Safari-də \"Paylaş\" düyməsinə basın, sonra \"Ana ekrana əlavə et\" seçin"
      : "Tap the Share button in Safari, then select 'Add to Home Screen'",
    install: language === "az" ? "Yüklə" : "Install",
    later: language === "az" ? "Sonra" : "Later",
    installed: language === "az" ? "Uğurla yükləndi!" : "Successfully installed!",
  };

  useEffect(() => {
    // Check if already in standalone mode
    const isInStandaloneMode = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    
    setIsStandalone(isInStandaloneMode);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a short delay (don't interrupt initial experience)
      const hasSeenPrompt = localStorage.getItem("pwa-prompt-seen");
      if (!hasSeenPrompt) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show iOS prompt if on iOS and not in standalone
    if (iOS && !isInStandaloneMode) {
      const hasSeenIOSPrompt = localStorage.getItem("ios-prompt-seen");
      if (!hasSeenIOSPrompt) {
        setTimeout(() => setShowPrompt(true), 10000);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      console.log("PWA installed");
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-seen", "true");
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-seen", "true");
    if (isIOS) {
      localStorage.setItem("ios-prompt-seen", "true");
    }
  };

  // Don't show if already installed
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-6 md:bottom-6 md:w-80"
        >
          <div className="bg-card border border-border rounded-2xl p-4 shadow-xl backdrop-blur-xl">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>

            <div className="flex items-start gap-3">
              {/* App Icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-7 h-7 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base">{txt.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isIOS ? txt.iosInstructions : txt.description}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="flex-1 rounded-full"
              >
                {txt.later}
              </Button>
              
              {!isIOS && deferredPrompt && (
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="flex-1 rounded-full gradient-brand border-0"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  {txt.install}
                </Button>
              )}
              
              {isIOS && (
                <Button
                  size="sm"
                  onClick={handleDismiss}
                  className="flex-1 rounded-full gradient-brand border-0"
                >
                  <Share className="w-4 h-4 mr-1.5" />
                  OK
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
