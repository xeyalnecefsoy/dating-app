import { mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

// Helper to get user by Clerk ID
async function getUserByClerkId(ctx: any, clerkId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
    .first();
}

export const simulateLike = mutation({
  args: {
    likerId: v.string(), // The mock user ID
    targetId: v.string(), // The real user ID
  },
  handler: async (ctx, args) => {
    const mockUser = await getUserByClerkId(ctx, args.likerId);
    const mockName = mockUser?.name || "Biri";

    // 1. Check if like already exists from mock to real
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_pair", (q) => 
        q.eq("likerId", args.likerId).eq("likedId", args.targetId)
      )
      .first();

    if (existingLike) {
      return { success: false, message: "Artıq bəyənilib!" };
    }

    // 2. Create the like from mock to real
    await ctx.db.insert("likes", {
      likerId: args.likerId,
      likedId: args.targetId,
      createdAt: Date.now(),
    });

    // 3. Check if real user already liked mock user (Reverse check)
    const reverseLike = await ctx.db
      .query("likes")
      .withIndex("by_pair", (q) => 
        q.eq("likerId", args.targetId).eq("likedId", args.likerId)
      )
      .first();

    if (reverseLike) {
      const existingMatch = await ctx.db.query("matches").filter(q => 
        q.or(
          q.and(q.eq(q.field("user1Id"), args.likerId), q.eq(q.field("user2Id"), args.targetId)),
          q.and(q.eq(q.field("user1Id"), args.targetId), q.eq(q.field("user2Id"), args.likerId))
        )
      ).first();

      if (!existingMatch) {
         await ctx.db.insert("matches", {
          user1Id: args.likerId,
          user2Id: args.targetId,
          status: "accepted",
        });

        // Notify Match
        await ctx.scheduler.runAfter(0, api.push.sendPush, {
             userId: args.targetId,
             title: "Yeni Uyğunluq! 🎉",
             body: `${mockName} səninlə uyğunlaşdı!`,
             url: `/messages?userId=${args.likerId}`
        });

        return { success: true, message: "Uyğunluq yarandı!" };
      }
       return { success: true, message: "Uyğunluq artıq mövcuddur!" };
    }

    // Notify Like
    await ctx.scheduler.runAfter(0, api.push.sendPush, {
         userId: args.targetId,
         title: "Yeni Bəyənmə! 💖",
         body: `${mockName} səni bəyəndi!`,
         url: `/likes`
    });

    return { success: true, message: "Bəyənmə göndərildi!" };
  },
});

export const simulateMatch = mutation({
  args: {
    user1Id: v.string(), // Mock user
    user2Id: v.string(), // Real user
  },
  handler: async (ctx, args) => {
    const mockUser = await getUserByClerkId(ctx, args.user1Id);
    const mockName = mockUser?.name || "Biri";

    // Check if match exists
    const existingMatch = await ctx.db.query("matches").filter(q => 
        q.or(
          q.and(q.eq(q.field("user1Id"), args.user1Id), q.eq(q.field("user2Id"), args.user2Id)),
          q.and(q.eq(q.field("user1Id"), args.user2Id), q.eq(q.field("user2Id"), args.user1Id))
        )
      ).first();

    if (existingMatch) {
      // Still send notification for testing purposes
      await ctx.scheduler.runAfter(0, api.push.sendPush, {
           userId: args.user2Id,
           title: "Yenidən Uyğunluq! 🎉",
           body: `${mockName} ilə artıq uyğunluğunuz var!`,
           url: `/messages?userId=${args.user1Id}`
      });
      return { success: false, message: "Artıq uyğunluq var!" };
    }

    // Create match
    await ctx.db.insert("matches", {
      user1Id: args.user1Id,
      user2Id: args.user2Id,
      status: "accepted",
    });

    // Ensure bidirectional likes exist
    const like1 = await ctx.db.query("likes").withIndex("by_pair", q => q.eq("likerId", args.user1Id).eq("likedId", args.user2Id)).first();
    if (!like1) await ctx.db.insert("likes", { likerId: args.user1Id, likedId: args.user2Id, createdAt: Date.now() });

    const like2 = await ctx.db.query("likes").withIndex("by_pair", q => q.eq("likerId", args.user2Id).eq("likedId", args.user1Id)).first();
    if (!like2) await ctx.db.insert("likes", { likerId: args.user2Id, likedId: args.user1Id, createdAt: Date.now() });

    // Notify Match
    await ctx.scheduler.runAfter(0, api.push.sendPush, {
         userId: args.user2Id,
         title: "Yeni Uyğunluq! 🎉",
         body: `${mockName} səninlə uyğunlaşdı!`,
         url: `/messages?userId=${args.user1Id}`
    });

    return { success: true, message: "Uyğunluq yaradıldı!" };
  },
});

export const simulateMessage = mutation({
  args: {
    senderId: v.string(), // Mock user
    receiverId: v.string(), // Real user
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Find match to link message to
    const match = await ctx.db.query("matches").filter(q => 
        q.or(
          q.and(q.eq(q.field("user1Id"), args.senderId), q.eq(q.field("user2Id"), args.receiverId)),
          q.and(q.eq(q.field("user1Id"), args.receiverId), q.eq(q.field("user2Id"), args.senderId))
        )
      ).first();

    // Debugging hint: If match not found, verify IDs. In Dev mode, we can auto-create match if needed?
    // User requested "Must be matched first" error fix. 
    // If no match found, let's create it on the fly for convenience? 
    // Or just ensure the previous steps worked. 
    // Let's assume simulateMatch MUST be called. 
    
    if (!match) {
        return { success: false, message: "Əvvəlcə uyğunluq yaradılmalıdır!" };
    }

    // Generate consistent channelId (sorted ids) with match- prefix
    const sorted = [args.senderId, args.receiverId].sort();
    const channelId = `match-${sorted[0]}-${sorted[1]}`;

    await ctx.db.insert("messages", {
       body: args.content,
       userId: args.senderId,
       matchId: match._id,
       channelId: channelId, // Required for messages.list query
       format: "text",
    });

    const mockUser = await getUserByClerkId(ctx, args.senderId);
    const mockName = mockUser?.name || "Biri";

    // Schedule push notification for the receiver (Real User)
    await ctx.scheduler.runAfter(0, api.push.sendPush, {
         userId: args.receiverId,
         title: mockName, // Use actual name
         body: args.content.substring(0, 100),
         url: `/messages?userId=${args.senderId}`
    });

    return { success: true, message: "Mesaj göndərildi!" };
  },
});

export const reset = mutation({
  args: {
    userId: v.string(), // Clerk ID of real user
  },
  handler: async (ctx, args) => {
    // 1. Delete all matches where user is involved
    const matches1 = await ctx.db
      .query("matches")
      .filter((q) => q.eq(q.field("user1Id"), args.userId))
      .collect();

    const matches2 = await ctx.db
      .query("matches")
      .filter((q) => q.eq(q.field("user2Id"), args.userId))
      .collect();

    for (const match of [...matches1, ...matches2]) {
      await ctx.db.delete(match._id);
    }

    // 2. Delete all likes where user is involved
    const likes1 = await ctx.db
      .query("likes")
      .withIndex("by_liker", (q) => q.eq("likerId", args.userId))
      .collect();

    const likes2 = await ctx.db
      .query("likes")
      .withIndex("by_liked", (q) => q.eq("likedId", args.userId))
      .collect();

    for (const like of [...likes1, ...likes2]) {
      await ctx.db.delete(like._id);
    }

    // 3. Delete all messages where user is sender or receiver (via channelId check)
    // It's hard to find all messages received by user without scanning all. 
    // But we know the channelIds for matches.
    // Actually, widespread deletion of all messages where userId is sender is a good start.
    const messagesSent = await ctx.db
      .query("messages")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .collect();

    for (const msg of messagesSent) {
      await ctx.db.delete(msg._id);
    }

    // Also delete messages in channels that involve this user. 
    // This requires scanning or knowing channel IDs.
    // For Dev reset, we can iterate all messages and check channelId? No, too slow.
    // Better: We just deleted matches. We can use the match IDs? 
    // Actually, let's just delete all messages for now since this is a dev reset and likely only has test data.
    // OR, we can rely on `matchId` if it was populated. 
    // The previous simulateMessage populated `matchId`.
    
    // Let's delete by channelId if possible, or just all messages if it's safe. 
    // Safe approach: List all messages and filter by channel containing userId.
    const allMessages = await ctx.db.query("messages").collect();
    for (const msg of allMessages) {
        if (msg.channelId?.includes(args.userId)) {
            await ctx.db.delete(msg._id);
        }
    }

    return { success: true, message: "Bütün məlumatlar (mesajlar daxil) sıfırlandı!" };
  },
});

export const deleteMockUsers = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Find all mock users
    const mockUsers = await ctx.db
      .query("users")
      .collect();

    const targets = mockUsers.filter(u => u.clerkId?.startsWith("mock_"));

    for (const user of targets) {
        // Delete related data first
        // Matches
        const matches = await ctx.db.query("matches")
            .filter(q => q.or(q.eq(q.field("user1Id"), user.clerkId), q.eq(q.field("user2Id"), user.clerkId)))
            .collect();
        for (const m of matches) await ctx.db.delete(m._id);

        // Likes
        const likes = await ctx.db.query("likes")
            .filter(q => q.or(q.eq(q.field("likerId"), user.clerkId), q.eq(q.field("likedId"), user.clerkId)))
            .collect();
        for (const l of likes) await ctx.db.delete(l._id);

        // Messages
        const messages = await ctx.db.query("messages")
            .filter(q => q.eq(q.field("userId"), user.clerkId))
            .collect();
        for (const m of messages) await ctx.db.delete(m._id);

        // Delete user
        await ctx.db.delete(user._id);
    }

    return { success: true, message: `${targets.length} mock istifadəçi silindi.` };
  }
});

// Temporary utility
export const deleteUserById = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    // Clean up related data first
    // Messages
    const messages = await ctx.db.query("messages")
        .filter(q => q.eq(q.field("userId"), args.id))
        .collect();
    for (const m of messages) await ctx.db.delete(m._id);

    // Matches
    const matches = await ctx.db.query("matches")
        .filter(q => q.or(q.eq(q.field("user1Id"), args.id), q.eq(q.field("user2Id"), args.id)))
        .collect();
    for (const m of matches) await ctx.db.delete(m._id);

    // Likes
    const likes = await ctx.db.query("likes")
        .filter(q => q.or(q.eq(q.field("likerId"), args.id), q.eq(q.field("likedId"), args.id)))
        .collect();
    for (const l of likes) await ctx.db.delete(l._id);

    await ctx.db.delete(args.id as any);
    return { success: true };
  }
});
