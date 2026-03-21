import { useEffect } from "react";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { tokenCache } from "../lib/token-cache";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, Text, TextInput } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_800ExtraBold,
} from "@expo-google-fonts/geist";

const convex = new ConvexReactClient(
  process.env.EXPO_PUBLIC_CONVEX_URL!,
  { unsavedChangesWarning: false }
);

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!clerkPublishableKey) {
  throw new Error("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is missing in .env");
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    Geist_800ExtraBold,
  });

  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;

    // Apply default font globally
    const baseTextStyle = { fontFamily: "Geist_400Regular" as const };
    const baseInputStyle = { fontFamily: "Geist_400Regular" as const };

    const TextAny = Text as unknown as { defaultProps?: { style?: any } };
    TextAny.defaultProps = TextAny.defaultProps || {};
    TextAny.defaultProps.style = [baseTextStyle, TextAny.defaultProps.style];

    const TextInputAny = TextInput as unknown as { defaultProps?: { style?: any } };
    TextInputAny.defaultProps = TextInputAny.defaultProps || {};
    TextInputAny.defaultProps.style = [baseInputStyle, TextInputAny.defaultProps.style];

    SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  useEffect(() => {
    if (Platform.OS === "android") {
      WebBrowser.warmUpAsync();
      return () => {
        WebBrowser.coolDownAsync();
      };
    }
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: "#070A18" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "700" },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="waitlist" options={{ headerShown: false }} />
          </Stack>
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
