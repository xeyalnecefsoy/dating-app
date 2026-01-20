"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Flame, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAvatarByGender, translateValue, translateInterest, translateLoveLanguage, translateStyle } from "@/lib/mock-users";

const AVAILABLE_VALUES = [
  "Growth", "Creativity", "Authenticity", "Empathy", "Honesty", 
  "Family", "Adventure", "Ambition", "Kindness", "Intelligence",
  "Humor", "Loyalty", "Independence", "Health"
];

const AVAILABLE_INTERESTS = [
  "Travel", "Music", "Fitness", "Reading", "Cooking",
  "Photography", "Movies", "Art", "Sports",
  "Nature", "Technology", "Fashion", "Yoga",
  "Coffee", "Hiking", "Pets"
];

const LOVE_LANGUAGES = [
  { id: "Words of Affirmation", emoji: "💬" },
  { id: "Quality Time", emoji: "⏰" },
  { id: "Acts of Service", emoji: "🤝" },
  { id: "Physical Touch", emoji: "🤗" },
  { id: "Receiving Gifts", emoji: "🎁" }
];

const COMM_STYLES: Array<{ id: "Direct" | "Empathetic" | "Analytical" | "Playful"; emoji: string }> = [
  { id: "Direct", emoji: "🎯" },
  { id: "Empathetic", emoji: "💝" },
  { id: "Analytical", emoji: "🧠" },
  { id: "Playful", emoji: "😄" }
];

const LOCATIONS_EN = ["Baku", "Ganja", "Sumqayit", "Sheki", "Lankaran", "Mingachevir", "Other"];
const LOCATIONS_AZ = ["Bakı", "Gəncə", "Sumqayıt", "Şəki", "Lənkəran", "Mingəçevir", "Digər"];

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useUser();
  const { language } = useLanguage();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "" as "male" | "female" | "",
    location: "",
    bio: "",
    values: [] as string[],
    loveLanguage: "",
    interests: [] as string[],
    communicationStyle: "" as "Direct" | "Empathetic" | "Analytical" | "Playful" | "",
  });

  const totalSteps = 5;

  const txt = {
    // Headers
    step1Title: language === 'az' ? 'Mən...' : 'I am a...',
    step1Desc: language === 'az' ? 'Cinsinizi seçin' : 'Select your gender',
    step2Title: language === 'az' ? 'Adınız nədir?' : "What's your name?",
    step2Desc: language === 'az' ? 'Başqaları sizi belə görəcək' : "This is how you'll appear to others",
    step3Title: language === 'az' ? 'Özünüz haqqında danışın' : 'Tell us about yourself',
    step3Desc: language === 'az' ? 'Başqalarına sizi tanımağa kömək edin' : 'Help others get to know you',
    step4Title: language === 'az' ? 'Sizin üçün nə önəmlidir?' : 'What matters to you?',
    step4Desc: language === 'az' ? 'Ən az 3 əsas dəyər seçin' : 'Select up to 3 core values',
    step5Title: language === 'az' ? 'Demək olar hazırdır!' : 'Almost done!',
    step5Desc: language === 'az' ? 'Ən az 5 maraq dairəsi seçin' : 'Select up to 5 interests',
    
    // Labels & Buttons
    male: language === 'az' ? 'Kişi' : 'Man',
    female: language === 'az' ? 'Qadın' : 'Woman',
    lookingFor: language === 'az' ? 'Axtarılır:' : 'Looking for:',
    women: language === 'az' ? 'Qadınlar' : 'Women',
    men: language === 'az' ? 'Kişilər' : 'Men',
    placeholderName: language === 'az' ? 'Adınız' : 'Your first name',
    placeholderAge: language === 'az' ? 'Yaşınız' : 'Your age',
    mustBe18: language === 'az' ? 'Yaşınız 18 və ya yuxarı olmalıdır' : 'You must be 18 or older',
    locationLabel: language === 'az' ? 'Harada yaşayırsınız?' : 'Where are you located?',
    bioLabel: language === 'az' ? 'Qısa bio' : 'Short bio',
    bioPlaceholder: language === 'az' ? 'Özünüz haqqında maraqlı bir şey paylaşın...' : 'Share something interesting about yourself...',
    loveLanguageHeader: language === 'az' ? 'Sizin sevgi diliniz' : 'Your love language',
    commStyleHeader: language === 'az' ? 'Necə ünsiyyət qurursunuz?' : 'How do you communicate?',
    continue: language === 'az' ? 'Davam et' : 'Continue',
    startMatching: language === 'az' ? 'Eşləşməyə Başla' : 'Start Matching',
  };

  const handleValueToggle = (value: string) => {
    if (formData.values.includes(value)) {
      setFormData({ ...formData, values: formData.values.filter(v => v !== value) });
    } else if (formData.values.length < 3) {
      setFormData({ ...formData, values: [...formData.values, value] });
    }
  };

  const handleInterestToggle = (interest: string) => {
    if (formData.interests.includes(interest)) {
      setFormData({ ...formData, interests: formData.interests.filter(i => i !== interest) });
    } else if (formData.interests.length < 5) {
      setFormData({ ...formData, interests: [...formData.interests, interest] });
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.gender;
      case 2: return formData.name && formData.age && parseInt(formData.age) >= 18;
      case 3: return formData.location && formData.bio;
      case 4: return formData.values.length >= 1 && formData.loveLanguage;
      case 5: return formData.interests.length >= 1 && formData.communicationStyle;
      default: return false;
    }
  };

  const handleComplete = () => {
    const gender = formData.gender as "male" | "female";
    completeOnboarding({
      name: formData.name,
      age: parseInt(formData.age),
      gender: gender,
      lookingFor: gender === "male" ? "female" : "male", // Opposite gender
      location: formData.location,
      bio: formData.bio,
      values: formData.values,
      loveLanguage: formData.loveLanguage,
      interests: formData.interests,
      communicationStyle: formData.communicationStyle as "Direct" | "Empathetic" | "Analytical" | "Playful",
      avatar: getAvatarByGender(gender, Math.floor(Math.random() * 5)),
    });
    router.push("/discovery");
  };

  const LOCATIONS = language === 'az' ? LOCATIONS_AZ : LOCATIONS_EN;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between">
        {step > 1 ? (
          <Button variant="ghost" size="icon" onClick={() => setStep(step - 1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        ) : (
          <div className="w-10" />
        )}
        
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          <span className="font-bold">Aura</span>
        </div>
        
        <div className="w-10 text-right text-sm text-muted-foreground">
          {step}/{totalSteps}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 mb-8">
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
      <main className="flex-1 px-6 pb-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Gender Selection */}
          {step === 1 && (
            <StepContainer key="step1">
              <h1 className="text-2xl font-bold mb-2">{txt.step1Title}</h1>
              <p className="text-muted-foreground mb-8">{txt.step1Desc}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormData({ ...formData, gender: "male" })}
                  className={`flex flex-col items-center gap-4 p-8 rounded-2xl transition-all ${
                    formData.gender === "male"
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-card border-2 border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    formData.gender === "male" ? "bg-primary" : "bg-secondary"
                  }`}>
                    <User className={`w-10 h-10 ${formData.gender === "male" ? "text-white" : "text-muted-foreground"}`} />
                  </div>
                  <span className="text-lg font-semibold">{txt.male}</span>
                </button>
                
                <button
                  onClick={() => setFormData({ ...formData, gender: "female" })}
                  className={`flex flex-col items-center gap-4 p-8 rounded-2xl transition-all ${
                    formData.gender === "female"
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-card border-2 border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    formData.gender === "female" ? "bg-primary" : "bg-secondary"
                  }`}>
                    <Users className={`w-10 h-10 ${formData.gender === "female" ? "text-white" : "text-muted-foreground"}`} />
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

          {/* Step 2: Name & Age */}
          {step === 2 && (
            <StepContainer key="step2">
              <h1 className="text-2xl font-bold mb-2">{txt.step2Title}</h1>
              <p className="text-muted-foreground mb-8">{txt.step2Desc}</p>
              
              <div className="space-y-4">
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={txt.placeholderName}
                  className="h-14 text-lg bg-card border-border"
                />
                <Input 
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder={txt.placeholderAge}
                  min={18}
                  max={100}
                  className="h-14 text-lg bg-card border-border"
                />
                {formData.age && parseInt(formData.age) < 18 && (
                  <p className="text-sm text-primary">{txt.mustBe18}</p>
                )}
              </div>
            </StepContainer>
          )}

          {/* Step 3: Location & Bio */}
          {step === 3 && (
            <StepContainer key="step3">
              <h1 className="text-2xl font-bold mb-2">{txt.step3Title}</h1>
              <p className="text-muted-foreground mb-8">{txt.step3Desc}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">{txt.locationLabel}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {LOCATIONS.map(loc => (
                      <button
                        key={loc}
                        onClick={() => setFormData({ ...formData, location: loc })}
                        className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                          formData.location === loc
                            ? "bg-primary text-white"
                            : "bg-card border border-border hover:border-primary/50"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">{txt.bioLabel}</label>
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
              <p className="text-muted-foreground mb-6">{txt.step4Desc}</p>
              
              <div className="flex flex-wrap gap-2 mb-8">
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
                    className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                      formData.loveLanguage === lang.id
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-card border border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-2xl">{lang.emoji}</span>
                    <span className="font-medium">
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
              <p className="text-muted-foreground mb-6">{txt.step5Desc}</p>
              
              <div className="flex flex-wrap gap-2 mb-8">
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
                    <span className="text-3xl">{style.emoji}</span>
                    <span className="font-medium text-sm">
                      {translateStyle(style.id, language as "en" | "az")}
                    </span>
                  </button>
                ))}
              </div>
            </StepContainer>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Button */}
      <div className="px-6 pb-8 safe-bottom">
        {step < totalSteps ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            size="lg"
            className="w-full h-14 text-lg rounded-full gradient-brand border-0 font-semibold disabled:opacity-50"
          >
            {txt.continue}
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={!canProceed()}
            size="lg"
            className="w-full h-14 text-lg rounded-full gradient-brand border-0 font-semibold disabled:opacity-50"
          >
            {txt.startMatching}
          </Button>
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
    >
      {children}
    </motion.div>
  );
}
