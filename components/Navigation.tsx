"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Compass, MessageCircle, User, Menu, ChevronLeft, Flame, LogOut, Search, Bell, Crown, MapPin } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isOnboarded } = useUser();
  const { user: clerkUser } = useClerkUser();
  const { language } = useLanguage();
  
  // Hide if in a chat (userId param exists)
  if (searchParams.get("userId")) return null;

  
  // Use Clerk avatar as fallback when user context is not yet loaded
  const avatarUrl = user?.avatar || clerkUser?.imageUrl;

  const navItems = [
    { href: "/", icon: Home, labelEn: "Home", labelAz: "Ana Səhifə" },
    { href: "/discovery", icon: Compass, labelEn: "Discover", labelAz: "Kəşf" },
    { href: "/search", icon: Search, labelEn: "Search", labelAz: "Axtar" },
    { href: "/messages", icon: MessageCircle, labelEn: "Chat", labelAz: "Mesaj", badge: (user?.unreadMatches?.filter(id => user?.matches?.includes(id))?.length || 0) + (user?.messageRequests?.filter(id => !user?.seenMessageRequests?.includes(id)).length || 0) },
  ];

  // Profile item ayrı
  const profileHref = isOnboarded ? "/profile" : "/onboarding";
  const profileLabel = language === 'az' ? 'Profil' : 'Profile';
  const isProfileActive = pathname === "/profile";

  // Don't show nav on welcome/onboarding screens
  if (pathname === "/onboarding") return null;

  // Waitlist: only allow home and profile
  const isWaitlisted = user?.status === 'waitlist';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="h-16 grid grid-cols-5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const label = language === 'az' ? item.labelAz : item.labelEn;
          
          const isAllowed = !isWaitlisted || item.href === '/';

          if (!isAllowed) {
            return (
              <div
                key={item.href}
                className="flex flex-col items-center justify-center gap-0.5 cursor-not-allowed select-none"
                style={{ opacity: 0.3, pointerEvents: 'none' }}
                aria-disabled="true"
              >
                <div className="relative">
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </div>
            );
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {item.badge > 9 ? "9" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && (
                <div className="absolute top-0 w-10 h-0.5 bg-primary rounded-b-full" />
              )}
            </Link>
          );
        })}

        {/* Profile Link with Avatar */}
        <Link
          href={profileHref}
          className={`flex flex-col items-center justify-center gap-0.5 ${
            isProfileActive ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <div className={cn(
            "relative w-6 h-6 rounded-full overflow-hidden",
            isProfileActive && "ring-2 ring-primary ring-offset-1 ring-offset-background"
          )}>
            {avatarUrl ? (
              <img 
                src={avatarUrl}
                alt={user?.name || "Profile"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-avatar.svg';
                }}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}
          </div>
          <span className="text-[10px] font-medium">{profileLabel}</span>
          {isProfileActive && (
            <div className="absolute top-0 w-10 h-0.5 bg-primary rounded-b-full" />
          )}
        </Link>
      </div>
      {/* Safe area for iPhone */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

export function SideNav() {
  const pathname = usePathname();
  const { user, isOnboarded, logout } = useUser();
  const { language } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const notificationsCount = useQuery(api.notifications.getUnreadCount) || 0;

  const navItems = [
    { href: "/", icon: Home, labelEn: "Home", labelAz: "Ana Səhifə" },
    { href: "/discovery", icon: Compass, labelEn: "Discover", labelAz: "Kəşf" },
    { href: "/search", icon: Search, labelEn: "Search", labelAz: "Axtar" },
    { href: "/messages", icon: MessageCircle, labelEn: "Chat", labelAz: "Mesaj", badge: (user?.unreadMatches?.filter(id => user?.matches?.includes(id))?.length || 0) + (user?.messageRequests?.filter(id => !user?.seenMessageRequests?.includes(id)).length || 0) },
    { href: "/notifications", icon: Bell, labelEn: "Alerts", labelAz: "Bildiriş", badge: notificationsCount },
    { href: "/venues", icon: MapPin, labelEn: "Venues", labelAz: "Məkan" },
    { href: "/premium", icon: Crown, labelEn: "Premium", labelAz: "Premium" },
    { href: isOnboarded ? "/profile" : "/onboarding", icon: User, labelEn: "Profile", labelAz: "Profil" },
  ];

  if (pathname === "/onboarding") return null;

  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-50 bg-[#1A1A2E] border-r border-white/10 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#FF4458] to-[#FD267A] flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl text-white whitespace-nowrap">Danyeri</span>
          )}
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-6 px-3 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const label = language === 'az' ? item.labelAz : item.labelEn;

          // Waitlist Logic
          const isWaitlisted = user?.status === 'waitlist';
          // Check if this item is profile (path or label matches)
          const isProfileItem = item.href === '/profile' || item.href === '/onboarding' || item.labelEn === 'Profile';
          
          const isAllowed = !isWaitlisted || item.href === '/' || isProfileItem;

          if (!isAllowed) {
            return (
              <div
                key={item.href}
                className={cn(
                  "flex items-center gap-4 px-3 py-3 rounded-xl transition-colors group relative cursor-not-allowed select-none",
                )}
                style={{ opacity: 0.3, pointerEvents: 'none' }}
              >
                <div className="relative shrink-0">
                  <Icon className="w-6 h-6 text-gray-400" />
                </div>
                
                {!isCollapsed && (
                  <span className="font-medium whitespace-nowrap text-gray-400">{label}</span>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-3 py-3 rounded-xl transition-colors group relative",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="relative shrink-0">
                <Icon className={cn("w-6 h-6", isActive && "text-[#FF4458]")} />
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FF4458] text-[10px] font-bold text-white flex items-center justify-center">
                    {item.badge > 9 ? "9" : item.badge}
                  </span>
                )}
              </div>
              
              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap">{label}</span>
              )}

              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-white text-black text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50">
                  {label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer - Collapse Toggle */}
      <div className="p-4 border-t border-white/10">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : (
            <div className="flex items-center gap-2 w-full">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">{language === 'az' ? 'Menyunu bağla' : 'Collapse'}</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}

export function TopNav() {
  return null;
}
