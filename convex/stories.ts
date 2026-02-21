import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    storageId: v.id("_storage"),
    mediaType: v.string(), // "image" or "video"
    caption: v.optional(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const mediaUrl = await ctx.storage.getUrl(args.storageId);
    if (!mediaUrl) throw new Error("Failed to get media URL");

    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours from now

    return await ctx.db.insert("stories", {
      userId: identity.subject,
      storageId: args.storageId,
      mediaUrl,
      mediaType: args.mediaType,
      caption: args.caption,
      isPublic: args.isPublic,
      createdAt: now,
      expiresAt,
      viewers: [],
    });
  },
});

export const getFeed = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const currentUserId = identity.subject;

    const now = Date.now();

    // 1. Get all stories that haven't expired
    const allActiveStories = await ctx.db
      .query("stories")
      .withIndex("by_expiresAt", (q) => q.gt("expiresAt", now))
      .collect();

    // 2. Filter stories: either it's ours, it's public, or it's from a match
    const validStories = [];
    const userMatchesCache = new Map<string, boolean>();

    for (const story of allActiveStories) {
      if (story.userId === currentUserId) {
        validStories.push(story);
        continue;
      }

      if (story.isPublic) {
        validStories.push(story);
        continue;
      }

      // If private, we need to check if we are matched
      let isMatched = userMatchesCache.get(story.userId);
      if (isMatched === undefined) {
        const match1 = await ctx.db
          .query("matches")
          .withIndex("by_user1_status", (q) =>
            q.eq("user1Id", currentUserId).eq("status", "accepted")
          )
          .filter((q) => q.eq(q.field("user2Id"), story.userId))
          .first();

        const match2 = await ctx.db
          .query("matches")
          .withIndex("by_user2_status", (q) =>
            q.eq("user2Id", currentUserId).eq("status", "accepted")
          )
          .filter((q) => q.eq(q.field("user1Id"), story.userId))
          .first();

        isMatched = !!(match1 || match2);
        userMatchesCache.set(story.userId, isMatched);
      }

      if (isMatched) {
        validStories.push(story);
      }
    }

    // 3. Group by user and fetch user details
    const userStoriesMap = new Map<string, any[]>();
    for (const story of validStories) {
      if (!userStoriesMap.has(story.userId)) {
        userStoriesMap.set(story.userId, []);
      }
      userStoriesMap.get(story.userId)!.push({
        id: story._id,
        userId: story.userId,
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType,
        caption: story.caption,
        createdAt: new Date(story.createdAt),
        expiresAt: new Date(story.expiresAt),
        viewedBy: story.viewers || [],
      });
    }

    const result = [];
    for (const [userId, stories] of userStoriesMap.entries()) {
      // Fetch user details
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
        .first();

      if (user) {
        // Sort stories old -> new
        stories.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        result.push({
          userId,
          userName: user.name,
          userAvatar: user.avatar || user.image || "/placeholder-avatar.svg",
          stories,
          hasUnviewed: stories.some(
            (s) => !s.viewedBy.includes(currentUserId) && s.userId !== currentUserId
          ),
        });
      }
    }

    // 4. Sort users: Current user first, then by youngest recent story
    result.sort((a, b) => {
      if (a.userId === currentUserId) return -1;
      if (b.userId === currentUserId) return 1;

      const aLatest = a.stories[a.stories.length - 1].createdAt.getTime();
      const bLatest = b.stories[b.stories.length - 1].createdAt.getTime();
      return bLatest - aLatest; // Newest first
    });

    return result;
  },
});

export const markViewed = mutation({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const story = await ctx.db.get(args.storyId);
    if (!story) return;

    // Don't mark our own stories as viewed
    if (story.userId === identity.subject) return;

    const viewers = story.viewers || [];
    if (!viewers.includes(identity.subject)) {
      viewers.push(identity.subject);
      await ctx.db.patch(args.storyId, { viewers });
    }
  },
});

export const _delete = mutation({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const story = await ctx.db.get(args.storyId);
    if (!story) throw new Error("Story not found");

    if (story.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Optional: delete from storage
    if (story.storageId) {
      await ctx.storage.delete(story.storageId);
    }

    await ctx.db.delete(args.storyId);
  },
});
