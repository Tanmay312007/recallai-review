/**
 * RedisService — thin wrapper around ioredis for auth rate limiting.
 *
 * Phase 2 uses a Redis sliding window for rate limiting (5 auth attempts per IP
 * per 15 minutes, PROMPT §9). Later phases use BullMQ's own Redis connection for
 * job queues. This service provides a dedicated ioredis instance so auth rate
 * limiting works independently.
 *
 * In test/development without Redis, operations gracefully degrade (return null/0).
 */
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvConfig } from '../../../config/env.validation.js';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService<EnvConfig>) {}

  async onModuleInit(): Promise<void> {
    try {
      const url = this.configService.get<string>('REDIS_URL', { infer: true })!;
      this.client = new Redis(url, {
        maxRetriesPerRequest: 3,
        retryStrategy(times: number): number {
          if (times > 5) return null; // stop retrying
          return Math.min(times * 200, 2000);
        },
      });

      this.client.on('error', (err: Error) => {
        this.logger.warn(`Redis connection error: ${err.message}`);
      });

      this.client.on('connect', () => {
        this.logger.log('Redis connected');
      });
    } catch (err) {
      this.logger.warn(
        'Redis not available — rate limiting will be disabled. ' +
          `This is acceptable in development but NOT in production.`,
      );
      this.client = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
  }

  /**
   * Get the Redis client. Throws if Redis is not available.
   * Callers should check `isAvailable()` first if Redis is optional.
   */
  getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis is not available');
    }
    return this.client;
  }

  /** Whether Redis is connected and operational. */
  isAvailable(): boolean {
    return this.client !== null && this.client.status === 'ready';
  }

  /**
   * Sliding-window rate limit check.
   * Returns { allowed, remaining, retryAfterMs }.
   *
   * Uses Redis sorted sets for a precise sliding window:
   * - Each request adds the current timestamp as a member with score=timestamp.
   * - ZREMRANGEBYSCORE removes entries older than `windowMs`.
   * - ZCARD gives the count within the window.
   */
  async slidingWindowRateLimit(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<{ allowed: boolean; remaining: number; retryAfterMs: number }> {
    if (!this.client) {
      // Redis unavailable — allow all requests (fail-open, logged at init).
      return { allowed: true, remaining: limit, retryAfterMs: 0 };
    }

    try {
      const now = Date.now();
      const windowStart = now - windowMs;

      const pipeline = this.client.pipeline();
      pipeline.zremrangebyscore(key, 0, windowStart);
      pipeline.zadd(key, now, `${now}-${Math.random().toString(36).slice(2)}`);
      pipeline.zcard(key);
      pipeline.expire(key, Math.ceil(windowMs / 1000));

      const results = await pipeline.exec();
      // results is [err, result][] — the zcard result is at index 2
      const count = (results?.[2]?.[1] as number) ?? 0;

      if (count > limit) {
        // Find the oldest entry in the window to calculate retryAfter
        const oldest = await this.client.zrange(key, 0, 0, 'WITHSCORES');
        const oldestScore = oldest?.[1] ? parseFloat(oldest[1] as string) : now;
        const retryAfterMs = Math.ceil(oldestScore + windowMs - now);

        return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, retryAfterMs) };
      }

      return { allowed: true, remaining: limit - count, retryAfterMs: 0 };
    } catch (err) {
      this.logger.warn(`Rate limit Redis error: ${err instanceof Error ? err.message : String(err)}`);
      return { allowed: true, remaining: limit, retryAfterMs: 0 };
    }
  }
}
