"use client";

import { ReactNode, Suspense } from "react";
import { UserProvider } from "@/contexts/UserContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ConvexClientProvider from "./ConvexClientProvider";
import { ToastProvider } from "./ui/toast";
import { NotificationHandler } from "./NotificationHandler";

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
              {children}
            </ToastProvider>
          </UserProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ConvexClientProvider>
  );
}
