import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
  Animated,
  Dimensions,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useAction, useMutation, useQuery } from "convex/react";
import { Redirect, useRouter } from "expo-router";
import { api } from "../lib/api";
import {
  ArrowLeft,
  LogOut,
  AlertCircle,
  User,
  Users,
  ChevronDown,
  Info,
  CheckCircle2,
  Camera,
  Check,
  Trash2,
  ChevronRight,
  Heart,
  X,
  Search,
} from "../lib/icons";
import { Colors } from "../lib/colors";
import {
  AVAILABLE_VALUES,
  AVAILABLE_INTERESTS,
  LOVE_LANGUAGES,
  COMM_STYLES,
} from "../lib/constants";
import { AZERBAIJAN_REGIONS } from "../lib/locations";
import {
  translateValue,
  translateLoveLanguage,
  translateStyle,
  translateInterest,
} from "../lib/translations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import {
  validateFullName,
  validateBio,
  BIO_MIN_LENGTH,
  BIO_MIN_WORDS,
} from "../../lib/profileValidation";
import {
  communityStandardsSummaryAz,
  photoRulesAz,
} from "../../lib/onboardingStandards";
import { validateProfilePhotoRemote } from "../lib/validateProfilePhoto";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TOTAL_STEPS = 7;
const lang: "az" | "en" = "az";
const STORAGE_KEY_STEP = "onboarding-step";
const STORAGE_KEY_DATA = "onboarding-formData";

type Gender = "male" | "female";

const DAYS = Array.from({ length: 31 }, (_, i) => ({ label: `${i + 1}`, value: `${i + 1}` }));
const MONTHS = [
  { label: "Yanvar", value: "1" }, { label: "Fevral", value: "2" }, { label: "Mart", value: "3" },
  { label: "Aprel", value: "4" }, { label: "May", value: "5" }, { label: "İyun", value: "6" },
  { label: "İyul", value: "7" }, { label: "Avqust", value: "8" }, { label: "Sentyabr", value: "9" },
  { label: "Oktyabr", value: "10" }, { label: "Noyabr", value: "11" }, { label: "Dekabr", value: "12" },
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 18 - 1940 + 1 }, (_, i) => {
  const y = currentYear - 18 - i;
  return { label: `${y}`, value: `${y}` };
});

export default function OnboardingScreen() {
  const { isLoaded, isSignedIn, userId, signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const router = useRouter();

  const dbUser = useQuery(api.users.getUser, userId ? { clerkId: userId } : "skip");
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getUrlFromStorageId = useMutation(api.files.getUrlFromStorageId);
  const checkAvatarModeration = useAction(
    api.imageModeration.checkAndStoreAvatarModeration
  );

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    gender: "" as Gender | "",
    location: "",
    bio: "",
    values: [] as string[],
    loveLanguage: "",
    interests: [] as string[],
    communicationStyle: "" as "Direct" | "Empathetic" | "Analytical" | "Playful" | "",
    profilePhotoUri: "" as string,
    profilePhotoStorageId: null as string | null,
    acceptedCommunityGuidelines: false,
  });
  const [searchLocation, setSearchLocation] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<"day" | "month" | "year" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Step transition animation
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateStepChange = useCallback((newStep: number) => {
    const direction = newStep > step ? 1 : -1;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -direction * 30, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setStep(newStep);
      slideAnim.setValue(direction * 30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  }, [step, fadeAnim, slideAnim]);

  // AsyncStorage persistence — load on mount
  useEffect(() => {
    (async () => {
      try {
        const savedStep = await AsyncStorage.getItem(STORAGE_KEY_STEP);
        const savedData = await AsyncStorage.getItem(STORAGE_KEY_DATA);
        if (savedStep) setStep(parseInt(savedStep, 10));
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setFormData((prev) => ({ ...prev, ...parsed }));
        } else if (clerkUser) {
          setFormData((prev) => ({
            ...prev,
            firstName: (clerkUser.firstName as string) || "",
            lastName: (clerkUser.lastName as string) || "",
          }));
        }
      } catch {}
      setInitialized(true);
    })();
  }, []);

  // Save to AsyncStorage on step/formData change
  useEffect(() => {
    if (!initialized) return;
    AsyncStorage.setItem(STORAGE_KEY_STEP, String(step)).catch(() => {});
    const { profilePhotoUri, profilePhotoStorageId, ...saveable } = formData;
    AsyncStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(saveable)).catch(() => {});
  }, [step, formData, initialized]);

  // Progress bar animation
  const progressAnim = useRef(new Animated.Value(1 / TOTAL_STEPS)).current;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: step / TOTAL_STEPS,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const filteredLocations = useMemo(() => {
    if (!searchLocation.trim()) return AZERBAIJAN_REGIONS;
    const q = searchLocation.trim().toLowerCase();
    return AZERBAIJAN_REGIONS.filter((loc) => loc.toLowerCase().includes(q));
  }, [searchLocation]);

  const calculateAge = () => {
    const d = parseInt(formData.birthDay, 10);
    const m = parseInt(formData.birthMonth, 10);
    const y = parseInt(formData.birthYear, 10);
    if (!d || !m || !y) return 0;
    const birth = new Date(y, m - 1, d);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
    )
      age--;
    return age;
  };

  const isValidBirthDate = () => {
    const d = parseInt(formData.birthDay, 10);
    const m = parseInt(formData.birthMonth, 10);
    const y = parseInt(formData.birthYear, 10);
    if (!d || !m || !y) return false;
    if (d < 1 || d > 31 || m < 1 || m > 12) return false;
    if (y < 1940 || y > currentYear - 18) return false;
    return true;
  };

  const canProceed = () => {
    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
    switch (step) {
      case 1:
        return formData.acceptedCommunityGuidelines;
      case 2:
        return !!formData.gender;
      case 3:
        return (
          !!formData.firstName.trim() &&
          !!formData.lastName.trim() &&
          isValidBirthDate() &&
          calculateAge() >= 18 &&
          !validateFullName(fullName)
        );
      case 4:
        return (
          !!formData.location &&
          !!formData.bio.trim() &&
          !validateBio(formData.bio.trim()) &&
          formData.bio.trim().length >= BIO_MIN_LENGTH
        );
      case 5:
        return formData.values.length >= 1 && !!formData.loveLanguage;
      case 6:
        return formData.interests.length >= 1 && !!formData.communicationStyle;
      case 7:
        return !!formData.profilePhotoUri && uploadSuccess;
      default:
        return false;
    }
  };

  const handleComplete = async () => {
    if (!userId || !formData.gender) return;
    setError("");
    setIsSaving(true);
    try {
      let avatarUrl = formData.profilePhotoUri;
      if (formData.profilePhotoStorageId) {
        const url = await getUrlFromStorageId({ storageId: formData.profilePhotoStorageId as any });
        if (url) avatarUrl = url;
      }
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
      const result = await createOrUpdateUser({
        clerkId: userId,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress,
        name: fullName,
        gender: formData.gender,
        age: calculateAge(),
        birthDay: formData.birthDay,
        birthMonth: formData.birthMonth,
        birthYear: formData.birthYear,
        location: formData.location,
        bio: formData.bio.trim(),
        values: formData.values,
        loveLanguage: formData.loveLanguage,
        interests: formData.interests,
        communicationStyle: formData.communicationStyle || undefined,
        avatar: avatarUrl || undefined,
        lookingFor: formData.gender === "male" ? "female" : "male",
      });
      if (typeof avatarUrl === "string" && /^https?:\/\//i.test(avatarUrl)) {
        void checkAvatarModeration({ imageUrl: avatarUrl }).catch(() => {});
      }
      // Clear saved onboarding data
      AsyncStorage.multiRemove([STORAGE_KEY_STEP, STORAGE_KEY_DATA]).catch(() => {});
      if ((result as any)?.status === "waitlist") {
        router.replace("/waitlist");
        return;
      }
      router.replace("/(tabs)/home");
    } catch (e: any) {
      setError(e?.message || "Profil saxlanmadı");
    } finally {
      setIsSaving(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setError("Qalereyaya icazə lazımdır");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const originalUri = result.assets[0].uri;
    setIsUploading(true);
    setUploadSuccess(false);
    setError("");

    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        originalUri,
        [{ resize: { width: 800, height: 800 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      const uri = manipulated.uri;

      const faceCheck = await validateProfilePhotoRemote(uri);
      if (!faceCheck.isValid) {
        setError(faceCheck.errorMessage || "Şəkil qəbul edilmədi");
        setIsUploading(false);
        return;
      }

      setFormData((prev) => ({ ...prev, profilePhotoUri: uri }));
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uri);
      const blob = await response.blob();
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const data = await uploadRes.json();
      if (data?.storageId) {
        setFormData((prev) => ({ ...prev, profilePhotoStorageId: data.storageId as string }));
      }
      setUploadSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Şəkil yüklənə bilmədi");
      setFormData((prev) => ({ ...prev, profilePhotoUri: "", profilePhotoStorageId: null }));
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, profilePhotoUri: "", profilePhotoStorageId: null }));
    setUploadSuccess(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEY_STEP, STORAGE_KEY_DATA]);
      await signOut();
      router.replace("/welcome");
    } catch {}
  };

  if (!isLoaded || !initialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;
  if (dbUser === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  const isProfileComplete = !!(dbUser?.name && dbUser?.gender && dbUser?.age && dbUser?.location && dbUser?.bio);
  if (dbUser?.status === "rejected") return <Redirect href="/rejected" />;
  if (dbUser && isProfileComplete && dbUser.status === "waitlist") return <Redirect href="/waitlist" />;
  if (dbUser && isProfileComplete && dbUser.status === "active") return <Redirect href="/(tabs)/home" />;

  const getMonthLabel = (v: string) => MONTHS.find((m) => m.value === v)?.label || "";

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Header */}
      <View style={styles.header}>
        {step > 1 ? (
          <TouchableOpacity onPress={() => animateStepChange(step - 1)} style={styles.headerBtn}>
            <ArrowLeft size={22} color={Colors.foreground} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleLogout} style={styles.headerBtn}>
            <LogOut size={20} color={Colors.mutedForeground} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Danyeri</Text>
        <Text style={styles.stepIndicator}>{step}/{TOTAL_STEPS}</Text>
      </View>

      {/* Progress bar (animated) */}
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) },
          ]}
        />
      </View>

      {/* Step content (animated) */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <View style={styles.errorBox}>
              <AlertCircle size={16} color={Colors.destructiveLight} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {dbUser?.status === "needs_revision" && dbUser.profileModerationNote ? (
            <View style={styles.moderationBanner}>
              <Text style={styles.moderationBannerTitle}>Profilinizi yeniləyin</Text>
              <Text style={styles.moderationBannerText}>{dbUser.profileModerationNote}</Text>
            </View>
          ) : null}

          {/* ===== Step 1: Community standards ===== */}
          {step === 1 && (
            <>
              <Text style={styles.stepTitle}>İcma standartları</Text>
              <Text style={styles.stepDesc}>
                Davam etməzdən əvvəl qısa şəkildə tanış olun. Tam mətn üçün icma qaydalarına keçin.
              </Text>
              {communityStandardsSummaryAz(BIO_MIN_LENGTH, BIO_MIN_WORDS).map((line: string, i: number) => (
                <Text key={i} style={styles.guidelineBullet}>
                  {"\u2022 "}
                  {line}
                </Text>
              ))}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() =>
                  setFormData((prev) => ({
                    ...prev,
                    acceptedCommunityGuidelines: !prev.acceptedCommunityGuidelines,
                  }))
                }
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    formData.acceptedCommunityGuidelines && styles.checkboxBoxChecked,
                  ]}
                >
                  {formData.acceptedCommunityGuidelines ? (
                    <Check size={14} color={Colors.foreground} />
                  ) : null}
                </View>
                <Text style={styles.checkboxLabel}>
                  İcma qaydalarını oxudum və qəbul edirəm.{" "}
                  <Text
                    style={styles.linkInline}
                    onPress={() =>
                      Linking.openURL("https://www.danyeri.az/icma-qaydalari")
                    }
                  >
                    Tam mətn
                  </Text>
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* ===== Step 2: Gender ===== */}
          {step === 2 && (
            <>
              <Text style={styles.stepTitle}>Mən...</Text>
              <Text style={styles.stepDesc}>Cinsinizi seçin</Text>
              <View style={styles.genderRow}>
                <TouchableOpacity
                  style={[styles.genderCard, formData.gender === "male" && styles.genderCardActive]}
                  onPress={() => setFormData({ ...formData, gender: "male" })}
                >
                  <View style={[styles.genderIcon, formData.gender === "male" && styles.genderIconActive]}>
                    <User size={36} color={formData.gender === "male" ? Colors.foreground : Colors.mutedForeground} />
                  </View>
                  <Text style={styles.genderLabel}>Kişi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderCard, formData.gender === "female" && styles.genderCardActive]}
                  onPress={() => setFormData({ ...formData, gender: "female" })}
                >
                  <View style={[styles.genderIcon, formData.gender === "female" && styles.genderIconActive]}>
                    <Users size={36} color={formData.gender === "female" ? Colors.foreground : Colors.mutedForeground} />
                  </View>
                  <Text style={styles.genderLabel}>Qadın</Text>
                </TouchableOpacity>
              </View>
              {formData.gender ? (
                <Text style={styles.lookingForText}>Axtarılır: {formData.gender === "male" ? "Qadınlar" : "Kişilər"}</Text>
              ) : null}
            </>
          )}

          {/* ===== Step 3: Name & Birth ===== */}
          {step === 3 && (
            <>
              <Text style={styles.stepTitle}>Şəxsi məlumatlarınız</Text>
              <Text style={styles.stepDesc}>Profil təsdiqləmə üçün düzgün məlumat daxil edin</Text>
              <View style={styles.twoCol}>
                <View style={styles.half}>
                  <Text style={styles.label}>Ad</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(t) => setFormData({ ...formData, firstName: t })}
                    placeholder="Ad"
                    placeholderTextColor={Colors.mutedForeground}
                  />
                </View>
                <View style={styles.half}>
                  <Text style={styles.label}>Soyad</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(t) => setFormData({ ...formData, lastName: t })}
                    placeholder="Soyad"
                    placeholderTextColor={Colors.mutedForeground}
                  />
                </View>
              </View>

              <Text style={styles.label}>Doğum tarixi</Text>
              <View style={styles.dateRow}>
                <TouchableOpacity style={[styles.datePickerBtn, { flex: 1 }]} onPress={() => setShowDatePicker("day")}>
                  <Text style={formData.birthDay ? styles.datePickerText : styles.datePickerPlaceholder}>
                    {formData.birthDay || "Gün"}
                  </Text>
                  <ChevronDown size={16} color={Colors.mutedForeground} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.datePickerBtn, { flex: 1.5 }]} onPress={() => setShowDatePicker("month")}>
                  <Text style={formData.birthMonth ? styles.datePickerText : styles.datePickerPlaceholder}>
                    {formData.birthMonth ? getMonthLabel(formData.birthMonth) : "Ay"}
                  </Text>
                  <ChevronDown size={16} color={Colors.mutedForeground} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.datePickerBtn, { flex: 1 }]} onPress={() => setShowDatePicker("year")}>
                  <Text style={formData.birthYear ? styles.datePickerText : styles.datePickerPlaceholder}>
                    {formData.birthYear || "İl"}
                  </Text>
                  <ChevronDown size={16} color={Colors.mutedForeground} />
                </TouchableOpacity>
              </View>
              {isValidBirthDate() && calculateAge() < 18 && (
                <Text style={styles.validationError}>Yaşınız 18 və ya yuxarı olmalıdır</Text>
              )}

              {/* Info note */}
              <View style={styles.infoNote}>
                <Info size={16} color={Colors.mutedForeground} />
                <Text style={styles.infoNoteText}>Bu məlumatlar profil təsdiqləmə prosesində istifadə olunacaq</Text>
              </View>
            </>
          )}

          {/* ===== Step 4: Location & Bio ===== */}
          {step === 4 && (
            <>
              <Text style={styles.stepTitle}>Özünüz haqqında danışın</Text>
              <Text style={styles.stepDesc}>Başqalarına sizi tanımağa kömək edin</Text>
              <Text style={styles.label}>Harada yaşayırsınız?</Text>
              <TouchableOpacity style={styles.locationBtn} onPress={() => setShowLocationModal(true)}>
                <Text style={formData.location ? styles.locationBtnTextSelected : styles.locationBtnText}>
                  {formData.location || "Şəhər və ya rayon seçin..."}
                </Text>
                <ChevronDown size={20} color={Colors.mutedForeground} />
              </TouchableOpacity>
              <Text style={styles.label}>Qısa bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={formData.bio}
                onChangeText={(t) => setFormData({ ...formData, bio: t })}
                placeholder="Özünüz haqqında maraqlı bir şey paylaşın..."
                placeholderTextColor={Colors.mutedForeground}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              <Text style={styles.charCount}>
                {formData.bio.length}/500 · ən azı {BIO_MIN_LENGTH} simvol
              </Text>
              <TouchableOpacity
                onPress={() => Linking.openURL("https://www.danyeri.az/icma-qaydalari")}
                style={styles.guidelinesLinkWrap}
              >
                <Text style={styles.guidelinesLink}>İcma qaydaları</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ===== Step 5: Values & Love Language ===== */}
          {step === 5 && (
            <>
              <Text style={styles.stepTitle}>Sizin üçün nə önəmlidir?</Text>
              <Text style={styles.stepDesc}>5-ə qədər dəyər seçin</Text>
              <View style={styles.chipWrap}>
                {AVAILABLE_VALUES.map((v) => (
                  <TouchableOpacity
                    key={v}
                    style={[styles.chip, formData.values.includes(v) && styles.chipActive]}
                    onPress={() => {
                      if (formData.values.includes(v)) {
                        setFormData({ ...formData, values: formData.values.filter((x) => x !== v) });
                      } else if (formData.values.length < 5) {
                        setFormData({ ...formData, values: [...formData.values, v] });
                      }
                    }}
                  >
                    <Text style={[styles.chipText, formData.values.includes(v) && styles.chipTextActive]}>
                      {translateValue(v, lang)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.sectionLabel}>Sevgi diliniz</Text>
              {LOVE_LANGUAGES.map((ll) => (
                <TouchableOpacity
                  key={ll.id}
                  style={[styles.optionRow, formData.loveLanguage === ll.id && styles.optionRowActive]}
                  onPress={() => setFormData({ ...formData, loveLanguage: ll.id })}
                >
                  <Text style={styles.optionEmoji}>{ll.emoji}</Text>
                  <Text style={styles.optionText}>{translateLoveLanguage(ll.id, lang)}</Text>
                  {formData.loveLanguage === ll.id && <CheckCircle2 size={20} color={Colors.primary} style={{ marginLeft: "auto" }} />}
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* ===== Step 6: Interests & Communication ===== */}
          {step === 6 && (
            <>
              <Text style={styles.stepTitle}>Demək olar hazırdır!</Text>
              <Text style={styles.stepDesc}>7-ə qədər maraq dairəsi seçin</Text>
              <View style={styles.chipWrap}>
                {AVAILABLE_INTERESTS.map((i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.chip, formData.interests.includes(i) && styles.chipActive]}
                    onPress={() => {
                      if (formData.interests.includes(i)) {
                        setFormData({ ...formData, interests: formData.interests.filter((x) => x !== i) });
                      } else if (formData.interests.length < 7) {
                        setFormData({ ...formData, interests: [...formData.interests, i] });
                      }
                    }}
                  >
                    <Text style={[styles.chipText, formData.interests.includes(i) && styles.chipTextActive]}>
                      {translateInterest(i, lang)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.sectionLabel}>Necə ünsiyyət qurursunuz?</Text>
              <View style={styles.commRow}>
                {COMM_STYLES.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.commCard, formData.communicationStyle === s.id && styles.commCardActive]}
                    onPress={() => setFormData({ ...formData, communicationStyle: s.id })}
                  >
                    <Text style={styles.optionEmoji}>{s.emoji}</Text>
                    <Text style={styles.commCardText}>{translateStyle(s.id, lang)}</Text>
                    {formData.communicationStyle === s.id && (
                      <CheckCircle2 size={18} color={Colors.primary} style={{ marginTop: 4 }} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* ===== Step 7: Photo ===== */}
          {step === 7 && (
            <>
              <Text style={styles.stepTitle}>Profil Şəkliniz</Text>
              <Text style={styles.stepDesc}>
                Üzünüz aydın görünən bir şəkil yükləyin. Bu, digər istifadəçilərə sizi tanımağa kömək edəcək.
              </Text>

              <View style={styles.photoRulesBox}>
                <Text style={styles.photoRulesTitle}>Qısa qaydalar</Text>
                {photoRulesAz.map((line: string, i: number) => (
                  <Text key={i} style={styles.photoRulesLine}>
                    {"\u2022 "}
                    {line}
                  </Text>
                ))}
              </View>

              <TouchableOpacity style={styles.photoBox} onPress={pickImage} disabled={isUploading}>
                {isUploading ? (
                  <View style={styles.photoStatusWrap}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.photoStatusText}>Yüklənir...</Text>
                  </View>
                ) : formData.profilePhotoUri ? (
                  <ExpoImage source={{ uri: formData.profilePhotoUri }} style={styles.photoPreview} contentFit="cover" />
                ) : (
                  <>
                    <Camera size={48} color={Colors.mutedForeground} />
                    <Text style={styles.photoPlaceholder}>Şəkil Seç</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Upload status */}
              {uploadSuccess && formData.profilePhotoUri ? (
                <View style={styles.photoSuccessRow}>
                  <CheckCircle2 size={18} color={Colors.green} />
                  <Text style={styles.photoSuccessText}>Şəkil qəbul olundu!</Text>
                </View>
              ) : null}

              {/* Change / Remove buttons */}
              {formData.profilePhotoUri && !isUploading ? (
                <View style={styles.photoActions}>
                  <TouchableOpacity style={styles.photoActionBtn} onPress={pickImage}>
                    <Camera size={18} color={Colors.primary} />
                    <Text style={styles.photoActionText}>Başqa Şəkil Seç</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoActionBtn} onPress={removePhoto}>
                    <Trash2 size={18} color={Colors.mutedForeground} />
                    <Text style={[styles.photoActionText, { color: Colors.mutedForeground }]}>Şəkli Sil</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* Photo tip */}
              <View style={[styles.infoNote, { marginTop: 20 }]}>
                <Text style={styles.infoNoteText}>
                  📸 İpucu: Yaxşı işıqlandırılmış, üzünüz aydın görünən bir şəkil seçin. Qrup şəkilləri tövsiyə olunmur.
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </Animated.View>

      {/* Footer button (gradient-style) */}
      <View style={styles.footer}>
        <View style={styles.footerGradient} />
        {step < TOTAL_STEPS ? (
          <TouchableOpacity
            style={[styles.primaryBtn, !canProceed() && styles.primaryBtnDisabled]}
            onPress={() => animateStepChange(step + 1)}
            disabled={!canProceed()}
          >
            <Text style={styles.primaryBtnText}>Davam et</Text>
            <ChevronRight size={20} color={Colors.foreground} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, (!canProceed() || isSaving) && styles.primaryBtnDisabled]}
            onPress={handleComplete}
            disabled={!canProceed() || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={Colors.foreground} />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>Tanışlığa Başla</Text>
                <Heart size={20} color={Colors.foreground} style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Location modal */}
      <Modal visible={showLocationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Məkan seçin</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <X size={28} color={Colors.foreground} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchInputWrap}>
              <Search size={18} color={Colors.mutedForeground} />
              <TextInput
                style={styles.searchInput}
                value={searchLocation}
                onChangeText={setSearchLocation}
                placeholder="Şəhər və ya rayon axtar..."
                placeholderTextColor={Colors.mutedForeground}
              />
            </View>
            <FlatList
              data={filteredLocations}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.locationItem, formData.location === item && styles.locationItemActive]}
                  onPress={() => {
                    setFormData({ ...formData, location: item });
                    setShowLocationModal(false);
                    setSearchLocation("");
                  }}
                >
                  <Text style={styles.locationItemText}>{item}</Text>
                  {formData.location === item && <Check size={20} color={Colors.primary} />}
                </TouchableOpacity>
              )}
              style={styles.locationList}
              ListEmptyComponent={<Text style={styles.emptyListText}>Nəticə tapılmadı</Text>}
            />
          </View>
        </View>
      </Modal>

      {/* Date picker modal */}
      <Modal visible={showDatePicker !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showDatePicker === "day" ? "Gün seçin" : showDatePicker === "month" ? "Ay seçin" : "İl seçin"}
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                <X size={28} color={Colors.foreground} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={showDatePicker === "day" ? DAYS : showDatePicker === "month" ? MONTHS : YEARS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected =
                  (showDatePicker === "day" && formData.birthDay === item.value) ||
                  (showDatePicker === "month" && formData.birthMonth === item.value) ||
                  (showDatePicker === "year" && formData.birthYear === item.value);
                return (
                  <TouchableOpacity
                    style={[styles.locationItem, isSelected && styles.locationItemActive]}
                    onPress={() => {
                      if (showDatePicker === "day") setFormData({ ...formData, birthDay: item.value });
                      else if (showDatePicker === "month") setFormData({ ...formData, birthMonth: item.value });
                      else if (showDatePicker === "year") setFormData({ ...formData, birthYear: item.value });
                      setShowDatePicker(null);
                    }}
                  >
                    <Text style={styles.locationItemText}>{item.label}</Text>
                    {isSelected && <Check size={20} color={Colors.primary} />}
                  </TouchableOpacity>
                );
              }}
              style={styles.locationList}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  headerBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center", borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: Colors.foreground, letterSpacing: 0.5 },
  stepIndicator: { fontSize: 14, color: Colors.mutedForeground, fontWeight: "600" },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: Colors.primary, borderRadius: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 24 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(233,66,162,0.12)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(233,66,162,0.25)",
  },
  errorText: { color: Colors.destructiveLight, fontSize: 13, flex: 1 },
  moderationBanner: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.35)",
    backgroundColor: "rgba(245,158,11,0.1)",
  },
  moderationBannerTitle: { fontSize: 15, fontWeight: "800", color: "#fbbf24", marginBottom: 6 },
  moderationBannerText: { fontSize: 14, color: Colors.mutedForeground, lineHeight: 20 },
  guidelinesLinkWrap: { marginTop: 10 },
  guidelinesLink: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  stepTitle: { fontSize: 28, fontWeight: "800", color: Colors.foreground, marginBottom: 10 },
  stepDesc: { fontSize: 15, color: Colors.mutedForeground, marginBottom: 24, lineHeight: 22 },
  guidelineBullet: {
    fontSize: 14,
    color: Colors.foreground,
    opacity: 0.92,
    lineHeight: 22,
    marginBottom: 10,
    paddingRight: 4,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxBoxChecked: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(233,66,162,0.2)",
  },
  checkboxLabel: { flex: 1, fontSize: 14, color: Colors.foreground, lineHeight: 22 },
  linkInline: { color: Colors.primary, fontWeight: "700" },
  photoRulesBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.35)",
    backgroundColor: "rgba(245,158,11,0.08)",
    padding: 14,
    marginBottom: 16,
  },
  photoRulesTitle: { fontSize: 14, fontWeight: "800", color: "#fbbf24", marginBottom: 8 },
  photoRulesLine: { fontSize: 13, color: Colors.mutedForeground, lineHeight: 20, marginBottom: 6 },
  label: { fontSize: 13, fontWeight: "600", color: Colors.mutedForeground, marginBottom: 8, marginTop: 14 },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    color: Colors.foreground,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bioInput: { minHeight: 110, textAlignVertical: "top" },
  charCount: { fontSize: 12, color: Colors.mutedForeground, textAlign: "right", marginTop: 4 },
  twoCol: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  dateRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  datePickerText: { color: Colors.foreground, fontSize: 15 },
  datePickerPlaceholder: { color: Colors.mutedForeground, fontSize: 15 },
  validationError: { fontSize: 13, color: Colors.primary, marginTop: 8 },
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  infoNoteText: { color: Colors.mutedForeground, fontSize: 12, lineHeight: 18, flex: 1 },
  genderRow: { flexDirection: "row", gap: 16, marginTop: 16 },
  genderCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 32,
    alignItems: "center",
  },
  genderCardActive: { borderColor: Colors.primary, backgroundColor: "rgba(233,66,162,0.08)" },
  genderIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  genderIconActive: { backgroundColor: Colors.primary },
  genderLabel: { fontSize: 18, fontWeight: "700", color: Colors.foreground },
  lookingForText: { textAlign: "center", color: Colors.mutedForeground, marginTop: 20, fontSize: 15 },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  locationBtnText: { color: Colors.mutedForeground, fontSize: 15 },
  locationBtnTextSelected: { color: Colors.foreground, fontSize: 15 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  chipActive: { backgroundColor: "rgba(233,66,162,0.12)", borderColor: Colors.primary },
  chipText: { fontSize: 14, color: Colors.mutedForeground, fontWeight: "500" },
  chipTextActive: { color: Colors.primary, fontWeight: "600" },
  sectionLabel: { fontSize: 17, fontWeight: "700", color: Colors.foreground, marginTop: 8, marginBottom: 12 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 8,
  },
  optionRowActive: { borderColor: Colors.primary, backgroundColor: "rgba(233,66,162,0.08)" },
  optionEmoji: { fontSize: 22, marginRight: 12 },
  optionText: { fontSize: 15, color: Colors.foreground, fontWeight: "500" },
  commRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  commCard: {
    width: "47%",
    padding: 18,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },
  commCardActive: { borderColor: Colors.primary, backgroundColor: "rgba(233,66,162,0.08)" },
  commCardText: { fontSize: 13, color: Colors.foreground, fontWeight: "600", marginTop: 6 },
  photoBox: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 3,
    borderColor: "rgba(233,66,162,0.25)",
    borderStyle: "dashed",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    overflow: "hidden",
  },
  photoPreview: { width: "100%", height: "100%", borderRadius: 110 },
  photoPlaceholder: { color: Colors.mutedForeground, marginTop: 10, fontSize: 15, fontWeight: "600" },
  photoStatusWrap: { alignItems: "center", gap: 10 },
  photoStatusText: { color: Colors.mutedForeground, fontSize: 13 },
  photoSuccessRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 },
  photoSuccessText: { color: Colors.green, fontSize: 14, fontWeight: "600" },
  photoActions: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 16 },
  photoActionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)" },
  photoActionText: { color: Colors.primary, fontSize: 13, fontWeight: "600" },
  footer: { padding: 20, paddingBottom: 40, position: "relative" },
  footerGradient: {
    position: "absolute",
    top: -30,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "transparent",
  },
  primaryBtn: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnDisabled: { opacity: 0.35, shadowOpacity: 0 },
  primaryBtnText: { color: Colors.foreground, fontSize: 17, fontWeight: "700", letterSpacing: 0.3 },
  // Modals
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: Colors.foreground },
  searchInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: Colors.foreground,
    fontSize: 15,
  },
  locationList: { maxHeight: 350 },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  locationItemActive: { backgroundColor: "rgba(233,66,162,0.08)" },
  locationItemText: { color: Colors.foreground, fontSize: 15 },
  emptyListText: { color: Colors.mutedForeground, fontSize: 14, textAlign: "center", padding: 24 },
});
