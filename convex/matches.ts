import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new match between two users
export const create = mutation({
  args: {
    user1Id: v.string(), 
    user2Id: v.string(),
    status: v.optional(v.string()), // 'accepted' | 'request'
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    // Ensure we use the IDs passed in args (which are clerkIds)
    // likes.ts calls this with clerkIds
    const userId = args.user1Id; 

    // Check if match already exists (in either direction)
    const match1 = await ctx.db
      .query("matches")
      .withIndex("by_user1", q => q.eq("user1Id", userId))
      .filter(q => q.eq(q.field("user2Id"), args.user2Id))
      .first();

    const match2 = await ctx.db
      .query("matches")
      .withIndex("by_user1", q => q.eq("user1Id", args.user2Id))
      .filter(q => q.eq(q.field("user2Id"), userId))
      .first();

    if (match1 || match2) {
      return match1?._id || match2?._id; // Already matched
    }

    // Create new match
    return await ctx.db.insert("matches", {
      user1Id: userId,
      user2Id: args.user2Id,
      status: args.status || "accepted", 
    });
  },
});

// Send a message request (pending match)
export const sendRequest = mutation({
  args: {
    senderId: v.string(),
    receiverId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    // Use senderId from args (clerkId) for consistency
    const senderId = args.senderId || identity.subject;

    let receiverId = args.receiverId;

    if (!receiverId.startsWith("user_")) {
      try {
        // Attempt to find user by _id if it looks like a Convex ID
        const user = await ctx.db.get(receiverId as any);
        if (user && (user as any).clerkId) {
          receiverId = (user as any).clerkId;
        }
      } catch (e) {
        // Ignore invalid ID errors
      }
    }

    // Check if match already exists
    const match1 = await ctx.db
      .query("matches")
      .withIndex("by_user1", q => q.eq("user1Id", senderId))
      .filter(q => q.eq(q.field("user2Id"), receiverId))
      .first();

    const match2 = await ctx.db
      .query("matches")
      .withIndex("by_user1", q => q.eq("user1Id", receiverId))
      .filter(q => q.eq(q.field("user2Id"), senderId))
      .first();

    if (match1 || match2) {
      // If already accepted or pending, do nothing
      return match1?._id || match2?._id;
    }

    // Check if sender is Superadmin
    const sender = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", senderId))
      .first();

    const isSuperAdmin = sender?.role === "superadmin";

    // If superadmin, auto-accept. Else request.
    const initialStatus = isSuperAdmin ? "accepted" : "request";

    const matchId = await ctx.db.insert("matches", {
      user1Id: senderId,
      user2Id: receiverId,
      status: initialStatus,
    });

    if (isSuperAdmin) {
       await ctx.db.insert("notifications", {
         userId: receiverId,
         type: "match",
         title: "Yeni Uyğunluq! 🎉",
         body: `${sender?.name || "Superadmin"} sizinlə söhbətə başladı!`,
         read: false,
         data: { 
             matchId: matchId, 
             url: `/messages?userId=${senderId}`,
             partnerId: senderId
         },
         createdAt: Date.now()
       });
    }

    return matchId;
  }
});

// Accept a message request
export const acceptRequest = mutation({
  args: {
    userId: v.string(), // The user accepting
    targetId: v.string(), // The user who sent the request
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = args.userId || identity.subject;

    // Find the request where 'user1Id' was sender (targetId) and 'user2Id' was receiver (userId)
    const match = await ctx.db
      .query("matches")
      .withIndex("by_user1_status", q => q.eq("user1Id", args.targetId).eq("status", "request"))
      .filter(q => q.eq(q.field("user2Id"), userId))
      .first();

    if (match) {
      await ctx.db.patch(match._id, { status: "accepted" });
      return match._id;
    }
    return null;
  }
});

// Decline a message request
export const declineRequest = mutation({
  args: {
    userId: v.string(), 
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = args.userId || identity.subject;

     const match = await ctx.db
      .query("matches")
      .withIndex("by_user1_status", q => q.eq("user1Id", args.targetId).eq("status", "request"))
      .filter(q => q.eq(q.field("user2Id"), userId))
      .first();

    if (match) {
      await ctx.db.delete(match._id);
    }
  }
});

// Get incoming requests for a user
export const getRequests = query({
  args: { userId: v.string() }, 
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    // User args.userId if provided, else identity.subject (likely args.userId is correct one)
    const userId = args.userId || identity.subject;

    const requests = await ctx.db
      .query("matches")
      .withIndex("by_user2_status", q => q.eq("user2Id", userId).eq("status", "request"))
      .collect();

    return requests.map(r => r.user1Id);
  }
});

// List all CONFIRMED matches for a specific user and return the partner IDs
export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = args.userId || identity.subject;

    // Find where user is user1
    const matches1 = await ctx.db
      .query("matches")
      .withIndex("by_user1_status", q => q.eq("user1Id", userId).eq("status", "accepted"))
      .collect();

    // Find where user is user2
    const matches2 = await ctx.db
      .query("matches")
      .withIndex("by_user2_status", q => q.eq("user2Id", userId).eq("status", "accepted"))
      .collect();

    // Combine and extract partner IDs
    const partnerIds = [
      ...matches1.map((m) => m.user2Id),
      ...matches2.map((m) => m.user1Id),
    ];

    return partnerIds;
  },
});

export const clearAll = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = args.userId || identity.subject;

    // Find where user is user1
    const matches1 = await ctx.db
      .query("matches")
      .withIndex("by_user1", q => q.eq("user1Id", userId))
      .collect();

    // Find where user is user2
    const matches2 = await ctx.db
      .query("matches")
      .withIndex("by_user2", q => q.eq("user2Id", userId))
      .collect();

    // Delete all
    for (const match of [...matches1, ...matches2]) {
      await ctx.db.delete(match._id);
    }
  },
});

