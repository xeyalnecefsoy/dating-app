"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import webpush from "web-push";

export const sendPush = action({
  args: {
    userId: v.string(),
    title: v.string(),
    body: v.string(),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Get subscriptions for the user (from subscriptions.ts)
    const subscriptions = await ctx.runQuery(internal.subscriptions.getUserSubscriptions, { userId: args.userId });

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No subscriptions found for user", args.userId);
      return;
    }

    // 2. Setup web-push
    const vapidSubject = "mailto:support@danyeri.app";
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error("Missing VAPID keys in environment variables");
      return;
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    // 3. Send notifications
    const payload = JSON.stringify({
      title: args.title,
      body: args.body,
      url: args.url || "/messages",
      icon: "/logo.jpg", 
    });

    const promises = subscriptions.map(async (sub: { endpoint: string; p256dh: string; auth: string }) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        );
      } catch (error: any) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          // Subscription/endpoint is gone, remove it
          await ctx.runMutation(internal.subscriptions.removeByEndpoint, { endpoint: sub.endpoint });
        } else {
          console.error("Error sending push:", error);
        }
      }
    });

    await Promise.all(promises);
  },
});
