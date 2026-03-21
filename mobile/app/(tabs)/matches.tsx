import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "../../lib/api";
import { useRouter } from "expo-router";
import { User, CheckCircle2, MessageCircle } from "../../lib/icons";
import { Colors } from "../../lib/colors";

export default function MatchesScreen() {
  const { userId } = useAuth();
  const router = useRouter();

  const currentUser = useQuery(api.users.getUser, userId ? { clerkId: userId } : "skip");
  const convexMatches = useQuery(api.matches.list, userId ? { userId } : "skip");

  const matchedUserIds = useMemo(() => {
    if (!convexMatches) return [];
    return convexMatches.map((id: any) => String(id));
  }, [convexMatches]);

  const matchedUsers = useQuery(
    api.users.getUsersByIds,
    matchedUserIds.length > 0 ? { ids: matchedUserIds } : "skip"
  );

  const matches = useMemo(() => {
    if (!matchedUsers) return [];
    return matchedUsers.map((u: any) => ({
      id: u.clerkId || u._id,
      name: u.name,
      age: u.age || 25,
      location: u.location || "Bakı",
      avatar: u.avatar || "",
      username: u.username,
      isVerified: u.role === "admin" || u.role === "superadmin" || u.isVerified,
    }));
  }, [matchedUsers]);

  if (!currentUser || convexMatches === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>💜</Text>
        <Text style={styles.emptyTitle}>Hələ uyğunluq yoxdur</Text>
        <Text style={styles.emptySubtitle}>
          Kəşf etməyə davam edin — tezliklə uyğunluqlar tapacaqsınız!
        </Text>
        <TouchableOpacity style={styles.discoverBtn} onPress={() => router.push("/(tabs)/discovery")}>
          <Text style={styles.discoverBtnText}>Kəşf et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderMatch = ({ item, index }: { item: typeof matches[0]; index: number }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => router.push(`/user/${item.username || item.id}` as any)}
      activeOpacity={0.8}
    >
      {item.avatar ? (
        <Image
          source={{ uri: item.avatar }}
          style={styles.matchImage}
          contentFit="cover"
          placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
          transition={200}
          recyclingKey={item.id}
        />
      ) : (
        <View style={[styles.matchImage, styles.matchImagePlaceholder]}>
          <User size={48} color={Colors.mutedForeground} />
        </View>
      )}
      <View style={styles.matchGradient} />
      <View style={styles.matchInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.matchName}>{item.name}, {item.age}</Text>
          {item.isVerified && <CheckCircle2 size={14} color={Colors.green} />}
        </View>
        <Text style={styles.matchLocation}>📍 {item.location}</Text>
      </View>
      <TouchableOpacity
        style={styles.messageBtn}
        onPress={() => router.push(`/chat/${item.id}` as any)}
      >
        <MessageCircle size={16} color={Colors.foreground} />
        <Text style={styles.messageBtnText}>Mesaj</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 12 },
  row: { justifyContent: "space-between", marginBottom: 12 },
  matchCard: {
    width: "48%",
    aspectRatio: 0.75,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.card,
  },
  matchImage: { width: "100%", height: "100%" },
  matchImagePlaceholder: {
    backgroundColor: Colors.surfaceDark,
    justifyContent: "center",
    alignItems: "center",
  },
  matchGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  matchInfo: {
    position: "absolute",
    bottom: 50,
    left: 12,
    right: 12,
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  matchName: { fontSize: 16, fontWeight: "800", color: Colors.foreground },
  matchLocation: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  messageBtn: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  messageBtnText: { color: Colors.foreground, fontWeight: "600", fontSize: 13 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32, backgroundColor: Colors.background },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: "800", color: Colors.foreground, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: Colors.mutedForeground, textAlign: "center", marginBottom: 24 },
  discoverBtn: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  discoverBtnText: { color: Colors.foreground, fontWeight: "700", fontSize: 15 },
});
