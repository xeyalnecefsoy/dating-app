import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Get the public URL for a storage file
export const getStorageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Get storage URL from storageId string (mutation version for one-time call)
export const getUrlFromStorageId = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    const typedId = args.storageId as unknown as typeof args.storageId;
    try {
      const url = await ctx.storage.getUrl(typedId as any);
      return url;
    } catch (error) {
      console.error("Failed to get URL:", error);
      return null;
    }
  },
});
