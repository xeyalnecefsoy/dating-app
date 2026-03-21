import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const ONLINE_WINDOW_MS = 25 * 1000; // 25 saniyə — heartbeat bu müddətdən tez-tez göndərilir

// Heartbeat: istifadəçini online saxlayır
export const ping = mutation({
  args: { userId: v.string() },
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const userId = identity.subject;

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { updatedAt: now });
    } else {
      await ctx.db.insert("presence", { userId, updatedAt: now });
    }
  },
});

// Brauzer/pəncərə bağlananda çağrılır — statusu dərhal offline edir
export const setOffline = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const userId = identity.subject;

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      const lastSeen = existing.updatedAt;
      await ctx.db.delete(existing._id);
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
        .first();
      if (user) {
        await ctx.db.patch(user._id, { lastSeenAt: lastSeen });
      }
    }
  },
});

// İstifadəçi statusu: online və ya son görülmə
export const getStatus = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (data) {
      const isOnline = Date.now() - data.updatedAt < ONLINE_WINDOW_MS;
      return { isOnline, lastSeen: data.updatedAt };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();
    const lastSeen = user?.lastSeenAt ?? 0;
    return { isOnline: false, lastSeen };
  },
});
