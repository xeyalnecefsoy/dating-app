import { query, mutation, internalMutation } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

/** Söhbətgah (ümumi chat) mesajları bu müddətdən sonra avtomatik silinir; 30 gün "bəyənib sonra tapmaq" üçün kifayətdir */
const GENERAL_CHAT_RETENTION_DAYS = 30;

function getGeneralChatCutoffMs(): number {
  return Date.now() - GENERAL_CHAT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
}

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
    let messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", channelId))
      .order("desc")
      .take(channelId === "general" ? 500 : 100);

    if (channelId === "general") {
      const cutoff = getGeneralChatCutoffMs();
      messages = messages.filter((msg) => msg._creationTime > cutoff);
      messages = messages.slice(0, 100);
    }

    const visibleMessages =
      viewerClearedAt === null
        ? messages
        : messages.filter((msg) => msg._creationTime > viewerClearedAt);

    // Soft delete handling & text localization & image URL resolution
    const messagesWithUrls = await Promise.all(visibleMessages.map(async (msg) => {
      if (msg.isDeleted) {
         return {
          ...msg,
          body: "Bu mesaj silinib", 
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

/** One-shot conversation list for Messages tab: general + accepted matches + requests */
export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { general: null, acceptedMatches: [], incomingRequests: [], sentRequests: [] };
    const userId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();
    const generalLastSeenAt = user?.generalLastSeenAt ?? 0;

    const generalLast = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", "general"))
      .order("desc")
      .first();
    const general = generalLast
      ? {
          lastBody: generalLast.format === "image" ? "📷 Şəkil" : (generalLast.body || "").slice(0, 80),
          lastTime: generalLast._creationTime,
          unread: generalLast._creationTime > generalLastSeenAt,
        }
      : null;

    const matches1 = await ctx.db
      .query("matches")
      .withIndex("by_user1_status", (q: any) => q.eq("user1Id", userId).eq("status", "accepted"))
      .collect();
    const matches2 = await ctx.db
      .query("matches")
      .withIndex("by_user2_status", (q: any) => q.eq("user2Id", userId).eq("status", "accepted"))
      .collect();
    const acceptedList = [
      ...matches1.filter((m) => !m.hiddenByUser1).map((m) => ({ match: m, partnerId: m.user2Id })),
      ...matches2.filter((m) => !m.hiddenByUser2).map((m) => ({ match: m, partnerId: m.user1Id })),
    ];

    const acceptedMatches: Array<{
      partnerId: string;
      channelId: string;
      name: string;
      avatar?: string;
      username?: string;
      isVerified: boolean;
      isPremium?: boolean;
      lastBody: string;
      lastTime: number;
      unread: boolean;
    }> = [];
    for (const { match, partnerId } of acceptedList) {
      const channelId = `match-${[userId, partnerId].sort().join("-")}`;
      const lastMsg = await ctx.db
        .query("messages")
        .withIndex("by_channel", (q) => q.eq("channelId", channelId))
        .order("desc")
        .first();
      const isUser1 = match.user1Id === userId;
      const myReadAt = isUser1 ? (match.lastReadUser1 ?? 0) : (match.lastReadUser2 ?? 0);
      const unread = lastMsg ? lastMsg.userId !== userId && lastMsg._creationTime > myReadAt : false;
      const partner = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", partnerId))
        .first();
      acceptedMatches.push({
        partnerId,
        channelId,
        name: partner?.name ?? "User",
        avatar: partner?.avatar,
        username: partner?.username,
        isVerified: !!(partner?.role === "admin" || partner?.role === "superadmin" || (partner as any)?.isVerified),
        isPremium: (partner as any)?.isPremium,
        lastBody: lastMsg
          ? lastMsg.format === "image"
            ? "📷 Şəkil"
            : (lastMsg.body || "").slice(0, 60)
          : "Söhbətə başlayın",
        lastTime: lastMsg?._creationTime ?? 0,
        unread,
      });
    }
    acceptedMatches.sort((a, b) => b.lastTime - a.lastTime);

    const incomingRaw = await ctx.db
      .query("matches")
      .withIndex("by_user2_status", (q: any) => q.eq("user2Id", userId).eq("status", "request"))
      .collect();
    const sentRaw = await ctx.db
      .query("matches")
      .withIndex("by_user1_status", (q: any) => q.eq("user1Id", userId).eq("status", "request"))
      .collect();

    const incomingRequests: Array<{ id: string; name: string; avatar?: string; username?: string; isVerified: boolean }> = [];
    for (const r of incomingRaw) {
      const u = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", r.user1Id))
        .first();
      if (u) {
        incomingRequests.push({
          id: r.user1Id,
          name: u.name ?? "User",
          avatar: u.avatar,
          username: u.username,
          isVerified: !!(u.role === "admin" || u.role === "superadmin" || (u as any).isVerified),
        });
      }
    }

    const sentRequests: Array<{ id: string; name: string; avatar?: string; username?: string; isVerified: boolean }> = [];
    for (const r of sentRaw) {
      const u = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", r.user2Id))
        .first();
      if (u) {
        sentRequests.push({
          id: r.user2Id,
          name: u.name ?? "User",
          avatar: u.avatar,
          username: u.username,
          isVerified: !!(u.role === "admin" || u.role === "superadmin" || (u as any).isVerified),
        });
      }
    }

    return { general, acceptedMatches, incomingRequests, sentRequests };
  },
});

// Mark general (Söhbətgah) channel as seen for current user
export const markGeneralSeen = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const clerkId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) return;

    await ctx.db.patch(user._id, {
      generalLastSeenAt: Date.now(),
    });
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

    // For match-... channels keep 15-minute limit; for general/public chats allow anytime.
    const isMatchChannel =
      typeof message.channelId === "string" &&
      message.channelId.startsWith("match-");

    if (isMatchChannel) {
      const DELETE_LIMIT_MS = 15 * 60 * 1000;
      const now = Date.now();
      
      if (now - message._creationTime > DELETE_LIMIT_MS) {
        throw new Error("Message is too old to delete (15 min limit)");
      }
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
      editedAt: now,
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

/** Söhbətgah: müddəti keçmiş mesajları silir (cron gündəlik işlədilir) */
export const cleanupOldGeneralChatMessages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = getGeneralChatCutoffMs();
    const old = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", "general"))
      .collect();
    const toDelete = old.filter((msg) => msg._creationTime < cutoff);
    const batch = 200;
    for (let i = 0; i < toDelete.length; i += batch) {
      const chunk = toDelete.slice(i, i + batch);
      for (const msg of chunk) {
        await ctx.db.delete(msg._id);
      }
    }
    return { deleted: toDelete.length };
  },
});
