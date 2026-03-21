import { Redirect } from "expo-router";

/**
 * Standalone /search route redirects to the tab-based search so the bottom
 * navbar is always visible and the full search UI (filters, grid) is used.
 */
export default function SearchRedirect() {
  return <Redirect href="/(tabs)/search" />;
}
