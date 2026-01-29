"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Settings, Edit2, Heart, MessageCircle,
  Award, Flame, MapPin, ChevronRight, Camera, Crown, Shield, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { BottomNav } from "@/components/Navigation";
import { getBadgeById, getBadgeIcon } from "@/lib/badges";
import { translateValue, translateLoveLanguage, translateStyle, translateInterest } from "@/lib/mock-users";
import { 
  AVAILABLE_VALUES, 
  AVAILABLE_INTERESTS, 
  LOVE_LANGUAGES, 
  COMM_STYLES 
} from "@/lib/constants";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isOnboarded, isLoading, setUser } = useUser();
  const { language, t } = useLanguage();

  const [isEditingBio, setIsEditingBio] = React.useState(false);
  const [bioText, setBioText] = React.useState("");
  const [isEditingDetails, setIsEditingDetails] = React.useState(false);
  const [isEditingInterests, setIsEditingInterests] = React.useState(false);
  
  const [tempValues, setTempValues] = React.useState<string[]>([]);
  const [tempLoveLanguage, setTempLoveLanguage] = React.useState("");
  const [tempCommStyle, setTempCommStyle] = React.useState<any>("");
  const [tempInterests, setTempInterests] = React.useState<string[]>([]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !isOnboarded) {
      router.push("/onboarding");
    }
  }, [isOnboarded, isLoading, router]);

  React.useEffect(() => {
    if (user) {
      setBioText(user.bio);
      setTempValues(user.values);
      setTempLoveLanguage(user.loveLanguage);
      setTempCommStyle(user.communicationStyle);
      setTempInterests(user.interests);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Flame className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  // Text translations
  const txt = {
    profile: language === 'az' ? 'Profil' : 'Profile',
    likes: language === 'az' ? 'Bəyənmələr' : 'Likes',
    matches: language === 'az' ? 'Uyğunluqlar' : 'Matches',
    dayStreak: language === 'az' ? 'Gün Seriyası' : 'Day Streak',
    about: language === 'az' ? 'Haqqında' : 'About',
    values: language === 'az' ? 'Dəyərlər' : 'Values',
    loveLanguage: language === 'az' ? 'Sevgi Dili' : 'Love Language',
    communication: language === 'az' ? 'Ünsiyyət' : 'Communication',
    interests: language === 'az' ? 'Maraqlar' : 'Interests',
    badges: language === 'az' ? 'Nişanlar' : 'Badges',
    earned: language === 'az' ? 'qazanılıb' : 'earned',
    settings: language === 'az' ? 'Parametrlər' : 'Settings',
    practiceComm: language === 'az' ? 'Ünsiyyəti Məşq Et' : 'Practice Communication',
    startEarning: language === 'az' ? 'Nişan qazanmaq üçün tətbiqi istifadə etməyə başlayın!' : 'Start using the app to earn badges!',
    save: language === 'az' ? 'Yadda Saxla' : 'Save',
  };

  const handleSaveBio = () => {
    if (user && typeof setUser === 'function') {
      setUser({ ...user, bio: bioText });
      setIsEditingBio(false);
    }
  };

  const handleSaveDetails = () => {
    if (user && typeof setUser === 'function') {
      setUser({ 
        ...user, 
        values: tempValues, 
        loveLanguage: tempLoveLanguage, 
        communicationStyle: tempCommStyle 
      });
      setIsEditingDetails(false);
    }
  };

  const handleSaveInterests = () => {
    if (user && typeof setUser === 'function') {
      setUser({ ...user, interests: tempInterests });
      setIsEditingInterests(false);
    }
  };

  const toggleValue = (val: string) => {
    if (tempValues.includes(val)) {
      setTempValues(tempValues.filter(v => v !== val));
    } else if (tempValues.length < 3) {
      setTempValues([...tempValues, val]);
    }
  };

  const toggleInterest = (val: string) => {
    if (tempInterests.includes(val)) {
      setTempInterests(tempInterests.filter(v => v !== val));
    } else if (tempInterests.length < 5) {
      setTempInterests([...tempInterests, val]);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof setUser === 'function') {
            setUser({ ...user, avatar: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
      
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          
          <h1 className="font-bold text-lg">{txt.profile}</h1>
          
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Profile Header */}
        <section className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border">
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button 
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-background cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{user.name}, {user.age}</h2>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{user.location}</span>
            </div>
          </div>
        </section>

        {/* Premium CTA */}
        <Link href="/premium">
          <motion.section
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {language === 'az' ? 'Premium-a keçin' : 'Upgrade to Premium'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {language === 'az' ? 'Limitsiz bəyənmə, Super Like və daha çox' : 'Unlimited likes, Super Likes & more'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </motion.section>
        </Link>

        {/* Verify Profile */}
        <Link href="/verify">
          <motion.section
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mb-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {language === 'az' ? 'Profilinizi təsdiqləyin' : 'Verify your profile'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {language === 'az' ? 'Təsdiqlənmiş profillər 3x daha çox uyğunluq tapır' : 'Verified profiles get 3x more matches'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </motion.section>
        </Link>

        {/* Stats Row */}
        <section className="grid grid-cols-3 bg-card rounded-2xl border border-border p-4 mb-6">
          <Link href="/likes" className="text-center hover:bg-muted/50 rounded-xl transition-colors py-1">
            <div className="text-2xl font-bold text-primary">{user.likes.length}</div>
            <div className="text-xs text-muted-foreground">{txt.likes}</div>
          </Link>
          <Link href="/matches" className="text-center border-x border-border hover:bg-muted/50 transition-colors py-1">
            <div className="text-2xl font-bold text-[#20D5A0]">{user.matches.length}</div>
            <div className="text-xs text-muted-foreground">{txt.matches}</div>
          </Link>
          <div className="text-center py-1">
            <div className="text-2xl font-bold text-[#FFB800] flex items-center justify-center gap-1">
              <Flame className="w-5 h-5" /> {user.streak}
            </div>
            <div className="text-xs text-muted-foreground">{txt.dayStreak}</div>
          </div>
        </section>

        {/* Bio */}
        <section className="bg-card rounded-2xl border border-border p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{txt.about}</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 rounded-full p-0"
              onClick={() => {
                if (isEditingBio) handleSaveBio();
                else setIsEditingBio(true);
              }}
            >
              {isEditingBio ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Edit2 className="w-4 h-4" />}
            </Button>
          </div>
          {isEditingBio ? (
            <textarea
              className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary mb-2 resize-none"
              rows={4}
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              placeholder={language === 'az' ? 'Haqqınızda bir şeylər yazın...' : 'Write something about yourself...'}
            />
          ) : (
            <p className="text-muted-foreground whitespace-pre-wrap">{user.bio || (language === 'az' ? 'Məlumat yoxdur' : 'No bio yet')}</p>
          )}
        </section>

        {/* Values & Love Language */}
        <section className={`bg-card rounded-2xl border border-border p-4 mb-6 transition-all ${isEditingDetails ? 'ring-2 ring-primary/20' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{txt.values}</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 rounded-full p-0"
              onClick={() => {
                if (isEditingDetails) handleSaveDetails();
                else setIsEditingDetails(true);
              }}
            >
              {isEditingDetails ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Edit2 className="w-4 h-4" />}
            </Button>
          </div>

          {isEditingDetails ? (
            <div className="space-y-6">
               <div className="flex flex-wrap gap-2">
                {AVAILABLE_VALUES.map(value => (
                  <button
                    key={value}
                    onClick={() => toggleValue(value)}
                    className={`py-1.5 px-3 rounded-full text-xs font-medium transition-all ${
                      tempValues.includes(value)
                        ? "bg-primary text-white"
                        : "bg-muted border border-border hover:border-primary/50"
                    }`}
                  >
                    {translateValue(value, language as "en" | "az")}
                  </button>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                <span className="text-sm text-muted-foreground mb-3 block">{txt.loveLanguage}</span>
                <div className="grid grid-cols-1 gap-2">
                  {LOVE_LANGUAGES.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => setTempLoveLanguage(lang.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl text-left text-sm transition-all ${
                        tempLoveLanguage === lang.id
                          ? "bg-primary/10 border border-primary"
                          : "bg-muted border border-transparent"
                      }`}
                    >
                      <span>{lang.emoji}</span>
                      <span>{translateLoveLanguage(lang.id, language as "en" | "az")}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <span className="text-sm text-muted-foreground mb-3 block">{txt.communication}</span>
                <div className="grid grid-cols-2 gap-2">
                  {COMM_STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setTempCommStyle(style.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                        tempCommStyle === style.id
                          ? "bg-primary/10 border border-primary"
                          : "bg-muted border border-transparent"
                      }`}
                    >
                      <span className="text-xl">{style.emoji}</span>
                      <span className="text-xs">{translateStyle(style.id, language as "en" | "az")}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {user.values.map(value => (
                  <span 
                    key={value} 
                    className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                  >
                    {translateValue(value, language as "en" | "az")}
                  </span>
                ))}
              </div>
              
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{txt.loveLanguage}</span>
                  <span className="font-medium">{translateLoveLanguage(user.loveLanguage, language as "en" | "az")}</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{txt.communication}</span>
                  <span className="font-medium">{translateStyle(user.communicationStyle, language as "en" | "az")}</span>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Interests */}
        <section className={`bg-card rounded-2xl border border-border p-4 mb-6 transition-all ${isEditingInterests ? 'ring-2 ring-primary/20' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{txt.interests}</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 rounded-full p-0"
              onClick={() => {
                if (isEditingInterests) handleSaveInterests();
                else setIsEditingInterests(true);
              }}
            >
              {isEditingInterests ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Edit2 className="w-4 h-4" />}
            </Button>
          </div>

          {isEditingInterests ? (
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTERESTS.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`py-1.5 px-3 rounded-full text-xs font-medium transition-all ${
                    tempInterests.includes(interest)
                      ? "bg-primary text-white"
                      : "bg-muted border border-border hover:border-primary/50"
                  }`}
                >
                  {translateInterest(interest, language as "en" | "az")}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.interests.map(interest => (
                <span 
                  key={interest} 
                  className="px-3 py-1.5 rounded-full bg-secondary text-sm"
                >
                  {translateInterest(interest, language as "en" | "az")}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Badges */}
        <Link href="/badges" className="block">
          <section className="bg-card rounded-2xl border border-border p-4 mb-6 transition-all hover:bg-muted/50 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{txt.badges}</h3>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">{user.badges.length} {txt.earned}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            
            {user.badges.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {user.badges.map(badgeId => {
                  const badge = getBadgeById(badgeId.toLowerCase().replace(/ /g, "-"));
                  if (!badge) return null;
                  const IconComponent = getBadgeIcon(badge.icon);
                  return (
                    <div 
                      key={badgeId}
                      className="flex flex-col items-center text-center"
                    >
                      <div className={`w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-1 ${badge.color}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {language === 'az' ? badge.name.az : badge.name.en}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {txt.startEarning}
              </p>
            )}
          </section>
        </Link>

        {/* Menu Items */}
        <section className="space-y-2">
          <Link href="/settings">
            <div className="flex items-center justify-between bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{txt.settings}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>
          
          <Link href="/simulator">
            <div className="flex items-center justify-between bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{txt.practiceComm}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
