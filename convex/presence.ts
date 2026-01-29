import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Update user presence (heartbeat)
// Update user presence (heartbeat)
export const ping = mutation({
  args: { userId: v.string() }, // Ignored
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return; // Silent fail if not logged in (e.g. landing page)
    const userId = identity.subject;

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { updatedAt: Date.now() });
    } else {
      await ctx.db.insert("presence", { userId: userId, updatedAt: Date.now() });
    }
  },
});

// Get user status
export const getStatus = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!data) return { isOnline: false, lastSeen: 0 };

    // Consider online if updated within last 2 minutes
    const isOnline = Date.now() - data.updatedAt < 2 * 60 * 1000;
    
    return { isOnline, lastSeen: data.updatedAt };
  },
});
