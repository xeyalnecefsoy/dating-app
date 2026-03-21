import { useSignIn, useSSO } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { ArrowLeft, AlertCircle } from "../../lib/icons";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { Colors } from "../../lib/colors";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onGoogleSignIn = useCallback(async () => {
    try {
      setGoogleLoading(true);
      setError("");
      const { createdSessionId, setActive: ssoSetActive } =
        await startSSOFlow({ strategy: "oauth_google" });

      if (createdSessionId && ssoSetActive) {
        await ssoSetActive({ session: createdSessionId });
        router.replace("/");
      }
    } catch (err: any) {
      const message =
        err.errors?.[0]?.longMessage || "Google ilə giriş uğursuz oldu";
      setError(message);
    } finally {
      setGoogleLoading(false);
    }
  }, [startSSOFlow]);

  const onEmailSignIn = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/");
      }
    } catch (err: any) {
      const message = err.errors?.[0]?.longMessage || "Giriş uğursuz oldu";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={22} color={Colors.foreground} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View style={styles.brandContainer}>
          <View style={styles.logoShadow}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandTitle}>Danyeri</Text>
          <Text style={styles.brandSubtitle}>Hesabınıza daxil olun</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {error ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={Colors.primary} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Google OAuth */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={onGoogleSignIn}
            disabled={googleLoading}
            activeOpacity={0.8}
          >
            {googleLoading ? (
              <ActivityIndicator color={Colors.foreground} />
            ) : (
              <>
                <Ionicons
                  name="logo-google"
                  size={18}
                  color={Colors.foreground}
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.googleButtonText}>
                  Google ilə daxil olun
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>və ya</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email + Password */}
          <Text style={styles.label}>E-poçt</Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={styles.label}>Şifrə</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onEmailSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.foreground} />
            ) : (
              <Text style={styles.buttonText}>Daxil ol</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Hesabınız yoxdur? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Qeydiyyat</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    position: "absolute",
    top: 52,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoShadow: {
    width: 80,
    height: 80,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  logo: {
    width: 80,
    height: 80,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: Colors.foreground,
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginTop: 6,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primaryAlpha15,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(233,66,162,0.2)",
  },
  errorText: {
    color: Colors.primary,
    fontSize: 13,
    flex: 1,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  googleButtonText: {
    color: Colors.foreground,
    fontSize: 15,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dividerText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
    marginHorizontal: 12,
  },
  label: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.foreground,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.foreground,
    fontSize: 16,
    fontWeight: "700",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});
