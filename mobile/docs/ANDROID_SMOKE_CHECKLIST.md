# Android smoke checklist (Expo Router)

Goal: validate **every route renders**, navigation works, and no runtime crashes occur on Android.

## Pre-flight (once)
- Run `npm run typecheck` (must pass)
- Run `npm run check:icons` (must pass)
- Start app on Android: `npm run android`

## Auth + gatekeeping
- Launch app logged out → expect redirect to `/welcome`
- From Welcome:
  - Go to Sign In → `/ (auth)/sign-in`
  - Go to Sign Up → `/(auth)/sign-up`
- Sign in:
  - If profile incomplete → `/onboarding`
  - If waitlist → `/waitlist`
  - Else → `/(tabs)/home`

## Tabs
### Home `/(tabs)/home`
- Header renders once (no duplicated headers)
- Notifications bell opens `/notifications` and back works
- “Bəyənmələr” opens `/likes` and back works
- “Uğur Hekayələri” opens `/stories` and back works

### Discovery `/(tabs)/discovery`
- Renders profiles / empty state without crash
- Like / pass / super-like don’t crash
- Tapping profile opens `/user/[id]` and back works
- Match modal → “Mesaj yaz” opens `/chat/[id]` and back works

### Search `/(tabs)/search`
- Search input works
- Tapping a card opens `/user/[id]`

### Messages `/(tabs)/messages`
- General chat row opens `/chat/general`
- Match conversation opens `/chat/[id]`
- Requests modal open/close works

### Profile `/(tabs)/profile`
- Header renders once (no duplicated headers)
- Settings icon opens `/settings` and back returns to Profile
- Premium CTA opens `/premium`
- Verify CTA opens `/verify`
- Badges opens `/badges`
- Practice opens `/practice`
- Likes opens `/likes`
- Sign out returns to `/(auth)/sign-in`

## Top-level screens
- `/settings`: header shown, blocked users modal open/close, sign out works
- `/likes`: premium blur logic works (non-premium: only first visible)
- `/notifications`: list renders / empty state renders
- `/premium`: renders, back works
- `/verify`: renders, back works
- `/badges`: renders, back works
- `/practice`: renders, back works
- `/stories`: renders, back works

## Dynamic routes robustness
- Open `/chat/general` directly (deep link) → should render or show safe empty/error state
- Open `/chat/invalid` → should not crash (safe empty/error)
- Open `/user/invalid` → should not crash (safe empty/error)

