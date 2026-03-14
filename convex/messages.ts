import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

async function getMatchForChannel(ctx: any, channelId: string) {
  if (!channelId.startsWith("match-")) return null;
  const parts = channelId.split("-");
  if (parts.length < 3) return null;
  const user1Id = parts[1];
  const user2Id = parts[2];

  return (
    (await ctx.db
      .query("matches")
      .withIndex("by_user1", (q: any) => q.eq("user1Id", user1Id))
      .filter((q: any) => q.eq(q.field("user2Id"), user2Id))
      .first()) ||
    (await ctx.db
      .query("matches")
      .withIndex("by_user1", (q: any) => q.eq("user1Id", user2Id))
      .filter((q: any) => q.eq(q.field("user2Id"), user1Id))
      .first())
  );
}

// List all messages in a specific channel
export const list = query({
  args: { channelId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Authenticated users only
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const channelId = args.channelId || "general";

    let otherUserReadAt: number | null = null;
    let viewerClearedAt: number | null = null;
    
    if (channelId.startsWith("match-")) {
       const match = await getMatchForChannel(ctx, channelId);

       if (!match) return [];
       if (match.user1Id !== identity.subject && match.user2Id !== identity.subject) {
         return [];
       }

       if (match) {
          const isUser1 = match.user1Id === identity.subject;
          // We want the other person's read timestamp to know if OUR messages were read
          otherUserReadAt = isUser1 ? (match.lastReadUser2 || null) : (match.lastReadUser1 || null);
          viewerClearedAt = isUser1 ? (match.clearedAtUser1 || null) : (match.clearedAtUser2 || null);
       }
    }
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", channelId))
      .order("desc")
      .take(100);

    const visibleMessages =
      viewerClearedAt === null
        ? messages
        : messages.filter((msg) => msg._creationTime > viewerClearedAt);

    // Soft delete handling & text localization & image URL resolution
    const messagesWithUrls = await Promise.all(visibleMessages.map(async (msg) => {
      if (msg.isDeleted) {
         return {
          ...msg,
          body: "Bu mesaj silindi", 
          format: "text",
          venueId: undefined,
          icebreakerId: undefined,
          imageUrl: undefined // No image for deleted messages
        };
      }
      
      let imageUrl = null;
      if (msg.format === 'image' && msg.body) {
        try {
           imageUrl = await ctx.storage.getUrl(msg.body as any);
        } catch (e) {
           console.error("Failed to resolve image URL", e);
        }
      }

      return {
        ...msg,
        imageUrl, // Field to store the signed URL
        isRead: otherUserReadAt !== null && msg._creationTime <= otherUserReadAt,
      };
    }));
    
    return messagesWithUrls.reverse();
  },
});

// Get the last message in a channel
export const last = query({
  args: { channelId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
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

    let privateMatch: any = null;
    if (channelId.startsWith("match-")) {
      privateMatch = await getMatchForChannel(ctx, channelId);
      if (!privateMatch) {
        throw new Error("Conversation not found");
      }
      if (privateMatch.status !== "accepted") {
        throw new Error("Conversation is not accepted yet");
      }
      if (privateMatch.user1Id !== userId && privateMatch.user2Id !== userId) {
        throw new Error("Unauthorized conversation access");
      }

      await ctx.db.patch(privateMatch._id, { hiddenByUser1: false, hiddenByUser2: false });
    }

    await ctx.db.insert("messages", {
      body: args.body, // If format='image', this is the storageId
      userId: userId, 
      channelId: channelId, // Fixed: Include channelId!
      format: args.format || "text",
      venueId: args.venueId,
      icebreakerId: args.icebreakerId,
    });

    // Notify the recipient (if it's a match/private chat)
    if (channelId.startsWith("match-")) {
       // channelId format: match-userId1-userId2 (sorted)
       const parts = channelId.split("-");
       // parts[0] is match, parts[1] is id1, parts[2] is id2
       const otherUserId = parts[1] === userId ? parts[2] : parts[1];
       
       if (otherUserId) {
          // Schedule the push notification
          const notificationBody = args.format === 'invite' ? '📅 Yeni görüş dəvəti!' : 
                                   args.format === 'icebreaker' ? '✨ Yeni buzqıran sual!' :
                                   args.body.substring(0, 100);

          await ctx.scheduler.runAfter(0, api.push.sendPush, {
             userId: otherUserId,
             title: "Yeni Mesaj", 
             body: notificationBody,
             url: `/messages?userId=${userId}`
          });
       }
    }

    // Handle @mentions in General Chat (or any chat)
    const mentionRegex = /@(\w+)/g;
    const mentions = Array.from(args.body.matchAll(mentionRegex)).map(m => m[1]); // Extract usernames
    
    if (mentions.length > 0) {
      // Deduplicate mentions
      const uniqueUsernames = [...new Set(mentions)];
      
      for (const username of uniqueUsernames) {
        const mentionedUser = await ctx.db
          .query("users")
          .withIndex("by_username", (q) => q.eq("username", username))
          .first();
          
        if (mentionedUser && mentionedUser.clerkId !== userId) {
           // Create Notification
           await ctx.db.insert("notifications", {
             userId: mentionedUser.clerkId || mentionedUser._id,
             type: "mention",
             title: "Sizi etiketlədilər",
             body: `@${mentionedUser.username} ${channelId === 'general' ? 'Söhbətgahda' : 'söhbətdə'}: ${args.body.substring(0, 50)}...`,
             data: { 
               channelId, 
               senderId: userId,
               link: `/messages?userId=${channelId === 'general' ? 'general' : userId}`
             },
             read: false,
             createdAt: Date.now()
           });

           // Push Notification
           await ctx.scheduler.runAfter(0, api.push.sendPush, {
             userId: mentionedUser.clerkId || mentionedUser._id,
             title: "Sizi etiketlədilər",
             body: `${channelId === 'general' ? 'Söhbətgahda' : 'Bir mesajda'} adınız çəkildi.`,
             url: `/messages?userId=${channelId === 'general' ? 'general' : userId}`
           });
        }
      }
    }
  },
});

// Delete a message (Unsend)
export const deleteMessage = mutation({
  args: { id: v.id("messages"), userId: v.string() }, 
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const message = await ctx.db.get(args.id);
    
    if (!message) return;

    // Verify ownership
    if (message.userId !== userId) {
      throw new Error("You can only delete your own messages");
    }

    // Check time limit (15 minutes)
    const DELETE_LIMIT_MS = 15 * 60 * 1000;
    const now = Date.now();
    
    if (now - message._creationTime > DELETE_LIMIT_MS) {
      throw new Error("Message is too old to delete (15 min limit)");
    }

    // Soft Delete Implementation
    await ctx.db.patch(args.id, { 
      isDeleted: true,
      deletedAt: Date.now()
    });
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
    
    if (!message) throw new Error("Message not found");

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

// Mark messages as read in a channel
export const markRead = mutation({
  args: { channelId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const currentUserId = identity.subject;
    
    // Only handle private matches
    if (!args.channelId.startsWith("match-")) return;

    // Find the match record
    const match = await getMatchForChannel(ctx, args.channelId);
       
    if (!match) return;
    if (match.user1Id !== currentUserId && match.user2Id !== currentUserId) return;

    const now = Date.now();
    const isUser1 = match.user1Id === currentUserId;
    const isUser2 = match.user2Id === currentUserId;

    if (isUser1) {
      await ctx.db.patch(match._id, { lastReadUser1: now });
    } else if (isUser2) {
      await ctx.db.patch(match._id, { lastReadUser2: now });
    }
  },
});
