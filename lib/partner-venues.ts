// Partner venues for first dates

export type PartnerVenue = {
  id: string;
  name: string;
  type: "restaurant" | "cafe" | "cinema" | "entertainment";
  typeAz: string;
  address: string;
  location: string;
  image: string;
  rating: number;
  priceRange: 1 | 2 | 3; // $ $$ $$$
  discount?: number;
  discountCode?: string;
  tags: string[];
  tagsAz: string[];
  description: string;
  descriptionAz: string;
  specialOffer?: string;
  specialOfferAz?: string;
};

export const PARTNER_VENUES: PartnerVenue[] = [
  {
    id: "1",
    name: "Nargiz Restaurant",
    type: "restaurant",
    typeAz: "Restoran",
    address: "Nizami küçəsi 45",
    location: "Bakı",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    rating: 4.8,
    priceRange: 3,
    discount: 15,
    discountCode: "LOVE15",
    tags: ["Romantic", "Fine Dining", "Azerbaijani"],
    tagsAz: ["Romantik", "Lüks", "Azərbaycan Mətbəxi"],
    description: "Elegant fine dining with stunning city views",
    descriptionAz: "Şəhər mənzərəsi ilə zərif restoran",
    specialOffer: "Free dessert for couples",
    specialOfferAz: "Cütlüklər üçün pulsuz desert"
  },
  {
    id: "2",
    name: "Café Mado",
    type: "cafe",
    typeAz: "Kafe",
    address: "Fountain Square",
    location: "Bakı",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
    rating: 4.5,
    priceRange: 2,
    discount: 10,
    discountCode: "DATE10",
    tags: ["Cozy", "Coffee", "Desserts"],
    tagsAz: ["Rahat", "Qəhvə", "Şirniyyat"],
    description: "Perfect spot for a casual first date",
    descriptionAz: "İlk görüş üçün ideal yer",
    specialOffer: "2 for 1 on Turkish coffee",
    specialOfferAz: "Türk qəhvəsində 2-si 1 qiymətinə"
  },
  {
    id: "3",
    name: "CinemaPlus Park Bulvar",
    type: "cinema",
    typeAz: "Kinoteatr",
    address: "Park Bulvar Mall",
    location: "Bakı",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
    rating: 4.6,
    priceRange: 2,
    discount: 20,
    discountCode: "MOVIE20",
    tags: ["Movies", "IMAX", "Premium"],
    tagsAz: ["Filmlər", "IMAX", "Premium"],
    description: "Premium movie experience with VIP seating",
    descriptionAz: "VIP oturacaqlarla premium kino təcrübəsi",
    specialOffer: "Free popcorn with 2 tickets",
    specialOfferAz: "2 biletə pulsuz popkorn"
  },
  {
    id: "4",
    name: "Sahil Restaurant",
    type: "restaurant",
    typeAz: "Restoran",
    address: "Sahil metrosu yaxınlığı",
    location: "Bakı",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400",
    rating: 4.4,
    priceRange: 2,
    discount: 10,
    discountCode: "SAHIL10",
    tags: ["Seafood", "Traditional", "View"],
    tagsAz: ["Dəniz məhsulları", "Ənənəvi", "Mənzərə"],
    description: "Fresh seafood with Caspian Sea views",
    descriptionAz: "Xəzər dənizi mənzərəsi ilə təzə dəniz məhsulları"
  },
  {
    id: "5",
    name: "Starbucks Reserve",
    type: "cafe",
    typeAz: "Kafe",
    address: "Port Baku Mall",
    location: "Bakı",
    image: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=400",
    rating: 4.3,
    priceRange: 2,
    tags: ["Modern", "Coffee", "Casual"],
    tagsAz: ["Müasir", "Qəhvə", "Sərbəst"],
    description: "Premium coffee experience in a modern setting",
    descriptionAz: "Müasir mühitdə premium qəhvə"
  },
  {
    id: "6",
    name: "Bowling City",
    type: "entertainment",
    typeAz: "Əyləncə",
    address: "28 Mall",
    location: "Bakı",
    image: "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=400",
    rating: 4.2,
    priceRange: 2,
    discount: 25,
    discountCode: "BOWL25",
    tags: ["Fun", "Active", "Games"],
    tagsAz: ["Əyləncəli", "Aktiv", "Oyunlar"],
    description: "Fun bowling experience for active dates",
    descriptionAz: "Aktiv görüşlər üçün əyləncəli boulinq",
    specialOffer: "Free shoe rental for couples",
    specialOfferAz: "Cütlüklər üçün pulsuz ayaqqabı icarəsi"
  },
  {
    id: "7",
    name: "Qaynana Restaurant",
    type: "restaurant",
    typeAz: "Restoran",
    address: "Gəncə şəhəri",
    location: "Gəncə",
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400",
    rating: 4.7,
    priceRange: 2,
    discount: 15,
    discountCode: "GANJA15",
    tags: ["Traditional", "Homemade", "Family"],
    tagsAz: ["Ənənəvi", "Ev yeməkləri", "Ailəvi"],
    description: "Authentic Azerbaijani home cooking",
    descriptionAz: "Əsl Azərbaycan ev yeməkləri"
  },
  {
    id: "8",
    name: "Çay Evi",
    type: "cafe",
    typeAz: "Kafe",
    address: "İçərişəhər",
    location: "Bakı",
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400",
    rating: 4.9,
    priceRange: 1,
    tags: ["Traditional", "Tea", "Authentic"],
    tagsAz: ["Ənənəvi", "Çay", "Otantik"],
    description: "Traditional Azerbaijani tea house experience",
    descriptionAz: "Ənənəvi Azərbaycan çay evi təcrübəsi",
    specialOffer: "Free baklava with tea set",
    specialOfferAz: "Çay dəsti ilə pulsuz paxlava"
  }
];

export const VENUE_TYPES = [
  { id: "all", name: "All", nameAz: "Hamısı" },
  { id: "restaurant", name: "Restaurants", nameAz: "Restoranlar" },
  { id: "cafe", name: "Cafes", nameAz: "Kafelər" },
  { id: "cinema", name: "Cinema", nameAz: "Kinoteatrlar" },
  { id: "entertainment", name: "Entertainment", nameAz: "Əyləncə" }
];
