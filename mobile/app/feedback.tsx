import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import Constants from "expo-constants";
import { api } from "../lib/api";
import { Colors } from "../lib/colors";
import { ArrowLeft, Send } from "../lib/icons";
import { APP_FEEDBACK_CATEGORY_LABELS_AZ } from "../../lib/formatAz";

const CATEGORY_IDS = Object.keys(APP_FEEDBACK_CATEGORY_LABELS_AZ) as Array<
  keyof typeof APP_FEEDBACK_CATEGORY_LABELS_AZ
>;

export default function FeedbackScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const submitFeedback = useMutation(api.appFeedback.submitAppFeedback);

  const [category, setCategory] = useState<string>(CATEGORY_IDS[0] ?? "bug");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (trimmed.length < 10) {
      Alert.alert("Çox qısa", "Ən azı 10 simvol yazın.");
      return;
    }
    setSubmitting(true);
    try {
      await submitFeedback({
        category,
        message: trimmed,
        platform: `${Platform.OS} ${Platform.Version ?? ""}`.slice(0, 120),
        appVersion: Constants.expoConfig?.version || "1.0.0",
      });
      Alert.alert("Göndərildi", "Təşəkkür edirik. Komanda baxacaq.", [
        { text: "OK", onPress: () => router.back() },
      ]);
      setMessage("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert("Xəta", msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Problem bildir",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
                <ArrowLeft size={22} color={Colors.foreground} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={[styles.container, styles.centered]}>
          <Text style={styles.hint}>Daxil olun və problem bildirin.</Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace("/(auth)/sign-in")}
          >
            <Text style={styles.primaryBtnText}>Daxil ol</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Problem bildir",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <ArrowLeft size={22} color={Colors.foreground} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.lead}>
          Nasazlıq, donma və ya digər problemlər barədə qısa yazın. 24 saatda ən çox 5 bildiriş.
        </Text>

        <Text style={styles.label}>Kateqoriya</Text>
        {CATEGORY_IDS.map((id) => {
          const selected = category === id;
          const label = APP_FEEDBACK_CATEGORY_LABELS_AZ[id];
          return (
            <TouchableOpacity
              key={id}
              style={[styles.catBtn, selected && styles.catBtnActive]}
              onPress={() => setCategory(id)}
            >
              <Text style={[styles.catBtnText, selected && styles.catBtnTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.label}>Təsvir</Text>
        <TextInput
          style={styles.textarea}
          value={message}
          onChangeText={setMessage}
          placeholder="Nə baş verir? Hansı ekran?"
          placeholderTextColor={Colors.mutedForeground}
          multiline
          textAlignVertical="top"
          maxLength={4000}
        />
        <Text style={styles.count}>{message.trim().length}/4000</Text>

        <TouchableOpacity
          style={[styles.submitBtn, (submitting || message.trim().length < 10) && styles.submitBtnOff]}
          disabled={submitting || message.trim().length < 10}
          onPress={handleSubmit}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.foreground} />
          ) : (
            <>
              <Send size={20} color={Colors.foreground} />
              <Text style={styles.submitBtnText}>Göndər</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  centered: { justifyContent: "center", alignItems: "center", padding: 24 },
  hint: { color: Colors.mutedForeground, textAlign: "center", marginBottom: 16 },
  lead: { color: Colors.mutedForeground, fontSize: 14, lineHeight: 22, marginBottom: 20 },
  label: {
    color: Colors.mutedForeground,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 8,
  },
  catBtn: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 14,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  catBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(233,66,162,0.12)",
  },
  catBtnText: { color: Colors.mutedForeground, fontSize: 15 },
  catBtnTextActive: { color: Colors.foreground, fontWeight: "600" },
  textarea: {
    minHeight: 160,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 14,
    color: Colors.foreground,
    fontSize: 15,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  count: { fontSize: 12, color: Colors.mutedForeground, textAlign: "right", marginTop: 4 },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 24,
  },
  submitBtnOff: { opacity: 0.5 },
  submitBtnText: { color: Colors.foreground, fontWeight: "700", fontSize: 16 },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  primaryBtnText: { color: Colors.foreground, fontWeight: "700" },
});
