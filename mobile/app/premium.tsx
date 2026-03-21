import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "../lib/api";
import { ArrowLeft, Crown, ChevronRight } from "../lib/icons";
import { Colors } from "../lib/colors";

export default function PremiumScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const user = useQuery(api.users.getUser, userId ? { clerkId: userId } : "skip");

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={22} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium</Text>
        <View style={styles.headerIconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Crown size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Premium-a keçin</Text>
            <Text style={styles.heroSubtitle}>Limitsiz bəyənmə, Super Like və daha çox</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status</Text>
          <Text style={styles.cardBody}>
            {user?.isPremium ? "Premium aktivdir" : "Premium aktiv deyil"}
            {user?.premiumPlan ? ` (${user.premiumPlan})` : ""}
          </Text>
        </View>

        <TouchableOpacity style={styles.planRow} activeOpacity={0.9}>
          <Text style={styles.planText}>Planları gör</Text>
          <ChevronRight size={18} color={Colors.mutedForeground} />
        </TouchableOpacity>
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
  heroCard: {
    backgroundColor: "rgba(245,158,11,0.10)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.22)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(245,158,11,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: { color: Colors.foreground, fontSize: 16, fontWeight: "800" },
  heroSubtitle: { color: Colors.mutedForeground, fontSize: 13, marginTop: 2 },
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { color: Colors.foreground, fontSize: 14, fontWeight: "700", marginBottom: 6 },
  cardBody: { color: Colors.mutedForeground, fontSize: 13, lineHeight: 20 },
  planRow: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planText: { color: Colors.foreground, fontSize: 14, fontWeight: "600" },
});

