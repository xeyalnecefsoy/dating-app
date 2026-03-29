import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { Redirect } from "expo-router";
import { api } from "../lib/api";
import { Colors } from "../lib/colors";

const GUIDELINES_URL = "https://www.danyeri.az/icma-qaydalari";

export default function RejectedScreen() {
  const { isLoaded, isSignedIn, userId, signOut } = useAuth();
  const dbUser = useQuery(api.users.getUser, userId ? { clerkId: userId } : "skip");

  if (!isLoaded) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>…</Text>
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (dbUser === undefined) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>Yüklənir…</Text>
      </View>
    );
  }

  if (dbUser && dbUser.status !== "rejected") {
    return <Redirect href="/" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Müraciət təsdiqlənmədi</Text>
      <Text style={styles.subtitle}>
        Hazırda profiliniz platformaya qəbul edilmədi. İcma qaydalarına uyğun profil və şəkil tələb olunur.
      </Text>
      {dbUser?.profileModerationNote ? (
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>{dbUser.profileModerationNote}</Text>
        </View>
      ) : null}
      <TouchableOpacity style={styles.secondaryBtn} onPress={() => Linking.openURL(GUIDELINES_URL)}>
        <Text style={styles.secondaryBtnText}>İcma qaydaları</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.primaryBtn} onPress={() => signOut()}>
        <Text style={styles.primaryBtnText}>Hesabdan çıx</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingTop: 48,
    alignItems: "center",
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  muted: { color: Colors.mutedForeground },
  title: { color: Colors.foreground, fontSize: 22, fontWeight: "800", textAlign: "center" },
  subtitle: {
    color: Colors.mutedForeground,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
  noteBox: {
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
    width: "100%",
  },
  noteText: { color: Colors.mutedForeground, fontSize: 14, lineHeight: 20 },
  secondaryBtn: {
    marginTop: 24,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
  },
  secondaryBtnText: { color: Colors.foreground, fontWeight: "700" },
  primaryBtn: {
    marginTop: 12,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },
});
