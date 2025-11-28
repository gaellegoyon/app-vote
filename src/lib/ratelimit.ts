// Rate limiting avec LRU cache en mémoire
import { LRUCache } from "lru-cache";

const rl = new LRUCache<string, { n: number; ts: number }>({ max: 10000 });

export function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const cur = rl.get(key) || { n: 0, ts: now };
  if (now - cur.ts > windowMs) {
    cur.n = 0;
    cur.ts = now;
  }
  cur.n++;
  rl.set(key, cur);
  return cur.n <= limit;
}
