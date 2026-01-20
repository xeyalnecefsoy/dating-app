import { UserProfile } from "@/lib/mock-users";

export type CompatibilityResult = {
  score: number;
  breakdown: {
    values: number;
    interests: number;
    loveLanguage: number;
    communicationStyle: number;
  };
  highlights: string[];
};

export function calculateCompatibility(
  currentUser: { values: string[]; interests: string[]; loveLanguage: string; communicationStyle: string },
  otherUser: UserProfile
): CompatibilityResult {
  const breakdown = {
    values: 0,
    interests: 0,
    loveLanguage: 0,
    communicationStyle: 0,
  };
  const highlights: string[] = [];

  // Values compatibility (40% weight)
  const sharedValues = currentUser.values.filter(v => otherUser.values.includes(v));
  breakdown.values = Math.round((sharedValues.length / Math.max(currentUser.values.length, 1)) * 100);
  if (sharedValues.length > 0) {
    highlights.push(`Shared values: ${sharedValues.join(", ")}`);
  }

  // Interests compatibility (25% weight)
  const sharedInterests = currentUser.interests.filter(i => otherUser.interests.includes(i));
  breakdown.interests = Math.round((sharedInterests.length / Math.max(currentUser.interests.length, 1)) * 100);
  if (sharedInterests.length > 0) {
    highlights.push(`Common interests: ${sharedInterests.join(", ")}`);
  }

  // Love Language compatibility (20% weight)
  if (currentUser.loveLanguage === otherUser.loveLanguage) {
    breakdown.loveLanguage = 100;
    highlights.push(`Same love language: ${otherUser.loveLanguage}`);
  } else {
    // Partial compatibility for complementary love languages
    const complementary: Record<string, string[]> = {
      "Words of Affirmation": ["Quality Time", "Acts of Service"],
      "Quality Time": ["Words of Affirmation", "Physical Touch"],
      "Acts of Service": ["Words of Affirmation", "Receiving Gifts"],
      "Physical Touch": ["Quality Time", "Words of Affirmation"],
      "Receiving Gifts": ["Acts of Service", "Quality Time"],
    };
    if (complementary[currentUser.loveLanguage]?.includes(otherUser.loveLanguage)) {
      breakdown.loveLanguage = 60;
    } else {
      breakdown.loveLanguage = 30;
    }
  }

  // Communication Style compatibility (15% weight)
  const styleCompatibility: Record<string, Record<string, number>> = {
    "Direct": { "Direct": 100, "Analytical": 80, "Empathetic": 60, "Playful": 50 },
    "Empathetic": { "Empathetic": 100, "Playful": 80, "Analytical": 60, "Direct": 50 },
    "Analytical": { "Analytical": 100, "Direct": 80, "Empathetic": 60, "Playful": 50 },
    "Playful": { "Playful": 100, "Empathetic": 80, "Direct": 50, "Analytical": 60 },
  };
  breakdown.communicationStyle = styleCompatibility[currentUser.communicationStyle]?.[otherUser.communicationStyle] || 50;
  
  if (breakdown.communicationStyle >= 80) {
    highlights.push(`Compatible communication style`);
  }

  // Calculate weighted total score
  const score = Math.round(
    breakdown.values * 0.40 +
    breakdown.interests * 0.25 +
    breakdown.loveLanguage * 0.20 +
    breakdown.communicationStyle * 0.15
  );

  return { score, breakdown, highlights };
}

export function getCompatibilityLabel(score: number): { label: string; labelAz: string; color: string } {
  if (score >= 80) return { label: "Excellent Match", labelAz: "Əla Uyğunluq", color: "text-green-600" };
  if (score >= 60) return { label: "Good Match", labelAz: "Yaxşı Uyğunluq", color: "text-emerald-500" };
  if (score >= 40) return { label: "Potential", labelAz: "Potensial", color: "text-amber-500" };
  return { label: "Worth Exploring", labelAz: "Araşdırmağa Dəyər", color: "text-slate-500" };
}
