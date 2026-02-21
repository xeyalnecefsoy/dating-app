import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all notifications for the current user
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(20);

    return notifications;
  },
});

/**
 * Get all notifications for the current user, enriched with partner data
 */
export const getEnriched = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(50);

    // Enrich notifications with partner data if partnerId is present in data
    const enrichedNotifications = await Promise.all(
      notifications.map(async (notif) => {
        let partner = null;
        if (notif?.data?.partnerId) {
          partner = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", notif.data.partnerId))
            .first();
        }
        return {
          ...notif,
          partner: partner ? {
            name: partner.name,
            username: partner.username,
            image: partner.image,
            avatar: partner.avatar,
          } : null,
        };
      })
    );

    return enrichedNotifications;
  },
});

/**
 * Get unread count
 */
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", identity.subject).eq("read", false))
      .collect();

    return unread.length;
  },
});

/**
 * Mark a notification as read
 */
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    await ctx.db.patch(args.notificationId, { read: true });
  },
});

/**
 * Mark all notifications as read
 */
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.log("markAllAsRead: No identity found");
      return;
    }

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", identity.subject).eq("read", false))
      .collect();
      
    console.log(`markAllAsRead: Found ${unread.length} unread notifications for user ${identity.subject}`);

    let patchedCount = 0;
    for (const notification of unread) {
      try {
        await ctx.db.patch(notification._id, { read: true });
        patchedCount++;
      } catch (err) {
         console.error(`markAllAsRead: Failed to patch notification ${notification._id}`, err);
      }
    }
    console.log(`markAllAsRead: Successfully patched ${patchedCount} notifications`);
  },
});
