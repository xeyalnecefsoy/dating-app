import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
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
  isVerified: boolean;
  username?: string;
};

export default function DiscoveryScreen() {
  const { userId } = useAuth();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Convex queries
  const currentUser = useQuery(api.users.getUser, userId ? { clerkId: userId } : "skip");
  const convexUsers = useQuery(
    api.users.getActiveUsers,
    currentUser ? {
      currentUserGender: currentUser.gender || "male",
      currentUserId: userId || "",
    } : "skip"
  );

  // Mutations
  const recordLike = useMutation(api.likes.recordLike);

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
      isVerified: u.role === "admin" || u.role === "superadmin" || u.isVerified,
      username: u.username,
    }));
  }, [convexUsers]);

  const currentProfile = users[currentIndex];
  const nextProfile = users[currentIndex + 1];

  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, users.length));
    translateX.value = 0;
    translateY.value = 0;
  }, [users.length]);

  const handleLike = useCallback(async () => {
    if (!currentProfile || !userId) return;
    try {
      await recordLike({ likerId: userId, likedId: currentProfile.id, type: "like" });
    } catch (e) { /* ignore */ }
    goNext();
  }, [currentProfile, userId, recordLike, goNext]);

  const handlePass = useCallback(() => {
    goNext();
  }, [goNext]);

  const handleSuperLike = useCallback(async () => {
    if (!currentProfile || !userId) return;
    try {
      await recordLike({ likerId: userId, likedId: currentProfile.id, type: "super" });
    } catch (e) { /* ignore */ }
    goNext();
  }, [currentProfile, userId, recordLike, goNext]);

  // Gesture handler
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

  // Loading
  if (!currentUser || convexUsers === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e94057" />
        <Text style={styles.loadingText}>Profillər yüklənir...</Text>
      </View>
    );
  }

  // No more profiles
  if (!currentProfile || currentIndex >= users.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🔍</Text>
        <Text style={styles.emptyTitle}>Profillər bitdi</Text>
        <Text style={styles.emptySubtitle}>
          Yeni istifadəçilər gözləyin və ya filtrləri dəyişdirin
        </Text>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => setCurrentIndex(0)}
        >
          <Text style={styles.resetButtonText}>Yenidən başla</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Next card (behind) */}
      {nextProfile && (
        <View style={[styles.cardContainer, styles.nextCard]}>
          <Image source={{ uri: nextProfile.avatar }} style={styles.cardImage} contentFit="cover" />
          <View style={styles.cardGradient} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{nextProfile.name}, {nextProfile.age}</Text>
            <Text style={styles.cardLocation}>📍 {nextProfile.location}</Text>
          </View>
        </View>
      )}

      {/* Current card (swipeable) */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.cardContainer, cardStyle]}>
          <Image source={{ uri: currentProfile.avatar }} style={styles.cardImage} contentFit="cover" />
          <View style={styles.cardGradient} />

          {/* LIKE stamp */}
          <Animated.View style={[styles.stamp, styles.stampLike, likeOpacity]}>
            <Text style={styles.stampText}>BƏYƏNDİM</Text>
          </Animated.View>

          {/* NOPE stamp */}
          <Animated.View style={[styles.stamp, styles.stampNope, nopeOpacity]}>
            <Text style={[styles.stampText, { color: "#e94057" }]}>KEÇ</Text>
          </Animated.View>

          {/* Card info */}
          <View style={styles.cardInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.cardName}>{currentProfile.name}, {currentProfile.age}</Text>
              {currentProfile.isVerified && (
                <Ionicons name="checkmark-circle" size={20} color="#20D5A0" />
              )}
            </View>
            <Text style={styles.cardLocation}>📍 {currentProfile.location}</Text>
            {currentProfile.bio ? (
              <Text style={styles.cardBio} numberOfLines={2}>{currentProfile.bio}</Text>
            ) : null}
            {currentProfile.interests.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.interestsRow}>
                {currentProfile.interests.slice(0, 5).map((interest, i) => (
                  <View key={i} style={styles.interestChip}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.actionPass]} onPress={handlePass}>
          <Ionicons name="close" size={30} color="#f97316" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.actionSuperLike]} onPress={handleSuperLike}>
          <Ionicons name="star" size={26} color="#3b82f6" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.actionLike]} onPress={handleLike}>
          <Ionicons name="heart" size={30} color="#4ade80" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e", alignItems: "center", justifyContent: "center" },
  loadingContainer: { flex: 1, backgroundColor: "#1a1a2e", justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#888", marginTop: 12, fontSize: 14 },
  emptyContainer: { flex: 1, backgroundColor: "#1a1a2e", justifyContent: "center", alignItems: "center", padding: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 24, fontWeight: "800", color: "#fff", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: "#888", textAlign: "center", marginBottom: 24 },
  resetButton: { backgroundColor: "#e94057", paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  resetButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cardContainer: {
    position: "absolute",
    width: SCREEN_WIDTH - 32,
    height: SCREEN_HEIGHT * 0.62,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#222",
  },
  nextCard: { transform: [{ scale: 0.95 }], opacity: 0.7 },
  cardImage: { width: "100%", height: "100%" },
  cardGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "transparent",
    // Simulated gradient with overlaying views
  },
  stamp: {
    position: "absolute",
    top: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 4,
    borderRadius: 12,
    transform: [{ rotate: "-15deg" }],
    zIndex: 10,
  },
  stampLike: { left: 24, borderColor: "#4ade80" },
  stampNope: { right: 24, borderColor: "#e94057", transform: [{ rotate: "15deg" }] },
  stampText: { fontSize: 28, fontWeight: "900", color: "#4ade80" },
  cardInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardName: { fontSize: 26, fontWeight: "800", color: "#fff" },
  cardLocation: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  cardBio: { fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 6 },
  interestsRow: { marginTop: 8 },
  interestChip: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
  },
  interestText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  actionsRow: {
    position: "absolute",
    bottom: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  actionPass: { borderColor: "#f97316", backgroundColor: "rgba(249,115,22,0.1)" },
  actionSuperLike: { width: 50, height: 50, borderRadius: 25, borderColor: "#3b82f6", backgroundColor: "rgba(59,130,246,0.1)" },
  actionLike: { borderColor: "#4ade80", backgroundColor: "rgba(74,222,128,0.1)" },
});
