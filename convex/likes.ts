import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add a like
export const like = mutation({
  args: {
    likerId: v.string(),
    likedId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already liked
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_pair", q => q.eq("likerId", args.likerId).eq("likedId", args.likedId))
      .first();
    
    if (existing) {
      return { alreadyLiked: true, isMatch: false };
    }

    // Add the like
    await ctx.db.insert("likes", {
      likerId: args.likerId,
      likedId: args.likedId,
      createdAt: Date.now(),
    });

    // Check for mutual like (did the other person like us?)
    const mutualLike = await ctx.db
      .query("likes")
      .withIndex("by_pair", q => q.eq("likerId", args.likedId).eq("likedId", args.likerId))
      .first();

    if (mutualLike) {
      // It's a match! Create match record
      await ctx.db.insert("matches", {
        user1Id: args.likerId,
        user2Id: args.likedId,
        status: "accepted",
      });
      return { alreadyLiked: false, isMatch: true };
    }

    return { alreadyLiked: false, isMatch: false };
  },
});

// Check if user A liked user B
export const hasLiked = query({
  args: {
    likerId: v.string(),
    likedId: v.string(),
  },
  handler: async (ctx, args) => {
    const like = await ctx.db
      .query("likes")
      .withIndex("by_pair", q => q.eq("likerId", args.likerId).eq("likedId", args.likedId))
      .first();
    return !!like;
  },
});

// Get all users that liked a specific user
export const getLikesReceived = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_liked", q => q.eq("likedId", args.userId))
      .collect();
    return likes.map(l => l.likerId);
  },
});
