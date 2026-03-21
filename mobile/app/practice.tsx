import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import {
  ArrowLeft,
  Sparkles,
  Heart,
  MessageCircle,
  Users,
  ChevronRight,
} from "../lib/icons";
import { Colors } from "../lib/colors";

const WEB_URL =
  Constants.expoConfig?.extra?.webAppUrl ||
  process.env.EXPO_PUBLIC_WEB_APP_URL ||
  "https://danyeri.vercel.app";

const SCENARIOS = [
  {
    id: "1",
    emoji: "💬",
    title: "İlk Mesaj",
    description: "Birini yeni tanıdığınızda ilk mesajınızı necə yazacağınızı məşq edin.",
    tag: "Yeni başlayanlar üçün",
  },
  {
    id: "2",
    emoji: "☕",
    title: "İlk Görüş Söhbəti",
    description: "İlk görüşdə söhbəti necə maraqlı saxlayacağınızı öyrənin.",
    tag: "Orta səviyyə",
  },
  {
    id: "3",
    emoji: "💕",
    title: "Hisslər Haqqında Danışmaq",
    description: "Hisslərinizi necə səmimi şəkildə ifadə edəcəyinizi üzərində çalışın.",
    tag: "İrəliləmiş",
  },
  {
    id: "4",
    emoji: "🤝",
    title: "Münaqişə Həlli",
    description: "Fikir ayrılıqlarını konstruktiv şəkildə həll etməyi məşq edin.",
    tag: "İrəliləmiş",
  },
];

const SKILLS = [
  { icon: Heart, label: "Empatiya", color: "#ef4444" },
  { icon: MessageCircle, label: "Aktiv Dinləmə", color: "#3b82f6" },
  { icon: Users, label: "Qarşılıqlı Anlayış", color: "#22c55e" },
  { icon: Sparkles, label: "Yaradıcılıq", color: "#f59e0b" },
];

export default function PracticeScreen() {
  const router = useRouter();

  const openSimulator = () => {
    Linking.openURL(`${WEB_URL}/simulator`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Ünsiyyəti Məşq Et",
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
          <View style={s.heroIcon}>
            <Sparkles size={26} color={Colors.primary} />
          </View>
          <Text style={s.heroTitle}>Ünsiyyət Simulyatoru</Text>
          <Text style={s.heroSub}>
            AI ilə gücləndirilmiş simulyatorda münasibətlərdə vacib ünsiyyət bacarıqlarınızı inkişaf etdirin.
          </Text>
        </View>

        {/* Skills preview */}
        <View style={s.skillsRow}>
          {SKILLS.map((sk) => (
            <View key={sk.label} style={s.skillItem}>
              <View style={[s.skillIcon, { backgroundColor: `${sk.color}15` }]}>
                <sk.icon size={18} color={sk.color} />
              </View>
              <Text style={s.skillLabel}>{sk.label}</Text>
            </View>
          ))}
        </View>

        {/* Scenarios */}
        <Text style={s.sectionTitle}>Ssenarilər</Text>
        {SCENARIOS.map((sc) => (
          <TouchableOpacity
            key={sc.id}
            style={s.scenarioCard}
            activeOpacity={0.85}
            onPress={openSimulator}
          >
            <Text style={s.scenarioEmoji}>{sc.emoji}</Text>
            <View style={{ flex: 1 }}>
              <View style={s.scenarioHeader}>
                <Text style={s.scenarioTitle}>{sc.title}</Text>
                <View style={s.scenarioTag}>
                  <Text style={s.scenarioTagText}>{sc.tag}</Text>
                </View>
              </View>
              <Text style={s.scenarioDesc}>{sc.description}</Text>
            </View>
            <ChevronRight size={18} color={Colors.mutedForeground} />
          </TouchableOpacity>
        ))}

        {/* CTA */}
        <TouchableOpacity style={s.ctaBtn} activeOpacity={0.85} onPress={openSimulator}>
          <LinearGradient
            colors={[Colors.brandGradientFrom, Colors.brandGradientTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.ctaGradient}
          >
            <Sparkles size={18} color="#fff" />
            <Text style={s.ctaBtnText}>Simulyatoru Başlat</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={s.ctaNote}>
          Simulyator veb versiyada açılacaq. Tezliklə tam native dəstək əlavə olunacaq.
        </Text>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },

  // Hero
  hero: { alignItems: "center", marginBottom: 24 },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryAlpha10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  heroTitle: { fontSize: 22, fontWeight: "800", color: Colors.foreground, marginBottom: 8 },
  heroSub: {
    fontSize: 13,
    color: Colors.mutedForeground,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 300,
  },

  // Skills
  skillsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 8,
  },
  skillItem: { alignItems: "center", flex: 1 },
  skillIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  skillLabel: { fontSize: 10, color: Colors.mutedForeground, textAlign: "center" },

  // Scenarios
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.foreground,
    marginBottom: 12,
  },
  scenarioCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  scenarioEmoji: { fontSize: 28 },
  scenarioHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  scenarioTitle: { fontSize: 14, fontWeight: "700", color: Colors.foreground },
  scenarioTag: {
    backgroundColor: Colors.primaryAlpha10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scenarioTagText: { fontSize: 10, color: Colors.primary, fontWeight: "600" },
  scenarioDesc: { fontSize: 12, color: Colors.mutedForeground, lineHeight: 18 },

  // CTA
  ctaBtn: { borderRadius: 14, overflow: "hidden", marginTop: 16 },
  ctaGradient: {
    flexDirection: "row",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
  },
  ctaBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  ctaNote: {
    textAlign: "center",
    fontSize: 11,
    color: Colors.mutedForeground,
    marginTop: 10,
    lineHeight: 16,
  },
});
