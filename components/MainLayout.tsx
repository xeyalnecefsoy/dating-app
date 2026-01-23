"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, MessageCircle, User, Menu, ChevronLeft, Flame, ChevronRight, Search, Bell } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { BottomNav } from "./Navigation";
import { DebugUserSwitcher } from "./DebugUserSwitcher";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isOnboarded } = useUser();
  const { language } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(true); // Default collapsed

  const isAuthPage = pathname === "/onboarding" || pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");
  const isAdminPage = pathname?.includes("/admin");

  if (isAuthPage || isAdminPage) {
    return <>{children}</>;
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
                  src={user.avatar} 
                  alt={user.name || "Profile"} 
                  className="w-full h-full object-cover"
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
         className="flex-1 flex flex-col min-h-screen md:pl-20 transition-all duration-300 ease-in-out"
      >
        {children}
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />

      {/* Debug Switcher - Always visible */}
      <DebugUserSwitcher />
    </div>
  );
}


