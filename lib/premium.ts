// Premium subscription types and mock data

export type PremiumPlan = {
  id: string;
  name: string;
  nameAz: string;
  price: number;
  currency: string;
  period: "monthly" | "quarterly" | "yearly";
  periodAz: string;
  features: string[];
  featuresAz: string[];
  popular?: boolean;
  savings?: number;
};

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: "monthly",
    name: "Monthly",
    nameAz: "Aylıq",
    price: 9.99,
    currency: "AZN",
    period: "monthly",
    periodAz: "ay",
    features: [
      "See who liked you",
      "Unlimited likes",
      "5 Super Likes per day",
      "1 Boost per month",
      "Ad-free experience"
    ],
    featuresAz: [
      "Səni kim bəyənib görüntülə",
      "Limitsiz bəyənmə",
      "Gündəlik 5 Super Bəyənmə",
      "Ayda 1 Boost",
      "Reklamsız istifadə"
    ]
  },
  {
    id: "quarterly",
    name: "3 Months",
    nameAz: "3 Aylıq",
    price: 24.99,
    currency: "AZN",
    period: "quarterly",
    periodAz: "3 ay",
    features: [
      "Everything in Monthly",
      "10 Super Likes per day",
      "3 Boosts per month",
      "Priority profile display"
    ],
    featuresAz: [
      "Aylıq plandakı hər şey",
      "Gündəlik 10 Super Bəyənmə",
      "Ayda 3 Boost",
      "Profilin önə çıxarılması"
    ],
    popular: true,
    savings: 17
  },
  {
    id: "yearly",
    name: "Yearly",
    nameAz: "İllik",
    price: 79.99,
    currency: "AZN",
    period: "yearly",
    periodAz: "il",
    features: [
      "Everything in 3 Months",
      "Unlimited Super Likes",
      "5 Boosts per month",
      "Verified badge",
      "Read receipts"
    ],
    featuresAz: [
      "3 Aylıq plandakı hər şey",
      "Limitsiz Super Bəyənmə",
      "Ayda 5 Boost",
      "Təsdiqlənmiş nişanı",
      "Mesaj oxundu bildirişi"
    ],
    savings: 33
  }
];

export const PREMIUM_FEATURES = [
  {
    icon: "Heart",
    title: "Unlimited Likes",
    titleAz: "Limitsiz Bəyənmə",
    description: "Like as many profiles as you want",
    descriptionAz: "İstədiyiniz qədər profil bəyənin"
  },
  {
    icon: "Eye",
    title: "See Who Likes You",
    titleAz: "Səni Kim Bəyənib",
    description: "See everyone who liked your profile",
    descriptionAz: "Profilinizi bəyənən hər kəsi görün"
  },
  {
    icon: "Zap",
    title: "Super Likes",
    titleAz: "Super Bəyənmə",
    description: "Stand out with Super Likes",
    descriptionAz: "Super Bəyənmə ilə fərqlənin"
  },
  {
    icon: "Rocket",
    title: "Boost",
    titleAz: "Boost",
    description: "Be seen by more people",
    descriptionAz: "Daha çox insan tərəfindən görünün"
  },
  {
    icon: "XCircle",
    title: "No Ads",
    titleAz: "Reklamsız",
    description: "Enjoy an ad-free experience",
    descriptionAz: "Reklamsız istifadə edin"
  },
  {
    icon: "Shield",
    title: "Verified Badge",
    titleAz: "Təsdiq Nişanı",
    description: "Get a verified badge on your profile",
    descriptionAz: "Profilinizdə təsdiq nişanı alın"
  }
];
