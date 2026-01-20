"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { SideNav, BottomNav } from "./Navigation";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldHideNav = pathname === "/onboarding" || pathname?.includes("/admin");

  return (
    <div className="min-h-screen relative bg-background">
      {!shouldHideNav && <SideNav />}
      
      <div className={`transition-[padding] duration-300 ${!shouldHideNav ? "md:pl-20" : ""}`}>
        {children}
      </div>

      {!shouldHideNav && <BottomNav />}
    </div>
  );
}
