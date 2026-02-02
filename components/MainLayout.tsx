"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Compass, MessageCircle, User, Menu, ChevronLeft, Flame, ChevronRight, Search, Bell, Camera } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { BottomNav } from "./Navigation";
import { DebugUserSwitcher } from "./DebugUserSwitcher";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isOnboarded, isAuthenticated, isLoading } = useUser();
  const { language } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(true); // Default collapsed
  
  // Check if avatar is valid (reachable)
  const [isAvatarBroken, setIsAvatarBroken] = useState(false);

  useEffect(() => {
    if (user?.avatar && !user.avatar.includes("dicebear")) {
      // Check if image loads
      const img = new Image();
      img.src = user.avatar;
      img.onload = () => setIsAvatarBroken(false);
      img.onerror = () => setIsAvatarBroken(true);
    } else if (user?.avatar?.includes("dicebear")) {
      setIsAvatarBroken(true);
    }
  }, [user?.avatar]);

  const isAuthPage = pathname === "/onboarding" || pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");
  const isAdminPage = pathname?.includes("/admin");

  // Force onboarding redirect (except for home page which shows WelcomeScreen)
  useEffect(() => {
    if (isLoading) return;

    // Don't redirect if on home page - it handles its own display logic with WelcomeScreen
    const isHomePage = pathname === '/';
    
    if (isAuthenticated && !isOnboarded && !isAuthPage && !isAdminPage && !isHomePage) {
      router.replace("/onboarding");
    }
  }, [isLoading, isAuthenticated, isOnboarded, isAuthPage, isAdminPage, pathname, router]);

  // Waitlist access control - only allow home and profile
  const isWaitlisted = user?.status === 'waitlist';
  const allowedForWaitlist = ['/', '/profile', '/settings', '/onboarding'];
  // We check !isLoading below to decide final render, but for PROVISIONAL blocking:
  // If we are loading, we don't know status yet, so we assume potentially restricted.
  
  const isRestrictedForWaitlist = !isLoading && isWaitlisted && pathname && !allowedForWaitlist.includes(pathname);

  useEffect(() => {
    if (isRestrictedForWaitlist) {
      router.replace('/');
    }
  }, [isRestrictedForWaitlist, router]);

  if (isAuthPage || isAdminPage) {
    return <>{children}</>;
  }

  // CRITICAL FIX: While loading, DO NOT show content for protected pages.
  // We only allow "Safe" pages (Home, Profile, etc) to render optimistically or during load.
  // Actually, even Profile might be restricted? No, allowedForWaitlist includes it.
  // So if path is NOT in allowedForWaitlist, we BLOCK it during loading.
  const isSafePath = pathname && allowedForWaitlist.includes(pathname);
  
  // Prevent flash of content: If user is authenticated but NOT onboarded, and on a protected page,
  // we block rendering immediately while the useEffect above handles the redirect.
  const isHomePage = pathname === '/';
  const shouldRedirectToOnboarding = isAuthenticated && !isOnboarded && !isAuthPage && !isAdminPage && !isHomePage;

  if ((isLoading && !isSafePath) || shouldRedirectToOnboarding) { 
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          {/* Spinner or blank to avoid flicker */}
        </div>
      );
  }

  // Prevent flash of content for waitlisted users (after load)
  if (isRestrictedForWaitlist) {
    return null; 
  }

  const navItems = [
    { href: "/", icon: Home, labelEn: "Home", labelAz: "Ana Səhifə" },
    { href: "/discovery", icon: Compass, labelEn: "Discover", labelAz: "Kəşf" },
    { href: "/search", icon: Search, labelEn: "Search", labelAz: "Axtar" },
    { href: "/messages", icon: MessageCircle, labelEn: "Chat", labelAz: "Mesaj", badge: user?.unreadMatches?.length || 0 },
    { href: "/notifications", icon: Bell, labelEn: "Alerts", labelAz: "Bildiriş" },
  ];

  // Profile item ayrı - avatar şəkli üçün
  const profileHref = isOnboarded ? "/profile" : "/onboarding";
  const profileLabel = language === 'az' ? 'Profil' : 'Profile';
  const isProfileActive = pathname === "/profile";




  return (
    <div className="min-h-screen relative bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-50 bg-card border-r border-border transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Toggle / Logo Area */}
        <div className="h-20 flex items-center justify-center px-2 border-b border-border">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "flex items-center gap-3 p-2 rounded-xl transition-all group",
              isCollapsed ? "w-12 justify-center" : "w-full hover:bg-muted"
            )}
          >
            <div className={cn(
               "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
               isCollapsed ? "bg-transparent text-foreground group-hover:text-primary" : "bg-muted group-hover:bg-primary group-hover:text-primary-foreground"
            )}>
              <Menu className="w-6 h-6" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-xl bg-gradient-to-r from-[#FF4458] to-[#FD267A] bg-clip-text text-transparent">
                Danyeri
              </span>
            )}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-6 px-2 space-y-2 flex flex-col items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const label = language === 'az' ? item.labelAz : item.labelEn;

            // Waitlist Logic
            const isWaitlisted = user?.status === 'waitlist';
            const isAllowed = !isWaitlisted || item.href === '/';

            if (!isAllowed) {
              return (
                 <div
                   key={item.href}
                   className={cn(
                     "flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative cursor-not-allowed select-none",
                     isCollapsed ? "justify-center w-12" : "w-full px-3",
                   )}
                   style={{ opacity: 0.3, pointerEvents: 'none' }}
                   aria-disabled="true"
                 >
                   <div className={cn(
                     "relative shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                     "bg-transparent text-muted-foreground"
                   )}>
                     <Icon className="w-6 h-6" strokeWidth={2} />
                   </div>
                   
                   {!isCollapsed && (
                     <span className="font-medium whitespace-nowrap text-muted-foreground">{label}</span>
                   )}
                 </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative",
                  isCollapsed ? "justify-center w-12" : "w-full px-3",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "relative shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                  isActive && !isCollapsed ? "bg-primary/10" : "",
                   isActive && isCollapsed ? "bg-primary/10" : "group-hover:bg-muted"
                )}>
                  <Icon className={cn("w-6 h-6", isActive && "drop-shadow-md")} strokeWidth={isActive ? 2.5 : 2} />
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center ring-2 ring-card">
                      {item.badge > 9 ? "9" : item.badge}
                    </span>
                  )}
                </div>
                
                {!isCollapsed && (
                  <span className={cn("font-medium whitespace-nowrap", isActive && "font-bold")}>{label}</span>
                )}

                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-popover text-popover-foreground text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-all duration-200 shadow-xl border border-border z-50 translate-x-1 group-hover:translate-x-0">
                    {label}
                  </div>
                )}
                
                {isActive && !isCollapsed && (
                   <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}

          {/* Profile Link with Avatar */}
          <Link
            href={profileHref}
            className={cn(
              "flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative",
              isCollapsed ? "justify-center w-12" : "w-full px-3",
              isProfileActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "relative shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all overflow-hidden",
              isProfileActive && !isCollapsed ? "ring-2 ring-primary" : "",
              isProfileActive && isCollapsed ? "ring-2 ring-primary" : "group-hover:ring-2 group-hover:ring-muted"
            )}>
              {user?.avatar ? (
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                  alt={user.name || "Profile"} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.name || 'default'}`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
            
            {!isCollapsed && (
              <span className={cn("font-medium whitespace-nowrap", isProfileActive && "font-bold")}>{profileLabel}</span>
            )}

            {/* Tooltip for collapsed mode */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-popover text-popover-foreground text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-all duration-200 shadow-xl border border-border z-50 translate-x-1 group-hover:translate-x-0">
                {profileLabel}
              </div>
            )}
            
            {isProfileActive && !isCollapsed && (
              <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </Link>
        </nav>
      </aside>

      {/* Content Area */}
      {/* 
          We keep fixed padding-left (md:pl-20) equal to the collapsed sidebar width.
          When sidebar expands (w-64), it will overlay the content instead of pushing it.
      */}
      <div 
         className="flex-1 flex flex-col min-h-screen md:pl-20 pb-20 md:pb-0 transition-all duration-300 ease-in-out"
      >
        {children}
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />

      <DebugUserSwitcher />

      {/* Mandatory Profile Picture Warning */}
      {user && isAvatarBroken && !pathname?.includes("/onboarding") && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 bg-destructive/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-lg z-50 animate-in slide-in-from-bottom duration-500 border border-white/10">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/10 rounded-full shrink-0">
              <Camera className="w-6 h-6" />
            </div>
            <div className="flex-1">
               <h3 className="font-bold text-sm mb-1">
                 {language === 'az' ? 'Profil şəkli mütləqdir!' : 'Profile photo is required!'}
               </h3>
               <p className="text-xs opacity-90 mb-3">
                 {language === 'az' 
                   ? 'Platformada iştirak etmək üçün real profil şəkliniz olmalıdır. Zəhmət olmasa şəklinizi yükləyin.' 
                   : 'You must have a real profile photo to verify your profile. Please upload one.'}
               </p>
               <Link href="/profile">
                 <button className="w-full py-2 bg-white text-destructive font-bold rounded-xl text-sm hover:bg-white/90 transition-colors">
                   {language === 'az' ? 'Şəkil Yüklə' : 'Upload Photo'}
                 </button>
               </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


