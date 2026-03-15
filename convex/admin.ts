import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// SUPERADMIN email - hardcoded for security
// Only this email has full platform control
const SUPERADMIN_EMAIL = "xeyalnecefsoy@gmail.com";
const ADMIN_ROLES = new Set(["moderator", "admin", "superadmin"]);

function getIdentityEmails(identity: any) {
  const rawEmail = String(
    identity?.email ||
      identity?.claims?.email ||
      identity?.claims?.email_address ||
      ""
  ).trim();
  const normalizedEmail = rawEmail.toLowerCase();
  return { rawEmail, normalizedEmail };
}

async function getRequesterRole(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");

  const { rawEmail, normalizedEmail } = getIdentityEmails(identity);

  let user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .first();

  if (!user && rawEmail) {
    user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", rawEmail))
      .first();
  }

  if (!user && normalizedEmail && normalizedEmail !== rawEmail) {
    user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", normalizedEmail))
      .first();
  }

  const isEmailSuperadmin =
    normalizedEmail === SUPERADMIN_EMAIL.toLowerCase();
  const role = (user?.role || (isEmailSuperadmin ? "superadmin" : "user")).toLowerCase();

  return {
    identity,
    user,
    role,
    isSuperadmin: role === "superadmin",
    isAdmin: ADMIN_ROLES.has(role),
  };
}

async function requireAdmin(ctx: any) {
  const requester = await getRequesterRole(ctx);
  if (!requester.isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }
  return requester;
}

async function requireSuperadmin(ctx: any) {
  const requester = await getRequesterRole(ctx);
  if (!requester.isSuperadmin) {
    throw new Error("Unauthorized: Only superadmin allowed");
  }
  return requester;
}

function assertTargetCanBeDeleted(targetUser: any, requesterClerkId: string) {
  const targetEmail = String(targetUser?.email || "").toLowerCase();
  const targetRole = String(targetUser?.role || "").toLowerCase();
  const targetClerkId = String(targetUser?.clerkId || "");

  if (targetEmail === SUPERADMIN_EMAIL.toLowerCase() || targetRole === "superadmin") {
    throw new Error("Founder/Superadmin account cannot be deleted");
  }

  if (targetClerkId && targetClerkId === requesterClerkId) {
    throw new Error("You cannot delete your own account from admin panel");
  }

  return { targetClerkId };
}

function buildPrivateChannelId(userAId: string, userBId: string) {
  const sorted = [userAId, userBId].sort();
  return `match-${sorted[0]}-${sorted[1]}`;
}

function channelBelongsToUser(channelId: string | undefined, clerkId: string) {
  if (!channelId || !clerkId || !channelId.startsWith("match-")) return false;
  const privatePart = channelId.slice("match-".length);
  return privatePart.startsWith(`${clerkId}-`) || privatePart.endsWith(`-${clerkId}`);
}

function dedupeDocsById<T extends { _id: any }>(docs: T[]) {
  const seen = new Set<string>();
  const unique: T[] = [];
  for (const doc of docs) {
    const key = String(doc._id);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(doc);
  }
  return unique;
}

async function deleteUserAppData(ctx: any, targetUser: any) {
  const targetClerkId = String(targetUser?.clerkId || "");
  const hasClerkId = targetClerkId.length > 0;

  const [
    matchesAsUser1,
    matchesAsUser2,
    likesGiven,
    likesReceived,
    presenceRows,
    subscriptions,
    stories,
    reportsByReporter,
    reportsByReported,
    allNotifications,
    allMessages,
    allUsers,
    allReports,
  ] = await Promise.all([
    hasClerkId
      ? ctx.db.query("matches").withIndex("by_user1", (q: any) => q.eq("user1Id", targetClerkId)).collect()
      : Promise.resolve([]),
    hasClerkId
      ? ctx.db.query("matches").withIndex("by_user2", (q: any) => q.eq("user2Id", targetClerkId)).collect()
      : Promise.resolve([]),
    hasClerkId
      ? ctx.db.query("likes").withIndex("by_liker", (q: any) => q.eq("likerId", targetClerkId)).collect()
      : Promise.resolve([]),
    hasClerkId
      ? ctx.db.query("likes").withIndex("by_liked", (q: any) => q.eq("likedId", targetClerkId)).collect()
      : Promise.resolve([]),
    hasClerkId
      ? ctx.db.query("presence").withIndex("by_user", (q: any) => q.eq("userId", targetClerkId)).collect()
      : Promise.resolve([]),
    hasClerkId
      ? ctx.db.query("subscriptions").withIndex("by_user", (q: any) => q.eq("userId", targetClerkId)).collect()
      : Promise.resolve([]),
    hasClerkId
      ? ctx.db.query("stories").withIndex("by_user", (q: any) => q.eq("userId", targetClerkId)).collect()
      : Promise.resolve([]),
    hasClerkId
      ? ctx.db.query("reports").withIndex("by_reporter", (q: any) => q.eq("reporterId", targetClerkId)).collect()
      : Promise.resolve([]),
    hasClerkId
      ? ctx.db.query("reports").withIndex("by_reported", (q: any) => q.eq("reportedId", targetClerkId)).collect()
      : Promise.resolve([]),
    ctx.db.query("notifications").collect(),
    ctx.db.query("messages").collect(),
    ctx.db.query("users").collect(),
    ctx.db.query("reports").collect(),
  ]);

  const allMatches = dedupeDocsById([...(matchesAsUser1 as any[]), ...(matchesAsUser2 as any[])]);
  const allLikes = dedupeDocsById([...(likesGiven as any[]), ...(likesReceived as any[])]);
  const reportsToDelete = dedupeDocsById([
    ...(reportsByReporter as any[]),
    ...(reportsByReported as any[]),
  ]);

  const matchIdSet = new Set<string>(allMatches.map((m: any) => String(m._id)));
  const reportDeleteIdSet = new Set<string>(reportsToDelete.map((r: any) => String(r._id)));

  const privateChannelIds = new Set<string>();
  for (const match of allMatches) {
    if (match?.user1Id && match?.user2Id) {
      privateChannelIds.add(buildPrivateChannelId(match.user1Id, match.user2Id));
    }
  }

  const messagesToDelete = dedupeDocsById(
    (allMessages as any[]).filter((message: any) => {
      if (hasClerkId && message.userId === targetClerkId) return true;

      if (message.matchId && matchIdSet.has(String(message.matchId))) return true;

      if (typeof message.channelId === "string") {
        if (privateChannelIds.has(message.channelId)) return true;
        if (hasClerkId && channelBelongsToUser(message.channelId, targetClerkId)) return true;
      }

      return false;
    })
  );

  const notificationsToDelete = hasClerkId
    ? dedupeDocsById(
        (allNotifications as any[]).filter((notification: any) => {
          const data =
            notification?.data && typeof notification.data === "object"
              ? notification.data
              : null;
          return (
            notification.userId === targetClerkId ||
            data?.partnerId === targetClerkId ||
            data?.senderId === targetClerkId
          );
        })
      )
    : [];

  let userReferencePatches = 0;
  if (hasClerkId) {
    for (const existingUser of allUsers as any[]) {
      if (String(existingUser._id) === String(targetUser._id)) continue;

      const blockedUsers = Array.isArray(existingUser.blockedUsers)
        ? existingUser.blockedUsers
        : [];
      const unreadMatches = Array.isArray(existingUser.unreadMatches)
        ? existingUser.unreadMatches
        : [];
      const seenMessageRequests = Array.isArray(existingUser.seenMessageRequests)
        ? existingUser.seenMessageRequests
        : [];

      const nextBlockedUsers = blockedUsers.filter((id: string) => id !== targetClerkId);
      const nextUnreadMatches = unreadMatches.filter((id: string) => id !== targetClerkId);
      const nextSeenRequests = seenMessageRequests.filter((id: string) => id !== targetClerkId);

      const patch: Record<string, any> = {};
      if (nextBlockedUsers.length !== blockedUsers.length) {
        patch.blockedUsers = nextBlockedUsers;
      }
      if (nextUnreadMatches.length !== unreadMatches.length) {
        patch.unreadMatches = nextUnreadMatches;
      }
      if (nextSeenRequests.length !== seenMessageRequests.length) {
        patch.seenMessageRequests = nextSeenRequests;
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(existingUser._id, patch);
        userReferencePatches += 1;
      }
    }
  }

  let reportReferencePatches = 0;
  if (hasClerkId) {
    for (const report of allReports as any[]) {
      if (reportDeleteIdSet.has(String(report._id))) continue;
      if (report.reviewedBy !== targetClerkId) continue;
      await ctx.db.patch(report._id, {
        reviewedBy: undefined,
        reviewedAt: undefined,
      });
      reportReferencePatches += 1;
    }
  }

  let deletedStorageFiles = 0;
  for (const story of stories as any[]) {
    if (!story.storageId) continue;
    try {
      await ctx.storage.delete(story.storageId);
      deletedStorageFiles += 1;
    } catch {
      // Ignore invalid/expired storage IDs and continue cleanup.
    }
  }

  for (const message of messagesToDelete) {
    if (message.format === "image" && message.body) {
      try {
        await ctx.storage.delete(message.body as any);
        deletedStorageFiles += 1;
      } catch {
        // Body may not always be a storage ID; skip in that case.
      }
    }
  }

  for (const row of notificationsToDelete) {
    await ctx.db.delete(row._id);
  }
  for (const row of allLikes) {
    await ctx.db.delete(row._id);
  }
  for (const row of messagesToDelete) {
    await ctx.db.delete(row._id);
  }
  for (const row of allMatches) {
    await ctx.db.delete(row._id);
  }
  for (const row of reportsToDelete) {
    await ctx.db.delete(row._id);
  }
  for (const row of stories as any[]) {
    await ctx.db.delete(row._id);
  }
  for (const row of subscriptions as any[]) {
    await ctx.db.delete(row._id);
  }
  for (const row of presenceRows as any[]) {
    await ctx.db.delete(row._id);
  }

  await ctx.db.delete(targetUser._id);

  return {
    target: {
      _id: targetUser._id,
      clerkId: hasClerkId ? targetClerkId : null,
      name: targetUser.name || null,
      email: targetUser.email || null,
    },
    deleted: {
      user: 1,
      matches: allMatches.length,
      likes: allLikes.length,
      messages: messagesToDelete.length,
      notifications: notificationsToDelete.length,
      reports: reportsToDelete.length,
      stories: (stories as any[]).length,
      subscriptions: (subscriptions as any[]).length,
      presence: (presenceRows as any[]).length,
      userReferencesPatched: userReferencePatches,
      reportReferencesPatched: reportReferencePatches,
      storageFiles: deletedStorageFiles,
    },
  };
}

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
    await requireAdmin(ctx);

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
      isVerified: u.isVerified,
      isPremium: u.isPremium,
    }));
  },
});

import { paginationOptsValidator } from "convex/server";

/**
 * Get all users (paginated) (admin only)
 */
export const getAllUsersPaginated = query({
  args: { 
    adminEmail: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Paginate on the natural index, ordered by newest first
    const paginatedResult = await ctx.db
      .query("users")
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...paginatedResult,
      page: paginatedResult.page.map(u => ({
        _id: u._id,
        clerkId: u.clerkId,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        role: u.role || "user",
        status: u.status || "active",
        username: u.username,
        createdAt: u.createdAt,
        isVerified: u.isVerified,
        isPremium: u.isPremium,
      }))
    };
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
    await requireSuperadmin(ctx);
    
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
    await requireAdmin(ctx);
    
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
    await requireAdmin(ctx);
    
    await ctx.db.patch(args.targetUserId, { status: "banned" });
    return { success: true, message: `User banned. Reason: ${args.reason || "No reason provided"}` };
  },
});

/**
 * Permanently delete a user and related app data (superadmin only)
 */
export const deleteUserPermanently = mutation({
  args: {
    adminEmail: v.string(),
    targetUserId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const requester = await requireSuperadmin(ctx);

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    const { targetClerkId } = assertTargetCanBeDeleted(targetUser, requester.identity.subject);

    const result = await deleteUserAppData(ctx, targetUser);

    console.log("[admin] User permanently deleted", {
      by: requester.identity.subject,
      targetUserId: String(args.targetUserId),
      targetClerkId: targetClerkId || null,
      reason: args.reason || "No reason provided",
      deleted: result.deleted,
    });

    return {
      success: true,
      message: "User and related app data were permanently deleted",
      ...result,
    };
  },
});

export const getHardDeleteContext = internalQuery({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const requester = await requireSuperadmin(ctx);

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    const { targetClerkId } = assertTargetCanBeDeleted(targetUser, requester.identity.subject);

    if (!targetClerkId) {
      throw new Error("Target user has no Clerk account. Use app-data delete instead.");
    }

    return {
      requesterClerkId: requester.identity.subject,
      requesterEmail: requester.identity.email || requester.identity.claims?.email || null,
      targetUserId: targetUser._id,
      targetClerkId,
      targetName: targetUser.name || null,
      targetEmail: targetUser.email || null,
    };
  },
});

export const deleteUserAppDataInternal = internalMutation({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) {
      return {
        target: {
          _id: args.targetUserId,
          clerkId: null,
          name: null,
          email: null,
        },
        deleted: {
          user: 0,
          matches: 0,
          likes: 0,
          messages: 0,
          notifications: 0,
          reports: 0,
          stories: 0,
          subscriptions: 0,
          presence: 0,
          userReferencesPatched: 0,
          reportReferencesPatched: 0,
          storageFiles: 0,
        },
      };
    }

    return await deleteUserAppData(ctx, targetUser);
  },
});

/**
 * Hard delete user: remove Clerk account + all app data (superadmin only)
 */
export const hardDeleteUserWithClerk: ReturnType<typeof action> = action({
  args: {
    adminEmail: v.string(),
    targetUserId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any): Promise<any> => {
    const context: any = await ctx.runQuery((internal as any).admin.getHardDeleteContext, {
      targetUserId: args.targetUserId,
    });

    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      throw new Error("Missing CLERK_SECRET_KEY in Convex environment.");
    }

    const clerkDeleteResponse: Response = await fetch(
      `https://api.clerk.com/v1/users/${encodeURIComponent(context.targetClerkId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${clerkSecretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const clerkAlreadyMissing: boolean = clerkDeleteResponse.status === 404;
    if (!clerkDeleteResponse.ok && !clerkAlreadyMissing) {
      const errorBody = await clerkDeleteResponse.text();
      throw new Error(
        `Clerk deletion failed (${clerkDeleteResponse.status}): ${errorBody || "Unknown error"}`
      );
    }

    const appDeletion: any = await ctx.runMutation((internal as any).admin.deleteUserAppDataInternal, {
      targetUserId: args.targetUserId,
    });

    console.log("[admin] Hard delete completed", {
      by: context.requesterClerkId,
      byEmail: context.requesterEmail || args.adminEmail || null,
      targetUserId: String(args.targetUserId),
      targetClerkId: context.targetClerkId,
      reason: args.reason || "No reason provided",
      clerkAlreadyMissing,
      deleted: appDeletion.deleted,
    });

    return {
      success: true,
      message: clerkAlreadyMissing
        ? "Clerk account was already missing; app data was deleted"
        : "Clerk account and app data were permanently deleted",
      clerkDeleted: !clerkAlreadyMissing,
      clerkAlreadyMissing,
      ...appDeletion,
    };
  },
});

/**
 * Get platform stats (admin only)
 */
export const getPlatformStats = query({
  args: { adminEmail: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Fetch all aggregates in parallel
    const [users, matches, messages, pendingReportsList] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("matches").collect(),
      ctx.db.query("messages").collect(),
      ctx.db
        .query("reports")
        .withIndex("by_status", (q) => q.eq("status", "pending"))
        .collect(),
    ]);
    
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
    const pendingReports = pendingReportsList.length;
    
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
    await requireAdmin(ctx);
    
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
    await requireAdmin(ctx);

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
    await requireAdmin(ctx);
    
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
    await requireAdmin(ctx);
    
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
    await requireAdmin(ctx);

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
    await requireAdmin(ctx);

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
    await requireAdmin(ctx);

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
  handler: async (ctx, _args) => {
    await requireSuperadmin(ctx);

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
    await requireSuperadmin(ctx);

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
    await requireSuperadmin(ctx);

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
    await requireSuperadmin(ctx);

    await ctx.db.patch(args.targetUserId, {
      isPremium: false,
      premiumPlan: undefined,
      premiumExpiresAt: undefined,
    });

    return { success: true };
  },
});

/**
 * Verify a user (admin+ only)
 */
export const verifyUser = mutation({
  args: { 
    adminEmail: v.string(),
    targetUserId: v.id("users"),
    verify: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.patch(args.targetUserId, {
      isVerified: args.verify,
    });

    return { success: true };
  },
});
