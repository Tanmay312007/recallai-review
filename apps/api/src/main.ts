/**
 * RecallAI API — NestJS bootstrap.
 *
 * PROMPT §11 Phase 1 skeleton: global error filter, CORS, health check,
 * structured request logging (Vol V §5.2). Auth guards, rate limiting, and
 * business modules are added in subsequent phases.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter.js';
import { RequestIdMiddleware } from './shared/middleware/request-id.middleware.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    // bufferLogs is false by default; we let pino handle flush timing.
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3001;
  const frontendUrl = configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';

  // ── Global prefix: all routes live under /api/v1/ (PROMPT §6) ──────────
  app.setGlobalPrefix('api/v1', {
    exclude: ['health'], // health check stays at /health (no prefix)
  });

  // ── CORS (Vol V §5.2): locked to the frontend origin ──────────────────
  app.enableCors({
    origin: nodeEnv === 'production' ? frontendUrl : true, // permissive in dev
    credentials: true, // HttpOnly refresh-token cookie needs this
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    maxAge: 86400, // 24 h preflight cache
  });

  // ── Request ID middleware (Vol V §5.2): UUID per request for tracing ─────
  app.use(RequestIdMiddleware);

  // ── Global exception filter (PROMPT §10, Vol V §5.3) ─────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ── Validation pipe (§9): reject unknown fields, transform DTOs ─────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips properties without decorators
      forbidNonWhitelisted: true, // Rejects unknown fields (§9)
      transform: true, // Auto-transform to DTO class instances
      disableErrorMessages: nodeEnv === 'production', // Hide field details in prod
    }),
  );

  await app.listen(port);
  console.log(`RecallAI API listening on http://localhost:${port}`);
  console.log(`  Health: http://localhost:${port}/health`);
  console.log(`  API:    http://localhost:${port}/api/v1`);
}

bootstrap().catch((err: unknown) => {
  // Sync error during bootstrap — nothing else to do but log and exit.
  console.error('Fatal: bootstrap failed', err);
  process.exit(1);
});
