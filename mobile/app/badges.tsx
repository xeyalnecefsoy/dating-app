import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "../lib/api";
import { ArrowLeft, Award } from "../lib/icons";
import { Colors } from "../lib/colors";

export default function BadgesScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const user = useQuery(api.users.getUser, userId ? { clerkId: userId } : "skip");

  const badges = useMemo(() => (user?.badges ?? []) as string[], [user?.badges]);

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={22} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nişanlar</Text>
        <View style={styles.headerIconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {badges.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Award size={26} color={Colors.mutedForeground} />
            </View>
            <Text style={styles.emptyTitle}>Hələ nişan yoxdur</Text>
            <Text style={styles.emptySubtitle}>Nişan qazanmaq üçün tətbiqi istifadə etməyə başlayın!</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {badges.map((b) => (
              <View key={b} style={styles.card}>
                <View style={styles.badgeIcon}>
                  <Award size={18} color={Colors.foreground} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{b}</Text>
                  <Text style={styles.cardBody}>Qazanıldı</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerIconBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  headerTitle: { color: Colors.foreground, fontSize: 18, fontWeight: "700" },
  content: { padding: 16, paddingBottom: 40 },
  empty: { paddingTop: 32, alignItems: "center" },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: { color: Colors.foreground, fontSize: 16, fontWeight: "700", marginBottom: 4 },
  emptySubtitle: { color: Colors.mutedForeground, fontSize: 13, textAlign: "center", paddingHorizontal: 20, lineHeight: 18 },
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { color: Colors.foreground, fontSize: 14, fontWeight: "700" },
  cardBody: { color: Colors.mutedForeground, fontSize: 12, marginTop: 2 },
});

