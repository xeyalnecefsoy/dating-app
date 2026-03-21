import { anyApi } from "convex/server";

// Re-export for compatibility. Use convex/_generated/api for full types when not building for web.
export const api = anyApi;
export const internal = anyApi;
