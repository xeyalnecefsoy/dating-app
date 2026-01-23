"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "az";

type Translations = {
  [key: string]: {
    en: string;
    az: string;
  };
};

export const translations: Translations = {
  // Navigation
  "nav.home": { en: "Home", az: "Ana Səhifə" },
  "nav.discover": { en: "Discover", az: "Kəşf Et" },
  "nav.stories": { en: "Stories", az: "Hekayələr" },
  "nav.simulator": { en: "Simulator", az: "Simulyator" },
  "nav.profile": { en: "Profile", az: "Profil" },
  "nav.messages": { en: "Messages", az: "Mesajlar" },
  
  // Hero Section
  "hero.title1": { en: "Meaningful Connections,", az: "Mənalı Əlaqələr," },
  "hero.title2": { en: "Personal Growth.", az: "Şəxsi İnkişaf." },
  "hero.subtitle": { 
    en: "A modern space for Azerbaijanis to build relationships rooted in understanding, verify values, and practice communication skills.",
    az: "Azərbaycanlılar üçün anlayışa əsaslanan münasibətlər qurmaq, dəyərləri yoxlamaq və ünsiyyət bacarıqlarını məşq etmək üçün müasir məkan."
  },
  "hero.startTraining": { en: "Start Training", az: "Məşqə Başla" },
  "hero.browseProfiles": { en: "Browse Profiles", az: "Profillərə Bax" },
  
  // Features
  "features.title": { en: "Reimagining Relationships", az: "Münasibətləri Yenidən Təsəvvür Etmək" },
  "features.subtitle": { 
    en: "We connect you through values and help you grow the skills to maintain them.",
    az: "Sizi dəyərlər vasitəsilə birləşdirir və onları qorumaq üçün bacarıqlarınızı inkişaf etdirməyə kömək edirik."
  },
  "features.skillBuilding": { en: "Skill Building", az: "Bacarıq Qurmaq" },
  "features.skillBuildingDesc": { 
    en: "Master the art of conversation with our AI-powered social simulators before you meet.",
    az: "Görüşmədən əvvəl süni intellekt əsaslı sosial simulyatorlarımızla söhbət sənətini mənimsəyin."
  },
  "features.ethicalDiscovery": { en: "Ethical Discovery", az: "Etik Kəşf" },
  "features.ethicalDiscoveryDesc": { 
    en: "Match based on deep psychological compatibility and shared core values.",
    az: "Dərin psixoloji uyğunluq və ortaq əsas dəyərlərə əsaslanaraq uyğunlaşın."
  },
  "features.safeSpace": { en: "Safe Space", az: "Təhlükəsiz Məkan" },
  "features.safeSpaceDesc": { 
    en: "A verified community where respect and authenticity are non-negotiable.",
    az: "Hörmət və orijinallığın danışılmaz olduğu təsdiqlənmiş icma."
  },
  
  // Discovery Page
  "discovery.title": { en: "Discovery", az: "Kəşf" },
  "discovery.potentialMatches": { en: "potential matches", az: "potensial uyğunluq" },
  "discovery.searchPlaceholder": { en: "Search by name or bio keyword...", az: "Ad və ya bio açar sözü ilə axtar..." },
  "discovery.allStyles": { en: "All Styles", az: "Bütün Üslublar" },
  "discovery.anyInterest": { en: "Any Interest", az: "İstənilən Maraq" },
  "discovery.activeFilters": { en: "Active Filters:", az: "Aktiv Filtrlər:" },
  "discovery.clearAll": { en: "Clear All", az: "Hamısını Sil" },
  "discovery.noMatches": { en: "No matches found", az: "Uyğunluq tapılmadı" },
  "discovery.noMatchesDesc": { 
    en: "Try adjusting your filters or search terms to find more people.",
    az: "Daha çox insan tapmaq üçün filtrlər və ya axtarış şərtlərini dəyişdirməyə çalışın."
  },
  
  // User Card
  "card.coreValues": { en: "Core Values", az: "Əsas Dəyərlər" },
  "card.loveLanguage": { en: "Love Language", az: "Sevgi Dili" },
  "card.commStyle": { en: "Comm. Style", az: "Ünsiyyət Tərzi" },
  "card.interests": { en: "Interests", az: "Maraqlar" },
  "card.revealIcebreaker": { en: "Reveal Ice-breaker", az: "Söhbət Başlatanı Göstər" },
  "card.hideIcebreaker": { en: "Hide Ice-breaker", az: "Söhbət Başlatanı Gizlə" },
  "card.compatibility": { en: "Compatibility", az: "Uyğunluq" },
  "card.like": { en: "Like", az: "Bəyən" },
  "card.message": { en: "Message", az: "Mesaj" },
  
  // Profile/Onboarding
  "onboarding.welcome": { en: "Welcome to Danyeri", az: "Danyeri-yə Xoş Gəlmisiniz" },
  "onboarding.step1": { en: "Basic Info", az: "Əsas Məlumat" },
  "onboarding.step2": { en: "Your Values", az: "Dəyərləriniz" },
  "onboarding.step3": { en: "Interests & Style", az: "Maraqlar və Üslub" },
  "onboarding.name": { en: "Your Name", az: "Adınız" },
  "onboarding.age": { en: "Your Age", az: "Yaşınız" },
  "onboarding.location": { en: "Location", az: "Məkan" },
  "onboarding.bio": { en: "Tell us about yourself", az: "Özünüz haqqında danışın" },
  "onboarding.selectValues": { en: "Select your core values (up to 3)", az: "Əsas dəyərlərinizi seçin (3-ə qədər)" },
  "onboarding.selectLoveLanguage": { en: "What's your love language?", az: "Sevgi diliniz nədir?" },
  "onboarding.selectInterests": { en: "Select your interests", az: "Maraqlarınızı seçin" },
  "onboarding.selectCommStyle": { en: "How do you communicate?", az: "Necə ünsiyyət qurursunuz?" },
  "onboarding.next": { en: "Next", az: "Növbəti" },
  "onboarding.back": { en: "Back", az: "Geri" },
  "onboarding.complete": { en: "Complete Profile", az: "Profili Tamamla" },
  
  // Messages
  "messages.title": { en: "Messages", az: "Mesajlar" },
  "messages.noMatches": { en: "No matches yet", az: "Hələ uyğunluq yoxdur" },
  "messages.noMatchesDesc": { 
    en: "Start discovering people to find your matches!",
    az: "Uyğunluqlarınızı tapmaq üçün insanları kəşf etməyə başlayın!"
  },
  "messages.startConversation": { en: "Start a conversation", az: "Söhbətə başla" },
  "messages.typeMessage": { en: "Type a message...", az: "Mesaj yazın..." },
  
  // Daily Question
  "daily.title": { en: "Question of the Day", az: "Günün Sualı" },
  "daily.reflect": { en: "Reflect on this...", az: "Bu barədə düşünün..." },
  
  // Badges
  "badges.title": { en: "Your Badges", az: "Nişanlarınız" },
  "badges.earlyAdopter": { en: "Early Adopter", az: "Erkən İstifadəçi" },
  "badges.firstMatch": { en: "First Match", az: "İlk Uyğunluq" },
  "badges.empatheticListener": { en: "Empathetic Listener", az: "Empatik Dinləyici" },
  "badges.conversationStarter": { en: "Conversation Starter", az: "Söhbət Başladan" },
  "badges.weekStreak": { en: "Week Streak", az: "Həftəlik Seriya" },
  
  // Common
  "common.loading": { en: "Loading...", az: "Yüklənir..." },
  "common.save": { en: "Save", az: "Saxla" },
  "common.cancel": { en: "Cancel", az: "Ləğv et" },
  "common.edit": { en: "Edit", az: "Redaktə" },
  "common.delete": { en: "Delete", az: "Sil" },
  "common.settings": { en: "Settings", az: "Parametrlər" },
  "common.darkMode": { en: "Dark Mode", az: "Qaranlıq Rejim" },
  "common.language": { en: "Language", az: "Dil" },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("az");

  useEffect(() => {
    const savedLang = localStorage.getItem("danyeri-language") as Language;
    if (savedLang) {
      setLanguageState(savedLang);
    }
    // If no saved preference, keep default as 'az'
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("danyeri-language", lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
