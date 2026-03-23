import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../lib/api";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Pencil,
  Camera,
  CheckCircle2,
  Crown,
  Shield,
  Flame,
  Sparkles,
  Plus,
  X,
  ChevronRight,
  Settings,
  Award,
  Heart,
  LogOut,
  Check,
  MapPin,
  Calendar,
  User,
  MessageCircle,
} from "../../lib/icons";
import {
  AVAILABLE_VALUES,
  AVAILABLE_INTERESTS,
  LOVE_LANGUAGES,
  COMM_STYLES,
} from "../../lib/constants";
import { translateLoveLanguage, translateStyle } from "../../lib/translations";
import { Colors } from "../../lib/colors";
import { getBadgeById, getBadgeIcon } from "../../lib/badges";

export default function ProfileScreen() {
  const { signOut, userId } = useAuth();
  const { user: clerkUser } = useUser();
  const router = useRouter();

  const dbUser = useQuery(
    api.users.getUser,
    userId ? { clerkId: userId } : "skip",
  );
  const updateUser = useMutation(api.users.createOrUpdateUser);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getUrlFromStorageId = useMutation(api.files.getUrlFromStorageId);

  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingInterests, setIsEditingInterests] = useState(false);

  const [saving, setSaving] = useState<
    null | "header" | "bio" | "details" | "interests"
  >(null);

  const [tempName, setTempName] = useState("");
  const [tempLocation, setTempLocation] = useState("");
  const [bioText, setBioText] = useState("");

  const [tempValues, setTempValues] = useState<string[]>([]);
  const [tempInterests, setTempInterests] = useState<string[]>([]);
  const [tempLoveLanguage, setTempLoveLanguage] = useState("");
  const [tempCommStyle, setTempCommStyle] = useState("");

  const [showEditModal, setShowEditModal] = useState<
    "values" | "interests" | "loveLanguage" | "commStyle" | null
  >(null);

  useEffect(() => {
    if (!dbUser) return;
    setTempName(dbUser.name || "");
    setTempLocation(dbUser.location || "");
    setBioText(dbUser.bio || "");
    setTempValues(dbUser.values || []);
    setTempInterests(dbUser.interests || []);
    setTempLoveLanguage(dbUser.loveLanguage || "");
    setTempCommStyle(dbUser.communicationStyle || "");
  }, [dbUser?._id]);

  const savePartial = async (
    patch: Partial<{
      name: string;
      location: string;
      bio: string;
      values: string[];
      interests: string[];
      loveLanguage: string;
      communicationStyle: string;
    }>,
  ) => {
    if (!userId || !dbUser) return;
    await updateUser({
      clerkId: userId,
      name: (patch.name ?? dbUser.name ?? "").trim() || "İstifadəçi",
      location: (patch.location ?? dbUser.location ?? "").trim(),
      bio: (patch.bio ?? dbUser.bio ?? "").trim(),
      values: patch.values ?? dbUser.values ?? [],
      interests: patch.interests ?? dbUser.interests ?? [],
      loveLanguage: patch.loveLanguage ?? dbUser.loveLanguage ?? "",
      communicationStyle:
        patch.communicationStyle ?? dbUser.communicationStyle ?? undefined,
      gender: dbUser.gender,
      age: dbUser.age,
      lookingFor: dbUser.lookingFor,
      avatar: dbUser.avatar,
      username: dbUser.username,
      role: dbUser.role,
      isVerified: dbUser.isVerified,
      isPremium: dbUser.isPremium,
      premiumPlan: dbUser.premiumPlan,
      premiumExpiresAt: dbUser.premiumExpiresAt,
      badges: dbUser.badges,
    } as any);
  };

  const handleSaveHeader = async () => {
    if (!dbUser) return;
    setSaving("header");
    try {
      await savePartial({ name: tempName, location: tempLocation });
      setIsEditingHeader(false);
    } catch (e: any) {
      Alert.alert("Xəta", e?.message || "Məlumat saxlanmadı");
    } finally {
      setSaving(null);
    }
  };

  const handleSaveBio = async () => {
    if (!dbUser) return;
    setSaving("bio");
    try {
      await savePartial({ bio: bioText });
      setIsEditingBio(false);
    } catch (e: any) {
      Alert.alert("Xəta", e?.message || "Bio saxlanmadı");
    } finally {
      setSaving(null);
    }
  };

  const handleSaveDetails = async () => {
    if (!dbUser) return;
    setSaving("details");
    try {
      await savePartial({
        values: tempValues,
        loveLanguage: tempLoveLanguage,
        communicationStyle: tempCommStyle,
      });
      setIsEditingDetails(false);
    } catch (e: any) {
      Alert.alert("Xəta", e?.message || "Dəyişiklik saxlanmadı");
    } finally {
      setSaving(null);
    }
  };

  const handleSaveInterests = async () => {
    if (!dbUser) return;
    setSaving("interests");
    try {
      await savePartial({ interests: tempInterests });
      setIsEditingInterests(false);
    } catch (e: any) {
      Alert.alert("Xəta", e?.message || "Dəyişiklik saxlanmadı");
    } finally {
      setSaving(null);
    }
  };

  const changeAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("İcazə lazımdır", "Qalereyaya icazə verin");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800, height: 800 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
      );
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(manipulated.uri);
      const blob = await response.blob();
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const data = await uploadRes.json();
      if (data?.storageId) {
        const url = await getUrlFromStorageId({
          storageId: data.storageId as any,
        });
        if (url && userId && dbUser) {
          await updateUser({
            clerkId: userId,
            avatar: url,
            gender: dbUser.gender,
            age: dbUser.age,
            lookingFor: dbUser.lookingFor,
          });
        }
      }
    } catch (err) {
      Alert.alert("Xəta", "Şəkil yüklənə bilmədi");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/sign-in");
  };

  const user = dbUser;

  const convexMatches = useQuery(
    api.matches.list,
    userId ? { userId } : "skip",
  );
  const sentLikesIds = useQuery(
    api.likes.getLikedUserIds,
    userId ? { userId } : "skip",
  );

  const likesCount = sentLikesIds?.length || 0;
  const matchesCount = convexMatches?.length || 0;
  const badgesCount = user?.badges?.length ?? 0;

  if (user === undefined) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={22} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.push("/settings" as any)}
          activeOpacity={0.8}
        >
          <Settings size={20} color={Colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatarRing}>
              <Image
                source={user.avatar ? { uri: user.avatar } : undefined}
                style={styles.avatar}
                contentFit="cover"
              />
            </View>
            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={changeAvatar}
              activeOpacity={0.85}
            >
              {saving === "header" ? (
                <ActivityIndicator size="small" color={Colors.foreground} />
              ) : (
                <Camera size={16} color={Colors.foreground} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              {isEditingHeader ? (
                <View style={styles.headerEditInputs}>
                  <TextInput
                    value={tempName}
                    onChangeText={setTempName}
                    style={styles.headerNameInput}
                    placeholder="Adınız"
                    placeholderTextColor={Colors.mutedForeground}
                  />
                  <TextInput
                    value={tempLocation}
                    onChangeText={setTempLocation}
                    style={styles.headerLocInput}
                    placeholder="Məkan"
                    placeholderTextColor={Colors.mutedForeground}
                  />
                </View>
              ) : (
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flexWrap: "wrap",
                      marginBottom: 4,
                      gap: 8,
                    }}
                  >
                    <Text style={styles.name}>
                      {user.name}
                      {user.age ? `, ${user.age}` : ""}
                    </Text>
                    {(user.role === "superadmin" ||
                      user.role === "admin" ||
                      (user as any).email === "xeyalnecefsoy@gmail.com") && (
                      <LinearGradient
                        colors={["#3b82f6", "#2563eb", "#06b6d4"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 16,
                          gap: 6,
                          shadowColor: "#3b82f6",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 3,
                        }}
                      >
                        <Sparkles size={14} color="#ffffff" />
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#ffffff",
                            fontWeight: "900",
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          Qurucu
                        </Text>
                      </LinearGradient>
                    )}
                  </View>
                  <View style={styles.locationRow}>
                    <MapPin size={16} color={Colors.mutedForeground} />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {user.location || "—"}
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.headerEditBtn}
                onPress={() => {
                  if (isEditingHeader) handleSaveHeader();
                  else setIsEditingHeader(true);
                }}
                activeOpacity={0.85}
              >
                {saving === "header" ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : isEditingHeader ? (
                  <CheckCircle2 size={18} color={Colors.primary} />
                ) : (
                  <Pencil size={18} color={Colors.foreground} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Premium CTA */}
        <TouchableOpacity
          style={styles.premiumCard}
          activeOpacity={0.9}
          onPress={() => router.push("/premium" as any)}
        >
          <View style={styles.premiumLeft}>
            <View style={styles.premiumIcon}>
              <Crown size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.premiumTitle}>Premium-a keçin</Text>
              <Text style={styles.premiumSubtitle}>
                Limitsiz bəyənmə, Super Like və daha çox
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={Colors.mutedForeground} />
        </TouchableOpacity>

        {/* Verify CTA */}
        <TouchableOpacity
          style={styles.verifyCard}
          activeOpacity={0.9}
          onPress={() => router.push("/verify" as any)}
        >
          <View style={styles.verifyLeft}>
            <View style={styles.verifyIcon}>
              <Shield size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.verifyTitle}>Profilinizi təsdiqləyin</Text>
              <Text style={styles.verifySubtitle}>
                Təsdiqlənmiş profillər 3x daha çox uyğunluq tapır
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={Colors.mutedForeground} />
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={styles.statsCard}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push("/likes" as any)}
            activeOpacity={0.85}
          >
            <Text style={[styles.statNumber, { color: Colors.primary }]}>
              {likesCount}
            </Text>
            <Text style={styles.statLabel}>Bəyənmələr</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push("/(tabs)/matches" as any)}
            activeOpacity={0.85}
          >
            <Text style={[styles.statNumber, { color: Colors.green }]}>
              {matchesCount}
            </Text>
            <Text style={styles.statLabel}>Uyğunluqlar</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Flame size={16} color={Colors.gold} />
              <Text style={[styles.statNumber, { color: Colors.gold }]}>
                {user.streak || 0}
              </Text>
            </View>
            <Text style={styles.statLabel}>Gün Seriyası</Text>
          </View>
        </View>

        {/* About */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Haqqında</Text>
            <TouchableOpacity
              style={styles.sectionIconBtn}
              onPress={() => {
                if (isEditingBio) handleSaveBio();
                else setIsEditingBio(true);
              }}
              activeOpacity={0.85}
            >
              {saving === "bio" ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : isEditingBio ? (
                <CheckCircle2 size={18} color={Colors.primary} />
              ) : (
                <Pencil size={18} color={Colors.foreground} />
              )}
            </TouchableOpacity>
          </View>
          {isEditingBio ? (
            <TextInput
              value={bioText}
              onChangeText={setBioText}
              style={styles.bioInput}
              placeholder="Haqqınızda bir şeylər yazın..."
              placeholderTextColor={Colors.mutedForeground}
              multiline
              maxLength={400}
            />
          ) : (
            <Text style={styles.sectionBody}>
              {user.bio || "Məlumat yoxdur"}
            </Text>
          )}
        </View>

        {/* Gallery */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Qalereya</Text>
            <TouchableOpacity
              style={styles.addPhotoBtn}
              onPress={changeAvatar}
              activeOpacity={0.85}
            >
              <Camera size={16} color={Colors.foreground} />
              <Text style={styles.addPhotoText}>Şəkil əlavə et</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.galleryGrid}>
            <View style={styles.galleryTile}>
              {user.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.galleryImg}
                  contentFit="cover"
                />
              ) : null}
            </View>
            <View style={styles.galleryTilePlaceholder}>
              <Camera size={22} color={Colors.mutedForeground} />
              <Text style={styles.galleryPlaceholderText}>Əlavə et</Text>
            </View>
            <View style={styles.galleryTilePlaceholder}>
              <Camera size={22} color={Colors.mutedForeground} />
              <Text style={styles.galleryPlaceholderText}>Əlavə et</Text>
            </View>
          </View>
        </View>

        {/* Details (Values + Love Language + Comm Style) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Dəyərlər</Text>
            <TouchableOpacity
              style={styles.sectionIconBtn}
              onPress={() => {
                if (isEditingDetails) handleSaveDetails();
                else setIsEditingDetails(true);
              }}
              activeOpacity={0.85}
            >
              {saving === "details" ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : isEditingDetails ? (
                <CheckCircle2 size={18} color={Colors.primary} />
              ) : (
                <Pencil size={18} color={Colors.foreground} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.chipsRow}>
            {(isEditingDetails ? tempValues : user.values || []).map(
              (value: string, i: number) => (
                <TouchableOpacity
                  key={i}
                  style={styles.chip}
                  onPress={
                    isEditingDetails
                      ? () =>
                          setTempValues(
                            tempValues.includes(value)
                              ? tempValues.filter((x) => x !== value)
                              : tempValues,
                          )
                      : undefined
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.chipText}>{value}</Text>
                </TouchableOpacity>
              ),
            )}
            {(isEditingDetails ? tempValues : user.values || []).length ===
            0 ? (
              <Text style={styles.sectionBody}>Məlumat yoxdur</Text>
            ) : null}
          </View>

          {isEditingDetails ? (
            <View style={{ marginTop: 12 }}>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setShowEditModal("loveLanguage")}
                activeOpacity={0.85}
              >
                <Text style={styles.optionLabel}>Sevgi dili</Text>
                <Text style={styles.optionValue}>
                  {tempLoveLanguage
                    ? translateLoveLanguage(tempLoveLanguage, "az")
                    : "Seçin"}
                </Text>
                <ChevronRight size={18} color={Colors.mutedForeground} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setShowEditModal("commStyle")}
                activeOpacity={0.85}
              >
                <Text style={styles.optionLabel}>Ünsiyyət tərzi</Text>
                <Text style={styles.optionValue}>
                  {tempCommStyle
                    ? translateStyle(tempCommStyle, "az")
                    : "Seçin"}
                </Text>
                <ChevronRight size={18} color={Colors.mutedForeground} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionRow, { borderBottomWidth: 0 }]}
                onPress={() => setShowEditModal("values")}
                activeOpacity={0.85}
              >
                <Text style={styles.optionLabel}>Dəyərlər seç</Text>
                <ChevronRight size={18} color={Colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ marginTop: 12 }}>
              <InfoRow
                icon={<Heart size={18} color={Colors.primary} />}
                label="Sevgi dili"
                value={
                  user.loveLanguage
                    ? translateLoveLanguage(user.loveLanguage, "az")
                    : "—"
                }
              />
              <InfoRow
                icon={<MessageCircle size={18} color={Colors.primary} />}
                label="Ünsiyyət"
                value={
                  user.communicationStyle
                    ? translateStyle(user.communicationStyle, "az")
                    : "—"
                }
              />
            </View>
          )}
        </View>

        {/* Interests */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Maraqlar</Text>
            <TouchableOpacity
              style={styles.sectionIconBtn}
              onPress={() => {
                if (isEditingInterests) handleSaveInterests();
                else setIsEditingInterests(true);
              }}
              activeOpacity={0.85}
            >
              {saving === "interests" ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : isEditingInterests ? (
                <CheckCircle2 size={18} color={Colors.primary} />
              ) : (
                <Pencil size={18} color={Colors.foreground} />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.chipsRow}>
            {(isEditingInterests ? tempInterests : user.interests || []).map(
              (interest: string, i: number) => (
                <TouchableOpacity
                  key={i}
                  style={styles.chip}
                  onPress={
                    isEditingInterests
                      ? () =>
                          setTempInterests(
                            tempInterests.includes(interest)
                              ? tempInterests.filter((x) => x !== interest)
                              : tempInterests,
                          )
                      : undefined
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.chipText}>{interest}</Text>
                </TouchableOpacity>
              ),
            )}
            {(isEditingInterests ? tempInterests : user.interests || [])
              .length === 0 ? (
              <Text style={styles.sectionBody}>Məlumat yoxdur</Text>
            ) : null}
          </View>
          {isEditingInterests ? (
            <TouchableOpacity
              style={[
                styles.optionRow,
                { borderBottomWidth: 0, marginTop: 12 },
              ]}
              onPress={() => setShowEditModal("interests")}
              activeOpacity={0.85}
            >
              <Text style={styles.optionLabel}>Maraqlar seç</Text>
              <ChevronRight size={18} color={Colors.mutedForeground} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Badges */}
        <TouchableOpacity
          style={[
            styles.badgesCard,
            { flexDirection: "column", alignItems: "stretch" },
          ]}
          activeOpacity={0.9}
          onPress={() => router.push("/badges" as any)}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: user.badges?.length > 0 ? 16 : 0,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View style={styles.badgesIcon}>
                <Award size={18} color={Colors.foreground} />
              </View>
              <Text style={styles.badgesTitle}>Nişanlar</Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Text style={styles.badgesSubtitle}>{badgesCount} qazanılıb</Text>
              <ChevronRight size={18} color={Colors.mutedForeground} />
            </View>
          </View>

          {user.badges && user.badges.length > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {user.badges.slice(0, 4).map((badgeId: string) => {
                const badge = getBadgeById(
                  badgeId.toLowerCase().replace(/ /g, "-"),
                );
                if (!badge) return null;
                const IconComponent = getBadgeIcon(badge.icon);

                let badgeColor = "#ffffff";
                const badgeColorClass = badge.color || "";
                if (
                  badgeColorClass.includes("amber") ||
                  badgeColorClass.includes("yellow")
                )
                  badgeColor = "#f59e0b";
                if (
                  badgeColorClass.includes("rose") ||
                  badgeColorClass.includes("red")
                )
                  badgeColor = "#ef4444";
                if (
                  badgeColorClass.includes("indigo") ||
                  badgeColorClass.includes("purple")
                )
                  badgeColor = "#6366f1";
                if (badgeColorClass.includes("orange")) badgeColor = "#f97316";
                if (badgeColorClass.includes("green")) badgeColor = "#22c55e";
                if (badgeColorClass.includes("cyan")) badgeColor = "#06b6d4";
                if (badgeColorClass.includes("pink")) badgeColor = "#ec4899";

                return (
                  <View
                    key={badgeId}
                    style={{ alignItems: "center", width: 65 }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: "rgba(255,255,255,0.05)",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <IconComponent size={22} color={badgeColor} />
                    </View>
                    <Text
                      style={{
                        fontSize: 10,
                        color: Colors.mutedForeground,
                        textAlign: "center",
                      }}
                      numberOfLines={2}
                    >
                      {badge.name.az}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text
              style={{
                fontSize: 12,
                color: Colors.mutedForeground,
                marginTop: 12,
                textAlign: "center",
              }}
            >
              Nişan qazanmaq üçün tətbiqi istifadə etməyə başlayın!
            </Text>
          )}
        </TouchableOpacity>

        {/* Bottom actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push("/settings" as any)}
            activeOpacity={0.85}
          >
            <Settings size={22} color={Colors.mutedForeground} />
            <Text style={styles.actionText}>Parametrlər</Text>
            <ChevronRight size={18} color={Colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push("/practice" as any)}
            activeOpacity={0.85}
          >
            <Sparkles size={22} color={Colors.mutedForeground} />
            <Text style={styles.actionText}>Ünsiyyəti Məşq Et</Text>
            <ChevronRight size={18} color={Colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.85}
          >
            <LogOut size={20} color={Colors.primary} />
            <Text style={styles.signOutText}>Çıxış</Text>
          </TouchableOpacity>
        </View>

        {/* Edit modals */}
        <Modal
          visible={showEditModal === "interests"}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Maraqlar (max 7)</Text>
                <TouchableOpacity onPress={() => setShowEditModal(null)}>
                  <X size={28} color={Colors.foreground} />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 400 }}>
                <View style={styles.chipWrapModal}>
                  {AVAILABLE_INTERESTS.map((item) => {
                    const selected = tempInterests.includes(item);
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.chipModal,
                          selected && styles.chipModalActive,
                        ]}
                        onPress={() => {
                          if (selected) {
                            setTempInterests(
                              tempInterests.filter((x) => x !== item),
                            );
                          } else if (tempInterests.length < 7) {
                            setTempInterests([...tempInterests, item]);
                          }
                        }}
                      >
                        <Text style={styles.chipModalText}>{item}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showEditModal === "values"}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Dəyərlər (max 5)</Text>
                <TouchableOpacity onPress={() => setShowEditModal(null)}>
                  <X size={28} color={Colors.foreground} />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 400 }}>
                <View style={styles.chipWrapModal}>
                  {AVAILABLE_VALUES.map((item) => {
                    const selected = tempValues.includes(item);
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.chipModal,
                          selected && styles.chipModalActiveBlue,
                        ]}
                        onPress={() => {
                          if (selected) {
                            setTempValues(tempValues.filter((x) => x !== item));
                          } else if (tempValues.length < 5) {
                            setTempValues([...tempValues, item]);
                          }
                        }}
                      >
                        <Text style={styles.chipModalText}>{item}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showEditModal === "loveLanguage"}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sevgi dili</Text>
                <TouchableOpacity onPress={() => setShowEditModal(null)}>
                  <X size={28} color={Colors.foreground} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={LOVE_LANGUAGES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionRow,
                      tempLoveLanguage === item.id && styles.optionRowActive,
                    ]}
                    onPress={() => {
                      setTempLoveLanguage(item.id);
                      setShowEditModal(null);
                    }}
                  >
                    <Text style={styles.optionEmoji}>{item.emoji}</Text>
                    <Text style={styles.optionText}>
                      {translateLoveLanguage(item.id, "az")}
                    </Text>
                    {tempLoveLanguage === item.id && (
                      <Check
                        size={18}
                        color={Colors.primary}
                        style={{ marginLeft: "auto" }}
                      />
                    )}
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 400 }}
              />
            </View>
          </View>
        </Modal>

        <Modal
          visible={showEditModal === "commStyle"}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Ünsiyyət tərzi</Text>
                <TouchableOpacity onPress={() => setShowEditModal(null)}>
                  <X size={28} color={Colors.foreground} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={COMM_STYLES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionRow,
                      tempCommStyle === item.id && styles.optionRowActive,
                    ]}
                    onPress={() => {
                      setTempCommStyle(item.id);
                      setShowEditModal(null);
                    }}
                  >
                    <Text style={styles.optionEmoji}>{item.emoji}</Text>
                    <Text style={styles.optionText}>
                      {translateStyle(item.id, "az")}
                    </Text>
                    {tempCommStyle === item.id && (
                      <Check
                        size={18}
                        color={Colors.primary}
                        style={{ marginLeft: "auto" }}
                      />
                    )}
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 400 }}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={infoStyles.row}>
      {icon}
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  label: {
    color: Colors.mutedForeground,
    fontSize: 13,
    marginLeft: 12,
    flex: 1,
  },
  value: { color: Colors.foreground, fontSize: 14, fontWeight: "600" },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },

  topHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
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
  headerTitle: { color: Colors.foreground, fontSize: 18, fontWeight: "700" },

  scrollContent: { padding: 16, paddingBottom: 40 },

  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  avatarOuter: { position: "relative" },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 3,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 48,
    backgroundColor: Colors.surfaceDark,
  },
  cameraBtn: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.foreground,
    flexShrink: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  locationText: { color: Colors.mutedForeground, fontSize: 14, flexShrink: 1 },
  headerEditBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  headerEditInputs: { flex: 1, gap: 8 },
  headerNameInput: {
    width: "100%",
    fontSize: 20,
    fontWeight: "800",
    color: Colors.foreground,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  headerLocInput: {
    width: "100%",
    fontSize: 14,
    color: Colors.foreground,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "rgba(245,158,11,0.15)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.4)",
  },
  premiumLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  premiumIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
  },
  premiumTitle: { color: Colors.foreground, fontSize: 14, fontWeight: "800" },
  premiumSubtitle: {
    color: Colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },

  verifyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "rgba(59,130,246,0.15)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.4)",
  },
  verifyLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  verifyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  verifyTitle: { color: Colors.foreground, fontSize: 14, fontWeight: "800" },
  verifySubtitle: { color: Colors.mutedForeground, fontSize: 12, marginTop: 2 },

  statsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  statNumber: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  statLabel: {
    color: Colors.mutedForeground,
    fontSize: 11,
    textAlign: "center",
  },

  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { color: Colors.foreground, fontSize: 15, fontWeight: "700" },
  sectionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  sectionBody: { color: Colors.mutedForeground, fontSize: 14, lineHeight: 22 },
  bioInput: {
    minHeight: 96,
    color: Colors.foreground,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
  },

  addPhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  addPhotoText: { color: Colors.foreground, fontSize: 12, fontWeight: "600" },
  galleryGrid: { flexDirection: "row", gap: 8 },
  galleryTile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.muted,
  },
  galleryImg: { width: "100%", height: "100%" },
  galleryTilePlaceholder: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.02)",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  galleryPlaceholderText: {
    color: Colors.mutedForeground,
    fontSize: 10,
    fontWeight: "500",
  },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: Colors.primaryAlpha15,
    borderWidth: 1,
    borderColor: Colors.primaryAlpha10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  chipText: { color: Colors.primary, fontSize: 13, fontWeight: "600" },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  optionLabel: { color: Colors.mutedForeground, fontSize: 14, flex: 1 },
  optionValue: {
    color: Colors.foreground,
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },

  badgesCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgesLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  badgesIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  badgesTitle: { color: Colors.foreground, fontSize: 15, fontWeight: "700" },
  badgesSubtitle: { color: Colors.mutedForeground, fontSize: 12, marginTop: 2 },

  actionsSection: { marginTop: 4, marginBottom: 8 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  actionText: {
    color: Colors.foreground,
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    marginLeft: 12,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primaryAlpha10,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primaryAlpha15,
  },
  signOutText: { color: Colors.primary, fontWeight: "700", fontSize: 15 },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
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
  chipWrapModal: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 16,
  },
  chipModal: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  chipModalActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipModalActiveBlue: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipModalText: { fontSize: 13, color: Colors.foreground, fontWeight: "600" },
  optionRowActive: {
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryAlpha10,
  },
  optionEmoji: { fontSize: 22, marginRight: 12 },
  optionText: { fontSize: 15, color: Colors.foreground, fontWeight: "600" },
});
