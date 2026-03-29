/** Production site for API routes (profile photo validation). Override in dev with EXPO_PUBLIC_SITE_URL. */

export const DEFAULT_SITE_URL = "https://www.danyeri.az";

export function getSiteUrl(): string {
  return (process.env.EXPO_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
}

export function getValidateProfilePhotoUrl(): string {
  return `${getSiteUrl()}/api/validate-profile-photo`;
}
