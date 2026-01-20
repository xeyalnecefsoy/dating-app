// Virtual gifts system

export type VirtualGift = {
  id: string;
  name: string;
  nameAz: string;
  emoji: string;
  price: number;
  currency: string;
  category: "flowers" | "toys" | "luxury" | "fun";
};

export const VIRTUAL_GIFTS: VirtualGift[] = [
  // Flowers
  {
    id: "rose",
    name: "Rose",
    nameAz: "Qızılgül",
    emoji: "🌹",
    price: 1.99,
    currency: "AZN",
    category: "flowers"
  },
  {
    id: "bouquet",
    name: "Bouquet",
    nameAz: "Buket",
    emoji: "💐",
    price: 4.99,
    currency: "AZN",
    category: "flowers"
  },
  {
    id: "tulip",
    name: "Tulip",
    nameAz: "Lale",
    emoji: "🌷",
    price: 1.49,
    currency: "AZN",
    category: "flowers"
  },
  {
    id: "sunflower",
    name: "Sunflower",
    nameAz: "Günəbaxan",
    emoji: "🌻",
    price: 1.99,
    currency: "AZN",
    category: "flowers"
  },
  
  // Toys
  {
    id: "teddy",
    name: "Teddy Bear",
    nameAz: "Ayı",
    emoji: "🧸",
    price: 2.99,
    currency: "AZN",
    category: "toys"
  },
  {
    id: "heart_box",
    name: "Heart Box",
    nameAz: "Ürək Qutu",
    emoji: "💝",
    price: 3.99,
    currency: "AZN",
    category: "toys"
  },
  
  // Luxury
  {
    id: "diamond",
    name: "Diamond",
    nameAz: "Almaz",
    emoji: "💎",
    price: 9.99,
    currency: "AZN",
    category: "luxury"
  },
  {
    id: "crown",
    name: "Crown",
    nameAz: "Tac",
    emoji: "👑",
    price: 7.99,
    currency: "AZN",
    category: "luxury"
  },
  {
    id: "ring",
    name: "Ring",
    nameAz: "Üzük",
    emoji: "💍",
    price: 14.99,
    currency: "AZN",
    category: "luxury"
  },
  
  // Fun
  {
    id: "heart",
    name: "Heart",
    nameAz: "Ürək",
    emoji: "❤️",
    price: 0.99,
    currency: "AZN",
    category: "fun"
  },
  {
    id: "kiss",
    name: "Kiss",
    nameAz: "Öpücük",
    emoji: "💋",
    price: 0.99,
    currency: "AZN",
    category: "fun"
  },
  {
    id: "fire",
    name: "Fire",
    nameAz: "Alov",
    emoji: "🔥",
    price: 1.49,
    currency: "AZN",
    category: "fun"
  },
  {
    id: "star",
    name: "Star",
    nameAz: "Ulduz",
    emoji: "⭐",
    price: 0.99,
    currency: "AZN",
    category: "fun"
  },
  {
    id: "chocolate",
    name: "Chocolate",
    nameAz: "Şokolad",
    emoji: "🍫",
    price: 1.99,
    currency: "AZN",
    category: "fun"
  },
  {
    id: "champagne",
    name: "Champagne",
    nameAz: "Şampan",
    emoji: "🍾",
    price: 4.99,
    currency: "AZN",
    category: "fun"
  }
];

export const GIFT_CATEGORIES = [
  { id: "all", name: "All", nameAz: "Hamısı" },
  { id: "flowers", name: "Flowers", nameAz: "Güllər" },
  { id: "toys", name: "Toys", nameAz: "Oyuncaqlar" },
  { id: "luxury", name: "Luxury", nameAz: "Lüks" },
  { id: "fun", name: "Fun", nameAz: "Əyləncəli" }
];
