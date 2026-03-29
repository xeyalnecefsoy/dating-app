import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const CATEGORIES = ["bug", "lag", "crash", "ui", "other"] as const;

/** Admin bildiriş mətni üçün (Convex-dən kənar import olmadan) */
function appFeedbackCategoryLabelAz(category: string): string {
  const labels: Record<string, string> = {
    bug: "Xəta / işləməmə",
    lag: "Gecikmə / donma",
    crash: "Tətbiq bağlanması",
    ui: "Görünüş / düymə problemi",
    other: "Digər",
  };
  const k = (category || "").toLowerCase();
  return labels[k] ?? category;
}
const MIN_MESSAGE = 10;
const MAX_MESSAGE = 4000;
const RATE_LIMIT_PER_24H = 5;

function isAdminRole(role: string | undefined) {
  return ["admin", "moderator", "superadmin"].includes(role || "");
}

async function notifyAdminsNewAppFeedback(
  ctx: any,
  reporterClerkId: string,
  category: string
) {
  const reporter = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", reporterClerkId))
    .first();
  const reporterName = reporter?.name || "İstifadəçi";
  const catAz = appFeedbackCategoryLabelAz(category);
  const allUsers = await ctx.db.query("users").collect();
  const adminRecipients = allUsers.filter(
    (u: any) =>
      !!u.clerkId &&
      u.status !== "banned" &&
      (u.role === "moderator" || u.role === "admin" || u.role === "superadmin")
  );
  await Promise.all(
    adminRecipients.map((admin: any) =>
      ctx.db.insert("notifications", {
        userId: admin.clerkId,
        type: "system",
        title: "Yeni tətbiq problemi bildirişi",
        body: `${reporterName}: «${catAz}».`,
        data: { url: "/admin?section=app-feedback" },
        read: false,
        createdAt: Date.now(),
      })
    )
  );
}

export const submitAppFeedback = mutation({
  args: {
    category: v.string(),
    message: v.string(),
    appVersion: v.optional(v.string()),
    platform: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Daxil olmamısınız");

    const clerkId = identity.subject;
    const cat = (args.category || "").toLowerCase();
    if (!CATEGORIES.includes(cat as (typeof CATEGORIES)[number])) {
      throw new Error("Yanlış kateqoriya");
    }

    const msg = args.message.trim();
    if (msg.length < MIN_MESSAGE) {
      throw new Error(`Ən azı ${MIN_MESSAGE} simvol yazın`);
    }
    if (msg.length > MAX_MESSAGE) {
      throw new Error("Mesaj çox uzundur");
    }

    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const mine = await ctx.db
      .query("appFeedback")
      .withIndex("by_clerk", (q) => q.eq("clerkId", clerkId))
      .collect();
    const count24h = mine.filter((r) => r.createdAt > dayAgo).length;
    if (count24h >= RATE_LIMIT_PER_24H) {
      throw new Error(
        "24 saat ərzində çox bildiriş göndərdiniz. Bir az sonra yenidən cəhd edin."
      );
    }

    await ctx.db.insert("appFeedback", {
      clerkId,
      category: cat,
      message: msg,
      status: "pending",
      createdAt: Date.now(),
      appVersion: args.appVersion,
      platform: args.platform,
    });

    await notifyAdminsNewAppFeedback(ctx, clerkId, cat);
    return { success: true };
  },
});

export const getAppFeedbackPaginated = query({
  args: {
    statusFilter: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || !isAdminRole(user.role)) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    let paginatedResult;
    if (args.statusFilter && args.statusFilter !== "all") {
      paginatedResult = await ctx.db
        .query("appFeedback")
        .withIndex("by_status", (q) => q.eq("status", args.statusFilter!))
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      paginatedResult = await ctx.db
        .query("appFeedback")
        .order("desc")
        .paginate(args.paginationOpts);
    }

    const enrichedPage = await Promise.all(
      paginatedResult.page.map(async (row) => {
        const u = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", row.clerkId))
          .first();
        return {
          ...row,
          userName: u?.name || "Naməlum",
          userUsername: u?.username,
          userEmail: u?.email,
        };
      })
    );

    return {
      ...paginatedResult,
      page: enrichedPage,
    };
  },
});

export const updateAppFeedbackStatus = mutation({
  args: {
    feedbackId: v.id("appFeedback"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!adminUser || !isAdminRole(adminUser.role)) {
      throw new Error("Not authorized");
    }

    const next = args.status;
    if (!["reviewed", "dismissed", "pending"].includes(next)) {
      throw new Error("Yanlış status");
    }

    await ctx.db.patch(args.feedbackId, {
      status: next,
      reviewedBy: identity.subject,
      reviewedAt: Date.now(),
    });

    return { success: true };
  },
});
