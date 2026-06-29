import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

/**
 * PrismaModule — globally available (isGlobal: true via ConfigModule).
 * Every service can inject PrismaService without importing PrismaModule.
 * TODO(spec): Consider making this @Global() explicitly once modules grow.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
