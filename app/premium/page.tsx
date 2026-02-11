"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Heart, Zap, Eye, Rocket, XCircle, Shield, 
  Check, Crown, Sparkles, Star, Loader2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { PREMIUM_PLANS, PREMIUM_FEATURES } from "@/lib/premium";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const iconMap: { [key: string]: any } = {
  Heart, Zap, Eye, Rocket, XCircle, Shield
};

export default function PremiumPage() {
  const { language } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState("quarterly");
  const [isActivating, setIsActivating] = useState(false);

  // Real Convex queries
  const premiumStatus = useQuery(api.premium.getStatus);
  const paywallEnabled = useQuery(api.premium.isPaywallEnabled);
  const activatePremium = useMutation(api.premium.activatePremium);
  const deactivatePremium = useMutation(api.premium.deactivatePremium);

  const isPremium = premiumStatus?.isPremium || false;

  const txt = {
    upgrade: language === 'az' ? 'Premium-a keçin' : 'Upgrade to Premium',
    subtitle: language === 'az' 
      ? 'Daha çox uyğunluq tapın, daha çox bağlantı qurun'
      : 'Find more matches, make more connections',
    choosePlan: language === 'az' ? 'Plan seçin' : 'Choose your plan',
    activateBtn: language === 'az' ? 'Premium-a keçin' : 'Upgrade to Premium',
    activatingBtn: language === 'az' ? 'Aktivləşdirilir...' : 'Activating...',
    cancelNote: language === 'az'
      ? 'İstənilən vaxt ləğv edə bilərsiniz. Abunəlik avtomatik yenilənir.'
      : 'Cancel anytime. Subscription auto-renews.',
    successTitle: language === 'az' ? 'Uğurlu!' : 'Success!',
    successMsg: language === 'az' ? 'Premium aktivləşdirildi!' : 'Premium activated!',
    errorTitle: language === 'az' ? 'Xəta' : 'Error',
    paywallMsg: language === 'az'
      ? 'Ödəniş sistemi tezliklə əlavə olunacaq. Hal-hazırda premium pulsuz aktivləşdirilə bilməz.'
      : 'Payment system coming soon. Premium cannot be activated right now.',
    // Active premium state
    alreadyPremium: language === 'az' ? 'Siz artıq Premium-sunuz!' : "You're already Premium!",
    yourPlan: language === 'az' ? 'Planınız' : 'Your plan',
    expiresOn: language === 'az' ? 'Bitir' : 'Expires',
    cancelPremium: language === 'az' ? 'Premium-u ləğv et' : 'Cancel Premium',
    cancellingBtn: language === 'az' ? 'Ləğv edilir...' : 'Cancelling...',
    freeNote: language === 'az'
      ? '🎉 Hal-hazırda Premium bütün istifadəçilər üçün pulsuzdur!'
      : '🎉 Premium is currently free for all users!',
  };

  const handleSubscribe = async () => {
    if (isActivating) return;
    setIsActivating(true);
    
    try {
      await activatePremium({ plan: selectedPlan });
    } catch (error: any) {
      console.error("Premium activation error:", error);
      // Error will show in the paywall toast below
    } finally {
      setIsActivating(false);
    }
  };

  const handleCancel = async () => {
    if (isActivating) return;
    setIsActivating(true);
    try {
      await deactivatePremium();
    } catch (error) {
      console.error("Premium deactivation error:", error);
    } finally {
      setIsActivating(false);
    }
  };

  const planNames: Record<string, string> = {
    monthly: language === 'az' ? 'Aylıq' : 'Monthly',
    quarterly: language === 'az' ? '3 Aylıq' : '3 Months',
    yearly: language === 'az' ? 'İllik' : 'Yearly',
  };

  // Already premium — show status
  if (isPremium) {
    return (
      <div className="min-h-screen bg-background">
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <Crown className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{txt.alreadyPremium}</h2>
            
            <div className="mt-6 bg-card border border-border rounded-2xl p-6 text-left space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{txt.yourPlan}</span>
                <span className="font-bold text-primary">
                  {planNames[premiumStatus?.plan || ''] || premiumStatus?.plan}
                </span>
              </div>
              {premiumStatus?.expiresAt && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{txt.expiresOn}</span>
                  <span className="font-medium">
                    {new Date(premiumStatus.expiresAt).toLocaleDateString(language === 'az' ? 'az-AZ' : 'en-US')}
                  </span>
                </div>
              )}
            </div>

            {/* Premium features still shown */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              {PREMIUM_FEATURES.map((feature, index) => {
                const Icon = iconMap[feature.icon] || Sparkles;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="bg-card border border-primary/20 rounded-2xl p-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">
                      {language === 'az' ? feature.titleAz : feature.title}
                    </h3>
                    <div className="flex items-center gap-1 text-green-500 text-xs mt-1">
                      <Check className="w-3 h-3" />
                      <span>{language === 'az' ? 'Aktiv' : 'Active'}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <Button
              onClick={handleCancel}
              disabled={isActivating}
              variant="outline"
              className="mt-8 rounded-full text-destructive hover:bg-destructive/10"
            >
              {isActivating ? txt.cancellingBtn : txt.cancelPremium}
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

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
        {/* Free notice when paywall is off */}
        {paywallEnabled === false && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 rounded-2xl p-4 mb-6 text-center text-sm font-medium"
          >
            {txt.freeNote}
          </motion.div>
        )}

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{txt.upgrade}</h2>
          <p className="text-muted-foreground">{txt.subtitle}</p>
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
        <h3 className="font-bold text-lg mb-4">{txt.choosePlan}</h3>
        
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
                    {paywallEnabled === false ? (
                      <span className="text-green-500 font-medium">
                        {language === 'az' ? 'Pulsuz' : 'Free'}
                      </span>
                    ) : (
                      <>{plan.price} {plan.currency} / {language === 'az' ? plan.periodAz : plan.period}</>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {plan.savings && paywallEnabled !== false && (
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
        {paywallEnabled ? (
          <div className="space-y-3">
            <Button 
              disabled
              className="w-full h-14 rounded-2xl text-lg font-bold opacity-60"
            >
              <AlertCircle className="w-5 h-5 mr-2" />
              {language === 'az' ? 'Tezliklə' : 'Coming Soon'}
            </Button>
            <p className="text-xs text-center text-amber-600 dark:text-amber-400">
              {txt.paywallMsg}
            </p>
          </div>
        ) : (
          <Button 
            onClick={handleSubscribe}
            disabled={isActivating}
            className="w-full h-14 rounded-2xl text-lg font-bold gradient-brand border-0"
          >
            {isActivating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {txt.activatingBtn}
              </>
            ) : (
              <>
                <Crown className="w-5 h-5 mr-2" />
                {txt.activateBtn}
              </>
            )}
          </Button>
        )}

        <p className="text-xs text-center text-muted-foreground mt-4">
          {paywallEnabled === false
            ? (language === 'az' 
                ? 'Hal-hazırda ödəniş tələb olunmur.' 
                : 'No payment required at this time.')
            : txt.cancelNote
          }
        </p>
      </main>
    </div>
  );
}
