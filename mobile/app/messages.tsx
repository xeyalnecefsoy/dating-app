import { Redirect } from "expo-router";

/**
 * Standalone /messages route redirects to the tab-based messages so the bottom
 * navbar is always visible and the full messages UI (list, requests) is used.
 */
export default function MessagesRedirect() {
  return <Redirect href="/(tabs)/messages" />;
}
