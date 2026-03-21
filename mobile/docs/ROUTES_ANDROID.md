# Mobile routes (Android-first)

This document maps Expo Router routes under `mobile/app/**`, their entry points, and expected navigation behavior.

## Route map

### Root
- `/` → `mobile/app/index.tsx` (redirect gate: signed-in + profile complete → `/(tabs)/home`, else → onboarding/waitlist/welcome)

### Auth group (`/(auth)`)
- `/(auth)/sign-in` → `mobile/app/(auth)/sign-in.tsx`
- `/(auth)/sign-up` → `mobile/app/(auth)/sign-up.tsx`

### Tabs group (`/(tabs)`)
- `/(tabs)/home` → `mobile/app/(tabs)/home.tsx` (custom header, tab header hidden)
- `/(tabs)/discovery` → `mobile/app/(tabs)/discovery.tsx` (custom header, tab header hidden)
- `/(tabs)/search` → `mobile/app/(tabs)/search.tsx` (custom header, tab header hidden)
- `/(tabs)/messages` → `mobile/app/(tabs)/messages.tsx` (custom header, tab header hidden)
- `/(tabs)/profile` → `mobile/app/(tabs)/profile.tsx` (custom header, tab header hidden)
- `/(tabs)/matches` → `mobile/app/(tabs)/matches.tsx` (hidden from tab bar)

### Top-level screens (outside tabs)
These are pushed as separate routes from tab screens; tab bar visibility depends on root stack structure.

- `/welcome` → `mobile/app/welcome.tsx`
- `/onboarding` → `mobile/app/onboarding.tsx`
- `/waitlist` → `mobile/app/waitlist.tsx`
- `/verify` → `mobile/app/verify.tsx`
- `/practice` → `mobile/app/practice.tsx`
- `/premium` → `mobile/app/premium.tsx`
- `/badges` → `mobile/app/badges.tsx`
- `/likes` → `mobile/app/likes.tsx`
- `/notifications` → `mobile/app/notifications.tsx`
- `/settings` → `mobile/app/settings.tsx`

### Dynamic
- `/chat/[id]` → `mobile/app/chat/[id].tsx` (chat id can be `general` or a user id)
- `/user/[id]` → `mobile/app/user/[id].tsx`

### Alias/redirect routes
- `/messages` → `mobile/app/messages.tsx` (redirects to `/(tabs)/messages`)
- `/search` → `mobile/app/search.tsx` (redirects to `/(tabs)/search`)

## Known entry points to validate
- `/(tabs)/home` → pushes `/notifications`, `/likes`, `/(tabs)/profile`, and `/stories` (route must exist).
- `/(tabs)/profile` → pushes `/settings`, `/premium`, `/verify`, `/likes`, `/badges`, `/practice`.

