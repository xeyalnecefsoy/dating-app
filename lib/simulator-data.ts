export type Scenario = {
  id: string;
  title: { en: string; az: string };
  description: { en: string; az: string };
  initialMessage: { en: string; az: string };
  persona: {
    name: string;
    role: { en: string; az: string };
    avatar?: string;
  };
};

export const scenarios: Scenario[] = [
  {
    id: "cafe-intro",
    title: { en: "Cafe Conversation", az: "Kafedə Söhbət" },
    description: { en: "Start a conversation with someone interesting at a cafe.", az: "Kafedə maraqlı biri ilə söhbətə başlayın." },
    initialMessage: { en: "Hey, is this seat taken? It's so crowded today.", az: "Salam, bu yer boşdur? Bu gün çox adam var." },
    persona: {
      name: "Aylin",
      role: { en: "Stranger", az: "Yabancı" },
      avatar: "/avatars/aysel.png",
    },
  },
  {
    id: "date-disagreement",
    title: { en: "First Date Disagreement", az: "İlk Görüşdə Fikir Ayrılığı" },
    description: { en: "Navigate a difference of opinion on a first date gracefully.", az: "İlk görüşdə fikir ayrılığını nəzakətlə idarə edin." },
    initialMessage: { en: "I actually don't think standard tests measure intelligence well. What do you think?", az: "Mən standart testlərin zəkanı düzgün ölçdüyünü düşünmürəm. Sən nə düşünürsən?" },
    persona: {
      name: "Orxan",
      role: { en: "Date", az: "Görüşdüyün şəxs" },
      avatar: "/avatars/farid.png",
    },
  },
  {
    id: "networking",
    title: { en: "Networking Event", az: "Netvorkinq Tədbiri" },
    description: { en: "Introduce yourself to a potential mentor.", az: "Potensial mentora özünüzü təqdim edin." },
    initialMessage: { en: "Hi there! I saw you speaking earlier, really insightful points on AI ethics.", az: "Salam! Çıxışınızı izlədim, süni intellekt etikası barədə çox maraqlı məqamlara toxundunuz." },
    persona: {
      name: "Leyla",
      role: { en: "Senior Engineer", az: "Baş Mühəndis" },
      avatar: "/avatars/leyla.png",
    },
  },
];

export type AnalysisResult = {
  empathy: number;
  clarity: number;
  confidence: number;
  tone: "Friendly" | "Assertive" | "Shy" | "Neutral" | "Aggressive";
  feedback: { en: string; az: string };
};

export const analyzeMessage = (text: string, lang: "en" | "az"): AnalysisResult => {
  const lowerText = text.toLowerCase();
  
  // Basic mock logic
  let empathy = 50;
  let clarity = 50;
  let confidence = 50;
  let tone: AnalysisResult["tone"] = "Neutral";

  // Empathy detection (basic keywords for both languages)
  if (lowerText.match(/listen|understand|feel|agree|sorry|interesting|başa düşürəm|anlayıram|hiss|maraqlı|təəssüf/)) {
    empathy += 20;
    tone = "Friendly";
  }
  if (lowerText.match(/you|sən|siz/)) empathy += 10;
  
  // Clarity detection
  if (text.length > 20 && text.length < 150) clarity += 20;
  if (lowerText.match(/because|so|example|çünki|ona görə|məsələn/)) clarity += 15;

  // Confidence detection
  if (lowerText.match(/i believe|definitely|sure|can|will|inanıram|əminəm|qəti|bəli/)) {
    confidence += 20;
    tone = "Assertive";
  }
  if (lowerText.match(/maybe|guess|uh|think|bəlkə|yəqin|düşünürəm/)) {
    confidence -= 15;
    tone = "Shy";
  }
  if (lowerText.includes("?")) {
      empathy += 5; 
  }

  // Cap values
  empathy = Math.min(100, Math.max(0, empathy));
  clarity = Math.min(100, Math.max(0, clarity));
  confidence = Math.min(100, Math.max(0, confidence));

  let feedback = { en: "Good start! Try to ask more open-ended questions.", az: "Yaxşı başlanğıcdır! Daha çox açıq suallar verməyə çalışın." };
  
  if (empathy > 70) feedback = { en: "Great job showing empathy!", az: "Empatiya göstərməkdə əla iş!" };
  if (confidence < 40) feedback = { en: "Try to be a bit more direct and confident.", az: "Bir az daha birbaşa və inamlı olmağa çalışın." };
  if (clarity > 80) feedback = { en: "Your message is very clear and easy to understand.", az: "Mesajınız çox aydın və anlaşıqlıdır." };

  return { empathy, clarity, confidence, tone, feedback };
};
