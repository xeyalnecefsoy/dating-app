import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { Redirect } from "expo-router";
import { api } from "../lib/api";
import { Colors } from "../lib/colors";

export default function WaitlistScreen() {
  const { isLoaded, isSignedIn, userId, signOut } = useAuth();
  const dbUser = useQuery(api.users.getUser, userId ? { clerkId: userId } : "skip");
  const queuePosition = useQuery(api.users.getQueuePosition, userId ? { clerkId: userId } : "skip");

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (dbUser === undefined || queuePosition === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!dbUser) {
    return <Redirect href="/onboarding" />;
  }

  if (dbUser.status !== "waitlist") {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⏳</Text>
      <Text style={styles.title}>Waitlist-dəsən</Text>
      <Text style={styles.subtitle}>
        Profilin uğurla yaradıldı. Aktivləşəndə tətbiqə tam giriş açılacaq.
      </Text>

      <View style={styles.positionCard}>
        <Text style={styles.positionLabel}>Növbədə yerin</Text>
        <Text style={styles.positionValue}>{queuePosition || "-"}</Text>
      </View>

      <Text style={styles.helper}>Status dəyişən kimi avtomatik giriş veriləcək.</Text>

      <TouchableOpacity style={styles.signOutBtn} onPress={() => signOut()}>
        <Text style={styles.signOutText}>Hesabdan çıx</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: "center", alignItems: "center" },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { color: Colors.foreground, fontSize: 28, fontWeight: "800" },
  subtitle: { color: Colors.mutedForeground, textAlign: "center", marginTop: 10, lineHeight: 22 },
  positionCard: {
    marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    minWidth: 180,
  },
  positionLabel: { color: Colors.mutedForeground, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.8 },
  positionValue: { color: Colors.foreground, fontSize: 40, fontWeight: "900", marginTop: 4 },
  helper: { color: Colors.mutedForeground, marginTop: 18, fontSize: 12, textAlign: "center" },
  signOutBtn: {
    marginTop: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(233,66,162,0.35)",
    backgroundColor: "rgba(233,66,162,0.12)",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  signOutText: { color: Colors.primary, fontWeight: "700" },
});
