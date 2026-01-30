import { mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Store a new push subscription (public - called from frontend)
export const store = mutation({
  args: {
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Auth not ready yet, skip silently
      console.log("Subscription store skipped - user not authenticated yet");
      return;
    }
    const userId = identity.subject;

    // Check if subscription already exists
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (existing) {
      if (existing.userId !== userId) {
        // Update user ownership if changed
        await ctx.db.patch(existing._id, { userId });
      }
      return;
    }

    await ctx.db.insert("subscriptions", {
      userId,
      endpoint: args.endpoint,
      p256dh: args.p256dh,
      auth: args.auth,
    });
  },
});

// Delete a subscription (public - e.g., on logout or unsubscribe)
export const remove = mutation({
  args: { endpoint: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

// Internal: Get subscriptions by userId (for push action)
export const getUserSubscriptions = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Internal: Remove subscription by endpoint (for push action when endpoint is gone)
export const removeByEndpoint = internalMutation({
  args: { endpoint: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
