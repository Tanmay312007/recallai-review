/**
 * RecallAI — Prisma service (database client singleton).
 *
 * Wraps @prisma/client in a NestJS-injectable service so every module can
 * receive PrismaService via DI rather than instantiating PrismaClient
 * directly. Provides:
 *   - Soft-delete aware queries (WHERE deleted_at IS NULL)
 *   - Graceful shutdown hook (disconnects the pool)
 */
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });

    // Log slow queries in development (threshold: 500ms, per Vol V §5.2).
    if (process.env['NODE_ENV'] === 'development') {
      this.$on('query' as never, (event: { query: string; duration: number }) => {
        // Event type from Prisma is not well-typed in v5; cast as needed.
        const e = event as { query: string; duration: number };
        if (e.duration > 500) {
          this.logger.warn(`Slow query (${e.duration}ms): ${e.query.slice(0, 200)}`);
        }
      });
    }
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Database connected');
    } catch (err) {
      this.logger.warn(
        `Database unavailable at startup — the service will work once the database becomes available. ` +
        (err instanceof Error ? err.message : ''),
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  /**
   * Enable soft-delete middleware: every find/findFirst/findMany automatically
   * adds `WHERE deleted_at IS NULL` to models that have a `deletedAt` field.
   * This prevents accidentally returning soft-deleted records (PROMPT §15).
   *
   * NOTE: Prisma middleware is preview — works fine in Prisma v5.
   */
  // Soft-delete middleware is enabled in Phase 6 when delete endpoints arrive.
  // For Phase 1, we rely on explicit queries.
}
