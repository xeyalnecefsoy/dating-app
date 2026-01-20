import { Award, Heart, MessageCircle, Flame, Star, Users, Zap, Target, Coffee, Sparkles } from "lucide-react";

export type Badge = {
  id: string;
  name: {
    en: string;
    az: string;
  };
  description: {
    en: string;
    az: string;
  };
  icon: string;
  color: string;
  requirement: string;
};

export const badges: Badge[] = [
  {
    id: "early-adopter",
    name: { en: "Early Adopter", az: "Erkən İstifadəçi" },
    description: { 
      en: "Joined Aura Connect in its early days",
      az: "Aura Connect-ə erkən qoşuldu"
    },
    icon: "Star",
    color: "text-amber-500",
    requirement: "signup"
  },
  {
    id: "first-match",
    name: { en: "First Match", az: "İlk Uyğunluq" },
    description: { 
      en: "Made your first connection",
      az: "İlk bağlantını qurdunuz"
    },
    icon: "Heart",
    color: "text-rose-500",
    requirement: "first-match"
  },
  {
    id: "empathetic-listener",
    name: { en: "Empathetic Listener", az: "Empatik Dinləyici" },
    description: { 
      en: "Showed high empathy in 5+ simulator sessions",
      az: "5+ simulyator sessiyasında yüksək empatiya göstərdi"
    },
    icon: "MessageCircle",
    color: "text-indigo-500",
    requirement: "simulator-empathy"
  },
  {
    id: "conversation-starter",
    name: { en: "Conversation Starter", az: "Söhbət Başladan" },
    description: { 
      en: "Used 10+ ice-breakers",
      az: "10+ söhbət başlatandan istifadə etdi"
    },
    icon: "Zap",
    color: "text-yellow-500",
    requirement: "icebreakers"
  },
  {
    id: "week-streak",
    name: { en: "Week Warrior", az: "Həftə Döyüşçüsü" },
    description: { 
      en: "Active for 7 days in a row",
      az: "Ardıcıl 7 gün aktiv"
    },
    icon: "Flame",
    color: "text-orange-500",
    requirement: "streak-7"
  },
  {
    id: "month-streak",
    name: { en: "Monthly Master", az: "Aylıq Usta" },
    description: { 
      en: "Active for 30 days in a row",
      az: "Ardıcıl 30 gün aktiv"
    },
    icon: "Flame",
    color: "text-red-500",
    requirement: "streak-30"
  },
  {
    id: "social-butterfly",
    name: { en: "Social Butterfly", az: "Sosial Kəpənək" },
    description: { 
      en: "Connected with 10+ people",
      az: "10+ insanla əlaqə qurdu"
    },
    icon: "Users",
    color: "text-purple-500",
    requirement: "connections-10"
  },
  {
    id: "profile-pro",
    name: { en: "Profile Pro", az: "Profil Pro" },
    description: { 
      en: "Completed 100% of your profile",
      az: "Profilinizi 100% tamamladınız"
    },
    icon: "Target",
    color: "text-green-500",
    requirement: "complete-profile"
  },
  {
    id: "deep-diver",
    name: { en: "Deep Diver", az: "Dərin Dalğıc" },
    description: { 
      en: "Had a conversation lasting 20+ messages",
      az: "20+ mesajlıq söhbət etdi"
    },
    icon: "Coffee",
    color: "text-cyan-500",
    requirement: "long-conversation"
  },
  {
    id: "value-aligned",
    name: { en: "Value Aligned", az: "Dəyər Uyğunluğu" },
    description: { 
      en: "Found someone with 3 shared values",
      az: "3 ortaq dəyəri olan birini tapdı"
    },
    icon: "Sparkles",
    color: "text-pink-500",
    requirement: "shared-values"
  }
];

export function getBadgeById(id: string): Badge | undefined {
  return badges.find(b => b.id === id);
}

export function getBadgeIcon(iconName: string) {
  const icons: Record<string, typeof Star> = {
    Star,
    Heart,
    MessageCircle,
    Flame,
    Users,
    Zap,
    Target,
    Coffee,
    Sparkles,
    Award
  };
  return icons[iconName] || Star;
}
