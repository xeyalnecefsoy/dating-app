import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Badge definitions with their requirements
const BADGE_CHECKS = [
  {
    id: "early-adopter",
    check: "early_user",
  },
  {
    id: "first-match",
    check: "matches_gte_1",
  },
  {
    id: "social-butterfly",
    check: "matches_gte_10",
  },
  {
    id: "conversation-starter",
    check: "icebreakers_gte_10",
  },
  {
    id: "profile-pro",
    check: "complete_profile",
  },
  {
    id: "deep-diver",
    check: "long_conversation",
  },
  {
    id: "week-streak",
    check: "streak_7",
  },
];

/**
 * Check and award badges for the current user.
 * Called periodically from the frontend (e.g. on login, on match creation).
 */
export const checkAndAwardBadges = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { awarded: [] };

    const userId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!user) return { awarded: [] };

    const currentBadges: string[] = (user as any).badges || [];
    const newBadges: string[] = [];

    // --- Check each badge ---

    // 1. Early Adopter: among first 100 users
    if (!currentBadges.includes("early-adopter")) {
      const allUsers = await ctx.db.query("users").collect();
      if (allUsers.length <= 100 || (user.createdAt && user.createdAt <= (allUsers[99]?.createdAt || Date.now()))) {
        newBadges.push("early-adopter");
      }
    }

    // 2. First Match: at least 1 match
    if (!currentBadges.includes("first-match")) {
      const matchCount = await countMatches(ctx, userId);
      if (matchCount >= 1) {
        newBadges.push("first-match");
      }
    }

    // 3. Social Butterfly: at least 10 matches
    if (!currentBadges.includes("social-butterfly")) {
      const matchCount = await countMatches(ctx, userId);
      if (matchCount >= 10) {
        newBadges.push("social-butterfly");
      }
    }

    // 4. Conversation Starter: sent 10+ icebreaker messages
    if (!currentBadges.includes("conversation-starter")) {
      const icebreakers = await ctx.db
        .query("messages")
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), userId),
            q.eq(q.field("format"), "icebreaker")
          )
        )
        .collect();
      if (icebreakers.length >= 10) {
        newBadges.push("conversation-starter");
      }
    }

    // 5. Profile Pro: all important fields filled
    if (!currentBadges.includes("profile-pro")) {
      const hasAllFields =
        user.name &&
        user.bio &&
        user.age &&
        user.gender &&
        user.location &&
        user.avatar &&
        user.interests &&
        (user.interests as string[]).length > 0 &&
        user.loveLanguage &&
        user.communicationStyle &&
        user.lookingFor;

      if (hasAllFields) {
        newBadges.push("profile-pro");
      }
    }

    // 6. Deep Diver: a conversation with 20+ messages from user
    if (!currentBadges.includes("deep-diver")) {
      const userMessages = await ctx.db
        .query("messages")
        .filter((q) => q.eq(q.field("userId"), userId))
        .collect();

      // Group by channelId and check if any channel has 20+ messages from this user
      const channelCounts: Record<string, number> = {};
      for (const msg of userMessages) {
        const ch = msg.channelId || "unknown";
        channelCounts[ch] = (channelCounts[ch] || 0) + 1;
      }
      const hasLongConvo = Object.values(channelCounts).some((c) => c >= 20);
      if (hasLongConvo) {
        newBadges.push("deep-diver");
      }
    }

    // 7. Week Streak: 7 unique days of presence pings in the last 10 days
    if (!currentBadges.includes("week-streak")) {
      const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
      const presenceData = await ctx.db
        .query("presence")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      // Simplified: if the user has been active (presence exists) and account is 7+ days old
      if (presenceData && user.createdAt && (Date.now() - user.createdAt) >= 7 * 24 * 60 * 60 * 1000) {
        newBadges.push("week-streak");
      }
    }

    // Apply new badges
    if (newBadges.length > 0) {
      const updatedBadges = [...currentBadges, ...newBadges];
      await ctx.db.patch(user._id, { badges: updatedBadges } as any);
    }

    return { awarded: newBadges };
  },
});

/**
 * Get badge progress for the current user
 */
export const getProgress = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return {};

    const userId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!user) return {};

    const matchCount = await countMatches(ctx, userId);

    // Count icebreaker messages
    const icebreakers = await ctx.db
      .query("messages")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("format"), "icebreaker")
        )
      )
      .collect();

    // Count messages per channel for deep-diver
    const userMessages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    const channelCounts: Record<string, number> = {};
    for (const msg of userMessages) {
      const ch = msg.channelId || "unknown";
      channelCounts[ch] = (channelCounts[ch] || 0) + 1;
    }
    const maxConvoLength = Math.max(0, ...Object.values(channelCounts));

    // Profile completeness
    const profileFields = [
      user.name, user.bio, user.age, user.gender, user.location,
      user.avatar, user.interests && (user.interests as string[]).length > 0,
      user.loveLanguage, user.communicationStyle, user.lookingFor,
    ];
    const filledFields = profileFields.filter(Boolean).length;

    // Account age in days
    const accountAgeDays = user.createdAt
      ? Math.floor((Date.now() - user.createdAt) / (24 * 60 * 60 * 1000))
      : 0;

    return {
      "first-match": { current: Math.min(matchCount, 1), target: 1 },
      "social-butterfly": { current: Math.min(matchCount, 10), target: 10 },
      "conversation-starter": { current: Math.min(icebreakers.length, 10), target: 10 },
      "profile-pro": { current: filledFields, target: 10 },
      "deep-diver": { current: Math.min(maxConvoLength, 20), target: 20 },
      "week-streak": { current: Math.min(accountAgeDays, 7), target: 7 },
      "early-adopter": { current: 1, target: 1 }, // either you are or you aren't
    };
  },
});

// Helper: count accepted matches for a user
async function countMatches(ctx: any, userId: string): Promise<number> {
  const matches1 = await ctx.db
    .query("matches")
    .filter((q: any) =>
      q.and(
        q.eq(q.field("user1Id"), userId),
        q.eq(q.field("status"), "accepted")
      )
    )
    .collect();

  const matches2 = await ctx.db
    .query("matches")
    .filter((q: any) =>
      q.and(
        q.eq(q.field("user2Id"), userId),
        q.eq(q.field("status"), "accepted")
      )
    )
    .collect();

  return matches1.length + matches2.length;
}
