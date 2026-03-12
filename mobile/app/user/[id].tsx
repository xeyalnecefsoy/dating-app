import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Try to find by username first, fallback to clerkId
  const userByUsername = useQuery(api.users.getByUsername, id ? { username: id } : "skip");
  const userByClerkId = useQuery(
    api.users.getUser,
    id && !userByUsername ? { clerkId: id } : "skip"
  );
  const user = userByUsername || userByClerkId;

  if (user === undefined) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e94057" />
        </View>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.notFoundText}>İstifadəçi tapılmadı</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Geri qayıt</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: user.name || "",
          headerStyle: { backgroundColor: "#1a1a2e" },
          headerTintColor: "#fff",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Hero image */}
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.heroImage} contentFit="cover" />
        ) : (
          <View style={[styles.heroImage, { backgroundColor: "#333", justifyContent: "center", alignItems: "center" }]}>
            <Text style={{ fontSize: 64, color: "#555" }}>👤</Text>
          </View>
        )}

        {/* Name */}
        <View style={styles.nameSection}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.name}, {user.age || "?"}</Text>
            {(user.isVerified || user.role === "admin" || user.role === "superadmin") && (
              <Ionicons name="checkmark-circle" size={22} color="#20D5A0" />
            )}
          </View>
          {user.username && <Text style={styles.username}>@{user.username}</Text>}
          <Text style={styles.location}>📍 {user.location || "Azərbaycan"}</Text>
        </View>

        {/* Bio */}
        {user.bio ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Haqqında</Text>
            <Text style={styles.cardText}>{user.bio}</Text>
          </View>
        ) : null}

        {/* Interests */}
        {user.interests && user.interests.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Maraqlar</Text>
            <View style={styles.chipsRow}>
              {user.interests.map((interest: string, i: number) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Values */}
        {user.values && user.values.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Dəyərlər</Text>
            <View style={styles.chipsRow}>
              {user.values.map((v: string, i: number) => (
                <View key={i} style={[styles.chip, { backgroundColor: "rgba(59,130,246,0.15)" }]}>
                  <Text style={[styles.chipText, { color: "#60a5fa" }]}>{v}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Info */}
        <View style={styles.card}>
          {user.loveLanguage ? (
            <View style={styles.infoRow}>
              <Ionicons name="heart" size={16} color="#e94057" />
              <Text style={styles.infoLabel}>Sevgi dili</Text>
              <Text style={styles.infoValue}>{user.loveLanguage}</Text>
            </View>
          ) : null}
          {user.communicationStyle ? (
            <View style={styles.infoRow}>
              <Ionicons name="chatbubble" size={16} color="#e94057" />
              <Text style={styles.infoLabel}>Ünsiyyət tərzi</Text>
              <Text style={styles.infoValue}>{user.communicationStyle}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  scrollContent: { paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: "#1a1a2e", justifyContent: "center", alignItems: "center" },
  notFoundText: { color: "#888", fontSize: 16 },
  backBtn: { marginTop: 16, backgroundColor: "#e94057", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  backBtnText: { color: "#fff", fontWeight: "600" },
  heroImage: { width: "100%", height: 400 },
  nameSection: { padding: 20 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 28, fontWeight: "800", color: "#fff" },
  username: { color: "#e94057", fontWeight: "600", fontSize: 14, marginTop: 4 },
  location: { color: "#888", fontSize: 14, marginTop: 6 },
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardLabel: { color: "#888", fontSize: 12, fontWeight: "700", textTransform: "uppercase", marginBottom: 8 },
  cardText: { color: "#ccc", fontSize: 14, lineHeight: 22 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "rgba(233,64,87,0.15)", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16 },
  chipText: { color: "#e94057", fontSize: 13, fontWeight: "600" },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  infoLabel: { color: "#888", fontSize: 13, marginLeft: 10, flex: 1 },
  infoValue: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
