import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.optional(v.string()), // Clerk user ID for auth
    name: v.string(),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    bio: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    gender: v.optional(v.string()),
    status: v.optional(v.string()), // 'active', 'waitlist', 'banned'
    role: v.optional(v.string()), // 'user', 'moderator', 'admin', 'superadmin'
    createdAt: v.optional(v.number()),
  }).index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),
  
  messages: defineTable({
    body: v.string(),
    userId: v.string(), // Changed from v.id("users") to allow any string ID for now
    matchId: v.optional(v.id("matches")), // Which conversation does it belong to?
    // For general chat simply use channelId or similar if not a match
    channelId: v.optional(v.string()), 
    format: v.optional(v.string()), // 'text' | 'image' | 'invite' | 'icebreaker'
    venueId: v.optional(v.string()), // For venue invites
    icebreakerId: v.optional(v.string()), // For icebreakers
  }).index("by_channel", ["channelId"]),

  matches: defineTable({
    user1Id: v.string(),
    user2Id: v.string(),
    status: v.string(), // 'pending', 'accepted', 'rejected'
  }),

  presence: defineTable({
    userId: v.string(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

   likes: defineTable({
    likerId: v.string(),   // Who liked
    likedId: v.string(),   // Who was liked
    createdAt: v.number(),
  }).index("by_liker", ["likerId"])
   .index("by_liked", ["likedId"])
   .index("by_pair", ["likerId", "likedId"]),

  subscriptions: defineTable({
    userId: v.string(),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
  }).index("by_user", ["userId"])
    .index("by_endpoint", ["endpoint"]),
});
