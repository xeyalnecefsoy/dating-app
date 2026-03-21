import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "../lib/api";
import { Stack, useRouter } from "expo-router";
import { CheckCircle2, ChevronRight, ArrowLeft, Crown } from "../lib/icons";
import { Colors } from "../lib/colors";

export default function LikesScreen() {
  const { userId } = useAuth();
  const router = useRouter();

  const currentUser = useQuery(api.users.getUser, userId ? { clerkId: userId } : "skip");
  const likes = useQuery(api.likes.getWhoLikedMe, userId ? { userId } : "skip");
  const isPremium = currentUser?.isPremium === true;

  const likesList = useMemo(() => {
    if (!likes) return [];
    return likes.map((u: any) => ({
      id: u.id,
      name: u.name,
      age: u.age || 25,
      avatar: u.avatar || "",
      username: u.username,
      isVerified: u.isVerified,
      type: u.type || "like",
    }));
  }, [likes]);

  if (likes === undefined || currentUser === undefined) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: "Bəyənmələr", headerStyle: { backgroundColor: Colors.background }, headerTintColor: Colors.foreground }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </>
    );
  }

  const renderLike = ({ item, index }: { item: typeof likesList[0]; index: number }) => {
    const isBlurred = !isPremium && index > 0;

    return (
      <TouchableOpacity
        style={styles.likeRow}
        onPress={() => {
          if (isBlurred) return;
          router.push(`/user/${item.username || item.id}` as any);
        }}
        activeOpacity={isBlurred ? 1 : 0.6}
      >
        <View style={styles.avatarWrap}>
          <Image
            source={{ uri: item.avatar }}
            style={styles.avatar}
            contentFit="cover"
            blurRadius={isBlurred ? 20 : 0}
          />
        </View>
        <View style={styles.likeInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.likeName, isBlurred && styles.blurredText]}>
              {isBlurred ? "••••••" : `${item.name}, ${item.age}`}
            </Text>
            {!isBlurred && item.isVerified && <CheckCircle2 size={14} color={Colors.green} />}
          </View>
          <Text style={styles.likeType}>
            {item.type === "super" ? "⭐ Super bəyənmə" : "❤️ Bəyəndi"}
          </Text>
        </View>
        {!isBlurred && <ChevronRight size={18} color={Colors.mutedForeground} />}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: `Bəyənmələr (${likesList.length})`,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.foreground,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8 }}>
              <ArrowLeft size={24} color={Colors.foreground} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        {likesList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💜</Text>
            <Text style={styles.emptyTitle}>Hələ bəyənmə yoxdur</Text>
            <Text style={styles.emptySubtitle}>Profili daha cəlbedici etmək üçün şəkillərinizi yeniləyin</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={likesList}
              renderItem={renderLike}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            {!isPremium && likesList.length > 1 && (
              <View style={styles.premiumBanner}>
                <View style={styles.premiumBannerContent}>
                  <Crown size={28} color={Colors.premium} />
                  <View style={styles.premiumBannerInfo}>
                    <Text style={styles.premiumBannerTitle}>
                      {likesList.length - 1} nəfər sizi bəyənib
                    </Text>
                    <Text style={styles.premiumBannerSubtitle}>
                      Kimin bəyəndiyini görmək üçün Premium alın
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.premiumBannerBtn}
                  onPress={() => {
                    const base = process.env.EXPO_PUBLIC_WEB_APP_URL || "https://danyeri.az";
                    Linking.openURL(`${base.replace(/\/$/, "")}/premium`).catch(() => {});
                  }}
                >
                  <Crown size={18} color={Colors.foreground} style={{ marginRight: 6 }} />
                  <Text style={styles.premiumBannerBtnText}>Premium Al</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16 },
  likeRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  avatarWrap: { overflow: "hidden", borderRadius: 28 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.surfaceDark },
  likeInfo: { flex: 1, marginLeft: 14 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  likeName: { fontSize: 16, fontWeight: "700", color: Colors.foreground },
  blurredText: { color: Colors.mutedForeground },
  likeType: { fontSize: 13, color: Colors.mutedForeground, marginTop: 3 },
  separator: { height: 1, backgroundColor: "rgba(255,255,255,0.05)" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: Colors.foreground, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: Colors.mutedForeground, textAlign: "center" },
  premiumBanner: {
    backgroundColor: "rgba(251,191,36,0.08)",
    borderTopWidth: 1,
    borderTopColor: "rgba(251,191,36,0.15)",
    padding: 20,
    paddingBottom: 36,
  },
  premiumBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  premiumBannerInfo: { flex: 1, marginLeft: 14 },
  premiumBannerTitle: { color: Colors.premium, fontSize: 16, fontWeight: "700" },
  premiumBannerSubtitle: { color: Colors.mutedForeground, fontSize: 13, marginTop: 2 },
  premiumBannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  premiumBannerBtnText: { color: Colors.foreground, fontWeight: "700", fontSize: 16 },
});
