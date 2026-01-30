import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

// List all messages in a specific channel
export const list = query({
  args: { channelId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Authenticated users only
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const channelId = args.channelId || "general";
    
    // TODO: Verify if user is part of this channel (match)
    
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", channelId))
      .collect();
    
    return messages;
  },
});

// Get the last message in a channel
export const last = query({
  args: { channelId: v.string() },
  handler: async (ctx, args) => {
    // Authenticated users only
    const identity = await ctx.auth.getUserIdentity();
    /*
      It is okay to let this fail silently or return null if unauthenticated, 
      but for UI rendering it is better to be safe.
    */
    if (!identity) return null;

    const message = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .first();
    
    return message;
  },
});

// Send a new message
export const send = mutation({
  args: { 
    body: v.string(), 
    userId: v.string(), 
    channelId: v.optional(v.string()),
    format: v.optional(v.string()),
    venueId: v.optional(v.string()),
    icebreakerId: v.optional(v.string()),
  }, 
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const channelId = args.channelId || "general";
    await ctx.db.insert("messages", {
      body: args.body,
      userId: userId, // Enforced
      format: args.format || "text",
      venueId: args.venueId,
      icebreakerId: args.icebreakerId,
    });

    // Notify the recipient (if it's a match/private chat)
    if (channelId.startsWith("match-")) {
       // channelId format: match-userId1-userId2 (sorted)
       // We need to find the OTHER user.
       const parts = channelId.split("-");
       // parts[0] is match, parts[1] is id1, parts[2] is id2
       const otherUserId = parts[1] === userId ? parts[2] : parts[1];
       
       if (otherUserId) {
          // Schedule the push notification
          // We truncate body for privacy/length
          const notificationBody = args.format === 'invite' ? '📅 Yeni görüş dəvəti!' : 
                                   args.format === 'icebreaker' ? '✨ Yeni buzqıran sual!' :
                                   args.body.substring(0, 100);

          await ctx.scheduler.runAfter(0, api.push.sendPush, {
             userId: otherUserId,
             title: `Yeni Mesaj`, // In real app, fetch sender name
             body: notificationBody,
             url: `/messages?userId=${userId}`
          });
       }
    }
  },
});

// Delete a message (Unsend)
export const deleteMessage = mutation({
  args: { id: v.id("messages"), userId: v.string() }, // userId verification
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const message = await ctx.db.get(args.id);
    
    if (!message) {
      // Message already deleted
      return;
    }

    // Verify ownership
    if (message.userId !== userId) {
      throw new Error("You can only delete your own messages");
    }

    // Check time limit (e.g., 15 minutes)
    const DELETE_LIMIT_MS = 15 * 60 * 1000;
    const now = Date.now();
    
    if (now - message._creationTime > DELETE_LIMIT_MS) {
      throw new Error("Message is too old to delete (15 min limit)");
    }

    await ctx.db.delete(args.id);
  },
});

// Edit a message
export const editMessage = mutation({
  args: { id: v.id("messages"), userId: v.string(), newBody: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const message = await ctx.db.get(args.id);
    
    if (!message) {
      throw new Error("Message not found");
    }

    // Verify ownership
    if (message.userId !== userId) {
      throw new Error("You can only edit your own messages");
    }

    // Check time limit (15 minutes)
    const EDIT_LIMIT_MS = 15 * 60 * 1000;
    const now = Date.now();
    
    if (now - message._creationTime > EDIT_LIMIT_MS) {
      throw new Error("Message is too old to edit (15 min limit)");
    }

    await ctx.db.patch(args.id, {
      body: args.newBody,
    });
  },
});
