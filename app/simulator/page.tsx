"use client";

import CommunicationSimulator from "@/components/simulator/CommunicationSimulator";
import Link from "next/link";
import { ArrowLeft, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SimulatorPage() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-4 h-14 border-b border-border flex items-center justify-between sticky top-0 bg-background z-50 shadow-sm">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
             <Flame className="w-5 h-5 text-white" />
           </div>
           <span className="font-bold text-lg">Danyeri</span>
        </div>
        <Link href="/">
           <Button variant="ghost" className="gap-2">
             <ArrowLeft className="w-4 h-4" />
             {language === 'az' ? 'Ana Səhifəyə Qayıt' : 'Back to Home'}
           </Button>
        </Link>
      </header>
      
      <main className="flex-1 flex flex-col p-4 md:p-6 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
        <CommunicationSimulator />
      </main>
    </div>
  );
}
