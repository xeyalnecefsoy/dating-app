# Development Notes & Lessons Learned

## 1. Data Synchronization (Local vs Remote)
### Problem
Initially, the app relied heavily on `localStorage` for user state (matches, likes), which prevented users on different devices (or different browser sessions) from seeing each other's actions.
### Solution
*   **Hybrid Approach:** We kept `localStorage` for the current user's session but integrated **Convex** for shared state (matches, messages, presence).
*   **Auto-Sync:** Implemented a one-way sync in `UserContext.tsx`. on mount, it checks if there are matches in `localStorage` that are missing from Convex and pushes them. This bridges the gap between the mock prototype and the real backend.
*   **Type Safety:** **ALWAYS** force ID conversion to `String()` when comparing local IDs with remote Convex IDs to avoid subtle bugs (e.g., `5` vs `"5"`).

## 2. Messaging Architecture
### Problem
Users could not see each other's messages because they were writing to different channel IDs (e.g., User A wrote to `conv-B`, User B wrote to `conv-A`).
### Solution
*   **Deterministic Channel IDs:** Implemented a `getChannelId(uid1, uid2)` helper function that **sorts** the user IDs. This ensures that regardless of who initiates the chat, the channel ID is always `match-MIN-MAX` (e.g., `match-5-6`).
*   **Component Refactor:** Created `ConversationRow` to independently fetch the last message for each conversation, preventing the need to load all messages for all users at once.

## 3. Real-Time Presence (Online/Offline)
### Implementation
*   **Backend:** Added a `presence` table in Convex with `userId` and `updatedAt`.
*   **Heartbeat:** `UserContext` sends a `ping` mutation every 60 seconds (and on mount).
*   **Frontend Logic:** A user is considered "Online" if their `updatedAt` is within the last 2 minutes.
*   **Visuals:**
    *   **Online:** Green dot + "Active now" (Green text).
    *   **Offline:** Red dot + "Offline" / "Last seen..." (Red text).

## 4. Stories & Discovery (Implemented Jan 20)
### Implementation
*   **Hybrid Model:** Stories are shown in both **Discovery** (via `StoryRing` on main card) and **Messages** (via `StoriesBar`).
*   **Filter Logic:** `StoriesBar` automatically filters stories based on the opposite gender (using `user.lookingFor` preference).
*   **Interactions:**
    *   **Replies:** Replying to a story checks if the user is a `match`.
        *   *If Matched:* Sends a direct Convex message ("💬 Story cavabı: ...").
        *   *If Not Matched:* Sends a **Message Request**.
*   **UX Features:**
    *   **Smart Navigation:** Left arrow appears if there is a previous story/user. Input clears on navigation.
    *   **Spacebar:** Prevents pausing when typing in the reply input.

## 5. Message Controls (Unsend & Cancel)
### New Features (Jan 20)
*   **Unsend Messages:** Users can delete their *own* messages within **15 minutes** of sending.
    *   *Backend:* `convex/messages.ts:deleteMessage` enforces the 15-minute rule and ownership check.
    *   *UI:* Trash icon appears on hover/selection for eligible messages.
*   **Cancel Requests:** Users can rescind "Sent Requests" from the Messages page.
    *   *UI:* "Sent Requests" section added. "X" button triggers `cancelMessageRequest` in `UserContext`.

## 6. Likes & Matching System
*   **Reliability:** Implemented a fallback mechanism. If the Convex backend fails (network/server error), the app falls back to a **30% random match chance** locally. This ensures the app never feels "broken" during demos.
*   **Notifications:** Added a global badge on the Bell icon that sums `unreadMatches` + `messageRequests`.

## 7. Known Issues / To-Do
*   **ParticipantId Lint:** There is a lingering TypeScript error in `app/messages/page.tsx` regarding `participantId` on a `never` type. This is likely due to the `Conversation` type union. It does not affect runtime but should be fixed for clean code.
*   **Convex Project:** We are using project `tremendous-partridge-845` (configured in `.env.local`). Ensure this project is active.
*   **Alerts:** All browser `alert()` calls have been replaced with a custom `useToast` hook for better UI.

## 8. General Best Practices for this Project
*   **Mock Data:** Continue using `MOCK_USERS` for static profile data (names, avatars) to avoid seeding a complex database for now, but use Convex for **all interactions** (messages, matches, pings, *story replies*).
*   **Convex Queries:** When adding new features, prefer creating specific queries (e.g., `api.messages.last`) rather than filtering large datasets on the client.

## 9. UI/UX & Branding Overhaul (Jan 23)
### Branding
*   **Rebranding:** Renamed application from "Aura Connect" to **"Danyeri"**. Updated all strings, constants, and UI elements.
*   **Visual Alignment:** Fixed alignment issues on "Start" (Başla) buttons and Sign In/Sign Up logos using precise flexbox and optical alignment techniques.

### Onboarding Flow
*   **Enhanced Data Collection:**
    *   Split Name into First/Last Name for better profile verification readiness.
    *   Replaced simple Age input with a full **Date of Birth picker** (Day/Month/Year).
    *   Expanded Location selection to include **all Azerbaijan regions** with a searchable dropdown.
*   **UX Improvements:**
    *   Increased selection limits: Interests (up to 7), Values (up to 5).
    *   Integrated **Clerk Profile Image**: Automatically uses the Google/Clerk avatar if available, falling back to gender-based defaults.
    *   Improved mobile bottom sheet/button spacing (`pb-8`).

### Navigation & Settings
*   **Simplified Navigation:**
    *   Removed redundant Clerk `UserButton` from Sidebar and BottomNav to avoid duplicate profile pictures.
    *   Implemented a custom **Profile Button** that shows the user's avatar with a active ring state.
*   **Settings Page:**
    *   Replaced native browser `confirm()` alerts with custom **Modals** for "Logout" and "Delete Account" actions.
    *   Added proper `Clerk.signOut()` integration to ensure complete session cleanup upon logout/deletion.

### Landing Page
*   **Optimization:**
    *   Refined the Hero section "Başla" button to be more compact (`max-w-md`) and optically aligned.
    *   Improved Sign In/Sign Up page layouts for better vertical rhythm and centering.

## 10. Security & Privacy Hardening (Jan 26)
### Backend Security (Convex)
*   **Authentication Enforcement:** Moved from client-side trust to strict server-side verification using `ctx.auth.getUserIdentity()` in all mutations/queries.
    *   `likes.ts`: Verified `likerId` matches authenticated user.
    *   `matches.ts`: Verified `senderId`/`userId` in match creation and request handling.
    *   `messages.ts`: Enforced `userId` on message sending, editing, and deleting. Confirmed users can only delete/edit *their own* messages.
    *   `presence.ts`: Ensured users can only update their own online status.
*   **Data Access Control:** Updated queries to return only data relevant to the authenticated user (e.g., `getRequests`, `list` matches).

### Data Privacy (GDPR Compliance)
*   **Account Deletion:** Implemented `deleteAccount` mutation in `users.ts` that performs a cascading delete of all user data:
    *   Matches (both directions).
    *   Likes (given and received).
    *   Messages.
    *   Presence records.
    *   This ensures "Right to be Forgotten" compliance.

### Frontend Security (Next.js)
*   **headers:** Added security headers to `next.config.ts`:
    *   `X-Frame-Options: DENY`: Prevents Clickjacking.
    *   `X-Content-Type-Options: nosniff`: Prevents MIME sniffing.
    *   `Strict-Transport-Security` (HSTS): Enforces HTTPS.
    *   `Permissions-Policy`: Restricts access to sensitive browser features (camera, mic) unless explicitly needed.
*   **Middleware:** Verified `middleware.ts` correctly segments Public vs. Private routes using Clerk, ensuring unauthorized access is blocked at the edge.

## 11. Communication Enhancements (Jan 30)
### Safe & Rich Messages (No-Cost)
*   **Icebreakers:** Implemented a list of curated questions (Fun, Deep, Flirty) that users can send to start a conversation. 
    *   *Technical:* Stored as static constant `lib/icebreakers.ts`. Sent as `format: 'icebreaker'`.
*   **Venue Invites:** Integrated `venues` catalog into the chat. Users can tap the Calendar icon to invite matches to specific "Date Spots".
    *   *Technical:* Sends `format: 'invite'` with `venueId`. Frontend renders a rich "Invitation Card" using the `venueId` data.
*   **Schema Update:** Updated `convex/schema.ts` `messages` table to include `venueId`, `icebreakerId`, and expanded `format` usage.

## 12. Safety, Quality & SEO (Jan 30)
### Waitlist System (Gender Balancing)
*   **Goal:** Address male/female imbalance and create exclusivity.
*   **Logic:**
    *   **Females:** Immediately `active` status upon onboarding.
    *   **Males:** Automatically assigned `waitlist` status.
    *   **UI:** Implemented `WaitlistScreen` in `page.tsx` that blocks access for waitlisted users, showing their "position" and explaining the quality standards.
*   **Data:** Added `status: 'active' | 'waitlist' | 'banned'` to `users` schema.

### Photo Verification (AI-Powered)
*   **Problem:** Users uploading fake, dark, or no-face photos due to privacy fears.
*   **Solution:** Integrated **Client-Side AI Verification**.
    *   *Library:* `face-api.js` (using `tiny_face_detector` model loaded from CDN).
    *   *Checks:*
        1.  **Face Detection:** Ensures at least one human face is present.
        2.  **Brightness:** Checks average pixel brightness to reject dark/unclear photos.
    *   *UX:* Real-time feedback ("Checking...", "Photo accepted", "Too dark"). Users cannot proceed in onboarding without a valid photo.

### Azerbaijan SEO Strategy
*   **Technical SEO:**
    *   **Metadata:** Fully localized titles and descriptions (`danyeri.az`, "Tanışlıq tətbiqi", "Evlilik").
    *   **Open Graph:** Created custom OG Image and Twitter Card metadata for social sharing.
    *   **Crawling:** Added `robots.txt` and comprehensive `sitemap.xml`.
    *   **Structured Data:** Added JSON-LD for `MobileApplication` and `Organization` to boost rich search results.
    *   **Domain:** Configured logic to prioritize `.az` domain signaling in Google.

## 13. Admin System & Founder Perks (Jan 30)
### Admin Panel Refactor
*   **Real Data Integration:**
    *   Replaced all mock data in `app/admin` with real-time **Convex Queries** (`getPlatformStats`, `getAllUsers`).
    *   Now tracks actual User Count, Active Users, Message Volume, and Pending Queues.
*   **Role-Based Access Control (RBAC):**
    *   Implemented strict role checking (`user`, `moderator`, `admin`, `superadmin`).
    *   **Frontend:** `admin/page.tsx` automatically redirects unauthorized users to home.
    *   **Backend:** `convex/admin.ts` functions verify checks before executing mutations.
*   **Management Actions:**
    *   **Ban User:** Admins can now instantly ban users, preventing login/access.
    *   **Role Management:** Superadmin (`xeyalnecefsoy@gmail.com`) can promote/demote users via the Admin UI.

### Founder Status
*   **"Qurucu" Badge:**
    *   Implemented a visually distinct badge (Crown icon + Gradient) for the founder.
    *   Visible on **Profile Page** and **Discovery Cards** to establish trust and authority.
    *   **Logic:** Checks if role is `superadmin` OR email matches the founder's email.
*   **Security:**
    *   Hardcoded `matches('xeyalnecefsoy@gmail.com')` check in critical admin functions effectively creates a "God Mode" that cannot be usurped even if database roles are manipulated.

### Technical & Build Fixes
*   **Type Safety:**
    *   Fixed build errors by ensuring `convex/_generated/api.d.ts` is committed to git (resolving missing `api.admin` module on Vercel).
    *   Unified `UserProfile` types across `UserContext` and UI components to include optional `email` and `role` fields.
*   **Redirect Logic:**
    *   Fixed `Logout` / `Delete Account` flash-onboarding bug by ensuring `router.push('/')` happens *before* clearing state.

