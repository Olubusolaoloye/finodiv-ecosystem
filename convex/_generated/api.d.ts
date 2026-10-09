/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as authAccounts from "../authAccounts.js";
import type * as authActions from "../authActions.js";
import type * as certificates from "../certificates.js";
import type * as community from "../community.js";
import type * as courses from "../courses.js";
import type * as enrollments from "../enrollments.js";
import type * as jobs from "../jobs.js";
import type * as lib_conversations from "../lib/conversations.js";
import type * as lib_profileHelpers from "../lib/profileHelpers.js";
import type * as messages from "../messages.js";
import type * as payments from "../payments.js";
import type * as profiles from "../profiles.js";
import type * as settings from "../settings.js";
import type * as submissions from "../submissions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  authAccounts: typeof authAccounts;
  authActions: typeof authActions;
  certificates: typeof certificates;
  community: typeof community;
  courses: typeof courses;
  enrollments: typeof enrollments;
  jobs: typeof jobs;
  "lib/conversations": typeof lib_conversations;
  "lib/profileHelpers": typeof lib_profileHelpers;
  messages: typeof messages;
  payments: typeof payments;
  profiles: typeof profiles;
  settings: typeof settings;
  submissions: typeof submissions;
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
