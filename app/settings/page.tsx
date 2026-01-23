"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Moon, Sun, Globe, Bell, Shield, 
  HelpCircle, LogOut, ChevronRight, User, Trash2, Check, AlertTriangle, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { useClerk, useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";

type NotificationSettings = {
  pushEnabled: boolean;
  matchAlerts: boolean;
  messageAlerts: boolean;
};

export default function SettingsPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { logout: logoutUser, user, isOnboarded } = useUser();
  const { signOut } = useClerk();
  const { isSignedIn } = useAuth();
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    pushEnabled: true,
    matchAlerts: true,
    messageAlerts: true,
  });
  const [saved, setSaved] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load notification settings from localStorage
  useEffect(() => {
    const savedNotifs = localStorage.getItem("danyeri-notifications");
    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    }
  }, []);

  // Save notification settings
  const updateNotifications = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...notifications, [key]: value };
    setNotifications(newSettings);
    localStorage.setItem("danyeri-notifications", JSON.stringify(newSettings));
    showSavedFeedback();
  };

  const showSavedFeedback = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleLogout = async () => {
    // Clear local user data
    logoutUser();
    
    // Sign out from Clerk if signed in
    if (isSignedIn) {
      await signOut();
    }
    
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    // Clear all local storage data
    localStorage.removeItem("danyeri-notifications");
    localStorage.removeItem("danyeri-theme");
    localStorage.removeItem("danyeri-language");
    
    // Get all keys that start with danyeri-user
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith("danyeri-user")) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear user from context
    logoutUser();
    
    // Sign out from Clerk
    if (isSignedIn) {
      await signOut();
    }
    
    router.push("/");
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
    // Modal texts
    logoutTitle: language === 'az' ? 'Çıxış etmək istəyirsiniz?' : 'Log out?',
    logoutDesc: language === 'az' ? 'Hesabınızdan çıxış edəcəksiniz.' : 'You will be logged out of your account.',
    deleteTitle: language === 'az' ? 'Hesabı silmək istəyirsiniz?' : 'Delete account?',
    deleteDesc: language === 'az' ? 'Bu əməliyyat geri alına bilməz. Bütün məlumatlarınız silinəcək.' : 'This action cannot be undone. All your data will be deleted.',
    cancel: language === 'az' ? 'Ləğv et' : 'Cancel',
    confirm: language === 'az' ? 'Təsdiqlə' : 'Confirm',
    delete: language === 'az' ? 'Sil' : 'Delete',
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
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center justify-between p-4 active:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-primary" />
                  <span className="text-primary font-medium">{texts.logout}</span>
                </div>
              </button>
              <div className="h-px bg-border mx-4" />
              <button 
                onClick={() => setShowDeleteModal(true)}
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
          Danyeri v1.0.0
        </p>
      </main>

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <LogOut className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{texts.logoutTitle}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{texts.logoutDesc}</p>
                </div>
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="p-1 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowLogoutModal(false)}
                >
                  {texts.cancel}
                </Button>
                <Button
                  className="flex-1 gradient-brand"
                  onClick={() => {
                    setShowLogoutModal(false);
                    handleLogout();
                  }}
                >
                  {texts.confirm}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{texts.deleteTitle}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{texts.deleteDesc}</p>
                </div>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="p-1 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteModal(false)}
                >
                  {texts.cancel}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteModal(false);
                    handleDeleteAccount();
                  }}
                >
                  {texts.delete}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
