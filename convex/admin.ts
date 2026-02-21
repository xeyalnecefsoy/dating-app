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
    // Basic authorization check
    const isAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    
    // Also allow if user exists and has admin role
    let hasRole = false;
    if (!isAdmin) {
       const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.adminEmail))
        .first();
       if (user && (user.role === 'admin' || user.role === 'superadmin')) {
         hasRole = true;
       }
    }

    if (!isAdmin && !hasRole) {
      throw new Error("Unauthorized: Admin access required");
    }
    
    const users = await ctx.db.query("users").collect();
    return users.map(u => ({
      _id: u._id,
      clerkId: u.clerkId,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      role: u.role || "user",
      status: u.status || "active",
      username: u.username,
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
    // Basic authorization check
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
    // Basic authorization check
    const isSuperAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    
    // Also allow if user exists and has admin role
    let hasRole = false;
    if (!isSuperAdmin) {
       const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.adminEmail))
        .first();
       if (user && (user.role === 'admin' || user.role === 'superadmin')) {
         hasRole = true;
       }
    }

    if (!isSuperAdmin && !hasRole) {
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
    // Basic authorization check
    const isSuperAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    
    // Also allow if user exists and has admin role
    let hasRole = false;
    if (!isSuperAdmin) {
       const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.adminEmail))
        .first();
       if (user && (user.role === 'admin' || user.role === 'superadmin')) {
         hasRole = true;
       }
    }

    if (!isSuperAdmin && !hasRole) {
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
    // Basic authorization check
    const isAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    
    // Also allow if user exists and has admin role
    let hasRole = false;
    if (!isAdmin) {
       const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.adminEmail))
        .first();
       if (user && (user.role === 'admin' || user.role === 'superadmin')) {
         hasRole = true;
       }
    }

    if (!isAdmin && !hasRole) {
      throw new Error("Unauthorized: Admin access required");
    }
    
    // Fetch all data
    const users = await ctx.db.query("users").collect();
    const matches = await ctx.db.query("matches").collect();
    const messages = await ctx.db.query("messages").collect();
    const reports = await ctx.db.query("reports").collect();
    
    const maleUsers = users.filter(u => u.gender === "male").length;
    const femaleUsers = users.filter(u => u.gender === "female").length;
    const waitlistUsers = users.filter(u => u.status === "waitlist").length;
    const bannedUsers = users.filter(u => u.status === "banned").length;
    const premiumUsers = users.filter(u => u.isPremium === true).length;
    
    // Active users = not banned, not waitlisted, not rejected
    const activeUsers = users.filter(u => u.status === "active").length;
    
    // Time boundaries
    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;
    
    // Messages today
    const todayMessages = messages.filter(m => m._creationTime > todayStart.getTime()).length;
    
    // Pending reports — real count from reports table
    const pendingReports = reports.filter(r => r.status === "pending").length;
    
    // Growth metrics (this week vs last week)
    const newUsersThisWeek = users.filter(u => (u.createdAt || u._creationTime) > weekAgo).length;
    const newUsersLastWeek = users.filter(u => {
      const t = u.createdAt || u._creationTime;
      return t > twoWeeksAgo && t <= weekAgo;
    }).length;
    
    // Active users who joined this week vs last week
    const activeThisWeek = users.filter(u => u.status === "active" && (u.createdAt || u._creationTime) > weekAgo).length;
    const activeLastWeek = users.filter(u => {
      const t = u.createdAt || u._creationTime;
      return u.status === "active" && t > twoWeeksAgo && t <= weekAgo;
    }).length;
    
    // Messages this week vs last week
    const messagesThisWeek = messages.filter(m => m._creationTime > weekAgo).length;
    const messagesLastWeek = messages.filter(m => m._creationTime > twoWeeksAgo && m._creationTime <= weekAgo).length;
    
    // Match growth
    const matchesThisWeek = matches.filter(m => m._creationTime > weekAgo).length;
    const matchesLastWeek = matches.filter(m => m._creationTime > twoWeeksAgo && m._creationTime <= weekAgo).length;
    
    // Calculate growth percentages
    const calcGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100 * 10) / 10;
    };

    return {
      totalUsers: users.length,
      activeUsers,
      maleUsers,
      femaleUsers,
      waitlistUsers,
      bannedUsers,
      totalMatches: matches.length,
      totalMessages: messages.length,
      todayMessages,
      genderRatio: femaleUsers > 0 ? (maleUsers / femaleUsers).toFixed(2) : "N/A",
      pendingReports,
      pendingVerifications: waitlistUsers, 
      premiumUsers,
      // Growth percentages (week over week)
      userGrowth: calcGrowth(newUsersThisWeek, newUsersLastWeek),
      activeGrowth: calcGrowth(activeThisWeek, activeLastWeek),
      messageGrowth: calcGrowth(messagesThisWeek, messagesLastWeek),
      matchGrowth: calcGrowth(matchesThisWeek, matchesLastWeek),
    };
  },
});

/**
 * Get detailed message statistics (admin only)
 */
export const getMessageStats = query({
  args: { adminEmail: v.string() },
  handler: async (ctx, args) => {
    // Basic authorization check
    const isAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    let hasRole = false;
    if (!isAdmin) {
       const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.adminEmail))
        .first();
       if (user && (user.role === 'admin' || user.role === 'superadmin')) {
         hasRole = true;
       }
    }
    if (!isAdmin && !hasRole) {
      throw new Error("Unauthorized: Admin access required");
    }
    
    const messages = await ctx.db.query("messages").collect();
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    // Messages per day for last 7 days
    const dailyBreakdown: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now - i * 24 * 60 * 60 * 1000);
      dayStart.setHours(0,0,0,0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23,59,59,999);
      
      const count = messages.filter(m => 
        m._creationTime >= dayStart.getTime() && m._creationTime <= dayEnd.getTime()
      ).length;
      
      dailyBreakdown.push({
        date: dayStart.toLocaleDateString('az-AZ', { weekday: 'short', day: 'numeric' }),
        count,
      });
    }
    
    const weeklyMessages = messages.filter(m => m._creationTime > weekAgo).length;
    const dailyAverage = Math.round(weeklyMessages / 7);
    
    // Average response time calculation
    // Group messages by channelId, then find time between consecutive messages from different users
    const channelMessages: Record<string, typeof messages> = {};
    for (const msg of messages) {
      const ch = msg.channelId || "general";
      if (!channelMessages[ch]) channelMessages[ch] = [];
      channelMessages[ch].push(msg);
    }
    
    let totalResponseTime = 0;
    let responseCount = 0;
    
    for (const ch of Object.keys(channelMessages)) {
      // Skip general channel — only private chats
      if (ch === "general") continue;
      
      const sorted = channelMessages[ch].sort((a, b) => a._creationTime - b._creationTime);
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].userId !== sorted[i-1].userId) {
          const diff = sorted[i]._creationTime - sorted[i-1]._creationTime;
          // Only count responses within 24 hours to avoid skewing
          if (diff < 24 * 60 * 60 * 1000) {
            totalResponseTime += diff;
            responseCount++;
          }
        }
      }
    }
    
    // Average response time in hours
    const avgResponseTimeHours = responseCount > 0
      ? Math.round((totalResponseTime / responseCount / (1000 * 60 * 60)) * 10) / 10
      : 0;
    
    return {
      totalMessages: messages.length,
      weeklyMessages,
      dailyAverage,
      avgResponseTimeHours,
      dailyBreakdown,
    };
  },
});

/**
 * Get all users in waitlist (for verification queue)
 */
export const getWaitlistUsers = query({
  args: { adminEmail: v.string() },
  handler: async (ctx, args) => {
    // Basic authorization check
    const isAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    
    // Also allow if user exists and has admin role
    let hasRole = false;
    if (!isAdmin) {
       const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.adminEmail))
        .first();
       if (user && (user.role === 'admin' || user.role === 'superadmin')) {
         hasRole = true;
       }
    }

    if (!isAdmin && !hasRole) {
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
      username: u.username,
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
    // Basic authorization check
    const isAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    
    // Also allow if user exists and has admin role
    let hasRole = false;
    if (!isAdmin) {
       const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.adminEmail))
        .first();
       if (user && (user.role === 'admin' || user.role === 'superadmin')) {
         hasRole = true;
       }
    }

    if (!isAdmin && !hasRole) {
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
    // Basic authorization check
    const isAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    
    // Also allow if user exists and has admin role
    let hasRole = false;
    if (!isAdmin) {
       const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.adminEmail))
        .first();
       if (user && (user.role === 'admin' || user.role === 'superadmin')) {
         hasRole = true;
       }
    }

    if (!isAdmin && !hasRole) {
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
    // Basic authorization check
    const isAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    
    // Also allow if user exists and has admin role
    let hasRole = false;
    if (!isAdmin) {
       const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.adminEmail))
        .first();
       if (user && (user.role === 'admin' || user.role === 'superadmin')) {
         hasRole = true;
       }
    }

    if (!isAdmin && !hasRole) {
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
    // Basic authorization check
    const isAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    
    // Also allow if user exists and has admin role
    let hasRole = false;
    if (!isAdmin) {
       const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.adminEmail))
        .first();
       if (user && (user.role === 'admin' || user.role === 'superadmin')) {
         hasRole = true;
       }
    }

    if (!isAdmin && !hasRole) {
      throw new Error("Unauthorized: Super admin access required");
    }
    
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("matchId"), args.matchId))
      .collect();
    
    return messages;
  },
});

/**
 * Get recent activity for admin dashboard
 */
export const getRecentActivity = query({
  args: { adminEmail: v.string() },
  handler: async (ctx, args) => {
    // Basic authorization check
    const isAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    
    // Also allow if user exists and has admin role
    let hasRole = false;
    if (!isAdmin) {
       const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.adminEmail))
        .first();
       if (user && (user.role === 'admin' || user.role === 'superadmin')) {
         hasRole = true;
       }
    }

    if (!isAdmin && !hasRole) {
      throw new Error("Unauthorized: Admin access required");
    }
    
    // Get recently registered users (last 10)
    const recentUsers = await ctx.db
      .query("users")
      .order("desc")
      .take(10);
    
    // Transform to activity items
    const activities = recentUsers.map(user => {
      const createdAt = user._creationTime;
      const now = Date.now();
      const diffMs = now - createdAt;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      let timeAgo = '';
      if (diffDays > 0) {
        timeAgo = `${diffDays} gün əvvəl`;
      } else if (diffHours > 0) {
        timeAgo = `${diffHours} saat əvvəl`;
      } else if (diffMins > 0) {
        timeAgo = `${diffMins} dəq əvvəl`;
      } else {
        timeAgo = 'İndicə';
      }
      
      let actionType = 'registration';
      let actionText = 'Yeni istifadəçi qeydiyyatdan keçdi';
      
      if (user.status === 'banned') {
        actionType = 'banned';
        actionText = 'İstifadəçi ban edildi';
      } else if (user.status === 'waitlist') {
        actionType = 'waitlist';
        actionText = 'Waitlist-ə əlavə edildi';
      } else if (user.status === 'active' && user.gender === 'female') {
        actionType = 'verified';
        actionText = 'Profil avtomatik təsdiqləndi';
      }
      
      return {
        id: user._id,
        actionType,
        actionText,
        userName: user.name,
        userAvatar: user.avatar,
        timeAgo,
        createdAt,
      };
    });
    
    return activities;
  },
});

/**
 * Get platform settings (for admin dashboard)
 */
export const getPlatformSettings = query({
  args: { adminEmail: v.string() },
  handler: async (ctx, args) => {
    const isAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    if (!isAdmin) throw new Error("Unauthorized");

    const settings = await ctx.db.query("platformSettings").collect();
    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  },
});

/**
 * Toggle premium paywall on/off (superadmin only)
 */
export const togglePaywall = mutation({
  args: { 
    adminEmail: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const isSuperAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    if (!isSuperAdmin) throw new Error("Unauthorized: Only superadmin can toggle paywall");

    const existing = await ctx.db
      .query("platformSettings")
      .withIndex("by_key", (q) => q.eq("key", "PREMIUM_PAYWALL_ENABLED"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.enabled ? "true" : "false" });
    } else {
      await ctx.db.insert("platformSettings", {
        key: "PREMIUM_PAYWALL_ENABLED",
        value: args.enabled ? "true" : "false",
      });
    }

    return { success: true, paywallEnabled: args.enabled };
  },
});

/**
 * Grant premium to a user (superadmin only)
 */
export const grantPremium = mutation({
  args: { 
    adminEmail: v.string(),
    targetUserId: v.id("users"),
    plan: v.string(), // 'monthly' | 'quarterly' | 'yearly'
  },
  handler: async (ctx, args) => {
    const isSuperAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    if (!isSuperAdmin) throw new Error("Unauthorized: Only superadmin can grant premium");

    const durations: Record<string, number> = {
      monthly: 30 * 24 * 60 * 60 * 1000,
      quarterly: 90 * 24 * 60 * 60 * 1000,
      yearly: 365 * 24 * 60 * 60 * 1000,
    };

    const duration = durations[args.plan];
    if (!duration) throw new Error("Invalid plan");

    await ctx.db.patch(args.targetUserId, {
      isPremium: true,
      premiumPlan: args.plan,
      premiumExpiresAt: Date.now() + duration,
    });

    return { success: true };
  },
});

/**
 * Revoke premium from a user (superadmin only)
 */
export const revokePremium = mutation({
  args: { 
    adminEmail: v.string(),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const isSuperAdmin = args.adminEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
    if (!isSuperAdmin) throw new Error("Unauthorized: Only superadmin can revoke premium");

    await ctx.db.patch(args.targetUserId, {
      isPremium: false,
      premiumPlan: undefined,
      premiumExpiresAt: undefined,
    });

    return { success: true };
  },
});
