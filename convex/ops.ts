import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

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

async function requireAdmin(ctx: any) {
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

  const fallbackSuperadmin =
    normalizedEmail === SUPERADMIN_EMAIL.toLowerCase();
  const role = user?.role || (fallbackSuperadmin ? "superadmin" : "user");

  if (!ADMIN_ROLES.has(role)) {
    throw new Error("Unauthorized");
  }

  return {
    identity,
    role,
    user,
  };
}

async function getPlatformSetting(ctx: any, key: string) {
  return await ctx.db
    .query("platformSettings")
    .withIndex("by_key", (q: any) => q.eq("key", key))
    .first();
}

async function upsertPlatformSetting(ctx: any, key: string, value: string) {
  const existing = await getPlatformSetting(ctx, key);
  if (existing) {
    await ctx.db.patch(existing._id, { value });
  } else {
    await ctx.db.insert("platformSettings", { key, value });
  }
}

async function getAdminRecipients(ctx: any) {
  const allUsers = await ctx.db.query("users").collect();
  return allUsers.filter(
    (u: any) =>
      !!u.clerkId &&
      u.status !== "banned" &&
      (ADMIN_ROLES.has(u.role || "") ||
        (u.email || "").toLowerCase() === SUPERADMIN_EMAIL.toLowerCase())
  );
}

async function notifyAdmins(
  ctx: any,
  title: string,
  body: string,
  url: string,
  extraData?: Record<string, any>
) {
  const admins = await getAdminRecipients(ctx);
  const now = Date.now();
  await Promise.all(
    admins.map((admin: any) =>
      ctx.db.insert("notifications", {
        userId: admin.clerkId,
        type: "system",
        title,
        body,
        data: { url, ...(extraData || {}) },
        read: false,
        createdAt: now,
      })
    )
  );
  return admins.length;
}

export const getOperationalHealthPublic = query({
  args: {},
  handler: async (ctx) => {
    const [allUsers, pendingReports, waitlistUsers, activeAlert, settings] =
      await Promise.all([
        ctx.db.query("users").collect(),
        ctx.db
          .query("reports")
          .withIndex("by_status", (q) => q.eq("status", "pending"))
          .collect(),
        ctx.db
          .query("users")
          .withIndex("by_status", (q) => q.eq("status", "waitlist"))
          .collect(),
        ctx.db
          .query("systemAlerts")
          .withIndex("by_active", (q) => q.eq("isActive", true))
          .first(),
        ctx.db.query("platformSettings").collect(),
      ]);

    const activeUsers = allUsers.filter((u: any) => (u.status || "active") === "active").length;
    const blockedMaintenance = activeAlert?.isActive && activeAlert?.blocksAccess;

    const checks = {
      moderationBacklog: pendingReports.length <= 15 ? "ok" : "warn",
      waitlistBacklog: waitlistUsers.length <= 50 ? "ok" : "warn",
      maintenanceMode: blockedMaintenance ? "warn" : "ok",
    } as const;

    const status =
      checks.moderationBacklog === "ok" &&
      checks.waitlistBacklog === "ok" &&
      checks.maintenanceMode === "ok"
        ? "ok"
        : "degraded";

    const settingMap: Record<string, string> = {};
    for (const s of settings) {
      settingMap[s.key] = s.value;
    }

    return {
      status,
      timestamp: Date.now(),
      checks,
      metrics: {
        totalUsers: allUsers.length,
        activeUsers,
        pendingReports: pendingReports.length,
        waitlistCount: waitlistUsers.length,
      },
      automation: {
        lastSweepAt: Number(settingMap.OPS_LAST_SWEEP_AT || 0),
        lastReportAlertAt: Number(settingMap.OPS_LAST_REPORT_ALERT_AT || 0),
        lastWaitlistAlertAt: Number(settingMap.OPS_LAST_WAITLIST_ALERT_AT || 0),
      },
      activeSystemAlert: activeAlert
        ? {
            type: activeAlert.type,
            titleAz: activeAlert.titleAz,
            blocksAccess: activeAlert.blocksAccess,
          }
        : null,
    };
  },
});

export const getMobileAdminSnapshot = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    const [allUsers, allReports, pendingReports, waitlistUsers, activeAlert, settings] =
      await Promise.all([
        ctx.db.query("users").collect(),
        ctx.db.query("reports").collect(),
        ctx.db
          .query("reports")
          .withIndex("by_status", (q) => q.eq("status", "pending"))
          .collect(),
        ctx.db
          .query("users")
          .withIndex("by_status", (q) => q.eq("status", "waitlist"))
          .collect(),
        ctx.db
          .query("systemAlerts")
          .withIndex("by_active", (q) => q.eq("isActive", true))
          .first(),
        ctx.db.query("platformSettings").collect(),
      ]);

    const userByClerkId = new Map<string, any>();
    for (const u of allUsers) {
      if (u.clerkId) userByClerkId.set(u.clerkId, u);
    }

    const pendingReportsQueue = pendingReports
      .sort((a: any, b: any) => b.createdAt - a.createdAt)
      .slice(0, 20)
      .map((report: any) => {
        const reporter = userByClerkId.get(report.reporterId);
        const reported = userByClerkId.get(report.reportedId);
        return {
          _id: report._id,
          reason: report.reason,
          description: report.description,
          status: report.status,
          createdAt: report.createdAt,
          reporterId: report.reporterId,
          reportedId: report.reportedId,
          reporterName: reporter?.name || "Unknown",
          reporterAvatar: reporter?.avatar,
          reportedName: reported?.name || "Unknown",
          reportedAvatar: reported?.avatar,
        };
      });

    const waitlistQueue = waitlistUsers
      .sort(
        (a: any, b: any) =>
          (a.createdAt || a._creationTime) - (b.createdAt || b._creationTime)
      )
      .slice(0, 20)
      .map((u: any) => ({
        _id: u._id,
        clerkId: u.clerkId,
        name: u.name,
        avatar: u.avatar,
        email: u.email,
        gender: u.gender,
        age: u.age,
        location: u.location,
        bio: u.bio,
        createdAt: u.createdAt || u._creationTime,
      }));

    const activeUsers = allUsers.filter((u: any) => (u.status || "active") === "active").length;
    const bannedUsers = allUsers.filter((u: any) => u.status === "banned").length;

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return {
      now,
      summary: {
        totalUsers: allUsers.length,
        activeUsers,
        bannedUsers,
        waitlistCount: waitlistUsers.length,
        pendingReports: pendingReports.length,
        newReportsLast24h: allReports.filter((r: any) => r.createdAt >= dayAgo).length,
        newWaitlistLast24h: waitlistUsers.filter((u: any) => (u.createdAt || u._creationTime) >= dayAgo).length,
      },
      queue: {
        pendingReports: pendingReportsQueue,
        waitlist: waitlistQueue,
      },
      automation: {
        lastSweepAt: Number(settingsMap.OPS_LAST_SWEEP_AT || 0),
        lastReportAlertAt: Number(settingsMap.OPS_LAST_REPORT_ALERT_AT || 0),
        lastWaitlistAlertAt: Number(settingsMap.OPS_LAST_WAITLIST_ALERT_AT || 0),
      },
      activeSystemAlert: activeAlert
        ? {
            type: activeAlert.type,
            titleAz: activeAlert.titleAz,
            messageAz: activeAlert.messageAz,
            blocksAccess: activeAlert.blocksAccess,
          }
        : null,
    };
  },
});

export const quickApproveWaitlist = mutation({
  args: { targetUserId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const target = await ctx.db.get(args.targetUserId);
    if (!target) throw new Error("User not found");
    if (target.status !== "waitlist") {
      throw new Error("User is not in waitlist");
    }

    await ctx.db.patch(args.targetUserId, {
      status: "active",
      profileModerationNote: undefined,
      profileModerationAt: undefined,
    });

    if (target.clerkId) {
      await ctx.db.insert("notifications", {
        userId: target.clerkId,
        type: "system",
        title: "Profiliniz təsdiqləndi",
        body: "Danyeri-yə xoş gəlmisiniz. Artıq platformadan tam istifadə edə bilərsiniz.",
        read: false,
        createdAt: Date.now(),
        data: { url: "/" },
      });
    }

    return { success: true };
  },
});

export const quickRejectWaitlist = mutation({
  args: { targetUserId: v.id("users"), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const target = await ctx.db.get(args.targetUserId);
    if (!target) throw new Error("User not found");

    const note =
      args.reason?.trim() ||
      "Hazırda hesabınız aktivləşdirilmədi. Dəstək üçün əlaqə saxlayın.";

    await ctx.db.patch(args.targetUserId, {
      status: "rejected",
      profileModerationNote: note,
      profileModerationAt: Date.now(),
    });

    if (target.clerkId) {
      await ctx.db.insert("notifications", {
        userId: target.clerkId,
        type: "system",
        title: "Müraciətiniz təsdiqlənmədi",
        body: note,
        read: false,
        createdAt: Date.now(),
        data: { url: "/profile" },
      });
    }

    return { success: true };
  },
});

export const quickRequestRevision = mutation({
  args: { targetUserId: v.id("users"), reason: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const target = await ctx.db.get(args.targetUserId);
    if (!target) throw new Error("User not found");
    if (target.status !== "waitlist") {
      throw new Error("Yalnız gözləmə növbəsindəki istifadəçilər üçün");
    }
    const note = args.reason.trim();
    if (!note) throw new Error("Səbəb boş ola bilməz");

    await ctx.db.patch(args.targetUserId, {
      status: "needs_revision",
      profileModerationNote: note,
      profileModerationAt: Date.now(),
    });

    if (target.clerkId) {
      await ctx.db.insert("notifications", {
        userId: target.clerkId,
        type: "system",
        title: "Profilinizi yeniləyin",
        body: note,
        read: false,
        createdAt: Date.now(),
        data: { url: "/onboarding" },
      });
    }

    return { success: true };
  },
});

export const quickResolveReport = mutation({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const { identity } = await requireAdmin(ctx);
    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error("Report not found");

    await ctx.db.patch(args.reportId, {
      status: "resolved",
      reviewedBy: identity.subject,
      reviewedAt: Date.now(),
    });

    return { success: true };
  },
});

export const quickDismissReport = mutation({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const { identity } = await requireAdmin(ctx);
    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error("Report not found");

    await ctx.db.patch(args.reportId, {
      status: "dismissed",
      reviewedBy: identity.subject,
      reviewedAt: Date.now(),
    });

    return { success: true };
  },
});

async function runAutomationSweepCore(ctx: any) {
  const now = Date.now();
  const reportThreshold = 8;
  const waitlistThreshold = 25;
  const reportCooldownMs = 30 * 60 * 1000;
  const waitlistCooldownMs = 2 * 60 * 60 * 1000;

  const [pendingReports, waitlistUsers, reportSetting, waitlistSetting] =
    await Promise.all([
      ctx.db
        .query("reports")
        .withIndex("by_status", (q: any) => q.eq("status", "pending"))
        .collect(),
      ctx.db
        .query("users")
        .withIndex("by_status", (q: any) => q.eq("status", "waitlist"))
        .collect(),
      getPlatformSetting(ctx, "OPS_LAST_REPORT_ALERT_AT"),
      getPlatformSetting(ctx, "OPS_LAST_WAITLIST_ALERT_AT"),
    ]);

  const lastReportAlertAt = Number(reportSetting?.value || 0);
  const lastWaitlistAlertAt = Number(waitlistSetting?.value || 0);

  let reportAlertSent = false;
  let waitlistAlertSent = false;

  if (
    pendingReports.length >= reportThreshold &&
    now - lastReportAlertAt >= reportCooldownMs
  ) {
    await notifyAdmins(
      ctx,
      "Moderasiya növbəsi böyüyür",
      `Gözləyən şikayət sayı ${pendingReports.length}-ə çatıb.`,
      "/admin/mobile?tab=reports"
    );
    await upsertPlatformSetting(ctx, "OPS_LAST_REPORT_ALERT_AT", String(now));
    reportAlertSent = true;
  }

  if (
    waitlistUsers.length >= waitlistThreshold &&
    now - lastWaitlistAlertAt >= waitlistCooldownMs
  ) {
    await notifyAdmins(
      ctx,
      "Waitlist növbəsi böyüyür",
      `Waitlist istifadəçi sayı ${waitlistUsers.length}-ə çatıb.`,
      "/admin/mobile?tab=waitlist"
    );
    await upsertPlatformSetting(ctx, "OPS_LAST_WAITLIST_ALERT_AT", String(now));
    waitlistAlertSent = true;
  }

  await upsertPlatformSetting(ctx, "OPS_LAST_SWEEP_AT", String(now));

  return {
    pendingReports: pendingReports.length,
    waitlistCount: waitlistUsers.length,
    reportAlertSent,
    waitlistAlertSent,
    now,
  };
}

export const runAutomationNow = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await runAutomationSweepCore(ctx);
  },
});

export const runAutomationSweep = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await runAutomationSweepCore(ctx);
  },
});
