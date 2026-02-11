"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Settings, Edit2, Heart, MessageCircle,
  Award, Flame, MapPin, ChevronRight, Camera, Crown, Shield, CheckCircle2, Loader2, X, Sparkles
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
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { processProfileImage } from "@/lib/image-utils";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isOnboarded, isLoading, setUser } = useUser();
  const { language, t } = useLanguage();

  const [isEditingBio, setIsEditingBio] = React.useState(false);
  const [bioText, setBioText] = React.useState("");
  const [isEditingDetails, setIsEditingDetails] = React.useState(false);
  const [isEditingInterests, setIsEditingInterests] = React.useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadToast, setUploadToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [tempValues, setTempValues] = React.useState<string[]>([]);
  const [tempLoveLanguage, setTempLoveLanguage] = React.useState("");
  const [tempCommStyle, setTempCommStyle] = React.useState<any>("");
  const [tempInterests, setTempInterests] = React.useState<string[]>([]);
  
  // Header Edit State
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempLocation, setTempLocation] = useState("");

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Track latest user value to avoid stale closure in async operations
  const userRef = React.useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);
  
  // Convex mutation for file upload
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getUrlFromStorageId = useMutation(api.files.getUrlFromStorageId);
  const updateUserMutation = useMutation(api.users.createOrUpdateUser);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (uploadToast) {
      const timer = setTimeout(() => setUploadToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadToast]);

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
      setTempLoveLanguage(user.loveLanguage);
      setTempCommStyle(user.communicationStyle);
      setTempInterests(user.interests);
      setTempName(user.name);
      setTempLocation(user.location);
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

  const handleSaveHeader = async () => {
     if (user && user.clerkId) {
        // Optimistic update
        if (typeof setUser === 'function') {
           setUser({ ...user, name: tempName, location: tempLocation });
        }
        setIsEditingHeader(false);
        
        try {
           await updateUserMutation({
             clerkId: user.clerkId,
             name: tempName,
             location: tempLocation,
             // ... preserve other fields ...
             gender: user.gender,
             age: user.age,
             birthDay: user.birthDay,
             birthMonth: user.birthMonth,
             birthYear: user.birthYear,
             bio: user.bio,
             values: user.values,
             loveLanguage: user.loveLanguage,
             interests: user.interests,
             communicationStyle: user.communicationStyle,
             lookingFor: user.lookingFor,
             avatar: user.avatar,
           });
           setUploadToast({ message: language === 'az' ? 'Məlumat yeniləndi!' : 'Info updated!', type: 'success' });
        } catch (error) {
           console.error("Failed to update header", error);
           setUploadToast({ message: language === 'az' ? 'Xəta baş verdi' : 'Error updating info', type: 'error' });
        }
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
    if (!isUploadingPhoto) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingPhoto(true);
    
    // IMMEDIATELY show preview for instant feedback
    const previewUrl = URL.createObjectURL(file);
    if (typeof setUser === 'function') {
      setUser({ ...user, avatar: previewUrl });
    }
    
    try {
      console.log('Starting photo upload...');
      
      // 0. Process the image (resize/compress)
      // We convert it to Blob, then upload
      const processedBlob = await processProfileImage(file);
      
      // 1. Get upload URL from Convex
      const postUrl = await generateUploadUrl();
      console.log('Got upload URL:', postUrl);
      
      // 2. Upload file to Convex storage
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: processedBlob,
      });
      
      if (!result.ok) {
        const errorText = await result.text();
        throw new Error(`Upload failed: ${result.status} - ${errorText}`);
      }
      
      const { storageId } = await result.json();
      console.log('Upload successful, storageId:', storageId);
      
      // 3. Get the proper Convex storage URL using the built-in method
      const avatarUrl = await getUrlFromStorageId({ storageId });
      console.log('Avatar URL from Convex:', avatarUrl);
      
      if (!avatarUrl) {
        throw new Error("Failed to get storage URL");
      }
      
      // 4. Revoke the temporary preview URL and update with permanent URL
      // Use userRef.current to get latest user state (avoid stale closure)
      URL.revokeObjectURL(previewUrl);
      const latestUser = userRef.current;
      if (typeof setUser === 'function' && latestUser) {
        setUser({ ...latestUser, avatar: avatarUrl });
      }
      
      // 5. Also update in Convex DB for persistence
      // Use latestUser to ensure we have the most recent data
      if (latestUser?.clerkId) {
        await updateUserMutation({
          clerkId: latestUser.clerkId,
          name: latestUser.name,
          avatar: avatarUrl,
          gender: latestUser.gender,
          age: latestUser.age,
          location: latestUser.location,
          bio: latestUser.bio,
          values: latestUser.values,
          loveLanguage: latestUser.loveLanguage,
          interests: latestUser.interests,
          communicationStyle: latestUser.communicationStyle,
          lookingFor: latestUser.lookingFor,
        });
        console.log('User updated in Convex DB');
      }
      
      setUploadToast({ 
        message: language === 'az' ? 'Şəkil uğurla yükləndi!' : 'Photo uploaded successfully!', 
        type: 'success' 
      });
      
      console.log("Photo uploaded successfully:", avatarUrl);
    } catch (error) {
      console.error("Failed to upload photo:", error);
      
      setUploadToast({ 
        message: language === 'az' ? 'Şəkil yüklənərkən xəta baş verdi' : 'Failed to upload photo', 
        type: 'error' 
      });
      
      // Keep the preview but show error
      // User can try again
    } finally {
      setIsUploadingPhoto(false);
      // Clear file input so same file can be selected again
      if (e.target) {
        e.target.value = '';
      }
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
      
      {/* Toast Notification */}
      <AnimatePresence>
        {uploadToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 ${
              uploadToast.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}
          >
            {uploadToast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span className="font-medium">{uploadToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
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
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border ring-4 ring-primary/5 shadow-2xl bg-card">
              <img 
                src={user.avatar || '/placeholder-avatar.svg'}
                alt={user.name}
                className="w-full h-full object-cover bg-muted"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-avatar.svg';
                }}
              />
            </div>
            <button 
              onClick={handleAvatarClick}
              disabled={isUploadingPhoto}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-background cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isUploadingPhoto ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
          
          <div className="flex-1 min-w-0">
             <div className="flex justify-between items-start">
                {isEditingHeader ? (
                   <div className="w-full space-y-2 mb-2">
                      <input 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="w-full text-xl font-bold bg-muted/50 border border-border rounded px-2 py-1"
                        placeholder={language === 'az' ? "Adınız" : "Your Name"}
                      />
                      <input 
                        value={tempLocation}
                        onChange={(e) => setTempLocation(e.target.value)}
                        className="w-full text-sm bg-muted/50 border border-border rounded px-2 py-1"
                        placeholder={language === 'az' ? "Məkan" : "Location"}
                      />
                   </div>
                ) : (
                   <div>
                     <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                      {user.name}, {user.age}
                      {(user.role === 'superadmin' || user.role === 'admin' || (user as any).email === 'xeyalnecefsoy@gmail.com') && (
                        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 text-white rounded-full px-2 py-0.5 flex items-center gap-1 shadow-md ring-2 ring-blue-400/30">
                          <Sparkles className="w-3.5 h-3.5 fill-current" />
                          <span className="text-[10px] uppercase font-bold tracking-wide">Qurucu</span>
                        </div>
                      )}
                    </h2>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                   </div>
                )}
                
                <Button 
                   variant="ghost" 
                   size="sm" 
                   className="h-8 w-8 rounded-full p-0 shrink-0 ml-2"
                   onClick={() => {
                     if (isEditingHeader) handleSaveHeader();
                     else setIsEditingHeader(true);
                   }}
                 >
                   {isEditingHeader ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Edit2 className="w-4 h-4" />}
                 </Button>
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

        {/* Gallery / Qalereya */}
        <section className="bg-card rounded-2xl border border-border p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{language === 'az' ? 'Qalereya' : 'Gallery'}</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 text-xs"
            >
              <Camera className="w-4 h-4 mr-1" />
              {language === 'az' ? 'Şəkil əlavə et' : 'Add photo'}
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {user.avatar ? (
              <div className="aspect-square rounded-lg overflow-hidden border border-border">
                <img
                  src={user.avatar || '/placeholder-avatar.svg'}
                  alt="Gallery photo" 
                  className="w-full h-48 object-cover bg-muted"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-avatar.svg';
                  }}
                />
              </div>
            ) : null}
            {/* Placeholder for more photos */}
            <div className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="text-center">
                <Camera className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">{language === 'az' ? 'Əlavə et' : 'Add'}</p>
              </div>
            </div>
          </div>
          {!user.avatar && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              {language === 'az' ? 'Hələlik şəkil yoxdur' : 'No photos yet'}
            </p>
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
