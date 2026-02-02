import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  pathPrefix: "/api/storage",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams, pathname } = new URL(request.url);
    // Pathname will be /api/storage/<storageId>
    const storageId = pathname.split("/").pop();

    if (!storageId) {
      return new Response("Missing storageId", { status: 400 });
    }

    const blob = await ctx.storage.get(storageId);
    if (!blob) {
      return new Response("Image not found", { status: 404 });
    }

    return new Response(blob);
  }),
});

export default http;
