/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as ai from "../ai.js";
import type * as badges from "../badges.js";
import type * as blocks from "../blocks.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as likes from "../likes.js";
import type * as matches from "../matches.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as premium from "../premium.js";
import type * as presence from "../presence.js";
import type * as push from "../push.js";
import type * as reports from "../reports.js";
import type * as subscriptions from "../subscriptions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  ai: typeof ai;
  badges: typeof badges;
  blocks: typeof blocks;
  files: typeof files;
  http: typeof http;
  likes: typeof likes;
  matches: typeof matches;
  messages: typeof messages;
  notifications: typeof notifications;
  premium: typeof premium;
  presence: typeof presence;
  push: typeof push;
  reports: typeof reports;
  subscriptions: typeof subscriptions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
