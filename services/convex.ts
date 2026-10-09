import { ConvexReactClient } from 'convex/react';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const convex = new ConvexReactClient((import.meta as any).env.VITE_CONVEX_URL as string);
