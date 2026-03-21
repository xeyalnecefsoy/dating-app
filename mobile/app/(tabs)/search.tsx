import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
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
  SlidersHorizontal,
  Search as SearchIcon,
  X,
  Heart,
  MapPin,
} from "../../lib/icons";
import { Colors } from "../../lib/colors";
import { AZERBAIJAN_REGIONS } from "../../lib/locations";
import { translateInterest } from "../../lib/translations";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - CARD_GAP) / 2;

type CardUser = {
  id: string;
  name: string;
  age: number;
  avatar: string;
  username?: string;
  location: string;
  interests: string[];
  isVerified: boolean;
};

const COMM_STYLES = [
  { key: "Direct", label: "Birbaşa" },
  { key: "Empathetic", label: "Empatik" },
  { key: "Analytical", label: "Analitik" },
  { key: "Playful", label: "Oyunbaz" },
];

export default function SearchTabScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minAge: 18,
    maxAge: 50,
    location: "all",
    communicationStyle: "all",
  });

  const currentUser = useQuery(api.users.getUser, userId ? { clerkId: userId } : "skip");
  const dbUsers = useQuery(
    api.users.searchUsersFiltered,
    userId
      ? {
          currentUserId: userId,
          minAge: filters.minAge,
          maxAge: filters.maxAge,
          location: filters.location === "all" ? undefined : filters.location,
          communicationStyle: filters.communicationStyle === "all" ? undefined : filters.communicationStyle,
          // Only filter by gender when user has set lookingFor; otherwise show all (opposite + same) so results appear
          lookingFor:
            currentUser?.lookingFor && String(currentUser.lookingFor).trim()
              ? currentUser.lookingFor
              : undefined,
        }
      : "skip"
  );
  const likedIds = useQuery(api.likes.getLikedUserIds, userId ? { userId } : "skip");
  const likeMutation = useMutation(api.likes.like);

  const likedSet = useMemo(() => new Set(likedIds || []), [likedIds]);

  const allUsers: CardUser[] = useMemo(() => {
    if (!dbUsers) return [];
    return dbUsers.map((u: any) => ({
      id: u.clerkId || u._id,
      name: u.name || "User",
      age: u.age || 25,
      avatar: u.avatar || "",
      username: u.username,
      location: u.location || "Bakı",
      interests: u.interests || [],
      isVerified: u.role === "admin" || u.role === "superadmin" || !!u.isVerified,
    }));
  }, [dbUsers]);

  const availableUsers = useMemo(() => {
    if (!searchQuery.trim()) return allUsers;
    const q = searchQuery.trim().toLowerCase();
    return allUsers.filter((u) => u.name.toLowerCase().includes(q));
  }, [allUsers, searchQuery]);

  const handleLike = async (likedId: string) => {
    if (!userId) return;
    try {
      await likeMutation({ likerId: userId, likedId, type: "like" });
    } catch (_) {}
  };

  const renderCard = ({ item }: { item: CardUser }) => {
    const isLiked = likedSet.has(item.id);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => router.push(`/user/${item.username || item.id}` as any)}
      >
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.cardImage} contentFit="cover" />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <Text style={styles.cardPlaceholderText}>{item.name?.[0]?.toUpperCase() || "?"}</Text>
          </View>
        )}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.cardGradient}
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}, {item.age}
          </Text>
          <View style={styles.cardLocationRow}>
            <MapPin size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.cardLocation} numberOfLines={1}>{item.location}</Text>
          </View>
          {item.interests.length > 0 && (
            <View style={styles.cardTags}>
              {item.interests.slice(0, 2).map((inte, i) => (
                <View key={i} style={styles.cardTag}>
                  <Text style={styles.cardTagText} numberOfLines={1}>
                    {translateInterest(inte, "az")}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={(e) => {
            e.stopPropagation();
            handleLike(item.id);
          }}
        >
          <Heart
            size={18}
            color="#fff"
            fill={isLiked ? "#fff" : "transparent"}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Axtarış</Text>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => setShowFilters(true)}>
          <SlidersHorizontal size={20} color={Colors.foreground} />
        </TouchableOpacity>
      </View>

      <View style={styles.main}>
        {/* Search bar */}
        <View style={styles.searchWrap}>
          <SearchIcon size={18} color={Colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Adla axtar..."
            placeholderTextColor={Colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={18} color={Colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {dbUsers === undefined ? (
          <View style={styles.skeletonGrid}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={styles.skeletonCard} />
            ))}
          </View>
        ) : availableUsers.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>İstifadəçi tapılmadı</Text>
          </View>
        ) : (
          <FlatList
            data={availableUsers}
            renderItem={renderCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={[styles.gridContent, { paddingBottom: 24 + 72 + insets.bottom }]}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => setShowFilters(false)}
      />
    </View>
  );
}

function FilterModal({
  visible,
  filters,
  onFiltersChange,
  onClose,
}: {
  visible: boolean;
  filters: { minAge: number; maxAge: number; location: string; communicationStyle: string };
  onFiltersChange: (f: typeof filters) => void;
  onClose: () => void;
}) {
  const [minAge, setMinAge] = useState(String(filters.minAge));
  const [maxAge, setMaxAge] = useState(String(filters.maxAge));
  const [location, setLocation] = useState(filters.location);
  const [commStyle, setCommStyle] = useState(filters.communicationStyle);

  React.useEffect(() => {
    setMinAge(String(filters.minAge));
    setMaxAge(String(filters.maxAge));
    setLocation(filters.location);
    setCommStyle(filters.communicationStyle);
  }, [filters, visible]);

  const handleApply = () => {
    const min = Math.max(18, parseInt(minAge, 10) || 18);
    const max = Math.max(18, parseInt(maxAge, 10) || 50);
    onFiltersChange({
      minAge: min,
      maxAge: max,
      location,
      communicationStyle: commStyle,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} style={styles.filterOverlay} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={styles.filterCard}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filtrlər</Text>
            <TouchableOpacity onPress={onClose} style={styles.filterCloseBtn}>
              <X size={20} color={Colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.filterScroll}>
            <Text style={styles.filterLabel}>Yaş Aralığı</Text>
            <View style={styles.filterAgeRow}>
              <TextInput
                style={styles.filterAgeInput}
                keyboardType="number-pad"
                value={minAge}
                onChangeText={setMinAge}
                placeholderTextColor={Colors.mutedForeground}
              />
              <Text style={styles.filterAgeDash}>-</Text>
              <TextInput
                style={styles.filterAgeInput}
                keyboardType="number-pad"
                value={maxAge}
                onChangeText={setMaxAge}
                placeholderTextColor={Colors.mutedForeground}
              />
            </View>

            <Text style={[styles.filterLabel, { marginTop: 20 }]}>Məkan</Text>
            <View style={styles.filterLocationGrid}>
              <TouchableOpacity
                style={[styles.filterLocBtn, location === "all" && styles.filterLocBtnActive]}
                onPress={() => setLocation("all")}
              >
                <Text style={[styles.filterLocText, location === "all" && styles.filterLocTextActive]}>Hamısı</Text>
              </TouchableOpacity>
              {AZERBAIJAN_REGIONS.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={[styles.filterLocBtn, location === loc && styles.filterLocBtnActive]}
                  onPress={() => setLocation(loc)}
                >
                  <Text style={[styles.filterLocText, location === loc && styles.filterLocTextActive]}>{loc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.filterLabel, { marginTop: 20 }]}>Ünsiyyət Üslubu</Text>
            <View style={styles.filterStyleRow}>
              <TouchableOpacity
                style={[styles.filterStyleBtn, commStyle === "all" && styles.filterStyleBtnActive]}
                onPress={() => setCommStyle("all")}
              >
                <Text style={[styles.filterStyleText, commStyle === "all" && styles.filterStyleTextActive]}>Hamısı</Text>
              </TouchableOpacity>
              {COMM_STYLES.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.filterStyleBtn, commStyle === s.key && styles.filterStyleBtnActive]}
                  onPress={() => setCommStyle(s.key)}
                >
                  <Text style={[styles.filterStyleText, commStyle === s.key && styles.filterStyleTextActive]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.filterApplyBtn} onPress={handleApply}>
              <LinearGradient
                colors={[Colors.brandGradientFrom, Colors.brandGradientTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.filterApplyGradient}
              >
                <Text style={styles.filterApplyText}>Tətbiq Et</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.foreground,
  },
  main: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 24,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: Colors.foreground,
    fontSize: 14,
    paddingVertical: 12,
    marginLeft: 8,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
  },
  skeletonCard: {
    width: CARD_WIDTH,
    aspectRatio: 3 / 4,
    borderRadius: 16,
    backgroundColor: Colors.muted,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: Colors.mutedForeground,
  },
  gridContent: {
    paddingBottom: 24,
  },
  gridRow: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardImagePlaceholder: {
    backgroundColor: Colors.surfaceDark,
    justifyContent: "center",
    alignItems: "center",
  },
  cardPlaceholderText: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.mutedForeground,
  },
  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "65%",
  },
  cardContent: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  cardLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  cardLocation: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    flex: 1,
  },
  cardTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 6,
  },
  cardTag: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardTagText: {
    fontSize: 9,
    color: "#fff",
    maxWidth: 60,
  },
  heartBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  filterCard: {
    width: "100%",
    maxWidth: 340,
    maxHeight: "85%",
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.foreground,
  },
  filterCloseBtn: { padding: 4 },
  filterScroll: {},
  filterLabel: {
    fontSize: 13,
    color: Colors.mutedForeground,
    marginBottom: 8,
  },
  filterAgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterAgeInput: {
    flex: 1,
    backgroundColor: Colors.muted,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: Colors.foreground,
    textAlign: "center",
    fontSize: 15,
  },
  filterAgeDash: { color: Colors.mutedForeground, fontSize: 16 },
  filterLocationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    maxHeight: 180,
  },
  filterLocBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.muted,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterLocBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterLocText: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  filterLocTextActive: { color: "#fff" },
  filterStyleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterStyleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.muted,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterStyleBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterStyleText: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  filterStyleTextActive: { color: "#fff" },
  filterApplyBtn: {
    marginTop: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  filterApplyGradient: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
  },
  filterApplyText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
