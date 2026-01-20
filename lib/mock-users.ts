export type UserProfile = {
  id: string;
  name: string;
  age: number;
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

export const MOCK_USERS: UserProfile[] = [
  // ... existing users ...
  {
    id: "1",
    name: "Selcan",
    age: 23,
    gender: "female",
    lookingFor: "male",
    location: "Bakı",
    bio: { 
      en: "Dark aesthetics and loud music. If you can't handle The Cure or Bauhaus, swipe left. 🖤",
      az: "Qaranlıq estetika və səs-küylü musiqi. The Cure və ya Bauhaus dinləmirsinizsə, sola sürüşdürün. 🖤"
    },
    values: ["Authenticity", "Independence", "Creativity"],
    loveLanguage: "Quality Time",
    interests: ["Music", "Art", "Movies"],
    communicationStyle: "Direct",
    iceBreaker: { 
      en: "What's the best concert you've ever been to?",
      az: "Olduğunuz ən yaxşı konsert hansı olub?"
    },
    avatar: "/avatars/selcan.png",
    gallery: ["/gallery/selcan_1.png"],
    isVerified: true,
  },
  {
    id: "2",
    name: "Tural",
    age: 26,
    gender: "male",
    lookingFor: "female",
    location: "Bakı",
    bio: { 
      en: "Gym is therapy. Focused on self-improvement and heavy lifting. Looking for a gym partner or someone who respects the grind. 💪",
      az: "İdman zalı mənim terapiyamdır. Özünü inkişafa fokuslanmışam. İdman partnyoru və ya zəhmətə dəyər verən birini axtarıram. 💪"
    },
    values: ["Health", "Discipline" as any, "Ambition"],
    loveLanguage: "Physical Touch",
    interests: ["Fitness", "Sports", "Nutrition" as any],
    communicationStyle: "Direct",
    iceBreaker: { 
      en: "What's your PR on deadlift?",
      az: "Deadlift-də rekordun neçədir?"
    },
    avatar: "/avatars/tural.png",
    gallery: ["/gallery/tural_1.png"],
    isPremium: true,
  },
  {
    id: "3",
    name: "Tomris",
    age: 25,
    gender: "female",
    lookingFor: "male",
    location: "Quba",
    bio: { 
      en: "Mountains are calling. Always planning the next hike. Nature lover, sunrise chaser. 🏔️⛺",
      az: "Dağlar çağırır. Həmişə növbəti yürüyüşü planlaşdırıram. Təbiət aşiqi, gün doğuşunu izləyən. 🏔️⛺"
    },
    values: ["Adventure", "Health", "Nature" as any],
    loveLanguage: "Quality Time",
    interests: ["Hiking", "Nature", "Photography"],
    communicationStyle: "Empathetic",
    iceBreaker: { 
      en: "What's the most beautiful view you've ever seen?",
      az: "Gördüyünüz ən gözəl mənzərə harada olub?"
    },
    avatar: "/avatars/tomris.png",
    gallery: ["/gallery/tomris_1.png"],
    isVerified: true,
  },
  {
    id: "4",
    name: "Araz",
    age: 28,
    gender: "male",
    lookingFor: "female",
    location: "Bakı",
    bio: { 
      en: "Two wheels, open road. Cafe racer builder and night rider. Not looking for drama, just good vibes. 🏍️",
      az: "İki təkər, açıq yol. Cafe racer yığıram və gecə sürüşlərini sevirəm. Drama axtarmıram, sadəcə yaxşı vaxt keçirmək istəyirəm. 🏍️"
    },
    values: ["Freedom" as any, "Authenticity", "Loyalty"],
    loveLanguage: "Acts of Service",
    interests: ["Motorcycles" as any, "Travel", "Music"],
    communicationStyle: "Direct",
    iceBreaker: { 
      en: "Ever been on a motorcycle trip?",
      az: "Heç motosikletlə səyahətə çıxmısan?"
    },
    avatar: "/avatars/araz.png",
    gallery: ["/gallery/araz_1.png"],
  },
  {
    id: "5",
    name: "Banu",
    age: 24,
    gender: "female",
    lookingFor: "male",
    location: "Bakı",
    bio: { 
      en: "My hands are always covered in paint. Seeing the world in colors. Let's paint the town red (literally). 🎨🖌️",
      az: "Əllərim həmişə boyalıdır. Dünyanı rəngli görürəm. Gəl şəhəri rəngləyək (həqiqi mənada). 🎨🖌️"
    },
    values: ["Creativity", "Expression" as any, "Humor"],
    loveLanguage: "Receiving Gifts",
    interests: ["Art", "Design" as any, "Coffee"],
    communicationStyle: "Playful",
    iceBreaker: { 
      en: "What color represents your mood today?",
      az: "Bu gün əhvalını hansı rəng ifadə edir?"
    },
    avatar: "/avatars/banu.png",
    gallery: ["/gallery/banu_1.png"],
  },
  {
    id: "6",
    name: "Cavid",
    age: 27,
    gender: "male",
    lookingFor: "female",
    location: "Sumqayıt",
    bio: { 
      en: "Metalhead. Guitarist. Introverted until I get on stage. Looking for my metal queen. 🤘🎸",
      az: "Metalhead. Gitaraçı. Səhnəyə çıxana qədər introvertəm. Metal kraliçamı axtarıram. 🤘🎸"
    },
    values: ["Authenticity", "Music" as any, "Loyalty"],
    loveLanguage: "Quality Time",
    interests: ["Music", "Concerts" as any, "Movies"],
    communicationStyle: "Analytical",
    iceBreaker: { 
      en: "Metallica or Megadeth?",
      az: "Metallica yoxsa Megadeth?"
    },
    avatar: "/avatars/cavid.png",
    gallery: ["/gallery/cavid_1.png"],
    isVerified: true,
  },
  {
    id: "7",
    name: "Lalə",
    age: 25,
    gender: "female",
    lookingFor: "male",
    location: "Bakı",
    bio: { 
      en: "High heels, high standards. Fashion enthusiast and foodie. Treat me like a princess and I'll treat you like a king. 💅✨",
      az: "Hündür dabanlar, yüksək standartlar. Dəb həvəskarı və qurman. Mənə şahzadə kimi yanaşsan, sənə kral kimi davranaram. 💅✨"
    },
    values: ["Ambition", "Style" as any, "Loyalty"],
    loveLanguage: "Receiving Gifts",
    interests: ["Fashion", "Travel", "Dining" as any],
    communicationStyle: "Direct",
    iceBreaker: { 
      en: "What's the most stylish place you've been to?",
      az: "Olduğun ən dəbli məkan haradır?"
    },
    avatar: "/avatars/lala.png",
    gallery: ["/gallery/lala_1.png"],
    isPremium: true,
  },
  {
    id: "8",
    name: "Orxan",
    age: 26,
    gender: "male",
    lookingFor: "female",
    location: "Bakı",
    bio: { 
      en: "Analog soul in a digital world. Film photography, vinyl records, and third-wave coffee. 📷☕",
      az: "Rəqəmsal dünyada analoq ruh. Film fotoqrafiyası, vinil vallar və keyfiyyətli qəhvə. 📷☕"
    },
    values: ["Creativity", "Authenticity", "Peace" as any],
    loveLanguage: "Quality Time",
    interests: ["Photography", "Music", "Coffee"],
    communicationStyle: "Empathetic",
    iceBreaker: { 
      en: "What is your favorite obscure band?",
      az: "Ən sevdiyin az tanınan qrup hansıdır?"
    },
    avatar: "/avatars/orxan.png",
  },
  {
    id: "9",
    name: "Aylin",
    age: 24,
    gender: "female",
    lookingFor: "male",
    location: "Bakı",
    bio: { 
      en: "Confidence is my makeup. Love city nights, fine dining, and good conversation. If you can keep up, let's talk. 💋🍸",
      az: "Özgüvən mənim makiyajımdır. Şəhər gecələrini, yüksək səviyyəli şam yeməklərini və yaxşı söhbəti sevirəm. Mənə çata bilsən, gəl danışaq. 💋🍸"
    },
    values: ["Ambition", "Romance" as any, "Freedom" as any],
    loveLanguage: "Physical Touch",
    interests: ["Nightlife" as any, "Fashion", "Music"],
    communicationStyle: "Playful",
    iceBreaker: { 
      en: "What's your signature drink?",
      az: "Sənin imza içkin nədir?"
    },
    avatar: "/avatars/aylin.png",
    gallery: ["/avatars/aylin.png"],
    isPremium: true,
  },
  {
    id: "10",
    name: "Nigar",
    age: 23,
    gender: "female",
    lookingFor: "male",
    location: "Bakı",
    bio: { 
      en: "Summer state of mind. Beach days, sunsets, and cocktails. Life is better in a bikini. ☀️🌊",
      az: "Yay əhval-ruhiyyəsi. Çimərlik günləri, gün batımı və kokteyllər. Həyat bikini ilə daha gözəldir. ☀️🌊"
    },
    values: ["Freedom" as any, "Health", "Adventure"],
    loveLanguage: "Quality Time",
    interests: ["Beach" as any, "Travel", "Swimming" as any],
    communicationStyle: "Playful",
    iceBreaker: { 
      en: "Pool party or beach bonfire?",
      az: "Hovuz partisi yoxsa sahildə tonqal?"
    },
    avatar: "/avatars/nigar.png",
    gallery: ["/avatars/nigar.png"],
  },
  {
    id: "11",
    name: "Fidan",
    age: 25,
    gender: "female",
    lookingFor: "male",
    location: "Bakı",
    bio: { 
      en: "Passionate soul wrapped in mystery. Looking for intense connections and deep desires. Can you handle the heat? 🔥",
      az: "Sirli bir dünyaya bürünmüş ehtiraslı ruh. Güclü bağlar və dərin arzular axtarıram. Atəşə dözə bilərsən? 🔥"
    },
    values: ["Passion" as any, "Romance" as any, "Authenticity"],
    loveLanguage: "Physical Touch",
    interests: ["Romance" as any, "Wine" as any, "Music"],
    communicationStyle: "Empathetic",
    iceBreaker: { 
      en: "What's the most romantic thing you've ever done?",
      az: "Etdiyin ən romantik şey nə olub?"
    },
    avatar: "/avatars/fidan.png",
    gallery: ["/avatars/fidan.png"],
    isVerified: true,
  },
  {
    id: "12",
    name: "Sevda",
    age: 26,
    gender: "female",
    lookingFor: "male",
    location: "Bakı",
    bio: { 
      en: "Curves in all the right places. Embracing my femininity and power. Looking for a gentleman who appreciates a real woman. 💃🏻",
      az: "Bütün doğru yerlərdə əyrilər. Qadınlığımı və gücümü sevirəm. Əsl qadına dəyər verən bir centlmen axtarıram. 💃🏻"
    },
    values: ["Confidence" as any, "Romance" as any, "Style" as any],
    loveLanguage: "Receiving Gifts",
    interests: ["Fine Dining" as any, "Fashion", "Dancing" as any],
    communicationStyle: "Direct",
    iceBreaker: { 
      en: "What's the first thing you noticed about me?",
      az: "Məndə ilk diqqətini çəkən nə oldu?"
    },
    avatar: "/avatars/sevda.png",
    gallery: ["/avatars/sevda.png"],
    isPremium: true,
  },
  {
    id: "13",
    name: "Rəna",
    age: 24,
    gender: "female",
    lookingFor: "male",
    location: "Bakı",
    bio: { 
      en: "Sweat is just fat crying. Fitness addict with a body built by hard work. Catch me at the gym or showing off my gains. 💪🍑",
      az: "Tər sadəcə yağların ağlamasıdır. Zəhmətlə qurulmuş bədənə sahib fitness düşkünü. Məni zalda və ya nəticələrimi göstərərkən tapa bilərsən. 💪🍑"
    },
    values: ["Health", "Discipline" as any, "Ambition"],
    loveLanguage: "Physical Touch",
    interests: ["Fitness", "Nutrition" as any, "Sports"],
    communicationStyle: "Direct",
    iceBreaker: { 
      en: "Do you even lift, bro?",
      az: "Sən heç 'lift' edirsən, bro?"
    },
    avatar: "/avatars/rena.png",
    gallery: ["/gallery/rena_1.jpg", "/gallery/rena_2.jpg", "/gallery/rena_3.jpg", "/gallery/rena_4.jpg", "/gallery/rena_5.jpg"],
  },
  {
    id: "14",
    name: "Jalə",
    age: 25,
    gender: "female",
    lookingFor: "male",
    location: "Bakı",
    bio: { 
      en: "The night is young and so are we. Dressed to kill, ready to thrill. Let's make tonight unforgettable. 🌙✨",
      az: "Gecə gəncdir, elə biz də. Yıxıb-sürüyən geyimdə, həyəcana hazıram. Gəl bu gecəni unudulmaz edək. 🌙✨"
    },
    values: ["Passion" as any, "Adventure", "Freedom" as any],
    loveLanguage: "Quality Time",
    interests: ["Nightlife" as any, "Music", "Wine" as any],
    communicationStyle: "Playful",
    iceBreaker: { 
      en: "What's your wildest adventure?",
      az: "Ən çılğın macəran nə olub?"
    },
    avatar: "/avatars/jale.png",
    gallery: ["/avatars/jale.png"],
    isVerified: true,
  },
];
