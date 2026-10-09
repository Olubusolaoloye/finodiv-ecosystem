import { ConvexReactClient } from 'convex/react';

/* eslint-disable @typescript-eslint/no-explicit-any */
const CONVEX_URL =
  (import.meta as any).env?.VITE_CONVEX_URL ||
  'https://cautious-dalmatian-280.convex.cloud';

export const convex = new ConvexReactClient(CONVEX_URL);
