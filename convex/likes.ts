import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add a like
export const like = mutation({
  args: {
    likerId: v.string(),
    likedId: v.string(),
    type: v.optional(v.string()), // 'like' | 'super'
  },
  handler: async (ctx, args) => {
    // Verify user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { alreadyLiked: false, isMatch: false, error: "Unauthenticated" };
    }

    // Use the likerId from frontend (clerkUser.id) for consistency
    const likerId = args.likerId;
    const type = args.type || "like";

    if (!likerId || !args.likedId) {
      return { alreadyLiked: false, isMatch: false, error: "Missing IDs" };
    }

    // Prevent self-like
    if (likerId === args.likedId) {
      return { alreadyLiked: false, isMatch: false, error: "Cannot like yourself" };
    }

    // Rate limiting — max 30 likes per minute
    const oneMinuteAgo = Date.now() - 60 * 1000;
    const recentLikes = await ctx.db
      .query("likes")
      .withIndex("by_liker", q => q.eq("likerId", likerId))
      .filter(q => q.gt(q.field("createdAt"), oneMinuteAgo))
      .collect();

    if (recentLikes.length >= 30) {
      return { alreadyLiked: false, isMatch: false, error: "Rate limit exceeded" };
    }

    // Check if already liked
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_pair", q => q.eq("likerId", likerId).eq("likedId", args.likedId))
      .first();
    
    if (existing) {
      return { alreadyLiked: true, isMatch: false };
    }

    // Add the like
    await ctx.db.insert("likes", {
      likerId: likerId,
      likedId: args.likedId,
      type: type,
      createdAt: Date.now(),
    });

    // If it's a SUPER like, notify immediately regardless of match
    if (type === "super") {
       await ctx.db.insert("notifications", {
        userId: args.likedId,
        type: "super_like",
        title: "Super Like! ⭐",
        body: "Biri səni ÇOX bəyəndi! Profilinə bax.",
        data: { partnerId: likerId, url: `/discovery` }, // Direct to discovery to swipe them back? Or profile?
        read: false,
        createdAt: Date.now(),
      });
    }

    // Check for mutual like (did the other person like us?)
    const mutualLike = await ctx.db
      .query("likes")
      .withIndex("by_pair", q => q.eq("likerId", args.likedId).eq("likedId", likerId))
      .first();

    if (mutualLike) {
      // It's a match! Create match record
      const matchId = await ctx.db.insert("matches", {
        user1Id: likerId,
        user2Id: args.likedId,
        status: "accepted",
      });

      // Notify the other user (who liked first)
      await ctx.db.insert("notifications", {
        userId: args.likedId,
        type: "match",
        title: "Yeni Uyğunluq! 🎉",
        body: "Kimsə səni bəyəndi və uyğunluq yarandı!",
        data: { matchId: matchId.toString(), partnerId: likerId, url: `/messages?userId=${likerId}` },
        read: false,
        createdAt: Date.now(),
      });

      // Notify current user
      await ctx.db.insert("notifications", {
        userId: likerId,
        type: "match",
        title: "Təbriklər! Uyğunluq var! 💖",
        body: "Sən də onu bəyəndin. İndi mesaj yaza bilərsən.",
        data: { matchId: matchId.toString(), partnerId: args.likedId, url: `/messages?userId=${args.likedId}` },
        read: false,
        createdAt: Date.now(),
      });

      return { alreadyLiked: false, isMatch: true, matchId: matchId.toString() };
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
