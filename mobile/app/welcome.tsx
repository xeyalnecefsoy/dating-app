import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { Heart, Sparkles, ChevronRight, ShieldCheck } from "../lib/icons";
import { Colors } from "../lib/colors";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(30)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const heartY = useRef(new Animated.Value(0)).current;
  const sparkY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
    }).start();
    Animated.timing(contentY, {
      toValue: 0,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
    }).start();

    const heartAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(heartY, { toValue: -6, duration: 1500, useNativeDriver: true }),
        Animated.timing(heartY, { toValue: 6, duration: 1500, useNativeDriver: true }),
      ])
    );
    heartAnim.start();

    const sparkAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkY, { toValue: 6, duration: 1750, useNativeDriver: true }),
        Animated.timing(sparkY, { toValue: -6, duration: 1750, useNativeDriver: true }),
      ])
    );
    sparkAnim.start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.gradientOverlay} />

      {/* Logo Section */}
      <View style={styles.logoSection}>
        <Animated.View
          style={[
            styles.logoWrapper,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Floating heart */}
          <Animated.View
            style={[styles.floatingHeart, { transform: [{ translateY: heartY }] }]}
          >
            <Heart size={20} color={Colors.foreground} />
          </Animated.View>

          {/* Floating sparkle */}
          <Animated.View
            style={[styles.floatingSparkle, { transform: [{ translateY: sparkY }] }]}
          >
            <Sparkles size={16} color={Colors.foreground} />
          </Animated.View>
        </Animated.View>
      </View>

      {/* Content Section */}
      <Animated.View
        style={[
          styles.contentSection,
          { opacity: contentOpacity, transform: [{ translateY: contentY }] },
        ]}
      >
        <Text style={styles.title}>Danyeri ilə Tanış Olun</Text>
        <Text style={styles.subtitle}>
          Dəyərlərinizə uyğun insanlarla tanış olun.
        </Text>
        <Text style={styles.description}>
          Azərbaycanlılar üçün anlayış, ortaq dəyərlər və səmimi əlaqə üzərində
          qurulan münasibətlər üçün müasir məkan.
        </Text>

        {/* Get Started Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(auth)/sign-up")}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Başla</Text>
          <ChevronRight size={20} color={Colors.foreground} />
        </TouchableOpacity>

        {/* Secure badge */}
        <View style={styles.secureBadge}>
          <ShieldCheck size={12} color={Colors.green} />
          <Text style={styles.secureBadgeText}>Təhlükəsiz və Məxfi</Text>
        </View>

        {/* Sign In link */}
        <View style={styles.signInRow}>
          <Text style={styles.signInText}>Hesabınız var? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
            <Text style={styles.signInLink}>Daxil ol</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  logoSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    position: "relative",
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
    elevation: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  floatingHeart: {
    position: "absolute",
    top: -12,
    right: -12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.green,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  floatingSparkle: {
    position: "absolute",
    bottom: -4,
    left: -20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  contentSection: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.foreground,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 300,
    marginBottom: 28,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    width: width - 48,
    height: 52,
    borderRadius: 14,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  primaryButtonText: {
    color: Colors.foreground,
    fontSize: 17,
    fontWeight: "700",
  },
  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
    opacity: 0.6,
  },
  secureBadgeText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  signInRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  signInText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
  },
  signInLink: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
  },
});
