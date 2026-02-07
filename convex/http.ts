import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  pathPrefix: "/api/storage/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { pathname } = new URL(request.url);
    // Pathname will be /api/storage/<storageId>
    const storageId = pathname.split("/").filter(Boolean).pop();

    if (!storageId) {
      return new Response("Missing storageId", { status: 400 });
    }

    try {
      // 1. Try to get signed URL (works for new storage)
      const url = await ctx.storage.getUrl(storageId as Id<"_storage">);
      if (url) {
        return Response.redirect(url);
      }

      // 2. Fallback to getting blob directly (works for legacy storage)
      const blob = await ctx.storage.get(storageId as Id<"_storage">);
      if (!blob) {
        return new Response("Image not found", { status: 404 });
      }

      return new Response(blob, {
        headers: {
          "Content-Type": blob.type || "image/jpeg",
          "Cache-Control": "public, max-age=31536000",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("[HTTP] Storage fetch error:", error);
      return new Response("Failed to fetch image", { status: 500 });
    }
  }),
});

export default http;

