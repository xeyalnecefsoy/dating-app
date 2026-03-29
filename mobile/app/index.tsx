import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { View, ActivityIndicator, Text } from "react-native";
import { api } from "../lib/api";
import { Colors } from "../lib/colors";
import { useEffect, useState } from "react";

const SUPERADMIN_EMAIL = "xeyalnecefsoy@gmail.com";

export default function Index() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const { user: clerkUser } = useUser();
  const dbUser = useQuery(api.users.getUser, userId ? { clerkId: userId } : "skip");
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const [autoRegistering, setAutoRegistering] = useState(false);

  const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress;
  const isSuperadmin = userEmail === SUPERADMIN_EMAIL;

  const isProfileComplete = !!(
    dbUser?.name &&
    dbUser?.gender &&
    dbUser?.age &&
    dbUser?.location &&
    dbUser?.bio
  );

  useEffect(() => {
    if (isSignedIn && dbUser === null && isSuperadmin && userId && !autoRegistering) {
      setAutoRegistering(true);
      createOrUpdateUser({
        clerkId: userId,
        email: userEmail,
        name: clerkUser?.fullName || "Superadmin",
        gender: "male",
        age: 25,
        location: "Bakı",
        bio: "Danyeri Superadmin",
        values: [],
        loveLanguage: "quality_time",
        interests: [],
        lookingFor: "female",
      }).finally(() => setAutoRegistering(false));
    }
  }, [isSignedIn, dbUser, isSuperadmin, userId, autoRegistering]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isSignedIn) {
    if (dbUser === undefined || autoRegistering) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ color: Colors.mutedForeground, marginTop: 12, fontSize: 14 }}>Hesab yoxlanılır...</Text>
        </View>
      );
    }

    if (dbUser === null && isSuperadmin) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ color: Colors.mutedForeground, marginTop: 12, fontSize: 14 }}>Superadmin qeydiyyatı...</Text>
        </View>
      );
    }

    if (!dbUser || !isProfileComplete) {
      return <Redirect href="/onboarding" />;
    }

    if (dbUser.status === "rejected") {
      return <Redirect href="/rejected" />;
    }

    if (dbUser.status === "needs_revision") {
      return <Redirect href="/onboarding" />;
    }

    if (dbUser.status === "waitlist") {
      return <Redirect href="/waitlist" />;
    }

    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/welcome" />;
}
