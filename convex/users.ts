import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Staff emails that bypass waitlist
const STAFF_EMAILS = ["xeyalnecefsoy@gmail.com"];

/**
 * Create or update a user during onboarding
 * Males go to waitlist, females are active immediately
 * Staff members bypass waitlist regardless of gender
 */
export const createOrUpdateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.string(),
    gender: v.optional(v.string()),
    age: v.optional(v.number()),
    location: v.optional(v.string()),
    bio: v.optional(v.string()),
    values: v.optional(v.array(v.string())),
    loveLanguage: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    communicationStyle: v.optional(v.string()),
    avatar: v.optional(v.string()),
    lookingFor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    // Check if this is a staff member
    const isStaff = args.email && STAFF_EMAILS.includes(args.email.toLowerCase());
    
    // Check existing role if user exists
    const existingRole = existingUser?.role;
    const hasStaffRole = existingRole && ["admin", "moderator", "superadmin"].includes(existingRole);
    
    // Determine status: staff and females are active, males go to waitlist
    let status = "active";
    if (args.gender === "male" && !isStaff && !hasStaffRole) {
      status = "waitlist";
    }

    // Determine role: give superadmin to known staff emails
    const role = isStaff ? "superadmin" : (existingRole || "user");

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        gender: args.gender,
        age: args.age,
        location: args.location,
        bio: args.bio,
        values: args.values,
        loveLanguage: args.loveLanguage,
        interests: args.interests,
        communicationStyle: args.communicationStyle,
        avatar: args.avatar,
        lookingFor: args.lookingFor,
        // Only update status if not already set or if staff
        status: existingUser.status || status,
        role: role,
      });
      return { userId: existingUser._id, status: existingUser.status || status, isNew: false };
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        name: args.name,
        email: args.email,
        gender: args.gender,
        age: args.age,
        location: args.location,
        bio: args.bio,
        values: args.values,
        loveLanguage: args.loveLanguage,
        interests: args.interests,
        communicationStyle: args.communicationStyle,
        avatar: args.avatar,
        lookingFor: args.lookingFor,
        status: status,
        role: role,
        createdAt: Date.now(),
      });
      return { userId, status, isNew: true };
    }
  },
});

/**
 * Get a user by Clerk ID
 */
export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    return user;
  },
});

/**
 * Get user by email
 */
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return user;
  },
});

/**
 * Get active users for discovery
 * Filters by status = 'active' and opposite gender
 */
export const getActiveUsers = query({
  args: { 
    currentUserGender: v.optional(v.string()),
    currentUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get all active users
    const users = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Filter by opposite gender and exclude current user
    const targetGender = args.currentUserGender === "male" ? "female" : "male";
    const filteredUsers = users.filter(u => 
      u.gender === targetGender && 
      u.clerkId !== args.currentUserId
    );

    return filteredUsers;
  },
});

/**
 * Check if a user is staff (admin, moderator, or superadmin)
 */
export const isStaffMember = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return false;
    
    // Check role
    if (user.role && ["admin", "moderator", "superadmin"].includes(user.role)) {
      return true;
    }
    
    // Check email
    if (user.email && STAFF_EMAILS.includes(user.email.toLowerCase())) {
      return true;
    }
    
    return false;
  },
});

// Create a new user (Dev/Test only)
export const createTempUser = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      name: args.name,
      interests: [],
    });
    return userId;
  },
});

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    // 1. Delete Matches
    const matches1 = await ctx.db
      .query("matches")
      .filter((q) => q.eq(q.field("user1Id"), userId))
      .collect();
    const matches2 = await ctx.db
      .query("matches")
      .filter((q) => q.eq(q.field("user2Id"), userId))
      .collect();
    
    for (const m of [...matches1, ...matches2]) {
      await ctx.db.delete(m._id);
    }

    // 2. Delete Likes
    const likesGiven = await ctx.db
      .query("likes")
      .withIndex("by_liker", q => q.eq("likerId", userId))
      .collect();
    const likesReceived = await ctx.db
      .query("likes")
      .withIndex("by_liked", q => q.eq("likedId", userId))
      .collect();

    for (const l of [...likesGiven, ...likesReceived]) {
      await ctx.db.delete(l._id);
    }

    // 3. Delete Messages
    const messages = await ctx.db
      .query("messages")
      .filter(q => q.eq(q.field("userId"), userId))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    // 4. Delete Presence
    const presence = await ctx.db
      .query("presence")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
    
    for (const p of presence) {
      await ctx.db.delete(p._id);
    }

    // 5. Delete user record
    const userRecord = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", userId))
      .first();
    
    if (userRecord) {
      await ctx.db.delete(userRecord._id);
    }

    return { success: true };
  }
});

