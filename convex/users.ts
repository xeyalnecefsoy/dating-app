import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Staff emails that bypass waitlist
const STAFF_EMAILS = ["xeyalnecefsoy@gmail.com"];

/**
 * Generate a unique username from name
 * Removes special characters, converts to lowercase, adds random suffix if needed
 */
async function generateUniqueUsername(ctx: any, name: string): Promise<string> {
  // Normalize: remove special chars, convert to lowercase, replace spaces with underscores
  let baseUsername = name
    .toLowerCase()
    .replace(/[əƏ]/g, 'e')
    .replace(/[öÖ]/g, 'o')
    .replace(/[üÜ]/g, 'u')
    .replace(/[çÇ]/g, 'c')
    .replace(/[şŞ]/g, 's')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 15); // Max 15 chars for base
  
  if (baseUsername.length < 3) {
    baseUsername = "user";
  }
  
  // Check if base username is available
  let username = baseUsername;
  let existing = await ctx.db
    .query("users")
    .withIndex("by_username", (q: any) => q.eq("username", username))
    .first();
  
  // If taken, add random suffix
  let attempts = 0;
  while (existing && attempts < 10) {
    const suffix = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    username = `${baseUsername}${suffix}`;
    existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q: any) => q.eq("username", username))
      .first();
    attempts++;
  }
  
  return username;
}

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
    birthDay: v.optional(v.string()),
    birthMonth: v.optional(v.string()),
    birthYear: v.optional(v.string()),
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
    // Check if user already exists by Clerk ID
    let existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    // If not found by Clerk ID, check by Email (to prevent duplicates/merge accounts)
    if (!existingUser && args.email) {
      existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();
      
      // If we found a user by email but different Clerk ID, it means they logged in with a new method
      // We should update the Clerk ID to the new one to "link" the account
      if (existingUser) {
        console.log(`Merging user ${existingUser._id} with new Clerk ID ${args.clerkId}`);
        await ctx.db.patch(existingUser._id, { clerkId: args.clerkId });
      }
    }

    // Check if this is a staff member
    const isStaff = args.email && STAFF_EMAILS.includes(args.email.toLowerCase());
    
    // Check existing role if user exists
    const existingRole = existingUser?.role;
    const hasStaffRole = existingRole && ["admin", "moderator", "superadmin"].includes(existingRole);
    
    // Normalize gender to lowercase
    const normalizedGender = args.gender?.toLowerCase();
    
    // Determine status: staff and females are active, males go to waitlist
    let status = "active";
    if (normalizedGender === "male" && !isStaff && !hasStaffRole) {
      status = "waitlist";
    }

    // Determine role: give superadmin to known staff emails
    const role = isStaff ? "superadmin" : (existingRole || "user");

    if (existingUser) {
      // Generate username if not exists
      let username = existingUser.username;
      if (!username) {
        username = await generateUniqueUsername(ctx, args.name);
      }
      
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        // Ensure createdAt is present
        createdAt: existingUser.createdAt || Date.now(),
        email: args.email,
        gender: normalizedGender,
        age: args.age,
        birthDay: args.birthDay,
        birthMonth: args.birthMonth,
        birthYear: args.birthYear,
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
        // Set username if not already set
        ...(existingUser.username ? {} : { username, usernameChangedAt: Date.now() }),
      });
      return { userId: existingUser._id, status: existingUser.status || status, isNew: false, username };
    } else {
      // Generate username for new user
      const username = await generateUniqueUsername(ctx, args.name);
      
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        name: args.name,
        email: args.email,
        username: username,
        usernameChangedAt: Date.now(),
        gender: normalizedGender,
        age: args.age,
        birthDay: args.birthDay,
        birthMonth: args.birthMonth,
        birthYear: args.birthYear,
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
      return { userId, status, isNew: true, username };
    }
  },
});

export const resetSuperAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) return { success: false, message: "User not found" };

    // Reset to Khayal's profile
    await ctx.db.patch(user._id, {
        name: "Xəyal",
        gender: "male",
        role: "superadmin",
        avatar: "https://tremendous-partridge-845.convex.cloud/api/storage/dfb3e63e-35dc-4459-b19c-6997f7e49eb8", 
        // Keep existing valid data or reset if needed
    });
    
    // Check for duplicates
    const duplicates = await ctx.db.query("users").collect();
    const dupUsers = duplicates.filter(u => u.email === args.email && u._id !== user._id);
    for (const d of dupUsers) {
        await ctx.db.delete(d._id);
    }
    
    // Also delete any user that has no email but might be the duplicate "Gözəl Anlar"
    // ID: jd729b6xm76v62prs5yf3qk5n980j3a7
    // We should probably just delete "Gözəl Anlar" by ID to be safe
    // But let's rely on manual cleanup if needed.
    
    return { success: true, message: "Superadmin reset complete" };
  }
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
 * Get active users for discovery (paginated)
 * Filters by status = 'active', opposite gender, and privacy settings
 * Returns max 50 users per batch, excludes already-seen users
 */
export const getActiveUsers = query({
  args: { 
    currentUserGender: v.optional(v.string()),
    currentUserId: v.optional(v.string()),
    excludeIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Fetch users with limit to avoid loading entire DB
    const users = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(200);

    // Get current user's blocked list + already-liked list
    let myBlockedUsers: string[] = [];
    let myLikedUsers: Set<string> = new Set();
    if (args.currentUserId) {
      const currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.currentUserId))
        .first();
      myBlockedUsers = currentUser?.blockedUsers || [];

      // Fetch already-liked users to exclude server-side
      const myLikes = await ctx.db
        .query("likes")
        .withIndex("by_liker", q => q.eq("likerId", args.currentUserId!))
        .collect();
      myLikedUsers = new Set(myLikes.map(l => l.likedId));
    }

    const excludeSet = new Set(args.excludeIds || []);

    // Filter by opposite gender, exclude current user, and apply privacy filters
    const targetGender = args.currentUserGender === "male" ? "female" : "male";
    const filteredUsers = users.filter(u => {
      // Basic filters
      if (u.gender !== targetGender) return false;
      if (u.clerkId === args.currentUserId) return false;
      // Exclude already-seen users
      if (u.clerkId && excludeSet.has(u.clerkId)) return false;
      // Exclude already-liked users (server-side)
      if (u.clerkId && myLikedUsers.has(u.clerkId)) return false;
      // Privacy: skip users who hid their profile
      if (u.hideProfile === true) return false;
      // Privacy: skip users I blocked
      if (u.clerkId && myBlockedUsers.includes(u.clerkId)) return false;
      // Privacy: skip users who blocked ME
      if (u.blockedUsers && args.currentUserId && u.blockedUsers.includes(args.currentUserId)) return false;
      return true;
    });

    // Return max 50 users per batch
    return filteredUsers.slice(0, 50);
  },
});

/**
 * Get all active users for search (client-side filtering)
 */
export const searchUsers = query({
  args: { 
    currentUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    return users.filter(u => u.clerkId !== args.currentUserId);
  },
});

/**
 * Optimized user search for @mentions
 */
export const searchUsersForMention = query({
  args: { 
    query: v.string(),
    currentUserId: v.string()
  },
  handler: async (ctx, args) => {
    // If query is empty, return top 5 recent users (suggestions)
    const normalizedQuery = (args.query || "").toLowerCase();
    
    // 1. If empty query, get random/recent active users
    if (!normalizedQuery) {
        const users = await ctx.db
          .query("users")
          .withIndex("by_status", q => q.eq("status", "active"))
          .take(5);
          
        return users
          .filter(u => u.clerkId !== args.currentUserId)
          .map(u => ({
            _id: u._id,
            clerkId: u.clerkId,
            username: u.username || "user",
            name: u.name,
            avatar: u.avatar
          }));
    }

    // 2. Search by username prefix
    const usersByUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => 
         q.gte("username", normalizedQuery).lt("username", normalizedQuery + "\uffff")
      )
      .take(5);

    // 2. Search by name (if not enough results)
    // Note: This is an inefficient scan but acceptable for small scale
    // In production, use Convex Search or a dedicated search index
    let users = [...usersByUsername];
    
    if (users.length < 5) {
       const allUsers = await ctx.db.query("users").collect();
       const otherMatches = allUsers.filter(u => 
         u.name.toLowerCase().includes(normalizedQuery) && 
         !users.some(existing => existing._id === u._id)
       );
       users = [...users, ...otherMatches].slice(0, 5);
    }
    
    return users
      .filter(u => u.clerkId !== args.currentUserId)
      .map(u => ({
        _id: u._id,
        clerkId: u.clerkId,
        username: u.username || "user",
        name: u.name,
        avatar: u.avatar
      }));
  },
});

/**
 * Server-side filtered search — filters applied at the database level
 */
export const searchUsersFiltered = query({
  args: {
    currentUserId: v.optional(v.string()),
    minAge: v.optional(v.number()),
    maxAge: v.optional(v.number()),
    location: v.optional(v.string()),
    communicationStyle: v.optional(v.string()),
    lookingFor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    return users.filter((u) => {
      // Exclude self
      if (u.clerkId === args.currentUserId) return false;
      // Age filter
      if (args.minAge && (u.age || 0) < args.minAge) return false;
      if (args.maxAge && (u.age || 0) > args.maxAge) return false;
      // Location filter
      if (args.location && args.location !== "all" && u.location !== args.location) return false;
      // Communication style filter
      if (args.communicationStyle && args.communicationStyle !== "all" && u.communicationStyle !== args.communicationStyle) return false;
      // LookingFor gender filter
      if (args.lookingFor && u.gender !== args.lookingFor) return false;
      return true;
    });
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

/**
 * Clear all unread matches for the current user
 */
export const clearUnreadMatches = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // We expect the auth identity to match, but in a rush we just query by clerkId
    // since this is a safe operation (only clears badges) we can do it directly.
    const userRecord = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", args.clerkId))
      .first();

    if (userRecord) {
      await ctx.db.patch(userRecord._id, { unreadMatches: [] });
    }
    return { success: true };
  }
});

/**
 * Clear a single unread match for the current user
 */
export const clearSingleUnreadMatch = mutation({
  args: { clerkId: v.string(), matchIdToClear: v.string() },
  handler: async (ctx, args) => {
    const userRecord = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", args.clerkId))
      .first();

    if (userRecord) {
      const currentMatches = userRecord.unreadMatches || [];
      const updatedMatches = currentMatches.filter((id: string) => id !== args.matchIdToClear);
      
      await ctx.db.patch(userRecord._id, { unreadMatches: updatedMatches });
    }
    return { success: true };
  }
});

/**
 * Mark message requests as seen to prevent badge loops
 */
export const markSeenMessageRequests = mutation({
  args: { clerkId: v.string(), requestIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const userRecord = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", args.clerkId))
      .first();

    if (userRecord) {
      const currentSeen = userRecord.seenMessageRequests || [];
      const newUnique = args.requestIds.filter(id => !currentSeen.includes(id));
      if (newUnique.length > 0) {
          await ctx.db.patch(userRecord._id, { 
              seenMessageRequests: [...currentSeen, ...newUnique] 
          });
      }
    }
    return { success: true };
  }
});



/**
 * Get user's position in the waitlist
 */
/**
 * Get user's position in the waitlist
 */
export const getQueuePosition = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || user.status !== "waitlist") {
      return null;
    }

    // Critical: If createdAt is missing, we must NOT give them a priority.
    // We treat missing createdAt as Date.now() (end of line) temporarily until backfilled.
    // If strict ordering is required, we should use internal _creationTime if createdAt is 0?
    // Convex documents have _creationTime which is system guaranteed order.
    // Let's use user.createdAt if exists, else _creationTime.
    
    const creationTime = user.createdAt || user._creationTime;

    const waitlistedUsers = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", "waitlist"))
      .collect();

    // strict less-than count
    const position = waitlistedUsers.filter(u => {
      const uTime = u.createdAt || u._creationTime;
      // If times are exactly equal (rare), use ID as tiebreaker to be deterministic
      if (uTime === creationTime) {
        return u._id < user._id;
      }
      return uTime < creationTime;
    }).length + 1;
    
    return position;
  },
});

/**
 * Migration to backfill createdAt for all users
 */
import { internalMutation } from "./_generated/server";

export const backfillCreatedAt = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let count = 0;
    for (const u of users) {
      if (!u.createdAt) {
        // Use _creationTime as the source of truth for when they actually signed up
        await ctx.db.patch(u._id, { createdAt: u._creationTime });
        count++;
      }
    }
    return `Backfilled ${count} users.`;
  },
});



export const fixAvatarUrls = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let count = 0;
    const correctBase = "https://tremendous-partridge-845.convex.cloud";
    
    for (const u of users) {
      if (u.avatar && u.avatar.startsWith("undefined/api/storage/")) {
        const newAvatar = u.avatar.replace("undefined", correctBase);
        await ctx.db.patch(u._id, { avatar: newAvatar });
        count++;
      }
    }
    return `Fixed ${count} avatar URLs.`;
  },
});

/**
 * Get multiple users by their IDs (Clerk IDs)
 */
export const getUsersByIds = query({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, args) => {
    const users = [];
    for (const id of args.ids) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", id))
        .first();
      if (user) {
        users.push(user);
      }
    }
    return users;
  },
});

// ==================== USERNAME SYSTEM ====================

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const USERNAME_CHANGE_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const PREMIUM_COOLDOWN_MS = 15 * 24 * 60 * 60 * 1000; // 15 days for premium

/**
 * Get user by username
 */
export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const normalizedUsername = args.username.toLowerCase();
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", normalizedUsername))
      .first();
  },
});

/**
 * Check if username is available
 */
export const checkUsernameAvailable = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const normalizedUsername = args.username.toLowerCase();
    
    // Validate format
    if (!USERNAME_REGEX.test(args.username)) {
      return { 
        available: false, 
        error: "Username 3-20 simvol olmalı, yalnız hərf, rəqəm və alt xətt (_) icazəlidir" 
      };
    }
    
    // Check reserved usernames
    const reserved = ["admin", "superadmin", "moderator", "support", "help", "danyeri", "system"];
    if (reserved.includes(normalizedUsername)) {
      return { available: false, error: "Bu username qorunur" };
    }
    
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", normalizedUsername))
      .first();
      
    return { available: !existing, error: existing ? "Bu username artıq istifadə olunur" : null };
  },
});

/**
 * Set or update username
 */
export const setUsername = mutation({
  args: { 
    clerkId: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedUsername = args.username.toLowerCase();
    
    // Validate format
    if (!USERNAME_REGEX.test(args.username)) {
      return { 
        success: false, 
        error: "Username 3-20 simvol olmalı, yalnız hərf, rəqəm və alt xətt (_) icazəlidir" 
      };
    }
    
    // Check reserved
    const reserved = ["admin", "superadmin", "moderator", "support", "help", "danyeri", "system"];
    if (reserved.includes(normalizedUsername)) {
      return { success: false, error: "Bu username qorunur" };
    }
    
    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
      
    if (!user) {
      return { success: false, error: "İstifadəçi tapılmadı" };
    }
    
    // Check cooldown (skip for staff)
    const isStaff = user.role === "admin" || user.role === "superadmin" || user.role === "moderator";
    const isPremium = (user as any).isPremium === true;
    
    if (!isStaff && user.usernameChangedAt) {
      const cooldown = isPremium ? PREMIUM_COOLDOWN_MS : USERNAME_CHANGE_COOLDOWN_MS;
      const timeSinceChange = Date.now() - user.usernameChangedAt;
      
      if (timeSinceChange < cooldown) {
        const daysLeft = Math.ceil((cooldown - timeSinceChange) / (24 * 60 * 60 * 1000));
        return { 
          success: false, 
          error: `Username dəyişmək üçün ${daysLeft} gün gözləməlisiniz` 
        };
      }
    }
    
    // Check availability
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", normalizedUsername))
      .first();
      
    if (existing && existing._id !== user._id) {
      return { success: false, error: "Bu username artıq istifadə olunur" };
    }
    
    // Update username
    await ctx.db.patch(user._id, {
      username: normalizedUsername,
      usernameChangedAt: Date.now(),
    });
    
    return { success: true, username: normalizedUsername };
  },
});

/**
 * Backfill usernames for all existing users who don't have one
 */
export const backfillUsernames = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let count = 0;
    
    for (const u of users) {
      if (!u.username && u.name) {
        const username = await generateUniqueUsername(ctx, u.name);
        await ctx.db.patch(u._id, { 
          username, 
          usernameChangedAt: Date.now() 
        });
        count++;
      }
    }
    
    return `Generated usernames for ${count} users.`;
  },
});
