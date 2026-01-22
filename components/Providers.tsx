"use client";

import { ReactNode, Suspense } from "react";
import { UserProvider } from "@/contexts/UserContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ConvexClientProvider from "./ConvexClientProvider";
import { ToastProvider } from "./ui/toast";
import { NotificationHandler } from "./NotificationHandler";
import { ServiceWorkerRegister } from "./ServiceWorkerRegister";
import { PWAInstallPrompt } from "./PWAInstallPrompt";
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <LanguageProvider>
        <ThemeProvider>
          <UserProvider>
            <ToastProvider>
              <Suspense fallback={null}>
                <NotificationHandler />
              </Suspense>
              <ServiceWorkerRegister />
              <PWAInstallPrompt />
              {children}
            </ToastProvider>
          </UserProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ConvexClientProvider>
  );
}
