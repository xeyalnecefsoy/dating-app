"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Heart, Zap, Eye, Rocket, XCircle, Shield, 
  Check, Crown, Sparkles, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { PREMIUM_PLANS, PREMIUM_FEATURES } from "@/lib/premium";

const iconMap: { [key: string]: any } = {
  Heart, Zap, Eye, Rocket, XCircle, Shield
};

export default function PremiumPage() {
  const { language } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState("quarterly");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubscribe = () => {
    // Demo: Just show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 h-14 flex items-center justify-between sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-bold text-lg flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          Premium
        </h1>
        <div className="w-10" />
      </header>

      <main className="p-4 pb-24 max-w-lg mx-auto">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {language === 'az' ? 'Premium-a keçin' : 'Upgrade to Premium'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'az' 
              ? 'Daha çox uyğunluq tapın, daha çox bağlantı qurun' 
              : 'Find more matches, make more connections'}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {PREMIUM_FEATURES.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Sparkles;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">
                  {language === 'az' ? feature.titleAz : feature.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {language === 'az' ? feature.descriptionAz : feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Pricing Plans */}
        <h3 className="font-bold text-lg mb-4">
          {language === 'az' ? 'Plan seçin' : 'Choose your plan'}
        </h3>
        
        <div className="space-y-3 mb-6">
          {PREMIUM_PLANS.map((plan) => (
            <motion.button
              key={plan.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
                selectedPlan === plan.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">
                  {language === 'az' ? 'POPULYAR' : 'POPULAR'}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">
                    {language === 'az' ? plan.nameAz : plan.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {plan.price} {plan.currency} / {language === 'az' ? plan.periodAz : plan.period}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {plan.savings && (
                    <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                      {plan.savings}% {language === 'az' ? 'qənaət' : 'save'}
                    </span>
                  )}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === plan.id 
                      ? 'border-primary bg-primary' 
                      : 'border-muted-foreground'
                  }`}>
                    {selectedPlan === plan.id && (
                      <Check className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-1">
                {(language === 'az' ? plan.featuresAz : plan.features).slice(0, 3).map((f, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                    {f}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Subscribe Button */}
        <Button 
          onClick={handleSubscribe}
          className="w-full h-14 rounded-2xl text-lg font-bold gradient-brand border-0"
        >
          <Crown className="w-5 h-5 mr-2" />
          {language === 'az' ? 'Premium-a keçin' : 'Upgrade to Premium'}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-4">
          {language === 'az' 
            ? 'İstənilən vaxt ləğv edə bilərsiniz. Abunəlik avtomatik yenilənir.' 
            : 'Cancel anytime. Subscription auto-renews.'}
        </p>

        {/* Success Toast */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-50 w-full max-w-sm bg-green-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-lg mx-auto"
          >
            <Check className="w-6 h-6 shrink-0" />
            <div>
              <div className="font-bold">
                {language === 'az' ? 'Uğurlu!' : 'Success!'}
              </div>
              <div className="text-sm opacity-90">
                {language === 'az' 
                  ? 'Premium aktivləşdirildi (Demo)' 
                  : 'Premium activated (Demo)'}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
