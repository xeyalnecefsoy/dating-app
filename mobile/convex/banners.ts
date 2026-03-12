import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// -----------------------------------------
// Upload URL Generation
// -----------------------------------------
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// -----------------------------------------
// Queries
// -----------------------------------------
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    // Return all active banners sorted by order
    const banners = await ctx.db
      .query("banners")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return banners.sort((a, b) => a.order - b.order);
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    // For admin panel
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated call to getAll banners");

    const banners = await ctx.db
      .query("banners")
      .withIndex("by_order")
      .collect();

    return banners;
  },
});

// -----------------------------------------
// Mutations
// -----------------------------------------
export const create = mutation({
  args: {
    titleAz: v.optional(v.string()),
    titleEn: v.optional(v.string()),
    descriptionAz: v.optional(v.string()),
    descriptionEn: v.optional(v.string()),
    ctaTextAz: v.optional(v.string()),
    ctaTextEn: v.optional(v.string()),
    ctaLink: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    gradient: v.optional(v.string()),
    isActive: v.boolean(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated call to create banner");

    let imageUrl;
    if (args.storageId) {
      imageUrl = await ctx.storage.getUrl(args.storageId);
    }

    await ctx.db.insert("banners", {
      titleAz: args.titleAz,
      titleEn: args.titleEn,
      descriptionAz: args.descriptionAz,
      descriptionEn: args.descriptionEn,
      ctaTextAz: args.ctaTextAz,
      ctaTextEn: args.ctaTextEn,
      ctaLink: args.ctaLink,
      storageId: args.storageId,
      imageUrl: imageUrl || undefined,
      gradient: args.gradient || "from-primary to-accent",
      isActive: args.isActive,
      order: args.order,
      createdAt: Date.now(),
      createdBy: identity.subject,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("banners"),
    titleAz: v.optional(v.string()),
    titleEn: v.optional(v.string()),
    descriptionAz: v.optional(v.string()),
    descriptionEn: v.optional(v.string()),
    ctaTextAz: v.optional(v.string()),
    ctaTextEn: v.optional(v.string()),
    ctaLink: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")), // Will overwrite if provided
    gradient: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated call to update banner");

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Banner not found");

    const patch: any = {
      titleAz: args.titleAz !== undefined ? args.titleAz : existing.titleAz,
      titleEn: args.titleEn !== undefined ? args.titleEn : existing.titleEn,
      descriptionAz: args.descriptionAz !== undefined ? args.descriptionAz : existing.descriptionAz,
      descriptionEn: args.descriptionEn !== undefined ? args.descriptionEn : existing.descriptionEn,
      ctaTextAz: args.ctaTextAz !== undefined ? args.ctaTextAz : existing.ctaTextAz,
      ctaTextEn: args.ctaTextEn !== undefined ? args.ctaTextEn : existing.ctaTextEn,
      ctaLink: args.ctaLink !== undefined ? args.ctaLink : existing.ctaLink,
      gradient: args.gradient !== undefined ? args.gradient : existing.gradient,
      order: args.order !== undefined ? args.order : existing.order,
    };

    if (args.storageId) {
      patch.storageId = args.storageId;
      patch.imageUrl = await ctx.storage.getUrl(args.storageId);
    }

    await ctx.db.patch(args.id, patch);
  },
});

export const toggleActive = mutation({
  args: { id: v.id("banners"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    await ctx.db.patch(args.id, { isActive: args.isActive });
  },
});

export const remove = mutation({
  args: { id: v.id("banners") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const existing = await ctx.db.get(args.id);
    if (existing?.storageId) {
      await ctx.storage.delete(existing.storageId);
    }

    await ctx.db.delete(args.id);
  },
});
