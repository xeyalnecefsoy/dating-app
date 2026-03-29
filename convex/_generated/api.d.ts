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
import type * as appFeedback from "../appFeedback.js";
import type * as badges from "../badges.js";
import type * as banners from "../banners.js";
import type * as blocks from "../blocks.js";
import type * as crons from "../crons.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as imageModeration from "../imageModeration.js";
import type * as likes from "../likes.js";
import type * as matches from "../matches.js";
import type * as messageUrls from "../messageUrls.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as ops from "../ops.js";
import type * as premium from "../premium.js";
import type * as presence from "../presence.js";
import type * as profileValidation from "../profileValidation.js";
import type * as push from "../push.js";
import type * as reports from "../reports.js";
import type * as stories from "../stories.js";
import type * as subscriptions from "../subscriptions.js";
import type * as systemAlerts from "../systemAlerts.js";
import type * as users from "../users.js";
import type * as venues from "../venues.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  ai: typeof ai;
  appFeedback: typeof appFeedback;
  badges: typeof badges;
  banners: typeof banners;
  blocks: typeof blocks;
  crons: typeof crons;
  files: typeof files;
  http: typeof http;
  imageModeration: typeof imageModeration;
  likes: typeof likes;
  matches: typeof matches;
  messageUrls: typeof messageUrls;
  messages: typeof messages;
  notifications: typeof notifications;
  ops: typeof ops;
  premium: typeof premium;
  presence: typeof presence;
  profileValidation: typeof profileValidation;
  push: typeof push;
  reports: typeof reports;
  stories: typeof stories;
  subscriptions: typeof subscriptions;
  systemAlerts: typeof systemAlerts;
  users: typeof users;
  venues: typeof venues;
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
