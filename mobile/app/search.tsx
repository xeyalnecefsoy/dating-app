import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
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

export default function SearchScreen() {
  const { userId } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const searchResults = useQuery(
    api.users.searchUsers,
    query.length >= 2 ? { query, currentUserId: userId || "" } : "skip"
  );

  const results = useMemo(() => {
    if (!searchResults) return [];
    return searchResults.map((u: any) => ({
      id: u.clerkId || u._id,
      name: u.name,
      age: u.age || 25,
      avatar: u.avatar || "",
      username: u.username,
      location: u.location || "",
      isVerified: u.role === "admin" || u.role === "superadmin" || u.isVerified,
    }));
  }, [searchResults]);

  const renderUser = ({ item }: { item: typeof results[0] }) => (
    <TouchableOpacity
      style={styles.userRow}
      onPress={() => router.push(`/user/${item.username || item.id}` as any)}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} contentFit="cover" />
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>{item.name}, {item.age}</Text>
          {item.isVerified && <Ionicons name="checkmark-circle" size={14} color="#20D5A0" />}
        </View>
        {item.username && <Text style={styles.userUsername}>@{item.username}</Text>}
        {item.location ? <Text style={styles.userLocation}>📍 {item.location}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#555" />
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Axtar",
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
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Ad və ya istifadəçi adı ilə axtar..."
            placeholderTextColor="#666"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {query.length < 2 ? (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>Ən azı 2 simvol yazın</Text>
          </View>
        ) : searchResults === undefined ? (
          <View style={styles.hintContainer}>
            <ActivityIndicator color="#e94057" />
          </View>
        ) : results.length === 0 ? (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>Nəticə tapılmadı</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            renderItem={renderUser}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 12, marginLeft: 10 },
  listContent: { paddingHorizontal: 16 },
  userRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#333" },
  userInfo: { flex: 1, marginLeft: 14 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  userName: { fontSize: 16, fontWeight: "700", color: "#fff" },
  userUsername: { color: "#e94057", fontSize: 13, marginTop: 2 },
  userLocation: { color: "#888", fontSize: 12, marginTop: 2 },
  separator: { height: 1, backgroundColor: "rgba(255,255,255,0.05)" },
  hintContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  hintText: { color: "#666", fontSize: 14 },
});
