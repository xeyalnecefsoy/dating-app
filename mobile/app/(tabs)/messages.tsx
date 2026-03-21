import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../lib/api";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Heart,
  Mail,
  MessageCircle,
  ChevronRight,
  User,
  CheckCircle2,
  Search as SearchIcon,
  X,
} from "../../lib/icons";
import { Colors } from "../../lib/colors";
import { StoriesBar } from "../../components/stories";

type ListItem =
  | { type: "general"; id: string; name: string; subtitle: string; unread: boolean }
  | {
      type: "match";
      id: string;
      name: string;
      avatar?: string;
      username?: string;
      isVerified: boolean;
      subtitle: string;
      unread: boolean;
    }
  ;

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  const convData = useQuery(api.messages.listConversations, userId ? {} : "skip");

  const generalItem = useMemo<ListItem>(() => {
    return {
      type: "general",
      id: "general",
      name: "Söhbətgah",
      subtitle: convData?.general?.lastBody ?? "Hər kəs üçün açıq söhbət",
      unread: convData?.general?.unread ?? false,
    };
  }, [convData?.general?.lastBody, convData?.general?.unread]);

  const matchItems = useMemo((): Array<Extract<ListItem, { type: "match" }>> => {
    if (!convData?.acceptedMatches) return [];
    return convData.acceptedMatches.map((m: any) => ({
      type: "match" as const,
      id: m.partnerId,
      name: m.name,
      avatar: m.avatar,
      username: m.username,
      isVerified: m.isVerified,
      subtitle: m.lastBody,
      unread: m.unread,
    }));
  }, [convData?.acceptedMatches]);

  const filteredMatchItems = useMemo(() => {
    if (!searchQuery.trim()) return matchItems;
    const q = searchQuery.trim().toLowerCase();
    return matchItems.filter((item) => {
      const name = item.name.toLowerCase();
      const username = (item.username ?? "").toLowerCase();
      return name.includes(q) || username.includes(q);
    });
  }, [matchItems, searchQuery]);

  if (convData === undefined) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === "general") {
      return (
        <TouchableOpacity
          style={styles.generalRowTouchable}
          onPress={() => router.push("/chat/general" as any)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["rgba(233,66,162,0.07)", "rgba(253,38,122,0.04)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.generalRowBg}
          >
            <LinearGradient
              colors={["#ec4899", "#e11d48"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.generalIconWrap}
            >
              <MessageCircle size={28} color={Colors.foreground} />
            </LinearGradient>

            <View style={styles.convInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.convName}>{item.name}</Text>
                {item.unread && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.subtitle}
              </Text>
            </View>

            <View style={styles.generalRightWrap}>
              <Text style={styles.generalRightLabel}>İndi</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.conversationRow}
        onPress={() => router.push(`/chat/${item.id}` as any)}
      >
        <View style={styles.avatarWrap}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: Colors.surfaceDark,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <User size={24} color={Colors.mutedForeground} />
            </View>
          )}
        </View>
        <View style={styles.convInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.convName}>{item.name}</Text>
            {item.isVerified && <CheckCircle2 size={16} color={Colors.green} />}
            {item.unread && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.subtitle}
          </Text>
        </View>
        <ChevronRight size={20} color={Colors.mutedForeground} />
      </TouchableOpacity>
    );
  };

  const requestsCount =
    (convData?.incomingRequests?.length ?? 0) + (convData?.sentRequests?.length ?? 0);
  const hasAcceptedMatches = (convData?.acceptedMatches?.length ?? 0) > 0;
  const showEmptyState = !hasAcceptedMatches && !searchQuery.trim();

  const listData: ListItem[] = [generalItem, ...filteredMatchItems];
  const showNoResults = hasAcceptedMatches && filteredMatchItems.length === 0 && !!searchQuery.trim();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.push("/(tabs)/home" as any)}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={Colors.foreground} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap} pointerEvents="none">
          <Text style={styles.headerTitle}>Mesajlar</Text>
        </View>

        <TouchableOpacity
          style={[styles.headerIconBtn, styles.headerMailBtn]}
          onPress={() => setShowRequestsModal(true)}
          activeOpacity={0.8}
        >
          <Mail size={20} color={Colors.foreground} />
          {requestsCount > 0 && (
            <View style={styles.requestsBadge}>
              <Text style={styles.requestsBadgeText}>
                {requestsCount > 99 ? "99+" : String(requestsCount)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.searchWrap}>
        <SearchIcon size={18} color={Colors.mutedForeground} />
        <TextInput
          style={styles.searchInput}
          placeholder="Mesajları axtar"
          placeholderTextColor={Colors.mutedForeground}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <X size={18} color={Colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      <StoriesBar />

      {showEmptyState ? (
        <View style={styles.listContentOuter}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Mesajlar</Text>
          </View>
          <View style={styles.listInner}>
            {renderItem({ item: generalItem })}
            <View style={styles.emptyMatchesWrap}>
              <View style={styles.emptyIconCircle}>
                <Heart size={32} color={Colors.mutedForeground} />
              </View>
              <Text style={styles.emptyMatchesTitle}>Hələ uyğunluq yoxdur</Text>
              <Text style={styles.emptyMatchesSubtitle}>
                Uyğunluq tapmaq üçün kartları sürüşdürməyə başlayın!
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/(tabs)/discovery" as any)}
                style={styles.ctaBtnWrap}
              >
                <LinearGradient
                    colors={[Colors.brandGradientFrom, Colors.brandGradientTo]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaBtn}
                >
                  <Text style={styles.ctaBtnText}>Kəşf Etməyə Başla</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : showNoResults ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Nəticə tapılmadı</Text>
          <Text style={styles.emptySubtitle}>Axtarışınızı dəyişin və yenidən yoxlayın</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: 24 + 72 + insets.bottom }]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <RequestsModal
        visible={showRequestsModal}
        onClose={() => setShowRequestsModal(false)}
        incoming={convData?.incomingRequests ?? []}
        sent={convData?.sentRequests ?? []}
      />
    </View>
  );
}

function RequestsModal({
  visible,
  onClose,
  incoming,
  sent,
}: {
  visible: boolean;
  onClose: () => void;
  incoming: Array<{ id: string; name: string; avatar?: string; username?: string; isVerified: boolean }>;
  sent: Array<{ id: string; name: string; avatar?: string; username?: string; isVerified: boolean }>;
}) {
  const { userId } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"incoming" | "sent">("incoming");

  const acceptRequest = useMutation(api.matches.acceptRequest);
  const declineRequest = useMutation(api.matches.declineRequest);
  const cancelRequest = useMutation(api.matches.cancelRequest);

  const handleAccept = async (targetId: string) => {
    if (!userId) return;
    try {
      await acceptRequest({ userId, targetId });
      onClose();
      router.push(`/chat/${targetId}` as any);
    } catch (_) {}
  };

  const handleDecline = async (targetId: string) => {
    if (!userId) return;
    try {
      await declineRequest({ userId, targetId });
    } catch (_) {}
  };

  const handleCancel = async (receiverId: string) => {
    if (!userId) return;
    try {
      await cancelRequest({ senderId: userId, receiverId });
    } catch (_) {}
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={onClose}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={styles.modalCard}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mesaj İstəkləri</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <X size={22} color={Colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalTabs}>
            <TouchableOpacity
              style={[styles.modalTab, tab === "incoming" && styles.modalTabActive]}
              onPress={() => setTab("incoming")}
            >
              <Text style={[styles.modalTabText, tab === "incoming" && styles.modalTabTextActive]}>
                Gələn İstəklər ({incoming.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalTab, tab === "sent" && styles.modalTabActive]}
              onPress={() => setTab("sent")}
            >
              <Text style={[styles.modalTabText, tab === "sent" && styles.modalTabTextActive]}>
                Göndərilmiş ({sent.length})
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {tab === "incoming" &&
              (incoming.length === 0 ? (
                <Text style={styles.modalEmpty}>Gələn istəyiniz yoxdur</Text>
              ) : (
                incoming.map((u) => (
                  <View key={u.id} style={styles.requestRow}>
                    {u.avatar ? (
                      <Image source={{ uri: u.avatar }} style={styles.requestAvatar} contentFit="cover" />
                    ) : (
                      <View style={[styles.requestAvatar, styles.requestAvatarPlaceholder]}>
                        <User size={22} color={Colors.mutedForeground} />
                      </View>
                    )}
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestName}>{u.name}</Text>
                      {u.username ? (
                        <Text style={styles.requestUsername}>@{u.username}</Text>
                      ) : null}
                    </View>
                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        style={[styles.requestBtn, styles.requestBtnDecline]}
                        onPress={() => handleDecline(u.id)}
                      >
                        <Text style={styles.requestBtnDeclineText}>Rədd</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.requestBtn, styles.requestBtnAccept]}
                        onPress={() => handleAccept(u.id)}
                      >
                        <Text style={styles.requestBtnAcceptText}>Qəbul</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ))}
            {tab === "sent" &&
              (sent.length === 0 ? (
                <Text style={styles.modalEmpty}>Göndərilmiş istəyiniz yoxdur</Text>
              ) : (
                sent.map((u) => (
                  <View key={u.id} style={styles.requestRow}>
                    {u.avatar ? (
                      <Image source={{ uri: u.avatar }} style={styles.requestAvatar} contentFit="cover" />
                    ) : (
                      <View style={[styles.requestAvatar, styles.requestAvatarPlaceholder]}>
                        <User size={22} color={Colors.mutedForeground} />
                      </View>
                    )}
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestName}>{u.name}</Text>
                      {u.username ? (
                        <Text style={styles.requestUsername}>@{u.username}</Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      style={[styles.requestBtn, styles.requestBtnCancel]}
                      onPress={() => handleCancel(u.id)}
                    >
                      <Text style={styles.requestBtnCancelText}>Ləğv et</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ))}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerMailBtn: {
    borderWidth: 1,
    borderColor: "rgba(20,22,40,0.65)",
    backgroundColor: "rgba(8,10,26,0.35)",
  },
  headerTitleWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.foreground,
  },
  requestsBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  requestsBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(8,10,26,0.9)",
    borderWidth: 1,
    borderColor: "rgba(20,22,40,0.85)",
    borderRadius: 999,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    color: Colors.foreground,
    fontSize: 14,
    paddingVertical: 10,
    marginLeft: 8,
  },
  listContent: { padding: 16 },
  listContentOuter: { flex: 1 },
  listInner: { paddingHorizontal: 16 },
  sectionRow: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8 },
  sectionTitle: { color: Colors.mutedForeground, fontSize: 12, fontWeight: "700" },
  conversationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  generalRowTouchable: { marginBottom: 8 },
  generalRowBg: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(233,66,162,0.12)",
    overflow: "hidden",
  },
  generalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#e942a2",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceDark,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginLeft: 8,
  },
  convInfo: { flex: 1, marginLeft: 14, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  convName: { fontSize: 16, fontWeight: "700", color: Colors.foreground },
  lastMessage: { fontSize: 13, color: Colors.mutedForeground, marginTop: 3 },
  generalRightWrap: { alignItems: "flex-end", justifyContent: "flex-start", paddingLeft: 10 },
  generalRightLabel: { color: Colors.mutedForeground, fontSize: 12, fontWeight: "600" },
  separator: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginLeft: 74 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: { fontSize: 22, fontWeight: "800", color: Colors.foreground, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: Colors.mutedForeground, textAlign: "center" },
  emptyMatchesWrap: {
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 48,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyMatchesTitle: {
    color: Colors.foreground,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptyMatchesSubtitle: {
    color: Colors.mutedForeground,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  ctaBtnWrap: { alignSelf: "center" },
  ctaBtn: {
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  ctaBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: Colors.foreground },
  modalCloseBtn: { padding: 4 },
  modalTabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  modalTabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  modalTabText: { fontSize: 14, color: Colors.mutedForeground },
  modalTabTextActive: { color: Colors.primary, fontWeight: "600" },
  modalScroll: { maxHeight: 360, padding: 12 },
  modalEmpty: {
    padding: 24,
    textAlign: "center",
    color: Colors.mutedForeground,
    fontSize: 14,
  },
  requestRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  requestAvatar: { width: 44, height: 44, borderRadius: 22 },
  requestAvatarPlaceholder: {
    backgroundColor: Colors.surfaceDark,
    justifyContent: "center",
    alignItems: "center",
  },
  requestInfo: { flex: 1, marginLeft: 12 },
  requestName: { fontSize: 16, fontWeight: "600", color: Colors.foreground },
  requestUsername: { fontSize: 12, color: Colors.mutedForeground, marginTop: 2 },
  requestActions: { flexDirection: "row", gap: 8 },
  requestBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  requestBtnAccept: { backgroundColor: Colors.primary },
  requestBtnAcceptText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  requestBtnDecline: { backgroundColor: Colors.surfaceDark },
  requestBtnDeclineText: { color: Colors.mutedForeground, fontSize: 13 },
  requestBtnCancel: { backgroundColor: Colors.surfaceDark },
  requestBtnCancelText: { color: Colors.mutedForeground, fontSize: 13 },
});
