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
import { api } from "@/convex/_generated/api";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function LikesScreen() {
  const { userId } = useAuth();
  const router = useRouter();

  const likes = useQuery(api.likes.getLikesReceived, userId ? { userId } : "skip");

  const likerIds = useMemo(() => {
    if (!likes) return [];
    return likes.map((l: any) => l.likerId);
  }, [likes]);

  const likers = useQuery(
    api.users.getUsersByIds,
    likerIds.length > 0 ? { ids: likerIds } : "skip"
  );

  const likesList = useMemo(() => {
    if (!likers || !likes) return [];
    return likers.map((u: any) => {
      const like = likes.find((l: any) => l.likerId === (u.clerkId || u._id));
      return {
        id: u.clerkId || u._id,
        name: u.name,
        age: u.age || 25,
        avatar: u.avatar || "",
        username: u.username,
        isVerified: u.role === "admin" || u.role === "superadmin" || u.isVerified,
        type: like?.type || "like",
        createdAt: like?.createdAt,
      };
    });
  }, [likers, likes]);

  if (likes === undefined) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: "Bəyənmələr", headerStyle: { backgroundColor: "#1a1a2e" }, headerTintColor: "#fff" }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e94057" />
        </View>
      </>
    );
  }

  const renderLike = ({ item }: { item: typeof likesList[0] }) => (
    <TouchableOpacity
      style={styles.likeRow}
      onPress={() => router.push(`/user/${item.username || item.id}` as any)}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} contentFit="cover" />
      <View style={styles.likeInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.likeName}>{item.name}, {item.age}</Text>
          {item.isVerified && <Ionicons name="checkmark-circle" size={14} color="#20D5A0" />}
        </View>
        <Text style={styles.likeType}>
          {item.type === "super" ? "⭐ Super bəyənmə" : "❤️ Bəyəndi"}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#555" />
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Bəyənmələr",
          headerStyle: { backgroundColor: "#1a1a2e" },
          headerTintColor: "#fff",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
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
          <FlatList
            data={likesList}
            renderItem={renderLike}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  loadingContainer: { flex: 1, backgroundColor: "#1a1a2e", justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16 },
  likeRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#333" },
  likeInfo: { flex: 1, marginLeft: 14 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  likeName: { fontSize: 16, fontWeight: "700", color: "#fff" },
  likeType: { fontSize: 13, color: "#888", marginTop: 3 },
  separator: { height: 1, backgroundColor: "rgba(255,255,255,0.05)" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: "#fff", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: "#888", textAlign: "center" },
});
