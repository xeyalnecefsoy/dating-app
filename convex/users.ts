import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a new user (Dev/Test only)
export const createTempUser = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      name: args.name,
      interests: [],
    });
    return userId;
  },
});

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    // 1. Delete Matches
    const matches1 = await ctx.db
      .query("matches")
      .filter((q) => q.eq(q.field("user1Id"), userId))
      .collect();
    const matches2 = await ctx.db
      .query("matches")
      .filter((q) => q.eq(q.field("user2Id"), userId))
      .collect();
    
    for (const m of [...matches1, ...matches2]) {
      await ctx.db.delete(m._id);
    }

    // 2. Delete Likes
    const likesGiven = await ctx.db
      .query("likes")
      .withIndex("by_liker", q => q.eq("likerId", userId))
      .collect();
    const likesReceived = await ctx.db
      .query("likes")
      .withIndex("by_liked", q => q.eq("likedId", userId))
      .collect();

    for (const l of [...likesGiven, ...likesReceived]) {
      await ctx.db.delete(l._id);
    }

    // 3. Delete Messages
    // Note: This is an expensive operation if we don't have an index on userId in messages
    // Ideally we should add an index "by_user" to messages table, but for now filtering is okay for prototype
    const messages = await ctx.db
      .query("messages")
      .filter(q => q.eq(q.field("userId"), userId))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    // 4. Delete Presence
    const presence = await ctx.db
      .query("presence")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
    
    for (const p of presence) {
      await ctx.db.delete(p._id);
    }

    return { success: true };
  }
});
