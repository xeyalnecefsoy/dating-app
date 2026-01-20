import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()), // Optional for now
    image: v.optional(v.string()),
    bio: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    // We can add more fields later as needed
  }),
  
  messages: defineTable({
    body: v.string(),
    userId: v.string(), // Changed from v.id("users") to allow any string ID for now
    matchId: v.optional(v.id("matches")), // Which conversation does it belong to?
    // For general chat simply use channelId or similar if not a match
    channelId: v.optional(v.string()), 
    format: v.optional(v.string()), // 'text' | 'image' etc
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
});
