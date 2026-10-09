import { ConvexError } from 'convex/values';

export function errorMessage(e: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (e instanceof ConvexError && typeof e.data === 'string') return e.data;
  return fallback;
}
