"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  const { language } = useLanguage();

  const txt = {
    title: language === 'az' ? 'Səhifə Tapılmadı' : 'Page Not Found',
    desc: language === 'az' 
      ? 'Axtardığınız səhifə mövcud deyil və ya yeri dəyişdirilib.' 
      : 'The page you are looking for does not exist or has been moved.',
    home: language === 'az' ? 'Ana Səhifə' : 'Go Home',
    discover: language === 'az' ? 'Kəşf Et' : 'Discover',
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center mb-6 relative">
        <span className="text-4xl">🤔</span>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
          404
        </div>
      </div>
      
      <h1 className="text-3xl font-bold mb-3">{txt.title}</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        {txt.desc}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Button asChild size="lg" className="w-full">
          <Link href="/" className="gap-2">
            <Home className="w-4 h-4" />
            {txt.home}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href="/discovery" className="gap-2">
            <Compass className="w-4 h-4" />
            {txt.discover}
          </Link>
        </Button>
      </div>
    </div>
  );
}
