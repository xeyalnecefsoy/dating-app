import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Check if the premium paywall is enabled globally.
 * When false, all premium features are free (dev/launch mode).
 * When true, payment is required (Epoint integration).
 */
export const isPaywallEnabled = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("platformSettings")
      .withIndex("by_key", (q) => q.eq("key", "PREMIUM_PAYWALL_ENABLED"))
      .first();

    // Default: paywall disabled (free for all)
    return setting?.value === "true";
  },
});

/**
 * Get current user's premium status.
 */
export const getStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { isPremium: false, plan: null, expiresAt: null };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return { isPremium: false, plan: null, expiresAt: null };

    // Check if premium has expired (read-only check, no auto-deactivation)
    const isExpired = user.premiumExpiresAt ? user.premiumExpiresAt < Date.now() : false;

    return {
      isPremium: user.isPremium === true && !isExpired,
      plan: isExpired ? null : (user.premiumPlan || null),
      expiresAt: user.premiumExpiresAt || null,
    };
  },
});

/**
 * Activate premium for the current user.
 * In dev mode (paywall disabled): activates immediately without payment.
 * In production (paywall enabled): should only be called after successful Epoint payment.
 */
export const activatePremium = mutation({
  args: {
    plan: v.string(), // 'monthly' | 'quarterly' | 'yearly'
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Giriş etməlisiniz");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("İstifadəçi tapılmadı");

    // Check paywall status
    const paywall = await ctx.db
      .query("platformSettings")
      .withIndex("by_key", (q) => q.eq("key", "PREMIUM_PAYWALL_ENABLED"))
      .first();

    const paywallEnabled = paywall?.value === "true";

    if (paywallEnabled) {
      // In production mode, this mutation should only be called
      // after a verified Epoint payment callback.
      // For now, block direct activation.
      throw new Error("Ödəniş tələb olunur. Epoint inteqrasiyası hazırlanır.");
    }

    // Calculate expiry based on plan
    const now = Date.now();
    const durations: Record<string, number> = {
      monthly: 30 * 24 * 60 * 60 * 1000,
      quarterly: 90 * 24 * 60 * 60 * 1000,
      yearly: 365 * 24 * 60 * 60 * 1000,
    };

    const duration = durations[args.plan];
    if (!duration) throw new Error("Yanlış plan: " + args.plan);

    await ctx.db.patch(user._id, {
      isPremium: true,
      premiumPlan: args.plan,
      premiumExpiresAt: now + duration,
    });

    return { success: true, expiresAt: now + duration };
  },
});

/**
 * Deactivate own premium.
 */
export const deactivatePremium = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Giriş etməlisiniz");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("İstifadəçi tapılmadı");

    await ctx.db.patch(user._id, {
      isPremium: false,
      premiumPlan: undefined,
      premiumExpiresAt: undefined,
    });

    return { success: true };
  },
});
