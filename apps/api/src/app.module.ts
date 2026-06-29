/**
 * RecallAI API — root module.
 *
 * Phase 1 wires in: ConfigModule (env validation), HealthController,
 * PrismaService, and the global exception filter. Business modules
 * (auth, documents, decks, cards, review, billing, etc.) are added in
 * subsequent phases by importing their module here.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation.js';
import { HealthModule } from './modules/health/health.module.js';
import { PrismaModule } from './shared/prisma/prisma.module.js';

@Module({
  imports: [
    // ── Environment config (validated at startup via Zod) ──────────────────
    ConfigModule.forRoot({
      isGlobal: true, // Available everywhere without re-importing
      validate,
      cache: true, // Cache validated env for the process lifetime
    }),

    // ── Prisma client (database access) ───────────────────────────────────
    PrismaModule,

    // ── Health check ──────────────────────────────────────────────────────
    HealthModule,

    // Phase 2+: AuthModule, UsersModule, DocumentsModule, DecksModule, ...
  ],
  providers: [],
})
export class AppModule {}
