import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.optional(v.string()), // Clerk user ID for auth
    name: v.string(),
    email: v.optional(v.string()),
    username: v.optional(v.string()), // Unique username for profile URLs
    usernameChangedAt: v.optional(v.number()), // Last username change timestamp
    image: v.optional(v.string()),
    bio: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    gender: v.optional(v.string()),
    status: v.optional(v.string()), // 'active', 'waitlist', 'banned', 'rejected'
    role: v.optional(v.string()), // 'user', 'moderator', 'admin', 'superadmin'
    createdAt: v.optional(v.number()),
    // Extended profile fields
    age: v.optional(v.number()),
    // Store birth components for editing accuracy
    birthDay: v.optional(v.string()), 
    birthMonth: v.optional(v.string()),
    birthYear: v.optional(v.string()),
    location: v.optional(v.string()),
    values: v.optional(v.array(v.string())),
    loveLanguage: v.optional(v.string()),
    communicationStyle: v.optional(v.string()),
    avatar: v.optional(v.string()),
    lookingFor: v.optional(v.string()), // 'male' or 'female'
    // Privacy
    blockedUsers: v.optional(v.array(v.string())), // Clerk IDs of blocked users
    hideProfile: v.optional(v.boolean()), // Hide from discovery
    // Premium
    isPremium: v.optional(v.boolean()),
    premiumPlan: v.optional(v.string()), // 'monthly' | 'quarterly' | 'yearly'
    premiumExpiresAt: v.optional(v.number()), // timestamp — null = lifetime/admin-granted
  }).index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_username", ["username"])
    .index("by_status", ["status"])
    .index("by_gender", ["gender"]),
  
  messages: defineTable({
    body: v.string(),
    userId: v.string(), // Changed from v.id("users") to allow any string ID for now
    matchId: v.optional(v.id("matches")), // Which conversation does it belong to?
    // For general chat simply use channelId or similar if not a match
    channelId: v.optional(v.string()), 
    format: v.optional(v.string()), // 'text' | 'image' | 'invite' | 'icebreaker'
    venueId: v.optional(v.string()), // For venue invites
    icebreakerId: v.optional(v.string()), // For icebreakers
    isDeleted: v.optional(v.boolean()), // Soft delete flag
    deletedAt: v.optional(v.number()), // When it was deleted
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
    type: v.optional(v.string()), // 'like' | 'super'
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

  notifications: defineTable({
    userId: v.string(), // Who receives the notification
    type: v.string(), // 'match', 'message', 'system'
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()), // Extra data (e.g. matchId, url)
    read: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"]),

  platformSettings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});
