import { logger } from './logger';

// In-memory store — used when Redis is unavailable (default in local dev)
const mem = new Map<string, { value: string; expiresAt: number }>();

function memGet(key: string): string | null {
  const e = mem.get(key);
  if (!e) return null;
  if (Date.now() > e.expiresAt) { mem.delete(key); return null; }
  return e.value;
}

export async function connectRedis(): Promise<void> {
  logger.info('Using in-memory token store (Redis not required for local dev)');
}

export const redisHelpers = {
  async get(key: string): Promise<string | null> {
    return memGet(key);
  },
  async setex(key: string, ttl: number, value: string): Promise<void> {
    mem.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
  },
  async del(key: string): Promise<void> {
    mem.delete(key);
  },
  async exists(key: string): Promise<boolean> {
    return memGet(key) !== null;
  },
  async setJSON<T>(key: string, ttl: number, value: T): Promise<void> {
    mem.set(key, { value: JSON.stringify(value), expiresAt: Date.now() + ttl * 1000 });
  },
  async getJSON<T>(key: string): Promise<T | null> {
    const raw = memGet(key);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  },
  async lpush(_key: string, ..._values: string[]): Promise<void> { /* no-op */ },
  async lrange(_key: string, _start: number, _stop: number): Promise<string[]> { return []; },
  async ltrim(_key: string, _start: number, _stop: number): Promise<void> { /* no-op */ },
};

export const redis = { quit: async () => { /* no-op */ } };
