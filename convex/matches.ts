import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new match between two users
export const create = mutation({
  args: {
    user1Id: v.string(),
    user2Id: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if match already exists (in either direction)
    const match1 = await ctx.db
      .query("matches")
      .filter((q) => 
        q.and(
          q.eq(q.field("user1Id"), args.user1Id),
          q.eq(q.field("user2Id"), args.user2Id)
        )
      )
      .first();

    const match2 = await ctx.db
      .query("matches")
      .filter((q) => 
        q.and(
          q.eq(q.field("user1Id"), args.user2Id),
          q.eq(q.field("user2Id"), args.user1Id)
        )
      )
      .first();

    if (match1 || match2) {
      return match1?._id || match2?._id; // Already matched
    }

    // Create new match
    return await ctx.db.insert("matches", {
      user1Id: args.user1Id,
      user2Id: args.user2Id,
      status: "accepted", // Auto accept for now (tinder style after mutual swipe)
    });
  },
});

// List all matches for a specific user and return the partner IDs
export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Find where user is user1
    const matches1 = await ctx.db
      .query("matches")
      .filter((q) => q.eq(q.field("user1Id"), args.userId))
      .collect();

    // Find where user is user2
    const matches2 = await ctx.db
      .query("matches")
      .filter((q) => q.eq(q.field("user2Id"), args.userId))
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
    // Find where user is user1
    const matches1 = await ctx.db
      .query("matches")
      .filter((q) => q.eq(q.field("user1Id"), args.userId))
      .collect();

    // Find where user is user2
    const matches2 = await ctx.db
      .query("matches")
      .filter((q) => q.eq(q.field("user2Id"), args.userId))
      .collect();

    // Delete all
    for (const match of [...matches1, ...matches2]) {
      await ctx.db.delete(match._id);
    }
  },
});
