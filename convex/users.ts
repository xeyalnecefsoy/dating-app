import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a new user
export const createTempUser = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      name: args.name,
      interests: [],
    });
    return userId;
  },
});
