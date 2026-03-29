import type { MutationCtx, QueryCtx } from "./_generated/server";

/**
 * Server-side deep links: prefer /messages?u=<username> when the user has a username.
 */
export async function messagesDeepLinkForClerkId(
  ctx: MutationCtx | QueryCtx,
  clerkId: string,
): Promise<string> {
  if (clerkId === "general") {
    return "/messages?u=general";
  }
  const row = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();
  if (row?.username) {
    return `/messages?u=${encodeURIComponent(row.username)}`;
  }
  return `/messages?userId=${encodeURIComponent(clerkId)}`;
}
