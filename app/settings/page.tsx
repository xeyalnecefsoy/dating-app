"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Moon, Sun, Globe, Bell, Shield, 
  HelpCircle, LogOut, ChevronRight, User, Trash2, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";

type NotificationSettings = {
  pushEnabled: boolean;
  matchAlerts: boolean;
  messageAlerts: boolean;
};

export default function SettingsPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { setUser, user, isOnboarded } = useUser();
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    pushEnabled: true,
    matchAlerts: true,
    messageAlerts: true,
  });
  const [saved, setSaved] = useState(false);

  // Load notification settings from localStorage
  useEffect(() => {
    const savedNotifs = localStorage.getItem("aura-notifications");
    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    }
  }, []);

  // Save notification settings
  const updateNotifications = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...notifications, [key]: value };
    setNotifications(newSettings);
    localStorage.setItem("aura-notifications", JSON.stringify(newSettings));
    showSavedFeedback();
  };

  const showSavedFeedback = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleLogout = () => {
    if (confirm(language === 'az' ? 'Çıxış etmək istədiyinizə əminsiniz?' : 'Are you sure you want to log out?')) {
      localStorage.removeItem("aura-user");
      setUser(null);
      router.push("/");
    }
  };

  const handleDeleteAccount = () => {
    if (confirm(language === 'az' ? 'Hesabınızı silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz.' : 'Are you sure you want to delete your account? This action cannot be undone.')) {
      localStorage.removeItem("aura-user");
      localStorage.removeItem("aura-notifications");
      localStorage.removeItem("aura-theme");
      localStorage.removeItem("aura-language");
      setUser(null);
      router.push("/");
    }
  };

  const texts = {
    settings: language === 'az' ? 'Parametrlər' : 'Settings',
    account: language === 'az' ? 'Hesab' : 'Account',
    editProfile: language === 'az' ? 'Profili Redaktə Et' : 'Edit Profile',
    appearance: language === 'az' ? 'Görünüş' : 'Appearance',
    darkMode: language === 'az' ? 'Qaranlıq Rejim' : 'Dark Mode',
    selectLang: language === 'az' ? 'Dil' : 'Language',
    notifications: language === 'az' ? 'Bildirişlər' : 'Notifications',
    pushNotifs: language === 'az' ? 'Push Bildirişlər' : 'Push Notifications',
    matchAlerts: language === 'az' ? 'Uyğunluq Bildirişləri' : 'Match Alerts',
    messageAlerts: language === 'az' ? 'Mesaj Bildirişləri' : 'Message Alerts',
    support: language === 'az' ? 'Dəstək' : 'Support',
    privacy: language === 'az' ? 'Məxfilik Siyasəti' : 'Privacy Policy',
    help: language === 'az' ? 'Kömək Mərkəzi' : 'Help Center',
    logout: language === 'az' ? 'Çıxış' : 'Log Out',
    deleteAccount: language === 'az' ? 'Hesabı Sil' : 'Delete Account',
    saved: language === 'az' ? 'Saxlanıldı!' : 'Saved!',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={isOnboarded ? "/profile" : "/"}>
            <button className="w-8 h-8 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          </Link>
          <h1 className="font-bold text-lg text-foreground">{texts.settings}</h1>
          
          {/* Saved feedback */}
          {saved && (
            <div className="ml-auto flex items-center gap-1 text-green-500 text-sm">
              <Check className="w-4 h-4" />
              {texts.saved}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Account */}
        {isOnboarded && (
          <section>
            <h2 className="text-sm text-muted-foreground mb-3 px-1">{texts.account}</h2>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <Link href="/onboarding">
                <div className="flex items-center justify-between p-4 active:bg-muted">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground">{texts.editProfile}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Appearance */}
        <section>
          <h2 className="text-sm text-muted-foreground mb-3 px-1">{texts.appearance}</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {theme === "dark" ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                <span className="text-foreground">{texts.darkMode}</span>
              </div>
              <Switch 
                checked={theme === "dark"}
                onCheckedChange={() => {
                  toggleTheme();
                  showSavedFeedback();
                }}
              />
            </div>
            <div className="h-px bg-border mx-4" />
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">{texts.selectLang}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setLanguage("en");
                    showSavedFeedback();
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    language === "en" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => {
                    setLanguage("az");
                    showSavedFeedback();
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    language === "az" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  AZ
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-sm text-muted-foreground mb-3 px-1">{texts.notifications}</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">{texts.pushNotifs}</span>
              </div>
              <Switch 
                checked={notifications.pushEnabled}
                onCheckedChange={(checked) => updateNotifications("pushEnabled", checked)}
              />
            </div>
            <div className="h-px bg-border mx-4" />
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">{texts.matchAlerts}</span>
              </div>
              <Switch 
                checked={notifications.matchAlerts}
                onCheckedChange={(checked) => updateNotifications("matchAlerts", checked)}
              />
            </div>
            <div className="h-px bg-border mx-4" />
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">{texts.messageAlerts}</span>
              </div>
              <Switch 
                checked={notifications.messageAlerts}
                onCheckedChange={(checked) => updateNotifications("messageAlerts", checked)}
              />
            </div>
          </div>
        </section>

        {/* Support */}
        <section>
          <h2 className="text-sm text-muted-foreground mb-3 px-1">{texts.support}</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 active:bg-muted">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">{texts.privacy}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="h-px bg-border mx-4" />
            <button className="w-full flex items-center justify-between p-4 active:bg-muted">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">{texts.help}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        {isOnboarded && (
          <section>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 active:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-primary" />
                  <span className="text-primary font-medium">{texts.logout}</span>
                </div>
              </button>
              <div className="h-px bg-border mx-4" />
              <button 
                onClick={handleDeleteAccount}
                className="w-full flex items-center justify-between p-4 active:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">{texts.deleteAccount}</span>
                </div>
              </button>
            </div>
          </section>
        )}

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          Aura Connect v1.0.0
        </p>
      </main>
    </div>
  );
}
