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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function MessagesScreen() {
  const { userId } = useAuth();
  const router = useRouter();

  const currentUser = useQuery(api.users.getUser, userId ? { clerkId: userId } : "skip");
  const matchIds = currentUser?.matches || [];

  // Get all matches from Convex
  const convexMatches = useQuery(api.matches.list, userId ? { userId } : "skip");
  const matchedUserIds = useMemo(() => {
    if (!convexMatches) return [];
    return convexMatches.map((id: any) => String(id));
  }, [convexMatches]);

  // Get user details for matched users
  const matchedUsers = useQuery(
    api.users.getUsersByIds,
    matchedUserIds.length > 0 ? { ids: matchedUserIds } : "skip"
  );

  const conversations = useMemo(() => {
    if (!matchedUsers) return [];
    return matchedUsers.map((u: any) => ({
      id: u.clerkId || u._id,
      name: u.name,
      avatar: u.avatar || "",
      username: u.username,
      isVerified: u.role === "admin" || u.role === "superadmin" || u.isVerified,
    }));
  }, [matchedUsers]);

  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e94057" />
      </View>
    );
  }

  const renderConversation = ({ item }: { item: typeof conversations[0] }) => (
    <TouchableOpacity
      style={styles.conversationRow}
      onPress={() => router.push(`/chat/${item.id}` as any)}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} contentFit="cover" />
      <View style={styles.convInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.convName}>{item.name}</Text>
          {item.isVerified && <Ionicons name="checkmark-circle" size={16} color="#20D5A0" />}
        </View>
        <Text style={styles.lastMessage}>Mesaj yazmaq üçün toxunun</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#555" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>Hələ mesaj yoxdur</Text>
          <Text style={styles.emptySubtitle}>
            Uyğunluq tapdıqdan sonra burada söhbət edə biləcəksiniz
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  loadingContainer: { flex: 1, backgroundColor: "#1a1a2e", justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16 },
  conversationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#333" },
  convInfo: { flex: 1, marginLeft: 14 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  convName: { fontSize: 16, fontWeight: "700", color: "#fff" },
  lastMessage: { fontSize: 13, color: "#888", marginTop: 3 },
  separator: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginLeft: 74 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: "#888", textAlign: "center" },
});
