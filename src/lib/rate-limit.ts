import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Keyed by session_id, not IP — sessions are already the stable identity
// (see Conversation in CONTEXT.md), and per-IP would unfairly throttle
// multiple visitors sharing a network (e.g. an office or campus).
export const chatRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "10 m"),
  prefix: "leadpilot:chat",
});
