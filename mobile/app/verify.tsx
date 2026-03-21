import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Shield, ChevronRight } from "../lib/icons";
import { Colors } from "../lib/colors";

export default function VerifyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={22} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Təsdiq</Text>
        <View style={styles.headerIconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Shield size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Profilinizi təsdiqləyin</Text>
            <Text style={styles.heroSubtitle}>Təsdiqlənmiş profillər 3x daha çox uyğunluq tapır</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Necə işləyir?</Text>
          <Text style={styles.cardBody}>
            Şəxsi məlumatlarınızı qoruyaraq profilinizi təsdiqləmək üçün addımlar təqdim ediləcək.
            Bu ekran minimaldır və sonradan tam flow əlavə ediləcək.
          </Text>
        </View>

        <TouchableOpacity style={styles.actionRow} activeOpacity={0.9}>
          <Text style={styles.actionText}>Təsdiqə başla</Text>
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
    backgroundColor: "rgba(59,130,246,0.10)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.22)",
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
    backgroundColor: "rgba(59,130,246,0.90)",
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
  actionRow: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionText: { color: Colors.foreground, fontSize: 14, fontWeight: "600" },
});

