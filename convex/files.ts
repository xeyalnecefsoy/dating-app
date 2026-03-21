import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return await ctx.storage.generateUploadUrl();
});

// Get the public URL for a storage file
export const getStorageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Get storage URL from storageId (mutation version for one-time call)
export const getUrlFromStorageId = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    try {
      const url = await ctx.storage.getUrl(args.storageId);
      return url;
    } catch (error) {
      console.error("Failed to get URL for storageId:", args.storageId, error);
      return null;
    }
  },
});
