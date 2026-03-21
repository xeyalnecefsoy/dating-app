import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
  Platform,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../lib/api";
import {
  Heart,
  CheckCircle2,
  MapPin,
  Info,
  RotateCcw,
  X,
  Star,
  MessageCircle,
  Crown,
  ArrowLeft,
  SlidersHorizontal,
  Sparkles,
} from "../../lib/icons";
import { Colors } from "../../lib/colors";
import { AZERBAIJAN_REGIONS } from "../../lib/locations";
import {
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

type UserCard = {
  id: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  bio: string;
  avatar: string;
  interests: string[];
  values: string[];
  loveLanguage: string;
  isVerified: boolean;
  username?: string;
  communicationStyle?: string;
};

const TIPS = [
  "💡 Mükəmməl insan yoxdur, mükəmməl sevgi qura bilən insanlar var",
  "❤️ Daxili gözəllik, xarici gözəllikdən daha uzun ömürlüdür",
  "🤝 Qarşılıqlı hörmət, hər sağlam münasibətin təməlidir",
  "🌱 Doğru insanı tapmaq üçün əvvəlcə özün doğru insan ol",
  "💬 Açıq ünsiyyət, hər problemin həllidir",
  "🎯 Realist gözləntilər, xoşbəxt münasibətlərin açarıdır",
  "💕 Sevgi, verməkdən başlayır, almaqdan deyil",
  "🌟 Status deyil, xarakter önəmlidir",
  "🏠 Ailə qurmaq, birlikdə böyüməkdir",
  "⚖️ Yoldaşını dəyişdirmək deyil, onu başa düşmək lazımdır",
];

const COMM_STYLES = [
  { key: "Direct", label: "Birbaşa" },
  { key: "Empathetic", label: "Empatik" },
  { key: "Analytical", label: "Analitik" },
  { key: "Playful", label: "Oyunbaz" },
];

function calculateCompatibility(user: any, profile: UserCard): number {
  if (!user) return 0;
  let score = 0;
  let total = 0;

  const myInterests = user.interests || [];
  const theirInterests = profile.interests || [];
  if (myInterests.length && theirInterests.length) {
    const common = myInterests.filter((i: string) => theirInterests.includes(i)).length;
    score += (common / Math.max(myInterests.length, theirInterests.length)) * 40;
    total += 40;
  }

  const myValues = user.values || [];
  const theirValues = profile.values || [];
  if (myValues.length && theirValues.length) {
    const common = myValues.filter((v: string) => theirValues.includes(v)).length;
    score += (common / Math.max(myValues.length, theirValues.length)) * 35;
    total += 35;
  }

  if (user.loveLanguage && profile.loveLanguage) {
    score += user.loveLanguage === profile.loveLanguage ? 15 : 5;
    total += 15;
  }

  if (user.communicationStyle && profile.communicationStyle) {
    score += user.communicationStyle === profile.communicationStyle ? 10 : 3;
    total += 10;
  }

  if (total === 0) return 50;
  return Math.round((score / total) * 100);
}

export default function DiscoveryScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<UserCard | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const currentUser = useQuery(api.users.getUser, userId ? { clerkId: userId } : "skip");
  const swipeStatusQuery = useQuery(api.users.getSwipeStatus, userId ? { clerkId: userId } : "skip");
  const convexUsers = useQuery(
    api.users.getActiveUsers,
    currentUser ? {
      currentUserGender: currentUser.gender || "male",
      currentUserId: userId || "",
    } : "skip"
  );

  const likeMutation = useMutation(api.likes.like);
  const logSwipeMutation = useMutation(api.users.logSwipe);

  type LimitStatus = { count: number; limit: number; remaining: number; limitReached: boolean; isPremium: boolean } | null;
  const [limitStatus, setLimitStatus] = useState<LimitStatus>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    if (swipeStatusQuery) setLimitStatus(swipeStatusQuery);
  }, [swipeStatusQuery]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const users: UserCard[] = useMemo(() => {
    if (!convexUsers) return [];
    return convexUsers.map((u: any) => ({
      id: u.clerkId || u._id,
      name: u.name,
      age: u.age || 25,
      gender: u.gender,
      location: u.location || "Bakı",
      bio: u.bio || "",
      avatar: u.avatar || "",
      interests: u.interests || [],
      values: u.values || [],
      loveLanguage: u.loveLanguage || "",
      communicationStyle: u.communicationStyle || "",
      isVerified: u.role === "admin" || u.role === "superadmin" || u.isVerified,
      username: u.username,
    }));
  }, [convexUsers]);

  const currentProfile = users[currentIndex];
  const nextProfile = users[currentIndex + 1];
  const compatibility = currentProfile ? calculateCompatibility(currentUser, currentProfile) : 0;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const goNext = useCallback(() => {
    setHistory((prev) => [...prev, currentIndex]);
    setCurrentIndex((prev) => Math.min(prev + 1, users.length));
    translateX.value = 0;
    translateY.value = 0;
  }, [currentIndex, users.length]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const lastIndex = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex(lastIndex);
  }, [history]);

  const handleLike = useCallback(async () => {
    if (!currentProfile || !userId) return;
    if (limitStatus?.limitReached) {
      setShowLimitModal(true);
      return;
    }
    try {
      const swipeResult = await logSwipeMutation({ clerkId: userId }) as any;
      if (swipeResult?.success === false) {
        if (swipeResult.limitReached) {
          setLimitStatus((prev) => prev ? { ...prev, limitReached: true } : null);
          setShowLimitModal(true);
        }
        return;
      }
      if (swipeResult?.success && typeof swipeResult.count === "number") {
        setLimitStatus((prev) => prev ? { ...prev, count: swipeResult.count!, remaining: swipeResult.remaining ?? 0, limitReached: (swipeResult.remaining ?? 0) <= 0 } : null);
      }
      const result = await likeMutation({ likerId: userId, likedId: currentProfile.id, type: "like" }) as any;
      if (result?.matched) {
        setMatchedProfile(currentProfile);
        setShowMatchModal(true);
      }
    } catch (e) { /* ignore */ }
    goNext();
  }, [currentProfile, userId, likeMutation, logSwipeMutation, goNext, limitStatus?.limitReached]);

  const handlePass = useCallback(() => {
    goNext();
  }, [goNext]);

  const handleSuperLike = useCallback(async () => {
    if (!currentProfile || !userId) return;
    if (limitStatus?.limitReached) {
      setShowLimitModal(true);
      return;
    }
    try {
      const swipeResult = await logSwipeMutation({ clerkId: userId }) as any;
      if (swipeResult?.success === false) {
        if (swipeResult.limitReached) {
          setLimitStatus((prev) => prev ? { ...prev, limitReached: true } : null);
          setShowLimitModal(true);
        }
        return;
      }
      if (swipeResult?.success && typeof swipeResult.count === "number") {
        setLimitStatus((prev) => prev ? { ...prev, count: swipeResult.count!, remaining: swipeResult.remaining ?? 0, limitReached: (swipeResult.remaining ?? 0) <= 0 } : null);
      }
      const result = await likeMutation({ likerId: userId, likedId: currentProfile.id, type: "super" }) as any;
      if (result?.matched) {
        setMatchedProfile(currentProfile);
        setShowMatchModal(true);
      }
    } catch (e) { /* ignore */ }
    goNext();
  }, [currentProfile, userId, likeMutation, logSwipeMutation, goNext, limitStatus?.limitReached]);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(handleLike)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(handlePass)();
      } else if (e.translationY < -SWIPE_THRESHOLD) {
        translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 300 });
        runOnJS(handleSuperLike)();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          [-15, 0, 15],
          Extrapolation.CLAMP
        )}deg`,
      },
    ],
  }));

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  if (!currentUser || convexUsers === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Profillər yüklənir...</Text>
      </View>
    );
  }

  if (!currentProfile || currentIndex >= users.length) {
    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color={Colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kəşf et</Text>
          <View style={styles.headerIconBtn} />
        </View>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>Profillər bitdi</Text>
          <Text style={styles.emptySubtitle}>Yeni istifadəçilər gözləyin və ya filtrləri dəyişdirin</Text>
          <TouchableOpacity style={styles.resetButton} onPress={() => { setCurrentIndex(0); setHistory([]); }}>
            <Text style={styles.resetButtonText}>Yenidən başla</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kəşf et</Text>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => setShowFilters(true)}>
          <SlidersHorizontal size={20} color={Colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Main content area */}
      <View style={styles.mainArea}>
        {/* Swipe hints - extra padding around for breathing room */}
        <View style={styles.swipeHints}>
          <View style={styles.swipeHintBox}>
            <ArrowLeft size={12} color="rgba(255,255,255,0.35)" />
            <Text style={styles.swipeHintText}>Sola sürüşdür</Text>
            <X size={12} color="rgba(239,68,68,0.5)" />
          </View>
          <View style={styles.swipeHintBox}>
            <Heart size={12} color="rgba(74,222,128,0.5)" />
            <Text style={styles.swipeHintText}>Sağa sürüşdür</Text>
          </View>
        </View>

        {/* Card area - square card like web app, with proper spacing */}
        <View style={styles.cardArea}>
          <View style={styles.cardSquare}>
          {/* Next card (behind) */}
          {nextProfile && (
            <View style={[styles.cardContainer, styles.nextCard]}>
              <Image source={{ uri: nextProfile.avatar }} style={styles.cardImage} contentFit="cover" />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.8)"]}
                style={styles.cardGradient}
              />
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{nextProfile.name}, {nextProfile.age}</Text>
              </View>
            </View>
          )}

          {/* Current card */}
          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.cardContainer, cardStyle]}>
              <Image source={{ uri: currentProfile.avatar }} style={styles.cardImage} contentFit="cover" />
              <LinearGradient
                colors={["transparent", "transparent", "rgba(0,0,0,0.9)"]}
                locations={[0, 0.35, 1]}
                style={styles.cardGradient}
              />

              {/* Compatibility badge - top left, dark blur style */}
              <View style={styles.compatBadge}>
                <Sparkles size={14} color="#eab308" />
                <Text style={styles.compatText}>{compatibility}%</Text>
              </View>

              {/* LIKE stamp */}
              <Animated.View style={[styles.stamp, styles.stampLike, likeOpacity]}>
                <Text style={styles.stampText}>BƏYƏNDİM</Text>
              </Animated.View>

              {/* NOPE stamp */}
              <Animated.View style={[styles.stamp, styles.stampNope, nopeOpacity]}>
                <Text style={[styles.stampText, { color: "#ef4444" }]}>KEÇ</Text>
              </Animated.View>

              {/* Card info overlay */}
              <View style={styles.cardInfo}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push(`/user/${currentProfile.username || currentProfile.id}` as any)}
                >
                  <View style={styles.nameRow}>
                    <Text style={styles.cardName}>{currentProfile.name}, {currentProfile.age}</Text>
                    {currentProfile.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <CheckCircle2 size={12} color="#fff" />
                      </View>
                    )}
                  </View>
                  <View style={styles.locationRow}>
                    <MapPin size={13} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.cardLocation}>{currentProfile.location}</Text>
                    <Text style={styles.locationDot}>•</Text>
                    <Text style={styles.viewProfileText}>Profilə bax</Text>
                  </View>
                </TouchableOpacity>

                {/* Value chips - pink style like web */}
                {currentProfile.values && currentProfile.values.length > 0 && (
                  <View style={styles.valuesRow}>
                    {currentProfile.values.slice(0, 2).map((value, i) => (
                      <View key={i} style={styles.valueChip}>
                        <Text style={styles.valueText}>{value}</Text>
                      </View>
                    ))}
                    {currentProfile.values.length > 2 && (
                      <View style={styles.valueChipExtra}>
                        <Text style={styles.valueTextExtra}>+{currentProfile.values.length - 2}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Bottom-right info + block buttons */}
                <View style={styles.cardBottomButtons}>
                  <TouchableOpacity
                    style={styles.cardSmallBtn}
                    onPress={() => router.push(`/user/${currentProfile.username || currentProfile.id}` as any)}
                  >
                    <Info size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </GestureDetector>
          </View>
        </View>

        {/* Relationship Tips Banner */}
        <View style={styles.tipsBanner}>
          <LinearGradient
            colors={[Colors.primaryAlpha10, Colors.primaryAlpha15, Colors.primaryAlpha10]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.tipsBannerGradient}
          >
            <Text style={styles.tipsText} numberOfLines={2}>{TIPS[tipIndex]}</Text>
          </LinearGradient>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          {/* Undo */}
          <View style={styles.actionGroup}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionSmall, history.length === 0 && styles.actionDisabled]}
              onPress={handleUndo}
              disabled={history.length === 0}
            >
              <RotateCcw size={16} color="#fb923c" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Geri</Text>
          </View>

          {/* Skip */}
          <View style={styles.actionGroup}>
            <TouchableOpacity style={[styles.actionBtn, styles.actionMedium]} onPress={handlePass}>
              <X size={22} color="#ef4444" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Keç</Text>
          </View>

          {/* Like - gradient pink */}
          <View style={styles.actionGroup}>
            <TouchableOpacity style={styles.actionLikeWrap} onPress={handleLike}>
              <LinearGradient
                colors={[Colors.brandGradientFrom, Colors.brandGradientTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionLikeGradient}
              >
                {limitStatus && !limitStatus.isPremium && (
                  <View style={styles.likeBadge}>
                    <Text style={styles.likeBadgeText}>{limitStatus.remaining}</Text>
                  </View>
                )}
                <Heart size={26} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Bəyən</Text>
          </View>

          {/* Super Like */}
          <View style={styles.actionGroup}>
            <TouchableOpacity style={[styles.actionBtn, styles.actionMedium]} onPress={handleSuperLike}>
              <Star size={22} color="#eab308" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Super</Text>
          </View>
        </View>
      </View>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
      />

      {/* Match modal */}
      <Modal visible={showMatchModal} transparent animationType="fade">
        <View style={styles.matchModalOverlay}>
          <View style={styles.matchModalContent}>
            <Text style={styles.matchEmoji}>🎉</Text>
            <Text style={styles.matchTitle}>Uyğunluq tapıldı!</Text>
            <Text style={styles.matchSubtitle}>Siz və {matchedProfile?.name} bir-birinizi bəyəndiniz</Text>
            {matchedProfile?.avatar && (
              <Image source={{ uri: matchedProfile.avatar }} style={styles.matchAvatar} contentFit="cover" />
            )}
            <TouchableOpacity
              style={styles.matchBtn}
              onPress={() => {
                setShowMatchModal(false);
                if (matchedProfile) {
                  router.push(`/chat/${matchedProfile.id}` as any);
                }
              }}
            >
              <MessageCircle size={18} color={Colors.foreground} style={{ marginRight: 8 }} />
              <Text style={styles.matchBtnText}>Mesaj yaz</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.matchSecondaryBtn} onPress={() => setShowMatchModal(false)}>
              <Text style={styles.matchSecondaryBtnText}>Davam et</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Out of likes modal */}
      <Modal visible={showLimitModal} transparent animationType="fade" onRequestClose={() => setShowLimitModal(false)}>
        <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={() => setShowLimitModal(false)}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Heart size={40} color={Colors.foreground} />
            </View>
            <Text style={styles.modalTitle}>Bəyənmə limiti doldu</Text>
            <Text style={styles.modalText}>
              Gündəlik bəyənmə limitinizə ({limitStatus?.limit ?? 10} lik) çatdınız. Premium ala bilərsiniz və ya sabahadək gözləyə bilərsiniz.
            </Text>
            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => {
                const base = process.env.EXPO_PUBLIC_WEB_APP_URL || "https://danyeri.az";
                Linking.openURL(`${base.replace(/\/$/, "")}/premium`).catch(() => {});
                setShowLimitModal(false);
              }}
            >
              <Crown size={20} color={Colors.foreground} style={{ marginRight: 8 }} />
              <Text style={styles.modalPrimaryBtnText}>Premium Al</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setShowLimitModal(false)}>
              <Text style={styles.modalSecondaryBtnText}>Sabahadək Gözlə</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function FilterModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [minAge, setMinAge] = useState("18");
  const [maxAge, setMaxAge] = useState("80");
  const [location, setLocation] = useState("all");
  const [commStyle, setCommStyle] = useState("all");

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} style={styles.filterOverlay} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={styles.filterCard}>
          {/* Header */}
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filtrlər</Text>
            <TouchableOpacity onPress={onClose} style={styles.filterCloseBtn}>
              <X size={20} color={Colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.filterScroll}>
            {/* Age Range */}
            <Text style={styles.filterLabel}>Yaş Aralığı</Text>
            <View style={styles.filterAgeRow}>
              <TextInput
                style={styles.filterAgeInput}
                keyboardType="number-pad"
                value={minAge}
                onChangeText={setMinAge}
                placeholderTextColor={Colors.mutedForeground}
              />
              <Text style={styles.filterAgeDash}>-</Text>
              <TextInput
                style={styles.filterAgeInput}
                keyboardType="number-pad"
                value={maxAge}
                onChangeText={setMaxAge}
                placeholderTextColor={Colors.mutedForeground}
              />
            </View>

            {/* Location */}
            <Text style={[styles.filterLabel, { marginTop: 20 }]}>Məkan</Text>
            <View style={styles.filterLocationGrid}>
              <TouchableOpacity
                style={[styles.filterLocBtn, location === "all" && styles.filterLocBtnActive]}
                onPress={() => setLocation("all")}
              >
                <Text style={[styles.filterLocText, location === "all" && styles.filterLocTextActive]}>Hamısı</Text>
              </TouchableOpacity>
              {AZERBAIJAN_REGIONS.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={[styles.filterLocBtn, location === loc && styles.filterLocBtnActive]}
                  onPress={() => setLocation(loc)}
                >
                  <Text style={[styles.filterLocText, location === loc && styles.filterLocTextActive]}>{loc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Communication Style */}
            <Text style={[styles.filterLabel, { marginTop: 20 }]}>Ünsiyyət Üslubu</Text>
            <View style={styles.filterStyleRow}>
              <TouchableOpacity
                style={[styles.filterStyleBtn, commStyle === "all" && styles.filterStyleBtnActive]}
                onPress={() => setCommStyle("all")}
              >
                <Text style={[styles.filterStyleText, commStyle === "all" && styles.filterStyleTextActive]}>Hamısı</Text>
              </TouchableOpacity>
              {COMM_STYLES.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.filterStyleBtn, commStyle === s.key && styles.filterStyleBtnActive]}
                  onPress={() => setCommStyle(s.key)}
                >
                  <Text style={[styles.filterStyleText, commStyle === s.key && styles.filterStyleTextActive]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Apply */}
            <TouchableOpacity style={styles.filterApplyBtn} onPress={onClose}>
              <LinearGradient
                colors={[Colors.brandGradientFrom, Colors.brandGradientTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.filterApplyGradient}
              >
                <Text style={styles.filterApplyText}>Tətbiq Et</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { color: Colors.mutedForeground, marginTop: 12, fontSize: 14 },

  emptyContainer: { flex: 1, backgroundColor: Colors.background },
  emptyContent: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 24, fontWeight: "800", color: Colors.foreground, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: Colors.mutedForeground, textAlign: "center", marginBottom: 24 },
  resetButton: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  resetButtonText: { color: Colors.foreground, fontWeight: "700", fontSize: 15 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.foreground,
  },

  // Main area below header
  mainArea: {
    flex: 1,
    justifyContent: "space-between",
  },

  // Swipe hints - generous padding so labels have breathing room
  swipeHints: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
  },
  swipeHintBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  swipeHintText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "500",
  },

  // Card area - centers the square card, keeps spacing like web
  cardArea: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 12,
  },
  cardSquare: {
    flex: 1,
    width: "100%",
    position: "relative",
  },
  cardContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nextCard: { transform: [{ scale: 0.95 }], opacity: 0.5 },
  cardImage: { width: "100%", height: "100%" },
  cardGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "65%",
  },

  // Compatibility badge - top left, dark blur
  compatBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    zIndex: 20,
  },
  compatText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },

  // Stamps
  stamp: {
    position: "absolute",
    top: 60,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 4,
    borderRadius: 12,
    transform: [{ rotate: "-15deg" }],
    zIndex: 10,
  },
  stampLike: { left: 24, borderColor: "#20D5A0" },
  stampNope: { right: 24, borderColor: "#ef4444", transform: [{ rotate: "15deg" }] },
  stampText: { fontSize: 28, fontWeight: "900", color: "#20D5A0" },

  // Card info
  cardInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  cardName: { fontSize: 26, fontWeight: "800", color: "#fff" },
  verifiedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
  cardLocation: { fontSize: 13, color: "rgba(255,255,255,0.9)" },
  locationDot: { color: "rgba(255,255,255,0.5)", marginHorizontal: 2 },
  viewProfileText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    textDecorationLine: "underline",
  },
  cardBio: { fontSize: 14, color: "rgba(255,255,255,0.65)", marginTop: 6, lineHeight: 20 },

  // Value chips (pink style)
  valuesRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 6 },
  valueChip: {
    backgroundColor: "rgba(233,66,162,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  valueText: { color: "#fff", fontSize: 10, fontWeight: "600" },
  valueChipExtra: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  valueTextExtra: { color: "#fff", fontSize: 10, fontWeight: "500" },

  // Bottom-right card buttons
  cardBottomButtons: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
  },
  cardSmallBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  // Tips banner
  tipsBanner: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  tipsBannerGradient: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(233,66,162,0.2)",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
  },
  tipsText: {
    fontSize: 12,
    color: "rgba(250,250,250,0.8)",
    textAlign: "center",
    lineHeight: 18,
  },

  // Action buttons
  actionsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 10,
    paddingBottom: 14,
  },
  actionGroup: {
    alignItems: "center",
    gap: 4,
  },
  actionBtn: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  actionMedium: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  actionDisabled: {
    opacity: 0.35,
  },
  actionLikeWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
  },
  actionLikeGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  likeBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    zIndex: 10,
  },
  likeBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  actionLabel: {
    fontSize: 10,
    color: Colors.mutedForeground,
  },

  // Match modal
  matchModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  matchModalContent: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: Colors.modalCard,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(233,66,162,0.3)",
    padding: 32,
    alignItems: "center",
  },
  matchEmoji: { fontSize: 56, marginBottom: 12 },
  matchTitle: { fontSize: 26, fontWeight: "900", color: Colors.foreground, marginBottom: 8 },
  matchSubtitle: { fontSize: 15, color: Colors.mutedForeground, textAlign: "center", marginBottom: 20 },
  matchAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 24, borderWidth: 3, borderColor: Colors.primary },
  matchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  matchBtnText: { color: Colors.foreground, fontWeight: "700", fontSize: 16 },
  matchSecondaryBtn: { width: "100%", paddingVertical: 14, alignItems: "center" },
  matchSecondaryBtnText: { color: Colors.mutedForeground, fontSize: 15 },

  // Limit modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: Colors.modalCard,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 28,
    alignItems: "center",
  },
  modalIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: "800", color: Colors.foreground, marginBottom: 12, textAlign: "center" },
  modalText: { fontSize: 14, color: Colors.mutedForeground, textAlign: "center", marginBottom: 24, lineHeight: 20 },
  modalPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  modalPrimaryBtnText: { color: Colors.foreground, fontWeight: "700", fontSize: 16 },
  modalSecondaryBtn: { width: "100%", paddingVertical: 14, alignItems: "center" },
  modalSecondaryBtnText: { color: Colors.mutedForeground, fontSize: 15 },

  // Filter modal
  filterOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  filterCard: {
    width: "100%",
    maxWidth: 340,
    maxHeight: "85%",
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.foreground,
  },
  filterCloseBtn: {
    padding: 4,
  },
  filterScroll: {},
  filterLabel: {
    fontSize: 13,
    color: Colors.mutedForeground,
    marginBottom: 8,
  },
  filterAgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterAgeInput: {
    flex: 1,
    backgroundColor: Colors.muted,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: Colors.foreground,
    textAlign: "center",
    fontSize: 15,
  },
  filterAgeDash: {
    color: Colors.mutedForeground,
    fontSize: 16,
  },
  filterLocationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    maxHeight: 180,
  },
  filterLocBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.muted,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterLocBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterLocText: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  filterLocTextActive: {
    color: "#fff",
  },
  filterStyleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterStyleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.muted,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterStyleBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterStyleText: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  filterStyleTextActive: {
    color: "#fff",
  },
  filterApplyBtn: {
    marginTop: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  filterApplyGradient: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
  },
  filterApplyText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
