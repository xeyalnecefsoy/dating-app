import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  FlatList,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { useRouter, Stack } from "expo-router";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Users,
  ShieldCheck,
  LogOut,
  Trash2,
  X,
  User,
  ChevronRight,
  Globe,
  Moon,
  Info,
  HelpCircle,
  FileText,
  Lock,
  Bug,
} from "../lib/icons";
import Constants from "expo-constants";
import { api } from "../lib/api";
import { Colors } from "../lib/colors";

export default function SettingsScreen() {
  const { signOut, userId } = useAuth();
  const router = useRouter();

  const blockedUsers = useQuery(api.blocks.getBlockedUsers);
  const unblockMutation = useMutation(api.blocks.unblockUser);
  const deleteAccountMutation = useMutation(api.users.deleteAccount);

  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notifLikes, setNotifLikes] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifMatches, setNotifMatches] = useState(true);

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

  const handleDeleteAccount = () => {
    Alert.alert(
      "Hesabı sil",
      "Hesabınız birdəfəlik silinəcək. Bu əməliyyat geri qaytarıla bilməz. Əminsiniz?",
      [
        { text: "Ləğv et", style: "cancel" },
        {
          text: "Bəli, sil",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccountMutation();
              await signOut();
              router.replace("/(auth)/sign-in");
            } catch (e: any) {
              Alert.alert("Xəta", e?.message || "Hesab silinə bilmədi");
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const handleUnblock = (blockedId: string) => {
    Alert.alert("Bloku aç", "Bu istifadəçinin blokunu açmaq istəyirsiniz?", [
      { text: "Ləğv et", style: "cancel" },
      {
        text: "Bloku aç",
        onPress: async () => {
          try {
            await unblockMutation({ targetUserId: blockedId });
          } catch (e) {
            /* ignore */
          }
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Parametrlər",
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.foreground,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 8 }}
            >
              <ArrowLeft size={24} color={Colors.foreground} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account Section */}
        <Text style={styles.sectionTitle}>Hesab</Text>
        <View style={styles.section}>
          <SettingsRow
            icon={<User size={20} color={Colors.mutedForeground} />}
            label="Profili redaktə et"
            onPress={() => router.push("/(tabs)/profile")}
          />
          <SettingsRow
            icon={<Users size={20} color={Colors.mutedForeground} />}
            label="Bloklanan istifadəçilər"
            value={blockedUsers ? `${blockedUsers.length}` : "0"}
            onPress={() => setShowBlockedModal(true)}
          />
          <SettingsRow
            icon={<ShieldCheck size={20} color={Colors.mutedForeground} />}
            label="Gizlilik"
          />
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>Bildirişlər</Text>
        <View style={styles.section}>
          <View style={rowStyles.container}>
            <Heart size={20} color={Colors.mutedForeground} />
            <Text style={rowStyles.label}>Bəyənmələr</Text>
            <Switch
              value={notifLikes}
              onValueChange={setNotifLikes}
              trackColor={{
                false: Colors.surfaceDark,
                true: "rgba(233,66,162,0.4)",
              }}
              thumbColor={notifLikes ? Colors.primary : Colors.mutedForeground}
            />
          </View>
          <View style={rowStyles.container}>
            <MessageCircle size={20} color={Colors.mutedForeground} />
            <Text style={rowStyles.label}>Mesajlar</Text>
            <Switch
              value={notifMessages}
              onValueChange={setNotifMessages}
              trackColor={{
                false: Colors.surfaceDark,
                true: "rgba(233,66,162,0.4)",
              }}
              thumbColor={
                notifMessages ? Colors.primary : Colors.mutedForeground
              }
            />
          </View>
          <View style={rowStyles.container}>
            <Users size={20} color={Colors.mutedForeground} />
            <Text style={rowStyles.label}>Uyğunluqlar</Text>
            <Switch
              value={notifMatches}
              onValueChange={setNotifMatches}
              trackColor={{
                false: Colors.surfaceDark,
                true: "rgba(233,66,162,0.4)",
              }}
              thumbColor={
                notifMatches ? Colors.primary : Colors.mutedForeground
              }
            />
          </View>
        </View>

        {/* App Section */}
        <Text style={styles.sectionTitle}>Tətbiq</Text>
        <View style={styles.section}>
          <SettingsRow
            icon={<Globe size={20} color={Colors.mutedForeground} />}
            label="Dil"
            value="Azərbaycan"
          />
          <SettingsRow
            icon={<Moon size={20} color={Colors.mutedForeground} />}
            label="Tema"
            value="Tünd"
          />
          <SettingsRow
            icon={<Info size={20} color={Colors.mutedForeground} />}
            label="Versiya"
            value={Constants.expoConfig?.version || "1.0.0"}
          />
        </View>

        {/* Support Section */}
        <Text style={styles.sectionTitle}>Dəstək</Text>
        <View style={styles.section}>
          <SettingsRow
            icon={<Bug size={20} color={Colors.mutedForeground} />}
            label="Problem / nasazlıq bildir"
            onPress={() => router.push("/feedback" as any)}
          />
          <SettingsRow
            icon={<HelpCircle size={20} color={Colors.mutedForeground} />}
            label="Kömək"
          />
          <SettingsRow
            icon={<FileText size={20} color={Colors.mutedForeground} />}
            label="Qaydalar və şərtlər"
          />
          <SettingsRow
            icon={<Lock size={20} color={Colors.mutedForeground} />}
            label="Gizlilik siyasəti"
          />
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color={Colors.primary} />
          <Text style={styles.signOutText}>Hesabdan çıxış</Text>
        </TouchableOpacity>

        {/* Delete account */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color={Colors.destructive} />
          ) : (
            <>
              <Trash2 size={20} color={Colors.destructive} />
              <Text style={styles.deleteText}>Hesabı sil</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>Danyeri © 2026</Text>
      </ScrollView>

      {/* Blocked users modal */}
      <Modal visible={showBlockedModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bloklanan istifadəçilər</Text>
              <TouchableOpacity onPress={() => setShowBlockedModal(false)}>
                <X size={28} color={Colors.foreground} />
              </TouchableOpacity>
            </View>
            {!blockedUsers || blockedUsers.length === 0 ? (
              <View style={styles.emptyBlocked}>
                <Text style={styles.emptyBlockedText}>
                  Bloklanan istifadəçi yoxdur
                </Text>
              </View>
            ) : (
              <FlatList
                data={blockedUsers}
                keyExtractor={(item: any) => item._id || item.blockedId}
                renderItem={({ item }: { item: any }) => (
                  <View style={styles.blockedRow}>
                    {item.avatar ? (
                      <Image
                        source={{ uri: item.avatar }}
                        style={styles.blockedAvatar}
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.blockedAvatar,
                          {
                            backgroundColor: Colors.surfaceDark,
                            justifyContent: "center",
                            alignItems: "center",
                          },
                        ]}
                      >
                        <User size={20} color={Colors.mutedForeground} />
                      </View>
                    )}
                    <Text style={styles.blockedName}>
                      {item.name || "İstifadəçi"}
                    </Text>
                    <TouchableOpacity
                      style={styles.unblockBtn}
                      onPress={() => handleUnblock(item.clerkId || item._id)}
                    >
                      <Text style={styles.unblockBtnText}>Bloku aç</Text>
                    </TouchableOpacity>
                  </View>
                )}
                style={{ maxHeight: 400 }}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ReactNode;
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
      {icon}
      <Text style={rowStyles.label}>{label}</Text>
      {value ? <Text style={rowStyles.value}>{value}</Text> : null}
      {onPress ? (
        <ChevronRight size={16} color={Colors.mutedForeground} />
      ) : null}
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
  label: {
    color: Colors.mutedForeground,
    fontSize: 15,
    flex: 1,
    marginLeft: 14,
  },
  value: { color: Colors.mutedForeground, fontSize: 13, marginRight: 4 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    color: Colors.mutedForeground,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 8,
  },
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
    backgroundColor: Colors.primaryAlpha10,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(233,66,162,0.2)",
    marginTop: 32,
  },
  signOutText: { color: Colors.primary, fontWeight: "700", fontSize: 15 },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,68,68,0.08)",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,68,68,0.15)",
    marginTop: 12,
  },
  deleteText: { color: Colors.destructive, fontWeight: "700", fontSize: 15 },
  footer: {
    color: Colors.mutedForeground,
    textAlign: "center",
    marginTop: 24,
    fontSize: 12,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: Colors.foreground },
  emptyBlocked: { padding: 40, alignItems: "center" },
  emptyBlockedText: { color: Colors.mutedForeground, fontSize: 14 },
  blockedRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  blockedAvatar: { width: 40, height: 40, borderRadius: 20 },
  blockedName: {
    flex: 1,
    color: Colors.foreground,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 12,
  },
  unblockBtn: {
    backgroundColor: Colors.primaryAlpha15,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  unblockBtnText: { color: Colors.primary, fontSize: 13, fontWeight: "600" },
});
