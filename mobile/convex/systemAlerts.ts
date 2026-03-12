import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// For normal users to fetch the currently active alert (if any)
export const getActiveAlert = query({
  handler: async (ctx) => {
    // We only need the first active alert, sorted by most recent
    const activeAlert = await ctx.db
      .query("systemAlerts")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("desc")
      .first();

    return activeAlert;
  },
});

// For Admin Panel: List all alerts
export const listAlerts = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      throw new Error("Unauthorized");
    }

    const alerts = await ctx.db
      .query("systemAlerts")
      .order("desc")
      .collect();

    return alerts;
  },
});

// Admin: Create a new alert
export const createAlert = mutation({
  args: {
    type: v.string(),
    titleAz: v.string(),
    titleEn: v.string(),
    messageAz: v.string(),
    messageEn: v.string(),
    blocksAccess: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      throw new Error("Unauthorized");
    }

    // Deactivate previous active alerts to ensure only one is active at a time
    const activeAlerts = await ctx.db
      .query("systemAlerts")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    for (const alert of activeAlerts) {
      await ctx.db.patch(alert._id, { isActive: false });
    }

    await ctx.db.insert("systemAlerts", {
      type: args.type,
      titleAz: args.titleAz,
      titleEn: args.titleEn,
      messageAz: args.messageAz,
      messageEn: args.messageEn,
      blocksAccess: args.blocksAccess,
      isActive: true, // Auto-activate upon creation
      createdAt: Date.now(),
      createdBy: identity.subject,
    });
  },
});

// Admin: Toggle alert status (activate/deactivate)
export const toggleAlertStatus = mutation({
  args: { id: v.id("systemAlerts"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      throw new Error("Unauthorized");
    }

    // If we are activating this one, we should deactivate others
    if (args.isActive) {
       const activeAlerts = await ctx.db
         .query("systemAlerts")
         .withIndex("by_active", (q) => q.eq("isActive", true))
         .collect();

       for (const alert of activeAlerts) {
         if (alert._id !== args.id) {
            await ctx.db.patch(alert._id, { isActive: false });
         }
       }
    }

    await ctx.db.patch(args.id, { isActive: args.isActive });
  },
});

export const deleteAlert = mutation({
  args: { id: v.id("systemAlerts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
