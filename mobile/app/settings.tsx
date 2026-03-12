import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    Alert.alert("Çıxış", "Hesabınızdan çıxmaq istədiyinizə əminsiniz?", [
      { text: "Ləğv et", style: "cancel" },
      {
        text: "Çıxış",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Parametrlər",
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
        {/* Account Section */}
        <Text style={styles.sectionTitle}>Hesab</Text>
        <View style={styles.section}>
          <SettingsRow icon="person-outline" label="Profili redaktə et" onPress={() => router.push("/(tabs)/profile")} />
          <SettingsRow icon="notifications-outline" label="Bildirişlər" onPress={() => router.push("/notifications")} />
          <SettingsRow icon="shield-outline" label="Gizlilik" />
        </View>

        {/* App Section */}
        <Text style={styles.sectionTitle}>Tətbiq</Text>
        <View style={styles.section}>
          <SettingsRow icon="globe-outline" label="Dil" value="Azərbaycan" />
          <SettingsRow icon="moon-outline" label="Tema" value="Tünd" />
          <SettingsRow icon="information-circle-outline" label="Versiya" value={Constants.expoConfig?.version || "1.0.0"} />
        </View>

        {/* Support Section */}
        <Text style={styles.sectionTitle}>Dəstək</Text>
        <View style={styles.section}>
          <SettingsRow icon="help-circle-outline" label="Kömək" />
          <SettingsRow icon="document-text-outline" label="Qaydalar və şərtlər" />
          <SettingsRow icon="lock-closed-outline" label="Gizlilik siyasəti" />
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#e94057" />
          <Text style={styles.signOutText}>Hesabdan çıxış</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Danyeri © 2026</Text>
      </ScrollView>
    </>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={rowStyles.container}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <Ionicons name={icon as any} size={20} color="#aaa" />
      <Text style={rowStyles.label}>{label}</Text>
      {value ? <Text style={rowStyles.value}>{value}</Text> : null}
      {onPress ? <Ionicons name="chevron-forward" size={16} color="#555" /> : null}
    </TouchableOpacity>
  );
}

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  label: { color: "#ccc", fontSize: 15, flex: 1, marginLeft: 14 },
  value: { color: "#888", fontSize: 13, marginRight: 4 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: { color: "#888", fontSize: 12, fontWeight: "700", textTransform: "uppercase", marginTop: 24, marginBottom: 8 },
  section: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(233,64,87,0.1)",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(233,64,87,0.2)",
    marginTop: 32,
  },
  signOutText: { color: "#e94057", fontWeight: "700", fontSize: 15 },
  footer: { color: "#555", textAlign: "center", marginTop: 24, fontSize: 12 },
});
