import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { Public } from '../auth/decorators/public.decorator.js';

/**
 * Health endpoint — unauthenticated, excluded from the /api/v1 prefix.
 * Returns 200 when the service is up; 503 if the database is unreachable.
 */
@ApiTags('Health')
@Controller('health')
@Public()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness probe' })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      // Database connectivity check — runs a simple SELECT 1.
      async () => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return { database: { status: 'up' } };
        } catch {
          return { database: { status: 'down' } };
        }
      },
    ]);
  }
}
