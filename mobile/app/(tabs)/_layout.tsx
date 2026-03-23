import { Tabs } from "expo-router";
import { Home, Compass, Search, MessageCircle, User } from "../../lib/icons";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { api } from "../../lib/api";
import { Colors } from "../../lib/colors";

export default function TabLayout() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const dbUser = useQuery(
    api.users.getUser,
    userId ? { clerkId: userId } : "skip",
  );

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (dbUser === undefined) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!dbUser) {
    return <Redirect href="/onboarding" />;
  }

  if (dbUser.status === "waitlist") {
    return <Redirect href="/waitlist" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.foreground,
        headerTitleStyle: { fontWeight: "700" },
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 12,
          paddingTop: 8,
          height: 72,
        },
        tabBarActiveTintColor: Colors.tabBarActiveTint,
        tabBarInactiveTintColor: Colors.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Ana Səhifə",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="discovery"
        options={{
          title: "Kəşf",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Compass size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Axtar",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Mesaj",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MessageCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="simulator"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
