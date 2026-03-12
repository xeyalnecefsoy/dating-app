import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Block a user
 * Adds target's clerkId to the current user's blockedUsers array
 */
export const blockUser = mutation({
  args: { targetUserId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!user) throw new Error("User not found");

    const blockedUsers = user.blockedUsers || [];

    // Don't add duplicate
    if (blockedUsers.includes(args.targetUserId)) {
      return { success: true, alreadyBlocked: true };
    }

    await ctx.db.patch(user._id, {
      blockedUsers: [...blockedUsers, args.targetUserId],
    });

    // Also remove any existing matches between these users
    const matches1 = await ctx.db
      .query("matches")
      .filter((q) =>
        q.and(
          q.eq(q.field("user1Id"), userId),
          q.eq(q.field("user2Id"), args.targetUserId)
        )
      )
      .collect();

    const matches2 = await ctx.db
      .query("matches")
      .filter((q) =>
        q.and(
          q.eq(q.field("user1Id"), args.targetUserId),
          q.eq(q.field("user2Id"), userId)
        )
      )
      .collect();

    for (const m of [...matches1, ...matches2]) {
      await ctx.db.delete(m._id);
    }

    // Remove likes between users
    const likes1 = await ctx.db
      .query("likes")
      .withIndex("by_pair", (q) =>
        q.eq("likerId", userId).eq("likedId", args.targetUserId)
      )
      .collect();

    const likes2 = await ctx.db
      .query("likes")
      .withIndex("by_pair", (q) =>
        q.eq("likerId", args.targetUserId).eq("likedId", userId)
      )
      .collect();

    for (const l of [...likes1, ...likes2]) {
      await ctx.db.delete(l._id);
    }

    return { success: true, alreadyBlocked: false };
  },
});

/**
 * Unblock a user
 */
export const unblockUser = mutation({
  args: { targetUserId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!user) throw new Error("User not found");

    const blockedUsers = user.blockedUsers || [];
    const updatedList = blockedUsers.filter((id: string) => id !== args.targetUserId);

    await ctx.db.patch(user._id, {
      blockedUsers: updatedList,
    });

    return { success: true };
  },
});

/**
 * Get list of blocked users with their basic info
 */
export const getBlockedUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!user || !user.blockedUsers || user.blockedUsers.length === 0) {
      return [];
    }

    // Fetch basic info for blocked users
    const blockedProfiles = [];
    for (const blockedId of user.blockedUsers) {
      const blockedUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", blockedId))
        .first();

      if (blockedUser) {
        blockedProfiles.push({
          clerkId: blockedUser.clerkId,
          name: blockedUser.name,
          avatar: blockedUser.avatar,
        });
      }
    }

    return blockedProfiles;
  },
});

/**
 * Toggle hideProfile setting
 */
export const toggleHideProfile = mutation({
  args: { hideProfile: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      hideProfile: args.hideProfile,
    });

    return { success: true };
  },
});

/**
 * Get current user's privacy settings
 */
export const getPrivacySettings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!user) return null;

    return {
      hideProfile: user.hideProfile || false,
      blockedCount: (user.blockedUsers || []).length,
    };
  },
});
