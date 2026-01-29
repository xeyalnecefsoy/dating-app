import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new match between two users
export const create = mutation({
  args: {
    user1Id: v.string(), // Kept for signature compatibility but ignored/verified
    user2Id: v.string(),
    status: v.optional(v.string()), // 'accepted' | 'request'
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    // Check if match already exists (in either direction)
    const match1 = await ctx.db
      .query("matches")
      .filter((q) => 
        q.and(
          q.eq(q.field("user1Id"), userId),
          q.eq(q.field("user2Id"), args.user2Id)
        )
      )
      .first();

    const match2 = await ctx.db
      .query("matches")
      .filter((q) => 
        q.and(
          q.eq(q.field("user1Id"), args.user2Id),
          q.eq(q.field("user2Id"), userId)
        )
      )
      .first();

    if (match1 || match2) {
      return match1?._id || match2?._id; // Already matched
    }

    // Create new match
    return await ctx.db.insert("matches", {
      user1Id: userId,
      user2Id: args.user2Id,
      status: args.status || "accepted", 
    });
  },
});

// Send a message request (pending match)
export const sendRequest = mutation({
  args: {
    senderId: v.string(), // Ignored, verify auth
    receiverId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const senderId = identity.subject;

     // Check if match already exists
    const match1 = await ctx.db
      .query("matches")
      .filter((q) => 
        q.and(
          q.eq(q.field("user1Id"), senderId),
          q.eq(q.field("user2Id"), args.receiverId)
        )
      )
      .first();

    const match2 = await ctx.db
      .query("matches")
      .filter((q) => 
        q.and(
          q.eq(q.field("user1Id"), args.receiverId),
          q.eq(q.field("user2Id"), senderId)
        )
      )
      .first();

    if (match1 || match2) {
      // If already accepted, do nothing. If pending, maybe do nothing.
      return match1?._id || match2?._id;
    }

    return await ctx.db.insert("matches", {
      user1Id: senderId,
      user2Id: args.receiverId,
      status: "request",
    });
  }
});

// Accept a message request
export const acceptRequest = mutation({
  args: {
    userId: v.string(), // The user accepting (ignored, verify auth)
    targetId: v.string(), // The user who sent the request
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    // Find the request where 'user1Id' was sender (targetId) and 'user2Id' was receiver (userId)
    const match = await ctx.db
      .query("matches")
      .filter((q) => 
        q.and(
          q.eq(q.field("user1Id"), args.targetId),
          q.eq(q.field("user2Id"), userId),
          q.eq(q.field("status"), "request")
        )
      )
      .first();

    if (match) {
      await ctx.db.patch(match._id, { status: "accepted" });
      return match._id;
    }
    return null;
  }
});

// Decline a message request
export const declineRequest = mutation({
  args: {
    userId: v.string(), // Ignored
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

     const match = await ctx.db
      .query("matches")
      .filter((q) => 
        q.and(
          q.eq(q.field("user1Id"), args.targetId),
          q.eq(q.field("user2Id"), userId),
          q.eq(q.field("status"), "request")
        )
      )
      .first();

    if (match) {
      await ctx.db.delete(match._id);
    }
  }
});

// Get incoming requests for a user
export const getRequests = query({
  args: { userId: v.string() }, // Ignored
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return []; // Return empty if not logged in (or throw error)
    const userId = identity.subject;

    const requests = await ctx.db
      .query("matches")
      .filter((q) => 
        q.and(
          q.eq(q.field("user2Id"), userId),
          q.eq(q.field("status"), "request")
        )
      )
      .collect();

    return requests.map(r => r.user1Id);
  }
});

// List all CONFIRMED matches for a specific user and return the partner IDs
export const list = query({
  args: { userId: v.string() }, // Ignored
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;

    // Find where user is user1
    const matches1 = await ctx.db
      .query("matches")
      .filter((q) => 
        q.and(
          q.eq(q.field("user1Id"), userId),
          q.eq(q.field("status"), "accepted")
        )
      )
      .collect();

    // Find where user is user2
    const matches2 = await ctx.db
      .query("matches")
      .filter((q) => 
         q.and(
            q.eq(q.field("user2Id"), userId),
            q.eq(q.field("status"), "accepted")
         )
      )
      .collect();

    // Combine and extract partner IDs
    const partnerIds = [
      ...matches1.map((m) => m.user2Id),
      ...matches2.map((m) => m.user1Id),
    ];

    return partnerIds;
  },
});

export const clearAll = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    // Find where user is user1
    const matches1 = await ctx.db
      .query("matches")
      .filter((q) => q.eq(q.field("user1Id"), userId))
      .collect();

    // Find where user is user2
    const matches2 = await ctx.db
      .query("matches")
      .filter((q) => q.eq(q.field("user2Id"), userId))
      .collect();

    // Delete all
    for (const match of [...matches1, ...matches2]) {
      await ctx.db.delete(match._id);
    }
  },
});

