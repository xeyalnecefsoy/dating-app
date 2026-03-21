import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const FOUNDER_EMAIL = "xeyalnecefsoy@gmail.com";

async function isAdmin(ctx: any): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  const email = identity.email?.toLowerCase() || "";
  if (email === FOUNDER_EMAIL) return true;
  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q: any) => q.eq("email", email))
    .first();
  return user?.role === "admin" || user?.role === "superadmin";
}

// Public: list active venues
export const listVenues = query({
  args: {},
  handler: async (ctx) => {
    const venues = await ctx.db.query("venues").collect();
    return venues
      .filter((v: any) => v.isActive)
      .sort((a: any, b: any) => a.order - b.order);
  },
});

// Admin: list all venues
export const listAllVenues = query({
  args: {},
  handler: async (ctx) => {
    if (!(await isAdmin(ctx))) throw new Error("Unauthorized");
    const venues = await ctx.db.query("venues").collect();
    return venues.sort((a: any, b: any) => a.order - b.order);
  },
});

// Admin: create venue
export const createVenue = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    typeAz: v.string(),
    address: v.string(),
    location: v.string(),
    image: v.string(),
    rating: v.number(),
    priceRange: v.number(),
    discount: v.optional(v.number()),
    discountCode: v.optional(v.string()),
    tags: v.array(v.string()),
    tagsAz: v.array(v.string()),
    description: v.string(),
    descriptionAz: v.string(),
    specialOffer: v.optional(v.string()),
    specialOfferAz: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) throw new Error("Unauthorized");

    const identity = await ctx.auth.getUserIdentity();
    const allVenues = await ctx.db.query("venues").collect();
    const maxOrder = allVenues.reduce((max: number, v: any) => Math.max(max, v.order || 0), 0);

    return await ctx.db.insert("venues", {
      ...args,
      isActive: true,
      order: maxOrder + 1,
      createdAt: Date.now(),
      createdBy: identity?.subject || "admin",
    });
  },
});

// Admin: update venue
export const updateVenue = mutation({
  args: {
    id: v.id("venues"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    typeAz: v.optional(v.string()),
    address: v.optional(v.string()),
    location: v.optional(v.string()),
    image: v.optional(v.string()),
    rating: v.optional(v.number()),
    priceRange: v.optional(v.number()),
    discount: v.optional(v.number()),
    discountCode: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    tagsAz: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    descriptionAz: v.optional(v.string()),
    specialOffer: v.optional(v.string()),
    specialOfferAz: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) throw new Error("Unauthorized");
    const { id, ...updates } = args;
    // Remove undefined values
    const cleanUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) cleanUpdates[key] = value;
    }
    await ctx.db.patch(id, cleanUpdates);
  },
});

// Admin: toggle active status
export const toggleVenueStatus = mutation({
  args: {
    id: v.id("venues"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) throw new Error("Unauthorized");
    await ctx.db.patch(args.id, { isActive: args.isActive });
  },
});

// Admin: delete venue
export const deleteVenue = mutation({
  args: { id: v.id("venues") },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
  },
});

// Admin: seed venues from static data
export const seedVenues = mutation({
  args: {},
  handler: async (ctx) => {
    if (!(await isAdmin(ctx))) throw new Error("Unauthorized");
    
    // Delete any existing venues first
    const existing = await ctx.db.query("venues").collect();
    for (const v of existing) {
      await ctx.db.delete(v._id);
    }

    const identity = await ctx.auth.getUserIdentity();
    const createdBy = identity?.subject || "admin";

    const SEED_DATA = [
      // === BAKI ===
      { name: "Scalini", type: "restaurant", typeAz: "Restoran", address: "İçərişəhər, Böyük Qala küç. 7", location: "Bakı", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400", rating: 4.8, priceRange: 3, discount: 15, discountCode: "SCAL15", tags: ["Italian","Fine Dining","Romantic"], tagsAz: ["İtalyan","Lüks","Romantik"], description: "Upscale Italian dining in the heart of Old City", descriptionAz: "İçərişəhərin mərkəzində zərif İtalyan restoranı", specialOffer: "Free dessert for couples on weekends", specialOfferAz: "Həftə sonları cütlüklərə pulsuz desert" },
      { name: "Dolma Restaurant", type: "restaurant", typeAz: "Restoran", address: "Neftçilər prospekti 97", location: "Bakı", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400", rating: 4.7, priceRange: 3, discount: 10, discountCode: "DOLMA10", tags: ["Azerbaijani","Traditional","Elegant"], tagsAz: ["Azərbaycan","Ənənəvi","Zərif"], description: "Authentic Azerbaijani cuisine with Caspian views", descriptionAz: "Xəzər mənzərəsi ilə əsl Azərbaycan mətbəxi" },
      { name: "Chinar Restaurant & Café", type: "restaurant", typeAz: "Restoran", address: "Tbilisi prospekti 14, Dağüstü park", location: "Bakı", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400", rating: 4.9, priceRange: 3, tags: ["Panoramic","Premium","European"], tagsAz: ["Panoramik","Premium","Avropa"], description: "Stunning panoramic views over Baku Bay", descriptionAz: "Bakı körfəzinin heyrətamiz panoramik mənzərəsi", specialOffer: "Complimentary welcome drink", specialOfferAz: "Pulsuz xoş gəldin içkisi" },
      { name: "Starbucks Port Baku", type: "cafe", typeAz: "Kafe", address: "Port Baku Mall, Neftçilər pr. 153", location: "Bakı", image: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=400", rating: 4.3, priceRange: 2, tags: ["Modern","Coffee","International"], tagsAz: ["Müasir","Qəhvə","Beynəlxalq"], description: "Premium coffee in Baku's luxury shopping district", descriptionAz: "Bakının lüks alış-veriş mərkəzində premium qəhvə" },
      { name: "CinemaPlus 28 Mall", type: "cinema", typeAz: "Kinoteatr", address: "28 Mall, Babək pr. 2109", location: "Bakı", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400", rating: 4.6, priceRange: 2, discount: 20, discountCode: "CINE20", tags: ["IMAX","VIP","Blockbusters"], tagsAz: ["IMAX","VIP","Premyeralar"], description: "State-of-the-art IMAX and VIP cinema halls", descriptionAz: "Ən müasir IMAX və VIP kino zalları", specialOffer: "Free popcorn with 2 tickets", specialOfferAz: "2 biletə pulsuz popkorn" },
      { name: "Entrée Café", type: "cafe", typeAz: "Kafe", address: "Nizami küçəsi 203", location: "Bakı", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400", rating: 4.5, priceRange: 2, discount: 10, discountCode: "ENTREE10", tags: ["Cozy","Brunch","Coffee"], tagsAz: ["Rahat","Brunch","Qəhvə"], description: "Cozy café with specialty brunch and desserts", descriptionAz: "Xüsusi brunch və şirniyyatlarla rahat kafe", specialOffer: "Buy 1 get 1 free latte", specialOfferAz: "1 latte al, 1-i pulsuz" },
      { name: "Çay Evi No. 145", type: "cafe", typeAz: "Kafe", address: "İçərişəhər, Kiçik Qala küç. 145", location: "Bakı", image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400", rating: 4.9, priceRange: 1, tags: ["Tea","Traditional","Authentic"], tagsAz: ["Çay","Ənənəvi","Otantik"], description: "Iconic Old City tea house with traditional paxlava", descriptionAz: "İçərişəhərin məşhur çayxanası, ənənəvi paxlava ilə", specialOffer: "Free paxlava with tea set", specialOfferAz: "Çay dəsti ilə pulsuz paxlava" },
      { name: "ExitGames Baku", type: "entertainment", typeAz: "Əyləncə", address: "Xətai pr. 55A", location: "Bakı", image: "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=400", rating: 4.4, priceRange: 2, discount: 15, discountCode: "EXIT15", tags: ["Escape Room","Fun","Adventure"], tagsAz: ["Qaçış otağı","Əyləncə","Macəra"], description: "Exciting escape rooms perfect for date nights", descriptionAz: "Görüş gecələri üçün ideal qaçış otaqları" },

      // === GƏNCƏ ===
      { name: "Vego Café", type: "cafe", typeAz: "Kafe", address: "Cavadxan küçəsi 28", location: "Gəncə", image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400", rating: 4.6, priceRange: 1, discount: 10, discountCode: "VEGO10", tags: ["Modern","Coffee","Pastry"], tagsAz: ["Müasir","Qəhvə","Şirniyyat"], description: "Trendy café in the heart of Ganja", descriptionAz: "Gəncənin mərkəzində trend kafe" },
      { name: "Han Sarayı Restaurant", type: "restaurant", typeAz: "Restoran", address: "Şah İsmayıl Xətai prospekti 102", location: "Gəncə", image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400", rating: 4.7, priceRange: 2, discount: 15, discountCode: "HAN15", tags: ["Traditional","Kebab","Family"], tagsAz: ["Ənənəvi","Kabab","Ailəvi"], description: "Traditional Azerbaijani kebab house with garden seating", descriptionAz: "Bağ oturacaqları ilə ənənəvi Azərbaycan kabab evi" },

      // === ŞƏKİ ===
      { name: "Gagarin Restaurant", type: "restaurant", typeAz: "Restoran", address: "M. Ə. Rəsulzadə küçəsi 15", location: "Şəki", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400", rating: 4.5, priceRange: 2, tags: ["Sheki Cuisine","Traditional","Mountain View"], tagsAz: ["Şəki Mətbəxi","Ənənəvi","Dağ mənzərəsi"], description: "Famous Sheki piti and local cuisine with mountain views", descriptionAz: "Dağ mənzərəsi ilə məşhur Şəki pitisi və yerli mətbəx" },
      { name: "Şəki Çayxanası", type: "cafe", typeAz: "Kafe", address: "Xan Sarayı yanı, M.F.Axundzadə küçəsi", location: "Şəki", image: "https://images.unsplash.com/photo-1571167530149-c1105da4c2c7?w=400", rating: 4.8, priceRange: 1, tags: ["Tea","Paxlava","Historic"], tagsAz: ["Çay","Paxlava","Tarixi"], description: "Traditional tea house next to the historic Khan Palace", descriptionAz: "Tarixi Xan Sarayının yanında ənənəvi çayxana", specialOffer: "Free Sheki halva with tea", specialOfferAz: "Çay ilə pulsuz Şəki halvası" },

      // === QƏBƏLƏ ===
      { name: "Tufandağ Mountain Resort", type: "entertainment", typeAz: "Əyləncə", address: "Tufandağ Dağ-Xizək Kompleksi", location: "Qəbələ", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400", rating: 4.7, priceRange: 3, discount: 10, discountCode: "TUFAN10", tags: ["Ski","Nature","Resort"], tagsAz: ["Xizək","Təbiət","Kurort"], description: "Year-round mountain resort with skiing and nature trails", descriptionAz: "İl boyu xizək və təbiət cığırları ilə dağ kurortu" },
      { name: "Qəbələ Park Resort", type: "entertainment", typeAz: "Əyləncə", address: "Yeni Həyat küçəsi 1", location: "Qəbələ", image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400", rating: 4.3, priceRange: 2, tags: ["Amusement","Rides","Family"], tagsAz: ["Əyləncə parkı","Attraksionlar","Ailəvi"], description: "Fun amusement park surrounded by stunning nature", descriptionAz: "Heyrətamiz təbiətlə əhatə olunmuş əyləncə parkı" },

      // === SUMQAYIT ===
      { name: "Deniz Café", type: "cafe", typeAz: "Kafe", address: "Sahil bulvarı, Sumqayıt", location: "Sumqayıt", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", rating: 4.2, priceRange: 1, tags: ["Seaside","Coffee","Relaxed"], tagsAz: ["Dəniz kənarı","Qəhvə","Rahat"], description: "Relaxed seaside café with Caspian breeze", descriptionAz: "Xəzər küləyi ilə rahat dəniz kənarı kafe" },

      // === LƏNKƏRAN ===
      { name: "Xan Lənkəran Restaurant", type: "restaurant", typeAz: "Restoran", address: "Hüseyn Aslanov küçəsi 10", location: "Lənkəran", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400", rating: 4.6, priceRange: 2, discount: 10, discountCode: "XANL10", tags: ["Southern Cuisine","Fish","Garden"], tagsAz: ["Cənub mətbəxi","Balıq","Bağ"], description: "Famous Lankaran fish dishes in a garden setting", descriptionAz: "Bağ mühitində məşhur Lənkəran balıq yeməkləri", specialOffer: "Free Lankaran tea with meal", specialOfferAz: "Yeməklə pulsuz Lənkəran çayı" },
    ];

    for (let i = 0; i < SEED_DATA.length; i++) {
      await ctx.db.insert("venues", {
        ...SEED_DATA[i],
        tags: SEED_DATA[i].tags,
        tagsAz: SEED_DATA[i].tagsAz,
        isActive: true,
        order: i + 1,
        createdAt: Date.now(),
        createdBy,
      });
    }

    return { seeded: SEED_DATA.length };
  },
});
