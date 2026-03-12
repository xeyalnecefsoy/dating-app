import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1a1a2e" }}>
        <ActivityIndicator size="large" color="#e94057" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)/discovery" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
