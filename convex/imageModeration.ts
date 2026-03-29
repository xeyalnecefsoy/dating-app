import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const TOBACCO_PROB_THRESHOLD = 0.45;

/**
 * Optional Sightengine check on profile image URL. Requires SIGHTENGINE_API_USER and
 * SIGHTENGINE_API_SECRET in Convex dashboard. If unset, returns { skipped: true }.
 * Stores hints on the user document for admin queue context.
 */
export const checkAndStoreAvatarModeration = action({
  args: { imageUrl: v.string() },
  handler: async (ctx, { imageUrl }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { ok: false as const, reason: "unauthenticated" as const };
    }

    const apiUser = process.env.SIGHTENGINE_API_USER;
    const apiSecret = process.env.SIGHTENGINE_API_SECRET;
    if (!apiUser || !apiSecret) {
      return { ok: true as const, skipped: true as const };
    }

    const params = new URLSearchParams({
      api_user: apiUser,
      api_secret: apiSecret,
      url: imageUrl,
      models: "tobacco",
    });

    const res = await fetch(
      `https://api.sightengine.com/1.0/check.json?${params.toString()}`
    );
    const data = (await res.json()) as {
      status?: string;
      error?: { message?: string };
      tobacco?: { prob?: number; classes?: Record<string, number> };
    };

    if (data.status !== "success") {
      return {
        ok: false as const,
        error: data.error?.message ?? "sightengine_failed",
      };
    }

    const hints: string[] = [];
    const prob = data.tobacco?.prob ?? 0;
    if (prob > TOBACCO_PROB_THRESHOLD) {
      hints.push("tobacco_suspected");
    }

    await ctx.runMutation(internal.users.setAvatarModerationHintsInternal, {
      clerkId: identity.subject,
      hints,
    });

    return { ok: true as const, hints };
  },
});
