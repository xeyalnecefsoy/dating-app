import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// SUPERADMIN email - hardcoded for security
// Only this email has full platform control
const SUPERADMIN_EMAIL = "xeyalnecefsoy@gmail.com";

/**
 * Check if user is superadmin by email
 */
export const isSuperAdmin = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return args.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
  },
});

/**
 * Check user's role
 */
export const getUserRole = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    
    if (!user) return "user";
    
    // If no role set but matches superadmin email, return superadmin
    if (user.email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()) {
      return "superadmin";
    }
    
    return user.role || "user";
  },
});

/**
 * Get all users (admin only)
 */
export const getAllUsers = query({
  args: { adminEmail: v.string() },
  handler: async (ctx, args) => {
    // Only superadmin/admin can access
    const isAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }
    
    const users = await ctx.db.query("users").collect();
    return users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role || "user",
      status: u.status || "active",
      createdAt: u.createdAt,
    }));
  },
});

/**
 * Update user role (superadmin only)
 */
export const setUserRole = mutation({
  args: { 
    adminEmail: v.string(),
    targetUserId: v.id("users"),
    newRole: v.string() // 'user', 'moderator', 'admin'
  },
  handler: async (ctx, args) => {
    // Only superadmin can change roles
    const isSuperAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    if (!isSuperAdmin) {
      throw new Error("Unauthorized: Only superadmin can change roles");
    }
    
    // Validate role
    const validRoles = ["user", "moderator", "admin"];
    if (!validRoles.includes(args.newRole)) {
      throw new Error("Invalid role. Valid roles: user, moderator, admin");
    }
    
    await ctx.db.patch(args.targetUserId, { role: args.newRole });
    return { success: true };
  },
});

/**
 * Update user status (admin+ only)
 */
export const setUserStatus = mutation({
  args: { 
    adminEmail: v.string(),
    targetUserId: v.id("users"),
    newStatus: v.string() // 'active', 'waitlist', 'banned'
  },
  handler: async (ctx, args) => {
    // Check if requester is at least admin
    const isSuperAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    // For now, only superadmin can change status
    if (!isSuperAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }
    
    // Validate status
    const validStatuses = ["active", "waitlist", "banned"];
    if (!validStatuses.includes(args.newStatus)) {
      throw new Error("Invalid status. Valid statuses: active, waitlist, banned");
    }
    
    await ctx.db.patch(args.targetUserId, { status: args.newStatus });
    return { success: true };
  },
});

/**
 * Ban user (admin+ only)
 */
export const banUser = mutation({
  args: { 
    adminEmail: v.string(),
    targetUserId: v.id("users"),
    reason: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const isSuperAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    if (!isSuperAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }
    
    await ctx.db.patch(args.targetUserId, { status: "banned" });
    return { success: true, message: `User banned. Reason: ${args.reason || "No reason provided"}` };
  },
});

/**
 * Get platform stats (admin only)
 */
export const getPlatformStats = query({
  args: { adminEmail: v.string() },
  handler: async (ctx, args) => {
    const isAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }
    
    const users = await ctx.db.query("users").collect();
    const matches = await ctx.db.query("matches").collect();
    const messages = await ctx.db.query("messages").collect();
    
    const maleUsers = users.filter(u => u.gender === "male").length;
    const femaleUsers = users.filter(u => u.gender === "female").length;
    const waitlistUsers = users.filter(u => u.status === "waitlist").length;
    const bannedUsers = users.filter(u => u.status === "banned").length;
    
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status !== "banned" && u.status !== "waitlist").length,
      maleUsers,
      femaleUsers,
      waitlistUsers,
      bannedUsers,
      totalMatches: matches.length,
      totalMessages: messages.length,
      genderRatio: femaleUsers > 0 ? (maleUsers / femaleUsers).toFixed(2) : "N/A",
      pendingReports: 0, // TODO: Add reports table
      pendingVerifications: waitlistUsers, // Real count from waitlist
      premiumUsers: 0, // TODO: Add premium tracking
    };
  },
});

/**
 * Get all users in waitlist (for verification queue)
 */
export const getWaitlistUsers = query({
  args: { adminEmail: v.string() },
  handler: async (ctx, args) => {
    const isAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }
    
    const waitlistUsers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("status"), "waitlist"))
      .collect();
    
    return waitlistUsers.map(u => ({
      _id: u._id,
      clerkId: u.clerkId,
      name: u.name,
      email: u.email,
      gender: u.gender,
      age: u.age,
      location: u.location,
      bio: u.bio,
      avatar: u.avatar,
      createdAt: u.createdAt,
    }));
  },
});

/**
 * Approve a user from waitlist (set status to active)
 */
export const approveUser = mutation({
  args: { 
    adminEmail: v.string(),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const isAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }
    
    await ctx.db.patch(args.targetUserId, { status: "active" });
    return { success: true, message: "User approved and activated" };
  },
});

/**
 * Reject a user from waitlist
 */
export const rejectUser = mutation({
  args: { 
    adminEmail: v.string(),
    targetUserId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const isAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }
    
    await ctx.db.patch(args.targetUserId, { status: "rejected" });
    return { success: true, message: `User rejected. Reason: ${args.reason || "No reason provided"}` };
  },
});

/**
 * Get all conversations (for super admin oversight)
 */
export const getAllConversations = query({
  args: { adminEmail: v.string() },
  handler: async (ctx, args) => {
    const isAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    if (!isAdmin) {
      throw new Error("Unauthorized: Super admin access required");
    }
    
    // Get all matches (conversations)
    const matches = await ctx.db.query("matches").collect();
    
    // Get user info for each match
    const conversationsWithInfo = await Promise.all(
      matches.map(async (match) => {
        const user1 = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkId"), match.user1Id))
          .first();
        const user2 = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkId"), match.user2Id))
          .first();
        
        // Get last message for this match
        const messages = await ctx.db
          .query("messages")
          .filter((q) => q.eq(q.field("matchId"), match._id))
          .collect();
        const lastMessage = messages[messages.length - 1];
        
        return {
          matchId: match._id,
          user1: user1 ? { name: user1.name, avatar: user1.avatar, email: user1.email } : null,
          user2: user2 ? { name: user2.name, avatar: user2.avatar, email: user2.email } : null,
          status: match.status,
          messageCount: messages.length,
          lastMessage: lastMessage ? { body: lastMessage.body, userId: lastMessage.userId } : null,
        };
      })
    );
    
    return conversationsWithInfo;
  },
});

/**
 * Get messages for a specific conversation (super admin only)
 */
export const getConversationMessages = query({
  args: { 
    adminEmail: v.string(),
    matchId: v.id("matches"),
  },
  handler: async (ctx, args) => {
    const isAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    if (!isAdmin) {
      throw new Error("Unauthorized: Super admin access required");
    }
    
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("matchId"), args.matchId))
      .collect();
    
    return messages;
  },
});
