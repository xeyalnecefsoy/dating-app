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
    isVerified: v.optional(v.boolean()), // Verified (blue tick) status
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
    // Badges
    badges: v.optional(v.array(v.string())), // earned badge IDs
    // Unread match notifications
    unreadMatches: v.optional(v.array(v.string())), // IDs of newest matches to show in badge
    seenMessageRequests: v.optional(v.array(v.string())), // Avoid showing badges for requests already seen
    // Swipe Limits
    dailySwipeCount: v.optional(v.number()),
    lastSwipeDate: v.optional(v.string()), // YYYY-MM-DD
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
    lastReadUser1: v.optional(v.number()), // Timestamp when user1 last read messages
    lastReadUser2: v.optional(v.number()), // Timestamp when user2 last read messages
  }).index("by_user1", ["user1Id"])
    .index("by_user2", ["user2Id"])
    .index("by_user1_status", ["user1Id", "status"])
    .index("by_user2_status", ["user2Id", "status"]),

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
    createdAt: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"]),

  platformSettings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  reports: defineTable({
    reporterId: v.string(),       // Clerk ID of reporter
    reportedId: v.string(),       // Clerk ID of reported user
    reason: v.string(),           // 'fake', 'harassment', 'spam', 'inappropriate', 'other'
    description: v.optional(v.string()),
    status: v.string(),           // 'pending', 'reviewed', 'resolved', 'dismissed'
    createdAt: v.number(),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
  }).index("by_status", ["status"])
    .index("by_reported", ["reportedId"])
    .index("by_reporter", ["reporterId"]),

  stories: defineTable({
    userId: v.string(), // Clerk ID of the creator
    storageId: v.optional(v.id("_storage")), // Convex storage ID
    mediaUrl: v.string(), // Public URL of the media
    mediaType: v.string(), // 'image' or 'video'
    caption: v.optional(v.string()),
    isPublic: v.boolean(), // true = public, false = matches only
    createdAt: v.number(),
    expiresAt: v.number(), // +24 hours from creation
    viewers: v.optional(v.array(v.string())), // Clerk IDs of users who viewed this
  }).index("by_user", ["userId"])
    .index("by_expiresAt", ["expiresAt"]),

  banners: defineTable({
    titleAz: v.optional(v.string()),
    titleEn: v.optional(v.string()),
    descriptionAz: v.optional(v.string()),
    descriptionEn: v.optional(v.string()),
    ctaTextAz: v.optional(v.string()),
    ctaTextEn: v.optional(v.string()),
    ctaLink: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")), // For uploaded image
    imageUrl: v.optional(v.string()), // Resolved public URL
    gradient: v.optional(v.string()), // e.g. "from-pink-500 to-rose-500"
    isActive: v.boolean(),
    order: v.number(), // Sort order
    createdAt: v.number(),
    createdBy: v.string(), // Admin's clerkId
  }).index("by_active", ["isActive"])
    .index("by_order", ["order"]),

  systemAlerts: defineTable({
    type: v.string(), // 'info', 'maintenance'
    titleAz: v.string(),
    titleEn: v.string(),
    messageAz: v.string(),
    messageEn: v.string(),
    blocksAccess: v.boolean(), // true = maintenance mode (blocks users from entering)
    isActive: v.boolean(),
    createdAt: v.number(),
    createdBy: v.string(), // Admin's clerkId
  }).index("by_active", ["isActive"]),
});
