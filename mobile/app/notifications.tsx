import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function NotificationsScreen() {
  const { userId } = useAuth();
  const router = useRouter();

  const notifications = useQuery(api.notifications.getEnriched);
  const markRead = useMutation(api.notifications.markAsRead);

  if (notifications === undefined) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: "Bildirişlər", headerStyle: { backgroundColor: "#1a1a2e" }, headerTintColor: "#fff" }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e94057" />
        </View>
      </>
    );
  }

  const handlePress = async (notif: any) => {
    if (!notif.read) {
      try { await markRead({ notificationId: notif._id }); } catch {}
    }
    if (notif.data?.matchId || notif.type === "match") {
      router.push("/(tabs)/matches");
    } else if (notif.type === "message") {
      router.push(`/chat/${notif.data?.fromUserId}` as any);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "match": return { name: "heart", color: "#e94057" };
      case "message": return { name: "chatbubble", color: "#3b82f6" };
      case "like": return { name: "star", color: "#f59e0b" };
      default: return { name: "notifications", color: "#888" };
    }
  };

  const renderNotification = ({ item }: { item: any }) => {
    const icon = getIcon(item.type);
    return (
      <TouchableOpacity
        style={[styles.notifRow, !item.read && styles.unread]}
        onPress={() => handlePress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${icon.color}20` }]}>
          <Ionicons name={icon.name as any} size={20} color={icon.color} />
        </View>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.notifTime}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString("az-AZ") : ""}
          </Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Bildirişlər",
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
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyTitle}>Bildiriş yoxdur</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item._id}
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
  notifRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 4 },
  unread: { backgroundColor: "rgba(233,64,87,0.05)", borderRadius: 12, paddingHorizontal: 8 },
  iconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  notifContent: { flex: 1, marginLeft: 14 },
  notifTitle: { fontSize: 15, fontWeight: "700", color: "#fff" },
  notifBody: { fontSize: 13, color: "#888", marginTop: 2 },
  notifTime: { fontSize: 11, color: "#555", marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#e94057" },
  separator: { height: 1, backgroundColor: "rgba(255,255,255,0.05)" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: "#888", fontSize: 16 },
});
