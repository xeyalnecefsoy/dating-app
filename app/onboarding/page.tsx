"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, User, Users, Calendar, Search, ChevronDown, Camera, Loader2, AlertCircle, CheckCircle2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser as useClerkUser, useClerk } from "@clerk/nextjs";
import { getAvatarByGender, translateValue, translateInterest, translateLoveLanguage, translateStyle } from "@/lib/mock-users";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { 
  AVAILABLE_VALUES, 
  AVAILABLE_INTERESTS, 
  LOVE_LANGUAGES, 
  COMM_STYLES 
} from "@/lib/constants";
import { AZERBAIJAN_REGIONS } from "@/lib/locations";
import { processProfileImage } from "@/lib/image-utils";

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useUser();
  const { language } = useLanguage();
  const { user: clerkUser } = useClerkUser();
  const { signOut } = useClerk();
  
  const [step, setStep] = useState(1);
  const [searchLocation, setSearchLocation] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getUrlFromStorageId = useMutation(api.files.getUrlFromStorageId);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    gender: "" as "male" | "female" | "",
    location: "",
    bio: "",
    values: [] as string[],
    loveLanguage: "",
    interests: [] as string[],
    communicationStyle: "" as "Direct" | "Empathetic" | "Analytical" | "Playful" | "",
    profilePhoto: null as File | null,
    profilePhotoPreview: "" as string,
  });

  const [photoValidation, setPhotoValidation] = useState<{
    isValidating: boolean;
    isValid: boolean | null;
    message: string;
  }>({ isValidating: false, isValid: null, message: "" });

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  // Persist step and formData to sessionStorage to survive camera reload
  useEffect(() => {
    const savedStep = sessionStorage.getItem('onboarding-step');
    const savedFormData = sessionStorage.getItem('onboarding-formData');
    if (savedStep) {
      setStep(parseInt(savedStep, 10));
    }
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        // Don't restore File object, only preview
        setFormData(prev => ({ ...prev, ...parsed, profilePhoto: null }));
      } catch (e) {
        console.error('Failed to parse saved formData', e);
      }
    }
  }, []);

  // Save step changes
  useEffect(() => {
    sessionStorage.setItem('onboarding-step', String(step));
  }, [step]);

  // Save formData changes (without File object)
  useEffect(() => {
    // Exclude both File object and base64 preview string to avoid QuotaExceededError
    const { profilePhoto, profilePhotoPreview, ...toSave } = formData;
    sessionStorage.setItem('onboarding-formData', JSON.stringify(toSave));
  }, [formData]);

  // Pre-fill form with existing user data (for editing profile)
  const { user: convexUser, isLoading: isUserLoading } = useUser();

  useEffect(() => {
    // Only pre-fill if we have a user and form is relatively empty (to avoid overwriting work in progress if refreshed)
    // We check if formData.firstName is empty as a proxy for "not yet filled"
    if (convexUser && !formData.firstName) {
      const [first, ...last] = (convexUser.name || "").split(" ");
      
      setFormData(prev => ({
        ...prev,
        firstName: first || "",
        lastName: last.join(" ") || "",
        gender: (convexUser.gender as "male" | "female") || "",
        birthDay: convexUser.birthDay || "",
        birthMonth: convexUser.birthMonth || "",
        birthYear: convexUser.birthYear || "",
        location: convexUser.location || "",
        bio: convexUser.bio || "",
        values: convexUser.values || [],
        loveLanguage: convexUser.loveLanguage || "",
        interests: convexUser.interests || [],
        communicationStyle: (convexUser.communicationStyle as any) || "",
        profilePhotoPreview: convexUser.avatar || "",
        // We can't recover exact birth date from age, so we leave it blank for security/accuracy
        // or the user has to re-enter it.
      }));
    } else if (clerkUser && !formData.firstName) {
      // Fallback to Clerk data if no Convex user yet
      if (clerkUser.firstName) {
        setFormData(prev => ({ ...prev, firstName: clerkUser.firstName || "" }));
      }
      if (clerkUser.lastName) {
        setFormData(prev => ({ ...prev, lastName: clerkUser.lastName || "" }));
      }
    }
  }, [convexUser, clerkUser, formData.firstName]);

  const totalSteps = 6;

  // Calculate age from birthdate
  const calculateAge = () => {
    if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) return 0;
    const today = new Date();
    const birthDate = new Date(
      parseInt(formData.birthYear),
      parseInt(formData.birthMonth) - 1,
      parseInt(formData.birthDay)
    );
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const txt = {
    // Headers
    step1Title: language === 'az' ? 'Mən...' : 'I am a...',
    step1Desc: language === 'az' ? 'Cinsinizi seçin' : 'Select your gender',
    step2Title: language === 'az' ? 'Şəxsi məlumatlarınız' : 'Your personal info',
    step2Desc: language === 'az' ? 'Profil təsdiqləmə üçün düzgün məlumat daxil edin' : 'Enter correct info for profile verification',
    step3Title: language === 'az' ? 'Özünüz haqqında danışın' : 'Tell us about yourself',
    step3Desc: language === 'az' ? 'Başqalarına sizi tanımağa kömək edin' : 'Help others get to know you',
    step4Title: language === 'az' ? 'Sizin üçün nə önəmlidir?' : 'What matters to you?',
    step4Desc: language === 'az' ? '5-ə qədər dəyər seçin' : 'Select up to 5 core values',
    step5Title: language === 'az' ? 'Demək olar hazırdır!' : 'Almost done!',
    step5Desc: language === 'az' ? '7-ə qədər maraq dairəsi seçin' : 'Select up to 7 interests',
    
    // Labels & Buttons
    male: language === 'az' ? 'Kişi' : 'Man',
    female: language === 'az' ? 'Qadın' : 'Woman',
    lookingFor: language === 'az' ? 'Axtarılır:' : 'Looking for:',
    women: language === 'az' ? 'Qadınlar' : 'Women',
    men: language === 'az' ? 'Kişilər' : 'Men',
    firstName: language === 'az' ? 'Ad' : 'First name',
    lastName: language === 'az' ? 'Soyad' : 'Last name',
    birthDate: language === 'az' ? 'Doğum tarixi' : 'Date of birth',
    day: language === 'az' ? 'Gün' : 'Day',
    month: language === 'az' ? 'Ay' : 'Month',
    year: language === 'az' ? 'İl' : 'Year',
    mustBe18: language === 'az' ? 'Yaşınız 18 və ya yuxarı olmalıdır' : 'You must be 18 or older',
    infoNote: language === 'az' ? 'Bu məlumatlar profil təsdiqləmə prosesində istifadə olunacaq' : 'This info will be used for profile verification',
    locationLabel: language === 'az' ? 'Harada yaşayırsınız?' : 'Where are you located?',
    searchLocation: language === 'az' ? 'Şəhər və ya rayon axtar...' : 'Search city or region...',
    bioLabel: language === 'az' ? 'Qısa bio' : 'Short bio',
    bioPlaceholder: language === 'az' ? 'Özünüz haqqında maraqlı bir şey paylaşın...' : 'Share something interesting about yourself...',
    loveLanguageHeader: language === 'az' ? 'Sizin sevgi diliniz' : 'Your love language',
    commStyleHeader: language === 'az' ? 'Necə ünsiyyət qurursunuz?' : 'How do you communicate?',
    continue: language === 'az' ? 'Davam et' : 'Continue',
    startMatching: language === 'az' ? 'Tanışlığa Başla' : 'Start Meeting',
  };

  const handleValueToggle = (value: string) => {
    if (formData.values.includes(value)) {
      setFormData({ ...formData, values: formData.values.filter(v => v !== value) });
    } else if (formData.values.length < 5) {
      setFormData({ ...formData, values: [...formData.values, value] });
    }
  };

  const handleInterestToggle = (interest: string) => {
    if (formData.interests.includes(interest)) {
      setFormData({ ...formData, interests: formData.interests.filter(i => i !== interest) });
    } else if (formData.interests.length < 7) {
      setFormData({ ...formData, interests: [...formData.interests, interest] });
    }
  };

  const isValidBirthDate = () => {
    const day = parseInt(formData.birthDay);
    const month = parseInt(formData.birthMonth);
    const year = parseInt(formData.birthYear);
    
    if (!day || !month || !year) return false;
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 1940 || year > new Date().getFullYear() - 18) return false;
    
    return true;
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.gender;
      case 2: return formData.firstName && formData.lastName && isValidBirthDate() && calculateAge() >= 18;
      case 3: return formData.location && formData.bio;
      case 4: return formData.values.length >= 1 && formData.loveLanguage;
      case 5: return formData.interests.length >= 1 && formData.communicationStyle;
      case 6: return formData.profilePhoto && photoValidation.isValid;
      default: return false;
    }
  };

  const handleComplete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const gender = formData.gender as "male" | "female";
      
      let avatarUrl = formData.profilePhotoPreview || clerkUser?.imageUrl || getAvatarByGender(gender, Math.floor(Math.random() * 5));

      // Upload photo if a new file is selected
      if (formData.profilePhoto) {
        try {
          // 1. Get upload URL
          const postUrl = await generateUploadUrl();
          
          // 2. Process and Upload file
          const processedBlob = await processProfileImage(formData.profilePhoto);
          
          const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": "image/jpeg" },
            body: processedBlob,
          });
          
          if (!result.ok) throw new Error("Upload failed");
          
          const { storageId } = await result.json();
          
          // 3. Get proper URL from Convex
          const url = await getUrlFromStorageId({ storageId });
          if (url) {
            avatarUrl = url;
            console.log("Got Avatar URL from Convex:", avatarUrl);
          } else {
             console.error("Failed to get URL from storageId");
          }
        } catch (error) {
          console.error("Failed to upload photo:", error);
          // Fallback to existing logic if upload fails
        }
      }
      
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      await completeOnboarding({
        name: fullName,
        age: calculateAge(),
        birthDay: formData.birthDay,
        birthMonth: formData.birthMonth,
        birthYear: formData.birthYear,
        gender: gender,
        lookingFor: gender === "male" ? "female" : "male",
        location: formData.location,
        bio: formData.bio,
        values: formData.values,
        loveLanguage: formData.loveLanguage,
        interests: formData.interests,
        communicationStyle: formData.communicationStyle as "Direct" | "Empathetic" | "Analytical" | "Playful",
        avatar: avatarUrl,
      });
      
      // Clear onboarding session data
      sessionStorage.removeItem('onboarding-step');
      sessionStorage.removeItem('onboarding-formData');
      
      router.push("/discovery");
    } catch (error) {
      console.error("Onboarding error:", error);
      setIsSubmitting(false);
    }
  };

  // Filter locations based on search
  const filteredLocations = AZERBAIJAN_REGIONS.filter(loc => {
    const normalize = (str: string) => language === 'az' ? str.toLocaleLowerCase('az') : str.toLowerCase();
    return normalize(loc).includes(normalize(searchLocation));
  });

  // Generate arrays for date selectors
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: 1, label: language === 'az' ? 'Yanvar' : 'January' },
    { value: 2, label: language === 'az' ? 'Fevral' : 'February' },
    { value: 3, label: language === 'az' ? 'Mart' : 'March' },
    { value: 4, label: language === 'az' ? 'Aprel' : 'April' },
    { value: 5, label: language === 'az' ? 'May' : 'May' },
    { value: 6, label: language === 'az' ? 'İyun' : 'June' },
    { value: 7, label: language === 'az' ? 'İyul' : 'July' },
    { value: 8, label: language === 'az' ? 'Avqust' : 'August' },
    { value: 9, label: language === 'az' ? 'Sentyabr' : 'September' },
    { value: 10, label: language === 'az' ? 'Oktyabr' : 'October' },
    { value: 11, label: language === 'az' ? 'Noyabr' : 'November' },
    { value: 12, label: language === 'az' ? 'Dekabr' : 'December' },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 82 }, (_, i) => currentYear - 18 - i);

  return (
    <div className="h-screen bg-background flex flex-col items-center overflow-hidden">
      {/* Container for max width */}
      <div className="w-full max-w-lg flex flex-col h-full relative pb-24">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between shrink-0">
        {step > 1 ? (
          <Button variant="ghost" size="icon" onClick={() => setStep(step - 1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout} 
            className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title={language === 'az' ? 'Çıxış' : 'Log out'}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        )}
        
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" className="w-8 h-8 object-contain rounded-full" alt="Danyeri" />
          <span className="font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">Danyeri</span>
        </div>
        
        <div className="w-10 text-right text-sm text-muted-foreground">
          {step}/{totalSteps}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 mb-6 shrink-0">
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Gender Selection */}
          {step === 1 && (
            <StepContainer key="step1">
              <h1 className="text-2xl font-bold mb-2">{txt.step1Title}</h1>
              <p className="text-muted-foreground mb-8">{txt.step1Desc}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormData({ ...formData, gender: "male" })}
                  className={`flex flex-col items-center gap-4 p-6 rounded-2xl transition-all ${
                    formData.gender === "male"
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-card border-2 border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    formData.gender === "male" ? "bg-primary" : "bg-secondary"
                  }`}>
                    <User className={`w-8 h-8 ${formData.gender === "male" ? "text-white" : "text-muted-foreground"}`} />
                  </div>
                  <span className="text-lg font-semibold">{txt.male}</span>
                </button>
                
                <button
                  onClick={() => setFormData({ ...formData, gender: "female" })}
                  className={`flex flex-col items-center gap-4 p-6 rounded-2xl transition-all ${
                    formData.gender === "female"
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-card border-2 border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    formData.gender === "female" ? "bg-primary" : "bg-secondary"
                  }`}>
                    <Users className={`w-8 h-8 ${formData.gender === "female" ? "text-white" : "text-muted-foreground"}`} />
                  </div>
                  <span className="text-lg font-semibold">{txt.female}</span>
                </button>
              </div>

              {formData.gender && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-muted-foreground mt-6"
                >
                  {txt.lookingFor} <span className="text-foreground font-medium">
                    {formData.gender === "male" ? txt.women : txt.men}
                  </span>
                </motion.p>
              )}
            </StepContainer>
          )}

          {/* Step 2: Name & Birth Date */}
          {step === 2 && (
            <StepContainer key="step2">
              <h1 className="text-2xl font-bold mb-2">{txt.step2Title}</h1>
              <p className="text-muted-foreground mb-6">{txt.step2Desc}</p>
              
              <div className="space-y-4">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">{txt.firstName}</label>
                    <Input 
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder={txt.firstName}
                      className="h-12 bg-card border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">{txt.lastName}</label>
                    <Input 
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder={txt.lastName}
                      className="h-12 bg-card border-border"
                    />
                  </div>
                </div>

                {/* Birth Date */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {txt.birthDate}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <SearchableSelect
                      options={days.map(d => ({ value: String(d), label: String(d) }))}
                      value={formData.birthDay}
                      onChange={(val) => setFormData({ ...formData, birthDay: val })}
                      placeholder={txt.day}
                      searchPlaceholder="Gün..."
                      language={language}
                    />
                    
                    <SearchableSelect
                      options={months.map(m => ({ value: String(m.value), label: m.label }))}
                      value={formData.birthMonth}
                      onChange={(val) => setFormData({ ...formData, birthMonth: val })}
                      placeholder={txt.month}
                      searchPlaceholder="Ay..."
                      language={language}
                    />

                    <SearchableSelect
                      options={years.map(y => ({ value: String(y), label: String(y) }))}
                      value={formData.birthYear}
                      onChange={(val) => setFormData({ ...formData, birthYear: val })}
                      placeholder={txt.year}
                      searchPlaceholder="İl..."
                      language={language}
                    />
                  </div>
                </div>

                {/* Age validation message */}
                {isValidBirthDate() && calculateAge() < 18 && (
                  <p className="text-sm text-destructive">{txt.mustBe18}</p>
                )}

                {/* Info note */}
                <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  ℹ️ {txt.infoNote}
                </p>
              </div>
            </StepContainer>
          )}

          {/* Step 3: Location & Bio */}
          {step === 3 && (
            <StepContainer key="step3">
              <h1 className="text-2xl font-bold mb-2">{txt.step3Title}</h1>
              <p className="text-muted-foreground mb-6">{txt.step3Desc}</p>
              
              <div className="space-y-4">
                {/* Location with search */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">{txt.locationLabel}</label>
                  <div className="relative">
                    <div 
                      onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                      className={`h-12 px-4 flex items-center justify-between rounded-xl cursor-pointer transition-all ${
                        formData.location
                          ? "bg-primary text-white"
                          : "bg-card border border-border hover:border-primary/50"
                      }`}
                    >
                      <span>{formData.location || txt.searchLocation}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showLocationDropdown ? "rotate-180" : ""}`} />
                    </div>
                    
                    {showLocationDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 max-h-64 overflow-hidden"
                      >
                        {/* Search input */}
                        <div className="p-2 border-b border-border">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              value={searchLocation}
                              onChange={(e) => setSearchLocation(e.target.value)}
                              placeholder={txt.searchLocation}
                              className="pl-9 h-10 bg-background"
                              autoFocus
                            />
                          </div>
                        </div>
                        
                        {/* Location list */}
                        <div className="max-h-48 overflow-y-auto">
                          {filteredLocations.map(loc => (
                            <button
                              key={loc}
                              onClick={() => {
                                setFormData({ ...formData, location: loc });
                                setShowLocationDropdown(false);
                                setSearchLocation("");
                              }}
                              className={`w-full px-4 py-2.5 text-left hover:bg-muted/50 transition-colors ${
                                formData.location === loc ? "bg-primary/10 text-primary font-medium" : ""
                              }`}
                            >
                              {loc}
                            </button>
                          ))}
                          {filteredLocations.length === 0 && (
                            <p className="px-4 py-3 text-muted-foreground text-sm">
                              {language === 'az' ? 'Nəticə tapılmadı' : 'No results found'}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
                
                {/* Bio */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">{txt.bioLabel}</label>
                  <Textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder={txt.bioPlaceholder}
                    className="min-h-[120px] bg-card border-border resize-none"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">{formData.bio.length}/200</p>
                </div>
              </div>
            </StepContainer>
          )}

          {/* Step 4: Values & Love Language */}
          {step === 4 && (
            <StepContainer key="step4">
              <h1 className="text-2xl font-bold mb-2">{txt.step4Title}</h1>
              <p className="text-muted-foreground mb-4">{txt.step4Desc}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {AVAILABLE_VALUES.map(value => (
                  <button
                    key={value}
                    onClick={() => handleValueToggle(value)}
                    className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                      formData.values.includes(value)
                        ? "bg-primary text-white"
                        : "bg-card border border-border hover:border-primary/50"
                      }`}
                  >
                    {translateValue(value, language as "en" | "az")}
                  </button>
                ))}
              </div>

              <h2 className="text-lg font-semibold mb-3">{txt.loveLanguageHeader}</h2>
              <div className="grid grid-cols-1 gap-2">
                {LOVE_LANGUAGES.map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => setFormData({ ...formData, loveLanguage: lang.id })}
                    className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                      formData.loveLanguage === lang.id
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-card border border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-xl">{lang.emoji}</span>
                    <span className="font-medium text-sm">
                      {translateLoveLanguage(lang.id, language as "en" | "az")}
                    </span>
                  </button>
                ))}
              </div>
            </StepContainer>
          )}

          {/* Step 5: Interests & Communication */}
          {step === 5 && (
            <StepContainer key="step5">
              <h1 className="text-2xl font-bold mb-2">{txt.step5Title}</h1>
              <p className="text-muted-foreground mb-4">{txt.step5Desc}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {AVAILABLE_INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                      formData.interests.includes(interest)
                        ? "bg-primary text-white"
                        : "bg-card border border-border hover:border-primary/50"
                    }`}
                  >
                    {translateInterest(interest, language as "en" | "az")}
                  </button>
                ))}
              </div>

              <h2 className="text-lg font-semibold mb-3">{txt.commStyleHeader}</h2>
              <div className="grid grid-cols-2 gap-3">
                {COMM_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setFormData({ ...formData, communicationStyle: style.id })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                      formData.communicationStyle === style.id
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-card border border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-2xl">{style.emoji}</span>
                    <span className="font-medium text-sm">
                      {translateStyle(style.id, language as "en" | "az")}
                    </span>
                  </button>
                ))}
              </div>
            </StepContainer>
          )}

          {/* Step 6: Profile Photo Upload */}
          {step === 6 && (
            <StepContainer key="step6">
              <h1 className="text-2xl font-bold mb-2">
                {language === 'az' ? 'Profil Şəkliniz' : 'Your Profile Photo'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {language === 'az' 
                  ? 'Üzünüz aydın görünən bir şəkil yükləyin. Bu, digər istifadəçilərə sizi tanımağa kömək edəcək.' 
                  : 'Upload a clear photo showing your face. This helps others recognize you.'}
              </p>
              
              <PhotoUploader 
                onPhotoChange={async (file, preview) => {
                  if (!file) {
                    setFormData(prev => ({ ...prev, profilePhoto: null, profilePhotoPreview: '' }));
                    setPhotoValidation({ isValidating: false, isValid: null, message: '' });
                    return;
                  }
                  
                  setPhotoValidation({ isValidating: true, isValid: null, message: '' });
                  
                  // Dynamic import to avoid SSR issues
                  const { validateProfilePhoto } = await import('@/lib/face-detection');
                  const result = await validateProfilePhoto(file);
                  
                  if (result.isValid) {
                    setFormData(prev => ({ ...prev, profilePhoto: file, profilePhotoPreview: preview }));
                    setPhotoValidation({ isValidating: false, isValid: true, message: language === 'az' ? 'Şəkil qəbul olundu!' : 'Photo accepted!' });
                  } else {
                    setFormData(prev => ({ ...prev, profilePhoto: null, profilePhotoPreview: '' }));
                    setPhotoValidation({ isValidating: false, isValid: false, message: result.errorMessage || '' });
                  }
                }}
                preview={formData.profilePhotoPreview}
                validation={photoValidation}
                language={language}
              />
            </StepContainer>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Button - Sticky */}
      <div className="px-6 py-4 pb-8 shrink-0 bg-gradient-to-t from-background via-background to-transparent sticky bottom-0">
        {step < totalSteps ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            size="lg"
            className="w-full h-12 text-base rounded-xl gradient-brand border-0 font-semibold disabled:opacity-50 shadow-lg"
          >
            {txt.continue}
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={!canProceed()}
            size="lg"
            className="w-full h-12 text-base rounded-xl gradient-brand border-0 font-semibold disabled:opacity-50 shadow-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{language === 'az' ? 'Yüklənir...' : 'Processing...'}</span>
              </div>
            ) : (
              txt.startMatching
            )}
          </Button>
        )}
      </div>

      {/* Click outside to close location dropdown */}
      {showLocationDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowLocationDropdown(false)}
        />
      )}
      </div>
    </div>
  );
}

function StepContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="pb-4"
    >
      {children}
    </motion.div>
  );
}

function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder,
  searchPlaceholder,
  language
}: { 
  options: { value: string, label: string }[], 
  value: string, 
  onChange: (val: string) => void,
  placeholder: string,
  searchPlaceholder?: string,
  language?: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => {
    const normalize = (str: string) => language === 'az' ? str.toLocaleLowerCase('az') : str.toLowerCase();
    return normalize(opt.label).includes(normalize(search));
  });

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <div className="relative" ref={containerRef}>
      <div 
        onClick={() => {
          setIsOpen(!isOpen);
          // if opening, focus search input shortly after
        }}
        className={`h-12 px-3 flex items-center justify-between rounded-lg cursor-pointer transition-all border ${
          value || isOpen
            ? "bg-card border-primary/50 text-foreground"
            : "bg-card border-border text-muted-foreground"
        }`}
      >
        <span className="truncate text-sm">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl z-50 overflow-hidden"
          >
            <div className="p-2 border-b border-border bg-muted/20">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-background border border-border rounded-md pl-7 pr-2 py-1.5 text-xs focus:outline-none focus:border-primary"
                  placeholder={searchPlaceholder || "Search..."}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            
            <div className="max-h-[200px] overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                      value === opt.value 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "hover:bg-muted"
                    }`}
                  >
                    {opt.label}
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                  Nəticə yoxdur
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PhotoUploader({ 
  onPhotoChange, 
  preview, 
  validation,
  language 
}: { 
  onPhotoChange: (file: File | null, preview: string) => void;
  preview: string;
  validation: { isValidating: boolean; isValid: boolean | null; message: string };
  language: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = event.target?.result as string;
      onPhotoChange(file, preview);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onPhotoChange(null, '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Photo Preview / Upload Button */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`w-40 h-40 rounded-full flex items-center justify-center cursor-pointer transition-all border-2 border-dashed overflow-hidden ${
          preview 
            ? 'border-transparent' 
            : 'border-border hover:border-primary/50 bg-card'
        }`}
      >
        {preview ? (
          <img src={preview} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Camera className="w-8 h-8" />
            <span className="text-sm">{language === 'az' ? 'Şəkil Seç' : 'Select Photo'}</span>
          </div>
        )}
      </div>

      {/* Validation Status */}
      {validation.isValidating && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">{language === 'az' ? 'Üz yoxlanılır...' : 'Checking for face...'}</span>
        </div>
      )}

      {validation.isValid === true && (
        <div className="flex items-center gap-2 text-green-500">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm">{validation.message}</span>
        </div>
      )}

      {validation.isValid === false && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{validation.message}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            {language === 'az' ? 'Başqa Şəkil Seç' : 'Choose Another Photo'}
          </Button>
        </div>
      )}

      {/* Remove button */}
      {preview && !validation.isValidating && (
        <Button variant="ghost" size="sm" onClick={handleRemove} className="text-muted-foreground">
          {language === 'az' ? 'Şəkli Sil' : 'Remove Photo'}
        </Button>
      )}

      {/* Info */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        {language === 'az' 
          ? '📸 İpucu: Yaxşı işıqlandırılmış, üzünüz aydın görünən bir şəkil seçin.' 
          : '📸 Tip: Choose a well-lit photo where your face is clearly visible.'}
      </p>
    </div>
  );
}
