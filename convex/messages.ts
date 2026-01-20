import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all messages in a specific channel
export const list = query({
  args: { channelId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const channelId = args.channelId || "general";
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
  args: { body: v.string(), userId: v.string(), channelId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const channelId = args.channelId || "general";
    await ctx.db.insert("messages", {
      body: args.body,
      userId: args.userId,
      channelId: channelId,
      format: "text",
    });
  },
});

// Delete a message (Unsend)
export const deleteMessage = mutation({
  args: { id: v.id("messages"), userId: v.string() }, // userId verification
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);
    
    if (!message) {
      // Message already deleted
      return;
    }

    // Verify ownership
    // Note: In a real app with Auth, we would check ctx.auth.getUserIdentity()
    if (message.userId !== args.userId) {
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
    const message = await ctx.db.get(args.id);
    
    if (!message) {
      throw new Error("Message not found");
    }

    // Verify ownership
    if (message.userId !== args.userId) {
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
