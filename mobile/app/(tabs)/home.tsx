import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image as RNImage,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "../../lib/api";
import { useRouter } from "expo-router";
import {
  Bell,
  Compass,
  Heart,
  MessageCircle,
  ChevronRight,
  Sparkles,
  Crown,
  User,
} from "../../lib/icons";
import { Colors } from "../../lib/colors";

const DAILY_QUESTIONS = [
  {
    q: "Çətin vaxtlarınızda qarşı tərəfdən necə bir dəstək görmək istəyirsiniz?",
    purpose: "Çətin anlarda onun yanında necə olmağı bilmək",
  },
  {
    q: "Həyatında ən çox nəyə dəyər verirsən?",
    purpose: "Dəyərlər üzrə uyğunluğu kəşf etmək",
  },
  {
    q: "Xoşbəxt münasibətin açarı nədir sənin üçün?",
    purpose: "Münasibətə baxışını anlamaq",
  },
  {
    q: "Son oxuduğun kitab/baxdığın film hansıdır?",
    purpose: "Maraqları və zövqü kəşf etmək",
  },
  {
    q: "Hansı mahnı sənin sevgi hekayəni ən yaxşı təsvir edər?",
    purpose: "Emosional dünyasını tanımaq",
  },
  {
    q: "Qarşılaşdığın ən böyük çətinlik nə idi?",
    purpose: "Dözümlülük və güc haqqında öyrənmək",
  },
  {
    q: "5 il sonra özünü harada görürsən?",
    purpose: "Gələcəyə baxışı və hədəfləri anlamaq",
  },
];

export default function HomeScreen() {
  const { userId } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const currentUser = useQuery(
    api.users.getUser,
    userId ? { clerkId: userId } : "skip",
  );
  const convexMatches = useQuery(
    api.matches.list,
    userId ? { userId } : "skip",
  );
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const sentLikesIds = useQuery(
    api.likes.getLikedUserIds,
    userId ? { userId } : "skip",
  );

  const matchCount = convexMatches?.length || 0;
  const sentLikesCount = sentLikesIds?.length || 0;

  const todaysQuestion = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000,
    );
    return DAILY_QUESTIONS[dayOfYear % DAILY_QUESTIONS.length];
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: insets.top + 8 },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLogo}>
            <RNImage
              source={require("../../assets/logo.png")}
              style={styles.headerLogoImg}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.headerTitle}>Danyeri</Text>
        </View>
        <TouchableOpacity
          style={styles.headerBellBtn}
          onPress={() => router.push("/notifications" as any)}
        >
          <Bell size={20} color={Colors.foreground} />
          {(unreadCount ?? 0) > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>
                {(unreadCount ?? 0) > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick actions */}
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/(tabs)/discovery")}
          activeOpacity={0.85}
        >
          <View
            style={[styles.quickActionIcon, styles.quickActionIconDiscover]}
          >
            <Compass size={24} color={Colors.foreground} />
          </View>
          <View style={styles.quickActionTextWrap}>
            <Text style={styles.quickActionTitle}>Kəşf Et</Text>
            <Text style={styles.quickActionSubtitle}>Yeni insanlar tap</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/(tabs)/messages")}
          activeOpacity={0.85}
        >
          <View
            style={[styles.quickActionIcon, styles.quickActionIconMessages]}
          >
            <MessageCircle size={24} color={Colors.foreground} />
          </View>
          <View style={styles.quickActionTextWrap}>
            <Text style={styles.quickActionTitle}>Mesajlar</Text>
            <Text style={styles.quickActionSubtitle}>
              {matchCount} uyğunluq
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push("/likes" as any)}
          >
            <Text style={[styles.statNumber, { color: Colors.primary }]}>
              {sentLikesCount}
            </Text>
            <Text style={styles.statLabel}>Göndərilən Bəyənmə</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push("/(tabs)/messages")}
          >
            <Text style={[styles.statNumber, { color: Colors.green }]}>
              {matchCount}
            </Text>
            <Text style={styles.statLabel}>Uyğunluqlar</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Text style={[styles.statNumber, { color: Colors.gold }]}>
              {currentUser?.badges?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Nişanlar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Skills section */}
      <View style={styles.skillsSectionHeader}>
        <Text style={styles.skillsSectionTitle}>
          Bacarıqlarını İnkişaf Etdir
        </Text>
        <TouchableOpacity style={styles.skillsSeeAll}>
          <Text style={styles.skillsSeeAllText}>Hamısını gör</Text>
          <ChevronRight size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.skillsCard}
        activeOpacity={0.85}
        onPress={() => router.push("/(tabs)/simulator" as any)}
      >
        <View style={styles.skillsIconWrap}>
          <Sparkles size={28} color={Colors.primary} />
        </View>
        <View style={styles.skillsInfo}>
          <Text style={styles.skillsTitle}>Ünsiyyət Simulyatoru</Text>
          <Text style={styles.skillsSubtitle}>
            AI ilə söhbət bacarıqlarını məşq et
          </Text>
        </View>
        <ChevronRight size={20} color={Colors.mutedForeground} />
      </TouchableOpacity>

      {/* Daily question */}
      <Text style={styles.dailySectionTitle}>Günün Sualı</Text>
      <View style={styles.dailyCard}>
        <View style={styles.dailyRow}>
          <View style={styles.dailyIconWrap}>
            <Sparkles size={24} color={Colors.primary} />
          </View>
          <View style={styles.dailyContent}>
            <Text style={styles.dailyLabel}>Günün sualı</Text>
            <Text style={styles.dailyQuestion}>{todaysQuestion.q}</Text>
            <View style={styles.dailyPurposeBox}>
              <Text style={styles.dailyPurposeLabel}>Məqsəd:</Text>
              <Text style={styles.dailyPurposeText}>
                {todaysQuestion.purpose}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Success Stories */}
      <View style={styles.storiesSectionHeader}>
        <Text style={styles.storiesSectionTitle}>Uğur Hekayələri</Text>
        <TouchableOpacity
          style={styles.storiesSeeAll}
          onPress={() => router.push("/stories" as any)}
        >
          <Text style={styles.storiesSeeAllText}>Hamısını gör</Text>
          <ChevronRight size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesScroll}
        style={styles.storiesScrollOuter}
      >
        {[
          { id: 1, names: "Aysel və Rəşad", duration: "8 ay birlikdə" },
          { id: 2, names: "Nərmin və Tural", duration: "Adaqlı" },
          { id: 3, names: "Leyla və Emil", duration: "1 il birlikdə" },
        ].map((story) => (
          <TouchableOpacity
            key={story.id}
            style={styles.storyCard}
            activeOpacity={0.85}
            onPress={() => router.push("/stories" as any)}
          >
            <View style={styles.storyAvatarsRow}>
              <View style={styles.storyAvatar}>
                <User size={20} color={Colors.mutedForeground} />
              </View>
              <View style={[styles.storyAvatar, styles.storyAvatarOverlap]}>
                <User size={20} color={Colors.mutedForeground} />
              </View>
            </View>
            <Text style={styles.storyNames}>{story.names}</Text>
            <Text style={styles.storyDuration}>{story.duration}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Mission Banner */}
      <TouchableOpacity style={styles.missionCard} activeOpacity={0.85}>
        <View style={styles.missionIconWrap}>
          <Heart size={24} color={Colors.primary} />
        </View>
        <View style={styles.missionInfo}>
          <Text style={styles.missionTitle}>Missiyamız</Text>
          <Text style={styles.missionSubtitle}>
            Danyeri niyə yaradıldı? Dəyərlərimiz haqqında
          </Text>
        </View>
        <ChevronRight size={20} color={Colors.primary} />
      </TouchableOpacity>

      {/* Premium CTA */}
      {!currentUser?.isPremium && (
        <TouchableOpacity style={styles.premiumCard} activeOpacity={0.85}>
          <Crown size={28} color={Colors.premium} />
          <View style={styles.premiumInfo}>
            <Text style={styles.premiumTitle}>Premium ol</Text>
            <Text style={styles.premiumSubtitle}>
              Limitsiz bəyənmə, kimin bəyəndiyini gör
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.premium} />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerLogo: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: "hidden",
  },
  headerLogoImg: { width: 34, height: 34 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: Colors.foreground },
  headerBellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  notifBadgeText: { color: Colors.foreground, fontSize: 9, fontWeight: "800" },

  quickActionsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  quickActionCard: {
    flex: 1,
    height: 130,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    position: "relative",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  quickActionIcon: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionIconDiscover: { backgroundColor: Colors.primary },
  quickActionIconMessages: { backgroundColor: Colors.green },
  quickActionTextWrap: {},
  quickActionTitle: {
    color: Colors.foreground,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 2,
  },
  quickActionSubtitle: { color: Colors.mutedForeground, fontSize: 13 },

  statsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
  statNumber: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  statLabel: {
    color: Colors.mutedForeground,
    fontSize: 11,
    textAlign: "center",
  },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },

  skillsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  skillsSectionTitle: {
    color: Colors.foreground,
    fontSize: 17,
    fontWeight: "700",
  },
  skillsSeeAll: { flexDirection: "row", alignItems: "center", gap: 2 },
  skillsSeeAllText: { color: Colors.primary, fontSize: 13, fontWeight: "600" },
  skillsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  skillsIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  skillsInfo: { flex: 1 },
  skillsTitle: {
    color: Colors.foreground,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  skillsSubtitle: { color: Colors.mutedForeground, fontSize: 13 },

  dailySectionTitle: {
    color: Colors.foreground,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  dailyCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dailyRow: { flexDirection: "row", gap: 14 },
  dailyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primaryAlpha10,
    justifyContent: "center",
    alignItems: "center",
  },
  dailyContent: { flex: 1 },
  dailyLabel: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  dailyQuestion: {
    color: Colors.foreground,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 10,
  },
  dailyPurposeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dailyPurposeLabel: {
    color: Colors.mutedForeground,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 1,
  },
  dailyPurposeText: {
    color: Colors.mutedForeground,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },

  storiesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  storiesSectionTitle: {
    color: Colors.foreground,
    fontSize: 17,
    fontWeight: "700",
  },
  storiesSeeAll: { flexDirection: "row", alignItems: "center", gap: 2 },
  storiesSeeAllText: { color: Colors.primary, fontSize: 13, fontWeight: "600" },
  storiesScrollOuter: { marginBottom: 24, marginHorizontal: -16 },
  storiesScroll: { paddingHorizontal: 16, gap: 12 },
  storyCard: {
    width: 180,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  storyAvatarsRow: { flexDirection: "row", marginBottom: 12 },
  storyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary,
    borderWidth: 2,
    borderColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  storyAvatarOverlap: { marginLeft: -16 },
  storyNames: {
    color: Colors.foreground,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  storyDuration: { color: Colors.mutedForeground, fontSize: 12 },

  missionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryAlpha10,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.primaryAlpha15,
    marginBottom: 20,
    gap: 14,
  },
  missionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryAlpha15,
    justifyContent: "center",
    alignItems: "center",
  },
  missionInfo: { flex: 1 },
  missionTitle: {
    color: Colors.foreground,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  missionSubtitle: { color: Colors.mutedForeground, fontSize: 13 },

  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251,191,36,0.08)",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.15)",
    marginBottom: 20,
  },
  premiumInfo: { flex: 1, marginLeft: 14 },
  premiumTitle: { color: Colors.premium, fontSize: 16, fontWeight: "700" },
  premiumSubtitle: {
    color: Colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },
});
