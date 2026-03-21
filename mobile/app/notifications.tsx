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
import { api } from "../lib/api";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Heart, MessageCircle, Star, Bell, AlertCircle, Ban, Award } from "../lib/icons";
import { Colors } from "../lib/colors";

export default function NotificationsScreen() {
  const { userId } = useAuth();
  const router = useRouter();

  const notifications = useQuery(api.notifications.getEnriched);
  const markRead = useMutation(api.notifications.markAsRead);

  if (notifications === undefined) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: "Bildirişlər", headerStyle: { backgroundColor: Colors.background }, headerTintColor: Colors.foreground }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
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

  const getIcon = (type: string): { color: string; Icon: React.ComponentType<{ size: number; color: string }> } => {
    switch (type) {
      case "match": return { color: Colors.primary, Icon: Heart };
      case "message": return { color: Colors.infoBlue, Icon: MessageCircle };
      case "like": return { color: Colors.warningOrange, Icon: Star };
      case "mod_rejected": return { color: Colors.destructive, Icon: Ban };
      case "mod_deleted": return { color: Colors.destructive, Icon: AlertCircle };
      case "system_alert": return { color: Colors.warningOrange, Icon: AlertCircle };
      case "badge": return { color: "#f59e0b", Icon: Award };
      default: return { color: Colors.mutedForeground, Icon: Bell };
    }
  };

  const renderNotification = ({ item }: { item: any }) => {
    const { color, Icon } = getIcon(item.type);
    return (
      <TouchableOpacity
        style={[styles.notifRow, !item.read && styles.unread]}
        onPress={() => handlePress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Icon size={20} color={color} />
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
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16 },
  notifRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 4 },
  unread: { backgroundColor: "rgba(233,66,162,0.05)", borderRadius: 12, paddingHorizontal: 8 },
  iconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  notifContent: { flex: 1, marginLeft: 14 },
  notifTitle: { fontSize: 15, fontWeight: "700", color: Colors.foreground },
  notifBody: { fontSize: 13, color: Colors.mutedForeground, marginTop: 2 },
  notifTime: { fontSize: 11, color: Colors.mutedForeground, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  separator: { height: 1, backgroundColor: "rgba(255,255,255,0.05)" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: Colors.mutedForeground, fontSize: 16 },
});
