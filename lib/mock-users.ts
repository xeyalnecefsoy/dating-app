export type UserProfile = {
  id: string;
  name: string;
  age: number;
  birthDay?: string;
  birthMonth?: string;
  birthYear?: string;
  gender: "male" | "female";
  lookingFor: "male" | "female";
  location: string;
  bio: { en: string; az: string };
  values: string[];
  loveLanguage: string;
  interests: string[];
  communicationStyle: "Direct" | "Empathetic" | "Analytical" | "Playful";
  iceBreaker: { en: string; az: string };
  avatar: string;
  gallery?: string[];
  isVerified?: boolean;
  isPremium?: boolean;
};

// Translation maps
export const valueTranslations: Record<string, { en: string; az: string }> = {
  "Growth": { en: "Growth", az: "İnkişaf" },
  "Creativity": { en: "Creativity", az: "Yaradıcılıq" },
  "Authenticity": { en: "Authenticity", az: "Orijinallıq" },
  "Empathy": { en: "Empathy", az: "Empatiya" },
  "Honesty": { en: "Honesty", az: "Dürüstlük" },
  "Family": { en: "Family", az: "Ailə" },
  "Ambition": { en: "Ambition", az: "İddialılıq" },
  "Intelligence": { en: "Intelligence", az: "Zəka" },
  "Adventure": { en: "Adventure", az: "Macəra" },
  "Humor": { en: "Humor", az: "Yumor" },
  "Loyalty": { en: "Loyalty", az: "Sədaqət" },
  "Kindness": { en: "Kindness", az: "Xeyirxahlıq" },
  "Health": { en: "Health", az: "Sağlamlıq" },
  "Independence": { en: "Independence", az: "Müstəqillik" },
};

export const loveLanguageTranslations: Record<string, { en: string; az: string }> = {
  "Quality Time": { en: "Quality Time", az: "Keyfiyyətli Vaxt" },
  "Words of Affirmation": { en: "Words of Affirmation", az: "Tərifləyici Sözlər" },
  "Acts of Service": { en: "Acts of Service", az: "Qayğı və Dəstək" },
  "Receiving Gifts": { en: "Receiving Gifts", az: "Hədiyyə Almaq" },
  "Physical Touch": { en: "Physical Touch", az: "Fiziki Toxunuş" },
};

export const styleTranslations: Record<string, { en: string; az: string }> = {
  "Direct": { en: "Direct", az: "Birbaşa" },
  "Empathetic": { en: "Empathetic", az: "Empatik" },
  "Analytical": { en: "Analytical", az: "Analitik" },
  "Playful": { en: "Playful", az: "Oyunbaz" },
};

export const interestTranslations: Record<string, { en: string; az: string }> = {
  "Photography": { en: "Photography", az: "Fotoqrafiya" },
  "Architecture": { en: "Architecture", az: "Memarlıq" },
  "Coffee": { en: "Coffee", az: "Qəhvə" },
  "Poetry": { en: "Poetry", az: "Şeir" },
  "Hiking": { en: "Hiking", az: "Gəzinti" },
  "Cooking": { en: "Cooking", az: "Yemək Hazırlamaq" },
  "Coding": { en: "Coding", az: "Proqramlaşdırma" },
  "Chess": { en: "Chess", az: "Şahmat" },
  "Reading": { en: "Reading", az: "Oxumaq" },
  "Art": { en: "Art", az: "İncəsənət" },
  "Travel": { en: "Travel", az: "Səyahət" },
  "Movies": { en: "Movies", az: "Filmlər" },
  "History": { en: "History", az: "Tarix" },
  "Tea": { en: "Tea", az: "Çay" },
  "Nature": { en: "Nature", az: "Təbiət" },
  "Fitness": { en: "Fitness", az: "Fitnes" },
  "Volunteering": { en: "Volunteering", az: "Könüllülük" },
  "Sports": { en: "Sports", az: "İdman" },
  "Technology": { en: "Technology", az: "Texnologiya" },
  "Music": { en: "Music", az: "Musiqi" },
  "Fashion": { en: "Fashion", az: "Dəb" },
  "Yoga": { en: "Yoga", az: "Yoqa" },
  "Pets": { en: "Pets", az: "Ev Heyvanları" },
};

export function translateValue(value: string, lang: "en" | "az"): string {
  return valueTranslations[value]?.[lang] || value;
}

export function translateLoveLanguage(ll: string, lang: "en" | "az"): string {
  return loveLanguageTranslations[ll]?.[lang] || ll;
}

export function translateStyle(style: string, lang: "en" | "az"): string {
  return styleTranslations[style]?.[lang] || style;
}

export function translateInterest(interest: string, lang: "en" | "az"): string {
  return interestTranslations[interest]?.[lang] || interest;
}

export function getAvatarByGender(gender: "male" | "female", seed: number = 0): string {
  const maleAvatars = ["/avatars/tural.png", "/avatars/araz.png", "/avatars/cavid.png", "/avatars/orxan.png"];
  const femaleAvatars = ["/avatars/selcan.png", "/avatars/tomris.png", "/avatars/banu.png", "/avatars/lala.png", "/avatars/aylin.png", "/avatars/nigar.png", "/avatars/fidan.png", "/avatars/sevda.png", "/avatars/rena.png", "/avatars/jale.png"];
  const avatars = gender === "male" ? maleAvatars : femaleAvatars;
  return avatars[seed % avatars.length];
}


