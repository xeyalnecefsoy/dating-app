import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { signOut, userId } = useAuth();
  const { user: clerkUser } = useUser();
  const router = useRouter();

  const dbUser = useQuery(api.users.getUser, userId ? { clerkId: userId } : "skip");

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/sign-in");
  };

  const user = dbUser;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {user?.name?.[0]?.toUpperCase() || "?"}
            </Text>
          </View>
        )}
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{user?.name || "İstifadəçi"}</Text>
          {(user?.isVerified || user?.role === "superadmin" || user?.role === "admin") && (
            <Ionicons name="checkmark-circle" size={20} color="#20D5A0" />
          )}
        </View>
        {user?.username && (
          <Text style={styles.username}>@{user.username}</Text>
        )}
        <Text style={styles.email}>
          {clerkUser?.emailAddresses?.[0]?.emailAddress || ""}
        </Text>
      </View>

      {/* Info cards */}
      <View style={styles.infoCard}>
        <InfoRow icon="location" label="Məkan" value={user?.location || "—"} />
        <InfoRow icon="calendar" label="Yaş" value={user?.age ? `${user.age}` : "—"} />
        <InfoRow icon="male-female" label="Cinsiyyət" value={user?.gender === "male" ? "Kişi" : user?.gender === "female" ? "Qadın" : "—"} />
        <InfoRow icon="heart" label="Sevgi dili" value={user?.loveLanguage || "—"} />
        <InfoRow icon="chatbubble" label="Ünsiyyət tərzi" value={user?.communicationStyle || "—"} />
      </View>

      {/* Bio */}
      {user?.bio ? (
        <View style={styles.bioCard}>
          <Text style={styles.bioLabel}>Haqqında</Text>
          <Text style={styles.bioText}>{user.bio}</Text>
        </View>
      ) : null}

      {/* Interests */}
      {user?.interests && user.interests.length > 0 ? (
        <View style={styles.bioCard}>
          <Text style={styles.bioLabel}>Maraqlar</Text>
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
      {user?.values && user.values.length > 0 ? (
        <View style={styles.bioCard}>
          <Text style={styles.bioLabel}>Dəyərlər</Text>
          <View style={styles.chipsRow}>
            {user.values.map((value: string, i: number) => (
              <View key={i} style={[styles.chip, styles.valueChip]}>
                <Text style={[styles.chipText, styles.valueChipText]}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionRow} onPress={() => router.push("/settings" as any)}>
          <Ionicons name="settings-outline" size={22} color="#aaa" />
          <Text style={styles.actionText}>Parametrlər</Text>
          <Ionicons name="chevron-forward" size={18} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#e94057" />
          <Text style={styles.signOutText}>Çıxış</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon as any} size={18} color="#e94057" />
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  label: { color: "#888", fontSize: 13, marginLeft: 12, flex: 1 },
  value: { color: "#fff", fontSize: 14, fontWeight: "600" },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#333" },
  avatarPlaceholder: { justifyContent: "center", alignItems: "center", backgroundColor: "#e94057" },
  avatarInitial: { fontSize: 40, fontWeight: "800", color: "#fff" },
  nameContainer: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
  name: { fontSize: 24, fontWeight: "800", color: "#fff" },
  username: { fontSize: 14, color: "#e94057", fontWeight: "600", marginTop: 2 },
  email: { fontSize: 13, color: "#666", marginTop: 4 },
  infoCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 16,
  },
  bioCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 16,
  },
  bioLabel: { color: "#888", fontSize: 12, fontWeight: "700", textTransform: "uppercase", marginBottom: 8 },
  bioText: { color: "#ccc", fontSize: 14, lineHeight: 22 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "rgba(233,64,87,0.15)", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16 },
  chipText: { color: "#e94057", fontSize: 13, fontWeight: "600" },
  valueChip: { backgroundColor: "rgba(59,130,246,0.15)" },
  valueChipText: { color: "#60a5fa" },
  actionsSection: { marginTop: 8 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  actionText: { color: "#ccc", fontSize: 15, fontWeight: "500", flex: 1, marginLeft: 12 },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(233,64,87,0.1)",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(233,64,87,0.2)",
  },
  signOutText: { color: "#e94057", fontWeight: "600", fontSize: 15 },
});
