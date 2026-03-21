import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Heart,
  Quote,
  Sparkles,
  MapPin,
  ChevronRight,
  User,
} from "../lib/icons";
import { Colors } from "../lib/colors";

const STORIES = [
  {
    id: "1",
    names: "Aysel və Rəşad",
    quote:
      "Biz ailə və dürüstlük kimi ortaq dəyərlər ətrafında birləşdik. Ünsiyyət Simulyatoru mənə ilk görüşümüzdə özümə inamlı olmağa kömək etdi!",
    matchedOn: "Ailə, Dürüstlük",
    location: "Bakı",
    duration: "8 aydır birlikdə",
    featured: true,
  },
  {
    id: "2",
    names: "Leyla və Emil",
    quote:
      "Sadəcə bir tətbiq olduğunu düşündüyümüz yer, ən yaxın dostumu tapdığım yerə çevrildi. Şəkillərdən çox şəxsiyyətə önəm verilməsi hər şeyi dəyişdi.",
    matchedOn: "Sevgi Dili: Keyfiyyətli Zaman",
    location: "Sumqayıt",
    duration: "Adaqlı!",
    featured: false,
  },
  {
    id: "3",
    names: "Nigar və Kamran",
    quote:
      "Onlayn tanışlıqdan çəkinirdim, amma bacarıq inkişaf etdirmə xüsusiyyətləri mənə özümü ifadə etməyə kömək etdi. Məni həqiqətən anlayan birini tapdım.",
    matchedOn: "Ünsiyyət Tərzi: Empatik",
    location: "Gəncə",
    duration: "1 ildir birlikdə",
    featured: false,
  },
  {
    id: "4",
    names: "Fidan və Tural",
    quote:
      "Şəxsi inkişaf həvəsimi paylaşan biri ilə tanış olmaq xəyal idi. 'Buzqıran' suallar söhbətə başlamağı o qədər təbii etdi ki!",
    matchedOn: "Maraq: Şəxsi İnkişaf",
    location: "Bakı",
    duration: "6 aydır birlikdə",
    featured: false,
  },
];

export default function StoriesScreen() {
  const router = useRouter();
  const featured = STORIES.find((s) => s.featured) ?? STORIES[0];
  const rest = STORIES.filter((s) => s.id !== featured.id);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Uğur Hekayələri",
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.foreground,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8 }}>
              <ArrowLeft size={24} color={Colors.foreground} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroTitle}>
            Real <Text style={{ color: Colors.primary }}>əlaqələr</Text>, real hekayələr
          </Text>
          <Text style={s.heroSub}>
            Danyeri hər gün insanlara ortaq dəyərlər ətrafında mənalı münasibətlər qurmağa kömək edir.
          </Text>
        </View>

        {/* Featured Story */}
        <View style={s.featuredCard}>
          <View style={s.featuredInner}>
            <View style={s.quoteIcon}>
              <Quote size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.featuredQuote}>"{featured.quote}"</Text>
              <View style={s.featuredDivider} />
              <View style={s.featuredMeta}>
                <View style={s.featuredNameRow}>
                  <Sparkles size={14} color={Colors.primary} />
                  <Text style={s.featuredName}>{featured.names}</Text>
                </View>
                <Text style={s.featuredDuration}>{featured.duration}</Text>
              </View>
              <View style={s.featuredInfoRow}>
                <Text style={s.featuredInfo}>📍 {featured.location}</Text>
                <Text style={s.featuredInfo}>💕 {featured.matchedOn}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rest of Stories */}
        {rest.map((story) => (
          <View key={story.id} style={s.storyCard}>
            <View style={s.storyRow}>
              <View style={s.storyQuoteIcon}>
                <Quote size={14} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.storyQuote} numberOfLines={3}>
                  "{story.quote}"
                </Text>
                <View style={s.storyMetaRow}>
                  <Text style={s.storyName}>{story.names}</Text>
                  <Text style={s.storyDuration}>{story.duration}</Text>
                </View>
                <Text style={s.storyInfo}>
                  📍 {story.location} · {story.matchedOn}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* CTA */}
        <View style={s.cta}>
          <Text style={s.ctaTitle}>Öz hekayəni yazmağa hazırsan?</Text>
          <TouchableOpacity
            style={s.ctaBtn}
            activeOpacity={0.85}
            onPress={() => router.push("/(tabs)/discovery")}
          >
            <LinearGradient
              colors={[Colors.brandGradientFrom, Colors.brandGradientTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.ctaGradient}
            >
              <Text style={s.ctaBtnText}>Kəşf etməyə başla</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.ctaSecondary}
            activeOpacity={0.7}
            onPress={() => router.push("/practice" as any)}
          >
            <Text style={s.ctaSecondaryText}>Əvvəlcə məşq et</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },

  // Hero
  hero: { alignItems: "center", marginBottom: 24 },
  heroTitle: { fontSize: 24, fontWeight: "700", color: Colors.foreground, textAlign: "center", marginBottom: 8 },
  heroSub: { fontSize: 14, color: Colors.mutedForeground, textAlign: "center", lineHeight: 20, maxWidth: 320 },

  // Featured
  featuredCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  featuredInner: { flexDirection: "row", padding: 18, gap: 12 },
  quoteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryAlpha10,
    justifyContent: "center",
    alignItems: "center",
  },
  featuredQuote: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 22,
    fontStyle: "italic",
    marginBottom: 12,
  },
  featuredDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 12,
  },
  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  featuredNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  featuredName: { fontSize: 14, fontWeight: "700", color: Colors.foreground },
  featuredDuration: { fontSize: 12, color: Colors.primary, fontWeight: "600" },
  featuredInfoRow: { flexDirection: "row", gap: 12 },
  featuredInfo: { fontSize: 12, color: Colors.mutedForeground },

  // Story cards
  storyCard: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  storyRow: { flexDirection: "row", padding: 14, gap: 10 },
  storyQuoteIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryAlpha10,
    justifyContent: "center",
    alignItems: "center",
  },
  storyQuote: { fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 20, marginBottom: 10 },
  storyMetaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  storyName: { fontSize: 13, fontWeight: "600", color: Colors.foreground },
  storyDuration: { fontSize: 11, color: Colors.primary },
  storyInfo: { fontSize: 11, color: Colors.mutedForeground },

  // CTA
  cta: { alignItems: "center", marginTop: 20 },
  ctaTitle: { fontSize: 15, fontWeight: "600", color: Colors.foreground, marginBottom: 16 },
  ctaBtn: { borderRadius: 24, overflow: "hidden", width: "100%", marginBottom: 10 },
  ctaGradient: { paddingVertical: 15, alignItems: "center", borderRadius: 24 },
  ctaBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  ctaSecondary: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.03)",
    width: "100%",
    alignItems: "center",
  },
  ctaSecondaryText: { color: Colors.foreground, fontSize: 14, fontWeight: "600" },
});
