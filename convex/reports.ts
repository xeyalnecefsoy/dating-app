import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const REPORT_REASONS = ["fake", "harassment", "spam", "inappropriate", "other"] as const;

/**
 * Submit a report against another user
 */
export const submitReport = mutation({
  args: {
    reportedId: v.string(),
    reason: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const reporterId = identity.subject;

    // Prevent self-reports
    if (reporterId === args.reportedId) {
      throw new Error("Cannot report yourself");
    }

    // Check if already reported this user recently (within 24h)
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const existingReport = await ctx.db
      .query("reports")
      .withIndex("by_reporter", (q) => q.eq("reporterId", reporterId))
      .filter((q) =>
        q.and(
          q.eq(q.field("reportedId"), args.reportedId),
          q.gt(q.field("createdAt"), dayAgo)
        )
      )
      .first();

    if (existingReport) {
      throw new Error("You have already reported this user recently");
    }

    await ctx.db.insert("reports", {
      reporterId,
      reportedId: args.reportedId,
      reason: args.reason,
      description: args.description,
      status: "pending",
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get all reports (admin only)
 */
export const getReports = query({
  args: {
    statusFilter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Check if user is admin
    const userId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!user || !["admin", "moderator", "superadmin"].includes(user.role || "")) {
      return [];
    }

    let reports;
    if (args.statusFilter && args.statusFilter !== "all") {
      reports = await ctx.db
        .query("reports")
        .withIndex("by_status", (q) => q.eq("status", args.statusFilter!))
        .collect();
    } else {
      reports = await ctx.db.query("reports").collect();
    }

    // Enrich with user names
    const enriched = await Promise.all(
      reports.map(async (report) => {
        const reporter = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", report.reporterId))
          .first();

        const reported = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", report.reportedId))
          .first();

        return {
          ...report,
          reporterName: reporter?.name || "Unknown",
          reportedName: reported?.name || "Unknown",
          reporterAvatar: reporter?.avatar,
          reportedAvatar: reported?.avatar,
        };
      })
    );

    // Sort by newest first
    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Update report status (admin only)
 */
export const updateReportStatus = mutation({
  args: {
    reportId: v.id("reports"),
    status: v.string(), // 'reviewed', 'resolved', 'dismissed'
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!user || !["admin", "moderator", "superadmin"].includes(user.role || "")) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.reportId, {
      status: args.status,
      reviewedBy: userId,
      reviewedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get report count by status (for admin dashboard)
 */
export const getReportStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { pending: 0, reviewed: 0, resolved: 0, dismissed: 0, total: 0 };

    const allReports = await ctx.db.query("reports").collect();

    return {
      pending: allReports.filter((r) => r.status === "pending").length,
      reviewed: allReports.filter((r) => r.status === "reviewed").length,
      resolved: allReports.filter((r) => r.status === "resolved").length,
      dismissed: allReports.filter((r) => r.status === "dismissed").length,
      total: allReports.length,
    };
  },
});
